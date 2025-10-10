import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { AutoComplete } from 'primereact/autocomplete';
import { InputNumber } from 'primereact/inputnumber';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWatch } from 'react-hook-form';
import subsidiaryService from '../../../services/subsidiaryService';
import type { Subsidiary } from '../../../models/subsidiary';
// prime components kept minimal for now
import { Controller } from 'react-hook-form';
import type { UseFormRegister, FieldErrors, Control } from 'react-hook-form';
import { Calendar } from 'primereact/calendar';
import { useTranslation } from 'react-i18next';
import type { BusinessUnit } from '../../../models/businessUnit';
import businessUnitService from '../../../services/businessUnitService';

type FieldMeta = {
  name: string;
  label?: string;
  default_value?: unknown;
  visible?: boolean;
  required?: boolean;
  field_type?: string | null;
};

type Props = {
  serviceTypeId?: string | null;
  fields?: FieldMeta[];
  register?: UseFormRegister<Record<string, unknown>>;
  control?: Control<Record<string, unknown>>;
  errors?: FieldErrors<Record<string, unknown>>;
};

export default function GeneralDataSection({ serviceTypeId, fields = [], register, control, errors = {} }: Props) {
  const { t } = useTranslation('new_service_order');
  const [subsSuggestions, setSubsSuggestions] = useState<Subsidiary[]>([]);
  const [businessUnitSuggestions, setBusinessUnitSuggestions] = useState<BusinessUnit[]>([]);
  const [subsCache, setSubsCache] = useState<Record<string, Subsidiary>>({});
  const [businessUnitCache, setBusinessUnitCache] = useState<Record<string, BusinessUnit>>({});
  const qc = useQueryClient();
  // form control is expected to be provided by the parent form (we rely on that convention)
  const watchedSubsId = useWatch({ control, name: 'subsidiary_id' }) as string | undefined;
  const watchedBUsId = useWatch({ control, name: 'business_unit_id' }) as string | undefined;
  const { data: selectedSubs } = useQuery({ queryKey: ['subsidiary', watchedSubsId], queryFn: () => subsidiaryService.get(watchedSubsId as string), enabled: !!watchedSubsId, staleTime: 1000 * 60 * 5 });
  const { data: selectedBusinessUnit } = useQuery({ queryKey: ['businessUnit', watchedBUsId], queryFn: () => businessUnitService.get(watchedBUsId as string), enabled: !!watchedBUsId, staleTime: 1000 * 60 * 5 });

  useEffect(() => {
    // initial small fetch to populate autocomplete
    let mounted = true;
    (async () => {
      try {
        const res = await subsidiaryService.list({ per_page: 50 });
        const maybe = res as unknown;
        const items = maybe && typeof maybe === 'object' && 'data' in (maybe as Record<string, unknown>) ? (maybe as { data: Subsidiary[] }).data : [];
        if (mounted) {
          // keep suggestions initial
          setSubsSuggestions(items ?? []);
          // populate cache and query cache
          const map: Record<string, Subsidiary> = {};
          (items ?? []).forEach((it) => { if (it?.id) { map[it.id] = it; qc.setQueryData(['subsidiary', it.id], it); } });
          setSubsCache((prev) => ({ ...prev, ...map }));
        }
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [qc]);

  const onSubsComplete = async (event: { query: string }) => {
    const q = event.query;
    try {
      const res = await subsidiaryService.list({ per_page: 20, filters: { name: q } });
      const maybe = res as unknown;
      const items = maybe && typeof maybe === 'object' && 'data' in (maybe as Record<string, unknown>) ? (maybe as { data: Subsidiary[] }).data : [];
      setSubsSuggestions(items ?? []);
      const map: Record<string, Subsidiary> = {};
      (items ?? []).forEach((it) => { if (it?.id) { map[it.id] = it; qc.setQueryData(['subsidiary', it.id], it); } });
      setSubsCache((prev) => ({ ...prev, ...map }));
    } catch {
      setSubsSuggestions([]);
    }
  };

  const onBusinessUnitComplete = async (event: { query: string }) => {
    const q = event.query;
    try {
      const res = await businessUnitService.list({ per_page: 20, filters: { name: q } });
      const maybe = res as unknown;
      const items = maybe && typeof maybe === 'object' && 'data' in (maybe as Record<string, unknown>) ? (maybe as { data: BusinessUnit[] }).data : [];
      setBusinessUnitSuggestions(items ?? []);
      const map: Record<string, BusinessUnit> = {};
      (items ?? []).forEach((it) => { if (it?.id) { map[it.id] = it; qc.setQueryData(['businessUnit', it.id], it); } });
      setBusinessUnitCache((prev) => ({ ...prev, ...map }));
    } catch {
      setBusinessUnitSuggestions([]);
    }
  };

  const metaFor = (name: string) => fields.find((f) => f.name === name) as FieldMeta | undefined;

  const showIfVisible = (name: string) => !!(metaFor(name) && metaFor(name)?.visible === true);
  const isRequired = (name: string) => !!(metaFor(name) && metaFor(name)?.required === true);

  return (
    <Card>
      <div className="mb-4 text-center">
        <div className="inline-block px-4 py-1 border border-teal-100 rounded-md bg-teal-50">
          <h3 className="text-lg font-semibold text-teal-700">Dados Gerais</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {/* ID */}
        {showIfVisible('id') && (
          <div>
            <label className="block mb-1">ID {isRequired('id') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="id"
                render={({ field }) => (
                  <InputText
                    className="w-full"
                    disabled
                    value={(field.value as unknown as string) ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                  />
                )}
              />
            ) : (
              <InputText className="w-full" disabled {...(register ? register('id') : {})} />
            )}
            {errors && errors['id'] && <small className="p-error">{getErrorMessage(errors, 'id')}</small>}
          </div>
        )}


        {/* Nomination date */}
        {showIfVisible('nomination_date') && (
          <div>
            <label className="block mb-1">{t("new_service_order:nomination_date")}</label>
            <Controller
              control={control}
              name="nomination_date"
              render={({ field }) => (
                <Calendar
                  className="w-full"
                  value={field.value as Date | undefined}
                  onChange={((e: any) => field.onChange((e as any)?.value ?? null)) as any} // eslint-disable-line @typescript-eslint/no-explicit-any
                />
              )}
            />
          </div>
        )}

        {/* Subsidiary ID (Autocomplete) */}
        {showIfVisible('subsidiary_id') && (
          <div>
            <label className="block mb-1">Subsidiária {isRequired('subsidiary_id') ? '*' : ''}</label>
            <Controller
              control={control}
              name="subsidiary_id"
              render={({ field }) => (
                <AutoComplete
                  value={
                    // prefer query result (fresh), then suggestions, then local cache
                    (selectedSubs as Subsidiary) ?? (subsSuggestions.find((s) => s.id === (field.value as unknown as string)) as Subsidiary)
                    ?? (subsCache[(field.value as unknown as string)] as Subsidiary)
                    ?? (field.value as unknown as Subsidiary)
                  }
                  suggestions={subsSuggestions}
                  field="name"
                  completeMethod={onSubsComplete}
                  onChange={(e: { value: unknown }) => {
                    const value = e.value;
                    // if the backend returns an object, we expect it has id
                    if (value && typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
                      const id = (value as Record<string, unknown>).id as string;
                      // cache the selected object
                      setSubsCache((prev) => ({ ...prev, [id]: value as Subsidiary }));
                      field.onChange(id);
                    } else {
                      field.onChange(String(value ?? '') || null);
                    }
                  }}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {errors && errors['subsidiary_id'] && <small className="p-error">{getErrorMessage(errors, 'subsidiary_id')}</small>}
          </div>
        )}

        {/* Business Unit ID */}
        {showIfVisible('business_unit_id') && (
          <div>
            <label className="block mb-1">{t("new_service_order:business_unit")} {isRequired('business_unit_id') ? '*' : ''}</label>
            <Controller
              control={control}
              name="business_unit_id"
              render={({ field }) => (
                <AutoComplete
                  value={
                    // prefer query result (fresh), then suggestions, then local cache
                    (selectedBusinessUnit as BusinessUnit) ?? (businessUnitSuggestions.find((s) => s.id === (field.value as unknown as string)) as BusinessUnit)
                    ?? (businessUnitCache[(field.value as unknown as string)] as BusinessUnit)
                    ?? (field.value as unknown as BusinessUnit)
                  }
                  suggestions={businessUnitSuggestions}
                  field="name"
                  completeMethod={onBusinessUnitComplete}
                  onChange={(e: { value: unknown }) => {
                    const value = e.value;
                    // if the backend returns an object, we expect it has id
                    if (value && typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
                      const id = (value as Record<string, unknown>).id as string;
                      // cache the selected object in businessUnitCache
                      setBusinessUnitCache((prev) => ({ ...prev, [id]: value as BusinessUnit }));
                      field.onChange(id);
                    } else {
                      field.onChange(String(value ?? '') || null);
                    }
                  }}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {errors && errors['business_unit_id'] && <small className="p-error">{getErrorMessage(errors, 'business_unit_id')}</small>}
          </div>
        )}

        {/* Order Identifier */}
        {showIfVisible('order_identifier') && (
          <div>
            <label className="block mb-1">Order Identifier {isRequired('order_identifier') ? '*' : ''}</label>
            <Controller
              control={control}
              name="order_identifier"
              render={({ field }) => (
                <InputText
                  className="w-full"
                  value={(field.value as unknown as string) ?? ''}
                  onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                />
              )}
            />
          </div>
        )}

        {/* Service Type ID */}
        {showIfVisible('service_type_id') && (
          <div>
            <label className="block mb-1">Service Type {isRequired('service_type_id') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="service_type_id"
                render={({ field }) => (
                  <InputText
                    className="w-full"
                    value={(field.value as unknown as string) ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                  />
                )}
              />
            ) : (
              <InputText className="w-full" {...(register ? register('service_type_id') : {})} />
            )}
            {errors && errors['service_type_id'] && <small className="p-error">{getErrorMessage(errors, 'service_type_id')}</small>}
          </div>
        )}

        {/* Product ID */}
        {showIfVisible('product_id') && (
          <div>
            <label className="block mb-1">Product {isRequired('product_id') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="product_id"
                render={({ field }) => (
                  <InputText
                    className="w-full"
                    value={(field.value as unknown as string) ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                  />
                )}
              />
            ) : (
              <InputText className="w-full" {...(register ? register('product_id') : {})} />
            )}
            {errors && errors['product_id'] && <small className="p-error">{getErrorMessage(errors, 'product_id')}</small>}
          </div>
        )}

        {/* Num Containers (InputNumber) */}
        {showIfVisible('num_containers') && (
          <div>
            <label className="block mb-1">Containers {isRequired('num_containers') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="num_containers"
                render={({ field }) => (
                  <InputNumber
                    className={`w-full ${((field.value as number) ?? 0) > 0 ? 'bg-yellow-50' : ''}`}
                    value={field.value as number | undefined}
                    onValueChange={(e) => field.onChange(e.value as number)}
                    showButtons
                    mode="decimal"
                    min={0}
                  />
                )}
              />
            ) : null}
            {errors && errors['num_containers'] && <small className="p-error">{getErrorMessage(errors, 'num_containers')}</small>}
          </div>
        )}

        {/* Exporter ID */}
        {showIfVisible('exporter_id') && (
          <div>
            <label className="block mb-1">Exporter {isRequired('exporter_id') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="exporter_id"
                render={({ field }) => (
                  <InputText
                    className="w-full"
                    value={(field.value as unknown as string) ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                  />
                )}
              />
            ) : (
              <InputText className="w-full" {...(register ? register('exporter_id') : {})} />
            )}
            {errors && errors['exporter_id'] && <small className="p-error">{getErrorMessage(errors, 'exporter_id')}</small>}
          </div>
        )}

        {/* Vessel Name */}
        {showIfVisible('vessel_name') && (
          <div>
            <label className="block mb-1">Vessel Name {isRequired('vessel_name') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="vessel_name"
                render={({ field }) => (
                  <InputText
                    className="w-full"
                    value={(field.value as unknown as string) ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                  />
                )}
              />
            ) : (
              <InputText className="w-full" {...(register ? register('vessel_name') : {})} />
            )}
            {errors && errors['vessel_name'] && <small className="p-error">{getErrorMessage(errors, 'vessel_name')}</small>}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-muted">Tipo de serviço: {serviceTypeId ?? '—'}</div>
    </Card>
  );
}

function getErrorMessage(errors: Record<string, unknown> | undefined, name: string) {
  if (!errors) return '';
  const e = errors[name] as unknown;
  if (e && typeof e === 'object' && 'message' in (e as Record<string, unknown>)) {
    const m = (e as Record<string, unknown>).message;
    return typeof m === 'string' ? m : '';
  }
  return '';
}
