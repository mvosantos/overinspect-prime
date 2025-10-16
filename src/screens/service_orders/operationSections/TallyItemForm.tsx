/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useForm, FormProvider, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { AutoComplete } from 'primereact/autocomplete';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import AttachmentsSection from '../../../components/AttachmentsSection';
import { createAutocompleteComplete } from '../../../utils/autocompleteHelpers';
import { makeAutoCompleteOnChange, resolveAutoCompleteValue, seedCachedObject, resolveFieldName, resolveFieldDefault } from '../../../utils/formHelpers';
import { parseToDateOrOriginal } from '../../../utils/dateHelpers';
import siteService from '../../../services/siteService';
import { useRef } from 'react';

const ReadingSchema = z.object({
  id: z.string().optional(),
  site_id: z.any().optional(),
  ticket: z.any().optional(),
  tare_weight: z.any().optional(),
  gross_weight: z.any().optional(),
  net_weight: z.any().optional(),
  date: z.any().optional(),
  latitude: z.any().optional(),
  longitude: z.any().optional(),
  attachments: z.array(z.any()).optional().default([]),
});

const ItemSchema = z.object({
  id: z.string().optional(),
  plate_number: z.any().optional(),
  readings: z.array(ReadingSchema).optional().default([]),
  service_order_status: z.any().optional(),
});

function mutationIsLoading(m: unknown) {
  try {
    const mm = m as Record<string, unknown>;
    const state = typeof mm.state === 'string' ? String(mm.state) : undefined;
    const fetchStatus = typeof mm.fetchStatus === 'string' ? String(mm.fetchStatus) : undefined;
    const status = typeof mm.status === 'string' ? String(mm.status) : undefined;
    return state === 'loading' || fetchStatus === 'fetching' || status === 'loading';
  } catch {
    return false;
  }
}

type Props = {
  item?: any;
  isNew?: boolean;
  fieldConfigs?: Record<string, { name: string; visible?: boolean; required?: boolean; default_value?: unknown } | undefined>;
  parentStatus?: unknown;
  createMutation?: any;
  updateMutation?: any;
  deleteMutation?: any;
  deleteReadingMutation?: any;
  currentOrderId?: string | null;
  setCreatingNew?: (b: boolean) => void;
  toastRef?: React.RefObject<any>;
  t?: (k: string) => string;
};

