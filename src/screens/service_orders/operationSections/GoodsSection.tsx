/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ApiPaginatedResponse } from '../../../models/apiTypes';
import type { GoodOperation } from '../../../models/service_order/goods/GoodOperation';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { AutoComplete } from 'primereact/autocomplete';
import { Toast } from 'primereact/toast';
import { useFormContext } from 'react-hook-form';

import operationGoodService from '../../../services/operationGoodService';
import siteService from '../../../services/siteService';
import AttachmentsSection from '../../../components/AttachmentsSection';
import { createAutocompleteComplete } from '../../../utils/autocompleteHelpers';
import { makeAutoCompleteOnChange, resolveAutoCompleteValue } from '../../../utils/formHelpers';

type Props = {
  currentOrderId?: string | null;
  selectedServiceTypeId?: string | null;
  fieldConfigs?: Record<string, { name: string; visible?: boolean; required?: boolean; default_value?: unknown } | undefined>;
};

const ItemSchema = z.object({
  id: z.string().optional(),
  loading_port_id: z.string().nullable().optional(),
  // keep schema minimal for now (only loading_port_id requested)
  attachments: z.array(z.any()).optional().default([]),
  service_order_status: z.any().optional(),
});

export default function GoodsSection({ currentOrderId, fieldConfigs }: Props) {
  const qc = useQueryClient();
  const toast = useRef<Toast | null>(null);

  const parentForm = useFormContext();
  const parentStatus = (parentForm && typeof parentForm.getValues === 'function') ? (parentForm.getValues('service_order_status') as Record<string, unknown> | undefined) : undefined;
  const parentEnableEditing = parentStatus ? Boolean(parentStatus?.enable_editing ?? true) : true;

  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);
  const [activeIndexes, setActiveIndexes] = useState<number[] | number | null>(null);

  // debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(id);
  }, [search]);

  const queryKey = useMemo(() => ['operation-goods', currentOrderId, page, perPage, debouncedSearch], [currentOrderId, page, perPage, debouncedSearch]);

  const { data, refetch } = useQuery<ApiPaginatedResponse<GoodOperation>, Error>({
    queryKey,
    queryFn: () => operationGoodService.list({ page, per_page: perPage, filters: { service_order_id: currentOrderId ?? undefined, vessel_name: debouncedSearch } as any } as any),
    enabled: Boolean(currentOrderId),
  });

  const createMutation = useMutation<GoodOperation, Error, any>({ mutationFn: (payload: any) => operationGoodService.create(payload), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['operation-goods', currentOrderId] } as any); void refetch(); } });
  const updateMutation = useMutation<GoodOperation, Error, { id: string; payload: any }>({ mutationFn: ({ id, payload }) => operationGoodService.update(id, payload), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['operation-goods', currentOrderId] } as any); void refetch(); } });
  const deleteMutation = useMutation<void, Error, string>({ mutationFn: (id: string) => operationGoodService.remove(id), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['operation-goods', currentOrderId] } as any); void refetch(); } });

  // items and total derived from query (memoized so hooks depending on items are stable)
  const items = useMemo(() => ((data && Array.isArray((data as any).data)) ? (data as any).data : []), [data]);
  const total = useMemo(() => ((data && typeof (data as any).total === 'number') ? (data as any).total : 0), [data]);

  // destructure expected field config keys for this section
  const goodsVesselLoadingPortField = fieldConfigs ? fieldConfigs['goods_vessel_loading_port_id'] : undefined;

  // helper to open/close all (defined after items so it can reference them)
  const collapseAll = useCallback(() => setActiveIndexes(null), []);
  const expandAll = useCallback(() => {
    const totalItems = items.length + (creatingNew ? 1 : 0);
    setActiveIndexes(Array.from({ length: totalItems }, (_, i) => i));
  }, [items, creatingNew]);

  // inner component for each item (existing or new)
  function GoodItemForm({ item, isNew }: { item?: any; isNew?: boolean }) {
    const loadingPortFieldName = goodsVesselLoadingPortField?.name ?? 'loading_port_id';
    const defaultVals: any = { ...(item ?? {}), attachments: (item && Array.isArray(item.attachments)) ? item.attachments : [] };
    // ensure the named field is populated: prefer existing item value, then field default_value, then null
    defaultVals[loadingPortFieldName] = item?.loading_port_id ?? (goodsVesselLoadingPortField?.default_value ?? null);
    // also expose parent service_order_status into this form so AttachmentsSection can read enable flags
    const form = useForm<any>({ resolver: zodResolver(ItemSchema), defaultValues: { ...defaultVals, service_order_status: parentStatus } as any });
    const { handleSubmit, control, setValue } = form;

    // Site autocomplete helpers
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

    // If this item already contains the full loading_port object (from server),
    // seed the local cache and react-query cache so AutoComplete shows the name
    useEffect(() => {
      try {
        const lp = item && (item.loading_port || item.loading_port_id ? (item.loading_port ?? undefined) : undefined);
        const lpId = item && (item.loading_port_id ?? (lp && lp.id)) as string | undefined;
        if (lp && lpId) {
          setSiteCache((prev) => ({ ...(prev || {}), [lpId]: lp }));
          try { qc.setQueryData(['site', lpId], lp); } catch { /* ignore */ }
        }
      } catch {
        // ignore
      }
      // only run on mount per item
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSave = handleSubmit(async (vals) => {
      try {
        // map named form fields back to API-expected keys
        const payload: any = { ...vals };
        // ensure loading_port_id exists in payload for API
        if (loadingPortFieldName !== 'loading_port_id') {
          payload.loading_port_id = vals[loadingPortFieldName] ?? null;
          // avoid sending the custom-named field to API
          delete payload[loadingPortFieldName];
        }
        payload.service_order_id = currentOrderId;
        // ensure attachments node present
        if (!payload.attachments) payload.attachments = [];
        if (isNew) {
          await createMutation.mutateAsync(payload);
          toast.current?.show({ severity: 'success', summary: 'Criado', detail: `Registro criado` });
          setCreatingNew(false);
        } else if (item && item.id) {
          await updateMutation.mutateAsync({ id: item.id, payload });
          toast.current?.show({ severity: 'success', summary: 'Atualizado', detail: `Registro atualizado` });
        }
      } catch (err: any) {
          // try to map server-side field errors into the form
          try {
            const body = err?.response?.data ?? err?.data ?? null;
            if (body && typeof body === 'object') {
              // common Laravel style: { errors: { field: ['msg'] } }
              const errors = (body.errors ?? body) as Record<string, any>;
              if (errors && typeof errors === 'object') {
                Object.entries(errors).forEach(([k, v]) => {
                  const message = Array.isArray(v) ? String(v[0]) : String(v);
                  // map API field name to configured form field name
                  if (k === 'loading_port_id') {
                    try { form.setError(loadingPortFieldName, { type: 'server', message }); } catch { /* ignore */ }
                  } else {
                    try { form.setError(k, { type: 'server', message }); } catch { /* ignore */ }
                  }
                });
              }
            }
          } catch {
            // ignore mapping errors
          }
          toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar' });
        }
    });

    const onDelete = async () => {
      if (!item || !item.id) return;
      try {
        await deleteMutation.mutateAsync(item.id);
        toast.current?.show({ severity: 'success', summary: 'Removido', detail: 'Registro removido' });
      } catch {
        toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao remover' });
      }
    };

    // When parent status changes, keep the hidden field in sync so AttachmentsSection reads it
    useEffect(() => {
      try { setValue('service_order_status', parentStatus as any); } catch { /* ignore */ }
      // parentStatus comes from the parent form context and isn't a stable React dependency
      // so we intentionally only depend on setValue to avoid false lint warnings.
    }, [setValue]);

    return (
      <FormProvider {...form}>
        <div className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {goodsVesselLoadingPortField?.visible !== false && (
              <div className="md:col-span-2">
                <label className="block mb-1">Porto de embarque{goodsVesselLoadingPortField?.required ? ' *' : ''}</label>
                <Controller control={control} name={loadingPortFieldName} render={({ field }) => (
                  <AutoComplete
                    value={resolveAutoCompleteValue<any>(siteSuggestions, siteCache, field.value, qc, 'site') as any}
                    suggestions={siteSuggestions}
                    field="name"
                    completeMethod={createSiteComplete}
                    onChange={makeAutoCompleteOnChange<any>({ setCache: (updater) => setSiteCache((prev) => updater(prev)), cacheKey: 'site', qc })(field.onChange)}
                    dropdown
                    className="w-full"
                    defaultValue={goodsVesselLoadingPortField?.default_value as any}
                    
                    />
                )} />
                {((form.formState && (form.formState.errors as Record<string, any>)) || {})[loadingPortFieldName]?.message && (
                  <small className="p-error">{((form.formState && (form.formState.errors as Record<string, any>)) || {})[loadingPortFieldName].message}</small>
                )}
                {siteSuggestError && <small className="p-error">{siteSuggestError}</small>}
              </div>
            )}
            <div className="flex items-end justify-end gap-2 md:col-span-2">
              <div className="flex gap-2">
                <Button label="Salvar" icon="pi pi-save" onClick={onSave} disabled={!parentEnableEditing} />
                {!isNew && (
                  <Button label="Excluir" icon="pi pi-trash" className="p-button-danger" onClick={onDelete} disabled={!parentEnableEditing} />
                )}
                {isNew && (
                  <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setCreatingNew(false)} />
                )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            {/* Attachments for this item. Use path 'operation/good' so presign/upload go to correct node */}
            <AttachmentsSection name="attachments" path="operation/good" />
          </div>
        </div>
      </FormProvider>
    );
  }

  

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <InputText placeholder="Buscar por navio" value={search} onChange={(e) => setSearch((e.target as HTMLInputElement).value)} />
          <div className="text-sm text-muted">Total: {total}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button label="Novo" icon="pi pi-plus" onClick={() => { setCreatingNew(true); setActiveIndexes((prev) => {
            // open the new top panel (index 0)
            if (Array.isArray(prev)) return [0, ...prev];
            return [0];
          }); }} disabled={!parentEnableEditing} />
          <Button label="Expandir todos" onClick={expandAll} className="p-button-text" />
          <Button label="Colapsar" onClick={collapseAll} className="p-button-text" />
        </div>
      </div>

      <Accordion multiple activeIndex={activeIndexes} onTabChange={(e: any) => setActiveIndexes(e.index)}>
        {creatingNew && (
          <AccordionTab header={`0 - Novo registro`}>
            <GoodItemForm isNew />
          </AccordionTab>
        )}

        {items.map((it: any, idx: number) => (
          <AccordionTab key={it.id ?? idx} header={`${(page - 1) * perPage + idx + 1} - ${it.vessel_name ?? '—'}`}>
            <GoodItemForm item={it} />
          </AccordionTab>
        ))}
      </Accordion>

      <div className="flex items-center justify-between mt-4">
        <div>Exibindo página {page} de {data?.last_page ?? 1}</div>
        <div className="flex gap-2">
          <Button label="Anterior" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} />
          <Button label="Próxima" onClick={() => setPage(Math.min((data?.last_page as number) ?? 1, page + 1))} disabled={page >= ((data?.last_page as number) ?? 1)} />
        </div>
      </div>
    </div>
  );
}