export default function TallyItemForm({ item, isNew, fieldConfigs, parentStatus, createMutation, updateMutation, deleteMutation, deleteReadingMutation, currentOrderId, setCreatingNew, toastRef, t }: Props) {
  const qc = useQueryClient();

  const parentEnableEditing = parentStatus ? Boolean((parentStatus as any)?.enable_editing ?? true) : true;

  const plateField = fieldConfigs ? fieldConfigs['tally_plate_number'] : undefined;
  const siteField = fieldConfigs ? fieldConfigs['tally_site_id'] : undefined;
  const ticketField = fieldConfigs ? fieldConfigs['tally_ticket'] : undefined;
  const tareField = fieldConfigs ? fieldConfigs['tally_tare_weight'] : undefined;
  const grossField = fieldConfigs ? fieldConfigs['tally_gross_weight'] : undefined;
  const netField = fieldConfigs ? fieldConfigs['tally_net_weight'] : undefined;
  const dateField = fieldConfigs ? fieldConfigs['tally_date'] : undefined;
  const latField = fieldConfigs ? fieldConfigs['tally_latitude'] : undefined;
  const longField = fieldConfigs ? fieldConfigs['tally_longitude'] : undefined;

  const plateFieldName = resolveFieldName(plateField, 'plate_number');
  const siteFieldName = resolveFieldName(siteField, 'site_id');
  const ticketFieldName = resolveFieldName(ticketField, 'ticket');
  const tareFieldName = resolveFieldName(tareField, 'tare_weight');
  const grossFieldName = resolveFieldName(grossField, 'gross_weight');
  const netFieldName = resolveFieldName(netField, 'net_weight');
  const dateFieldName = resolveFieldName(dateField, 'date');
  const latFieldName = resolveFieldName(latField, 'latitude');
  const longFieldName = resolveFieldName(longField, 'longitude');

  // prepare default values: plate on top level, and readings from item.tally_operation_readings or item.readings
  const readingsFromItem = (item && (item.tally_operation_readings ?? item.readings)) ? (item.tally_operation_readings ?? item.readings) : [];
  const defaultReadings = Array.isArray(readingsFromItem) ? readingsFromItem.map((r: any) => ({
    ...r,
    [siteFieldName]: resolveFieldDefault(siteField, r?.site_id ?? r?.site?.id ?? r?.site),
    [ticketFieldName]: resolveFieldDefault(ticketField, r?.ticket),
    [tareFieldName]: resolveFieldDefault(tareField, r?.tare_weight ?? r?.total_weight),
    [grossFieldName]: resolveFieldDefault(grossField, r?.gross_weight),
    [netFieldName]: resolveFieldDefault(netField, r?.net_weight),
    [dateFieldName]: (() => {
      try {
        const parsed = parseToDateOrOriginal(r?.date);
        return parsed instanceof Date ? parsed : resolveFieldDefault(dateField, r?.date);
      } catch {
        return resolveFieldDefault(dateField, r?.date);
      }
    })(),
    [latFieldName]: resolveFieldDefault(latField, r?.latitude),
    [longFieldName]: resolveFieldDefault(longField, r?.longitude),
    attachments: Array.isArray(r?.attachments) ? r.attachments : [],
  })) : [];

  const defaultVals: any = { ...(item ?? {}), plate_number: resolveFieldDefault(plateField, item?.plate_number), readings: defaultReadings };
  // Try to restore a draft from sessionStorage if present
  const draftKey = `draft_tally:${currentOrderId ?? 'none'}:${item && item.id ? item.id : 'new'}`;
  let restored: any = null;
  try {
    const raw = sessionStorage.getItem(draftKey);
    if (raw) {
      restored = JSON.parse(raw);
    }
  } catch {
    restored = null;
  }

  const initialDefaults = restored && typeof restored === 'object' ? { ...defaultVals, ...(restored ?? {}) } : { ...defaultVals };

  const form = useForm<any>({ resolver: zodResolver(ItemSchema), defaultValues: { ...initialDefaults, service_order_status: parentStatus } as any });
  const { handleSubmit, control, setValue } = form;
  const saveDraftTimer = useRef<number | null>(null as unknown as number | null);

  // site autocomplete (shared suggestions/cache for all readings)
  const [siteSuggestions, setSiteSuggestions] = useState<any[]>([]);
  const [siteCache, setSiteCache] = useState<Record<string, any>>({});
  const [siteSuggestError, setSiteSuggestError] = useState<string | null>(null);
  const createSiteComplete = async (e: { query: string }) => {
    try {
      setSiteSuggestError(null);
      await createAutocompleteComplete<any>({ listFn: siteService.list, qc, cacheKeyRoot: 'site', setSuggestions: setSiteSuggestions, setCache: (updater) => setSiteCache((prev) => updater(prev)), per_page: 20, filterKey: 'name' })(e);
    } catch {
      setSiteSuggestions([]);
      setSiteSuggestError('Falha ao carregar sugestões');
    }
  };

  useEffect(() => {
    try {
      // seed cache for sites found in readings
      const readings = defaultReadings as any[];
      readings.forEach((r) => {
        const s = r && (r.site || r.site_id ? (r.site ?? undefined) : undefined);
        const sId = r && (r.site_id ?? (s && s.id)) as string | undefined;
        seedCachedObject(s, sId, setSiteCache, qc, 'site');
        if (sId) {
          const fetchIfMissing = async (id?: string | undefined) => {
            if (!id) return;
            try {
              const existing = qc.getQueryData(['site', id]);
              if (existing) return;
              const fetched = await siteService.get(id);
              if (fetched && typeof fetched === 'object') {
                setSiteCache((prev) => ({ ...(prev || {}), [id]: fetched }));
                try { qc.setQueryData(['site', id], fetched); } catch { /* ignore */ }
              }
            } catch {
              // ignore
            }
          };
          void fetchIfMissing(sId);
        }
      });
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [localSubmitting, setLocalSubmitting] = useState(false);
  const submitting = localSubmitting || (isNew ? mutationIsLoading(createMutation) : mutationIsLoading(updateMutation));

  const { fields, append, remove } = useFieldArray({ control, name: 'readings' });

  const onReadingRemove = async (index: number) => {
    try {
      const vals = form.getValues();
      const reading = vals && Array.isArray(vals.readings) ? vals.readings[index] : undefined;
      const rid = reading && (reading.id ?? reading.reading_id) ? String(reading.id ?? reading.reading_id) : null;
      const rm = (deleteReadingMutation && typeof deleteReadingMutation.mutateAsync === 'function') ? deleteReadingMutation : deleteMutation;
      if (rid && rm && typeof rm.mutateAsync === 'function') {
        try {
          await rm.mutateAsync(rid);
          toastRef?.current?.show({ severity: 'success', summary: 'Removido', detail: 'Leitura removida' });
          remove(index);
  } catch {
          toastRef?.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao remover leitura' });
        }
      } else {
        remove(index);
      }
  } catch {
      try { remove(index); } catch { /* ignore */ }
    }
  };

  const onSave = handleSubmit(async (vals) => {
    try {
      // Build payload according to API: top-level plate_number + tally_operation_readings array
  const payload: any = { service_order_id: currentOrderId };
  // include top-level id when updating existing operation
  if (item && item.id) payload.id = item.id;
  payload.plate_number = vals[plateFieldName] ?? vals.plate_number ?? null;

      const rawReadings = Array.isArray(vals.readings) ? vals.readings : [];
      const readingsPayload = rawReadings.map((r: any) => {
        const rec: any = {};
  // map configured field names back to API keys
  // include reading id when present so backend can distinguish update vs create
  rec.id = r.id ?? r.reading_id ?? null;
        rec.site_id = r[siteFieldName] ?? null;
        rec.ticket = r[ticketFieldName] ?? null;
        rec.tare_weight = r[tareFieldName] ?? null;
        rec.gross_weight = r[grossFieldName] ?? null;
        rec.net_weight = r[netFieldName] ?? null;
        rec.date = r[dateFieldName] ? (r[dateFieldName] instanceof Date ? r[dateFieldName].toISOString() : String(r[dateFieldName])) : null;
        rec.latitude = r[latFieldName] ?? null;
        rec.longitude = r[longFieldName] ?? null;
        // normalize attachments for this reading: attach filename and only include new files (no id)
        rec.attachments = [];
        try {
          if (Array.isArray(r.attachments)) {
            rec.attachments = r.attachments.map((att: any) => {
              if (att && typeof att === 'object') {
                const filename = att.name ?? att.filename ?? null;
                return { ...att, filename };
              }
              return att;
            }).filter((att: any) => !att || !att.id).map((att: any) => ({ ...att }));
          }
        } catch {
          // ignore
        }
        return rec;
      });

      payload.tally_operation_readings = readingsPayload;

      setLocalSubmitting(true);
      if (isNew) {
        await createMutation.mutateAsync(payload);
        toastRef?.current?.show({ severity: 'success', summary: 'Criado', detail: `Registro criado` });
        if (setCreatingNew) setCreatingNew(false);
      } else if (item && item.id) {
        await updateMutation.mutateAsync({ id: item.id, payload });
        toastRef?.current?.show({ severity: 'success', summary: 'Atualizado', detail: `Registro atualizado` });
      }
      setLocalSubmitting(false);
  // clear draft on successful save
  try { sessionStorage.removeItem(draftKey); } catch { /* ignore */ }
    } catch (err: any) {
      try {
        const body = err?.response?.data ?? err?.data ?? null;
        if (body && typeof body === 'object') {
          const errors = (body.errors ?? body) as Record<string, any>;
          if (errors && typeof errors === 'object') {
            Object.entries(errors).forEach(([k, v]) => {
              const message = Array.isArray(v) ? String(v[0]) : String(v);
              const map: Record<string, string | undefined> = {
                plate_number: plateFieldName,
                site_id: siteFieldName,
                ticket: ticketFieldName,
                tare_weight: tareFieldName,
                gross_weight: grossFieldName,
                net_weight: netFieldName,
                date: dateFieldName,
                latitude: latFieldName,
                longitude: longFieldName,
              };
              const target = map[k] ?? k;
              try { form.setError(target, { type: 'server', message }); } catch { /* ignore */ }
            });
          }
        }
      } catch {
        // ignore mapping errors
      }
      // make sure to re-enable the save button when error occurs
      try { setLocalSubmitting(false); } catch { /* ignore */ }
      toastRef?.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar' });
    }
  });

  // persist form draft to sessionStorage on change (debounced)
  useEffect(() => {
    const sub = (form as any).watch(() => {
      try {
        if (saveDraftTimer.current) window.clearTimeout(saveDraftTimer.current);
        saveDraftTimer.current = window.setTimeout(() => {
          try {
            const vals = (form as any).getValues();
            // only persist relevant fields to keep storage small
            const serializable = { plate_number: vals.plate_number, readings: vals.readings };
            sessionStorage.setItem(draftKey, JSON.stringify(serializable));
          } catch {
            // ignore storage errors
          }
        }, 400);
      } catch (e) {
        // ignore
        void e;
      }
    });
      return () => {
      try {
        if (saveDraftTimer.current) window.clearTimeout(saveDraftTimer.current);
      } catch (e) { void e; }
      try { if (typeof sub === 'function') sub(); } catch (e) { void e; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [cancelConfirmVisible, setCancelConfirmVisible] = useState(false);
  const [readingDeleteVisible, setReadingDeleteVisible] = useState(false);
  const [readingDeleteIndex, setReadingDeleteIndex] = useState<number | null>(null);

  const onDelete = () => setDeleteConfirmVisible(true);
  const confirmDelete = async () => {
    if (!item || !item.id) { setDeleteConfirmVisible(false); return; }
    try { await deleteMutation.mutateAsync(item.id); toastRef?.current?.show({ severity: 'success', summary: 'Removido', detail: 'Registro removido' }); } catch { toastRef?.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao remover' }); } finally { setDeleteConfirmVisible(false); }
  };
  const showReadingDeleteConfirm = (index: number) => {
    try {
      setReadingDeleteIndex(index);
      setReadingDeleteVisible(true);
    } catch {
      setReadingDeleteIndex(index);
      setReadingDeleteVisible(true);
    }
  };

  const confirmReadingDelete = async () => {
    const idx = readingDeleteIndex;
    setReadingDeleteVisible(false);
    setReadingDeleteIndex(null);
    if (idx == null) return;
    try {
      await onReadingRemove(idx);
    } catch {
      // onReadingRemove already shows toast on error
    }
  };
  useEffect(() => { try { setValue('service_order_status', parentStatus as any); } catch { /* ignore */ } }, [setValue, parentStatus]);

  return (
    <FormProvider {...form}>
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Plate Number (search + title) */}
          <div className="flex flex-col">
            <label className="block mb-1">{t ? t('tally:plate_number') : 'Plate Number'}</label>
            <Controller control={control} name={plateFieldName} defaultValue={plateField?.default_value} render={({ field }) => (
              <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
            )} />
          </div>
          <div className="col-span-1 sm:col-span-2 lg:col-span-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">{t ? t('tally:ticket') : 'Readings'}</h4>
              <Button type="button" label="Add reading" icon="pi pi-plus" className="p-button-sm" onClick={() => append({})} />
            </div>

            {fields.map((f, idx) => (
              <div key={f.id ?? idx} className="p-3 mb-3 border rounded">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{`Reading #${idx + 1}`}</div>
                  <div>
                    <Button type="button" icon="pi pi-trash" className="p-button-text p-button-danger" onClick={() => showReadingDeleteConfirm(idx)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-3 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Site AutoComplete */}
                  <div className="flex flex-col">
                    <label className="block mb-1">{t ? t('tally:site') : 'Site'}</label>
                    <Controller control={control} name={`readings.${idx}.${siteFieldName}`} render={({ field }) => {
                      const displayValue = field.value;
                      return (
                        <AutoComplete value={resolveAutoCompleteValue<any>(siteSuggestions, siteCache, displayValue, qc, 'site') as any} suggestions={siteSuggestions} field="name" completeMethod={createSiteComplete} onChange={makeAutoCompleteOnChange<any>({ setCache: (updater) => setSiteCache((prev) => updater(prev)), cacheKey: 'site', qc })(field.onChange)} dropdown className="w-full" />
                      );
                    }} />
                    {siteSuggestError && <small className="p-error">{siteSuggestError}</small>}
                  </div>

                  {/* Ticket */}
                  <div className="flex flex-col">
                    <label className="block mb-1">{t ? t('tally:ticket') : 'Ticket'}</label>
                    <Controller control={control} name={`readings.${idx}.${ticketFieldName}`} render={({ field }) => (
                      <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
                    )} />
                  </div>

                  {/* Tare/Gross/Net weights */}
                  <div className="flex flex-col">
                    <label className="block mb-1">{t ? t('tally:tare_weight') : 'Tare Weight (kg)'}</label>
                    <Controller control={control} name={`readings.${idx}.${tareFieldName}`} render={({ field }) => (
                      <InputNumber className="w-full" value={field.value as any} mode="decimal" locale="pt-BR" onValueChange={(e) => field.onChange(e.value)} />
                    )} />
                  </div>

                  <div className="flex flex-col">
                    <label className="block mb-1">{t ? t('tally:gross_weight') : 'Gross Weight (kg)'}</label>
                    <Controller control={control} name={`readings.${idx}.${grossFieldName}`} render={({ field }) => (
                      <InputNumber className="w-full" value={field.value as any} mode="decimal" locale="pt-BR" onValueChange={(e) => field.onChange(e.value)} />
                    )} />
                  </div>

                  <div className="flex flex-col">
                    <label className="block mb-1">{t ? t('tally:net_weight') : 'Net Weight (kg)'}</label>
                    <Controller control={control} name={`readings.${idx}.${netFieldName}`} render={({ field }) => (
                      <InputNumber className="w-full" value={field.value as any} mode="decimal" locale="pt-BR" onValueChange={(e) => field.onChange(e.value)} />
                    )} />
                  </div>

                  {/* Date and time */}
                  <div className="flex flex-col">
                    <label className="block mb-1">{t ? t('tally:date') : 'Date and Time'}</label>
                    <Controller control={control} name={`readings.${idx}.${dateFieldName}`} render={({ field }) => (
                      <Calendar showIcon showTime hourFormat="24" dateFormat='dd/mm/yy' className="w-full" value={field.value as Date | null} onChange={(e: any) => field.onChange(e?.value ?? null)} hideOnDateTimeSelect />
                    )} />
                  </div>

                  {/* Latitude */}
                  <div className="flex flex-col">
                    <label className="block mb-1">{t ? t('tally:latitude') : 'Latitude'}</label>
                    <Controller control={control} name={`readings.${idx}.${latFieldName}`} render={({ field }) => (
                      <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
                    )} />
                  </div>

                  {/* Longitude */}
                  <div className="flex flex-col">
                    <label className="block mb-1">{t ? t('tally:longitude') : 'Longitude'}</label>
                    <Controller control={control} name={`readings.${idx}.${longFieldName}`} render={({ field }) => (
                      <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
                    )} />
                  </div>
                </div>

                <div className="mt-4"><AttachmentsSection name={`readings.${idx}.attachments`} path="tally_operation" /></div>
              </div>
            ))}
          </div>
        </div>

        <Dialog header="Confirmar exclusão" visible={deleteConfirmVisible} onHide={() => setDeleteConfirmVisible(false)}>
          <p>Confirmar exclusão</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button label="Cancelar" onClick={() => setDeleteConfirmVisible(false)} />
            <Button label="Sim, excluir" className="p-button-danger" onClick={confirmDelete} disabled={mutationIsLoading(deleteMutation)} />
          </div>
        </Dialog>

        <Dialog header="Confirmar exclusão da leitura" visible={readingDeleteVisible} onHide={() => { setReadingDeleteVisible(false); setReadingDeleteIndex(null); }}>
          <p>Confirmar exclusão desta leitura?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button label="Cancelar" onClick={() => { setReadingDeleteVisible(false); setReadingDeleteIndex(null); }} />
            <Button label="Sim, excluir" className="p-button-danger" onClick={confirmReadingDelete} />
          </div>
        </Dialog>

        <Dialog header="Confirmar" visible={cancelConfirmVisible} onHide={() => setCancelConfirmVisible(false)}>
          <p>Deseja cancelar a criação deste registro?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button label="Cancelar" onClick={() => setCancelConfirmVisible(false)} />
            <Button label="Sim, cancelar" className="p-button-secondary" onClick={() => { setCancelConfirmVisible(false); if (setCreatingNew) setCreatingNew(false); }} />
          </div>
        </Dialog>

        <div className="flex items-end justify-end gap-2 mt-6">
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={parentEnableEditing ? (submitting ? (t ? t('common:saving') : 'Salvando') : 'Salvar') : undefined}
              className={`pf-save-btn p-button p-component p-button-primary ${(!parentEnableEditing || submitting) ? 'p-disabled' : ''}`}
              onClick={onSave}
              disabled={!parentEnableEditing || submitting}
            >
              {submitting ? <i className="pi pi-spin pi-spinner" /> : <i className="pi pi-save" />}
              <span className="ml-2">{submitting ? (t ? t('common:saving') : 'Salvando') : 'Salvar'}</span>
            </button>
            {!isNew && (
              <Button label="Excluir" icon="pi pi-trash" className="p-button-danger" onClick={onDelete} disabled={!parentEnableEditing} />
            )}
            {isNew && (
              <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setCancelConfirmVisible(true)} />
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
