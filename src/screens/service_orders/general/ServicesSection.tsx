import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { AutoComplete } from 'primereact/autocomplete';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import type { Control, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import type { FormServiceItemSubmission, ServiceOrderSubmission } from '../../../models/serviceOrder';
import { makeAutoCompleteOnChange, resolveAutoCompleteValue } from '../../../utils/formHelpers';
import { createAutocompleteComplete } from '../../../utils/autocompleteHelpers';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import serviceService from '../../../services/serviceService';
import type { Service } from '../../../models/service';
import type { ServiceOrderService } from '../../../models/serviceOrder';
import type { ServiceOrder } from '../../../models/serviceOrder';
import { useQueryClient } from '@tanstack/react-query';
// normalizeListResponse removed; using createAutocompleteComplete helper

// Props are optional; component will use form context when not provided
type FieldMeta = { name: string; visible?: boolean; required?: boolean; default_value?: unknown };

type Props = {
  control?: Control<ServiceOrderSubmission>;
  setValue?: UseFormSetValue<ServiceOrderSubmission>;
  getValues?: UseFormGetValues<ServiceOrderSubmission>;
  selectedServiceTypeId?: string | null;
  serviceTypeFields?: FieldMeta[] | undefined;
  // optional raw source from server when editing (array of service_order_services)
  svcSource?: ServiceOrderService[] | undefined;
};

export default function ServicesSection(props?: Props) {
  const { t } = useTranslation(['new_service_order', 'service_orders']);
  const ctx = useFormContext<ServiceOrderSubmission>();
  const control = props?.control ?? ctx.control;
  const setValue = props?.setValue ?? ctx.setValue;
  const getValues = props?.getValues ?? ctx.getValues;
  const typedSetValue = setValue as UseFormSetValue<ServiceOrderSubmission>;
  const setServiceField = (index: number, key: keyof FormServiceItemSubmission, value: unknown) => {
    const k = `services.${index}.${String(key)}` as unknown as Parameters<typeof typedSetValue>[0];
    typedSetValue(k, value);
  };
  // call useWatch unconditionally to satisfy hooks rules
  const watchedServiceTypeId = useWatch({ control, name: 'service_type_id' }) as string | undefined;
  const serviceTypeId = props?.selectedServiceTypeId ?? watchedServiceTypeId;
  // build local lookup from provided serviceTypeFields (if any)
  const serviceTypeFieldsLocal = props?.serviceTypeFields ?? [];
  const byNameLocal: Record<string, FieldMeta | undefined> = {};
  (serviceTypeFieldsLocal || []).forEach((f) => { if (f && typeof f === 'object' && 'name' in f) byNameLocal[f.name] = f as FieldMeta; });

  const SERVICES_FIELD_NAMES: Record<string, string> = {
    serviceField: 'service_id',
    unitPriceField: 'service_unit_price',
    quantityField: 'service_quantity',
    totalPriceField: 'service_total_price',
    scopeField: 'service_scope    ',
  };

  const fieldConfigs = Object.fromEntries(Object.entries(SERVICES_FIELD_NAMES).map(([k, svcName]) => [k, byNameLocal[svcName]])) as Record<string, FieldMeta | undefined>;
  const { serviceField, unitPriceField, quantityField, totalPriceField, scopeField } = fieldConfigs;
  // strongly type the field array to expect `services` as an array of FormServiceItemSubmission
  type RHFServiceFields = { services?: FormServiceItemSubmission[] };
  // control is typed as Control<ServiceOrderSubmission>; narrow it for useFieldArray
  const { fields, append, remove } = useFieldArray<RHFServiceFields, 'services'>({ control: control as unknown as Control<RHFServiceFields>, name: 'services' });

  const [serviceSuggestions, setServiceSuggestions] = useState<Service[]>([]);
  const [serviceCache, setServiceCache] = useState<Record<string, Service>>({});
  const qc = useQueryClient();

  // when fields change (e.g., editing existing order) ensure cached items exist
  useEffect(() => {
    // collect ids currently present in services field values
    const ids: string[] = [];
    try {
      const raw = getValues('services') as ServiceOrderService[] | undefined | unknown;
      if (Array.isArray(raw)) {
        (raw as ServiceOrderService[]).forEach((it) => { if (it && it.service_id) ids.push(String(it.service_id)); });
      }
    } catch {
      // ignore
    }

    ids.forEach(async (id) => {
      if (!serviceCache[id] && !qc.getQueryData(['service', id])) {
        try {
          const full = await serviceService.get(id);
          if (full && full.id) {
            setServiceCache((prev) => ({ ...prev, [id]: full }));
            qc.setQueryData(['service', id], full);
          }
        } catch {
          // ignore
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onServiceComplete = createAutocompleteComplete<Service>({ listFn: serviceService.list, qc, cacheKeyRoot: 'service', setSuggestions: setServiceSuggestions, setCache: (updater) => setServiceCache((prev) => updater(prev)), per_page: 20, filterKey: 'name' });

  const addRow = () => append({ service_id: null, unit_price: 0, quantity: 0, total_price: 0, scope: '' } as unknown as FormServiceItemSubmission);

  function calcGrandTotal() {
    const items = (getValues?.('services') as FormServiceItemSubmission[] | undefined) ?? [];
    const total = items.reduce((acc: number, curr: FormServiceItemSubmission) => {
      const v = curr && curr.total_price != null ? Number(curr.total_price as unknown) : 0;
      return acc + (Number.isNaN(v) ? 0 : v);
    }, 0);
    return total;
  }

  const hasVisibleFields =
    serviceField?.visible ||
    unitPriceField?.visible ||
    quantityField?.visible ||
    totalPriceField?.visible ||
    scopeField?.visible;

  if (!hasVisibleFields) return null;

  return (
    <Card>
      <div className="mb-4 text-center">
        <div className="inline-block w-full px-4 py-1 border border-teal-100 rounded-md bg-teal-50">
          <h3 className="text-lg font-semibold text-teal-700">{t('service_orders:service_to_be_performed').toUpperCase()}</h3>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="invisible mt-2 text-sm text-muted">Adicione os serviços clicando no ícone ao lado</div>
        {serviceTypeId && <Button icon="pi pi-plus" className="p-button-text" onClick={addRow} />}
      </div>

      <div className="mt-4 space-y-3">
        {fields.map((f, idx) => (
          <div key={f.id} className="grid items-end grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {serviceField?.visible !== false && (
            <div>
              <label className="block mb-1">Serviço{serviceField?.required ? ' *' : ''}</label>
              <Controller
                control={control}
                name={`services.${idx}.service_id`}
                render={({ field }) => (
                  <AutoComplete
                    value={resolveAutoCompleteValue<Service>(serviceSuggestions, serviceCache, field.value, qc, 'service') as Service | undefined}
                    suggestions={serviceSuggestions}
                    field="name"
                    completeMethod={(e: { query: string }) => onServiceComplete(e)}
                    onChange={makeAutoCompleteOnChange<Service>({ setCache: (updater) => setServiceCache((prev) => updater(prev)), cacheKey: 'service', qc, objectFieldKey: `services.${idx}.service`, setFormValue: setValue })(field.onChange)}
                    dropdown
                    className="w-full"
                  />
                )}
              />
            </div>
            )}

            {unitPriceField?.visible !== false && (
            <div>
              <label className="block mb-1">Valor unitário{unitPriceField?.required ? ' *' : ''}</label>
              <Controller
                control={control}
                name={`services.${idx}.unit_price`}
                render={({ field }) => (
                  <InputNumber
                    className="w-full"
                    value={field.value == null ? null : Number(field.value as unknown)}
                    onValueChange={(e) => {
                      const unit = e.value ?? 0;
                      field.onChange(unit ?? null);
                      const q = Number(getValues(`services.${idx}.quantity`) ?? 0);
                      setServiceField(idx, 'total_price', (Number(unit) * q));
                    }}
                    aria-required={Boolean(unitPriceField?.required)}
                    mode="currency"
                    currency="BRL"
                    locale="pt-BR"
                    min={0}
                  />
                )}
              />
            </div>
            )}

            {quantityField?.visible !== false && (
            <div>
              <label className="block mb-1">Quantidade{quantityField?.required ? ' *' : ''}</label>
              <Controller
                control={control}
                name={`services.${idx}.quantity`}
                render={({ field }) => (
                  <InputNumber
                    className="w-full"
                    value={field.value == null ? null : Number(field.value as unknown)}
                    onValueChange={(e) => {
                      const q = e.value ?? 0;
                      field.onChange(q ?? null);
                      const unit = Number(getValues(`services.${idx}.unit_price`) ?? 0);
                      setServiceField(idx, 'total_price', (unit * Number(q)));
                    }}
                    aria-required={Boolean(quantityField?.required)}
                    min={0}
                    step={1}
                    mode="decimal"
                  />
                )}
              />
            </div>
            )}

            {totalPriceField?.visible !== false && (
            <div>
              <label className="block mb-1">Total{totalPriceField?.required ? ' *' : ''}</label>
              <Controller
                control={control}
                name={`services.${idx}.total_price`}
                render={({ field }) => (
                  <InputNumber className="w-full" value={field.value == null ? null : Number(String(field.value))} mode="currency" currency="BRL" locale="pt-BR" disabled />
                )}
              />
            </div>
            )}

            <div className="flex justify-end gap-2 col-span-full">
              <Button icon="pi pi-trash" className="p-button-text p-button-danger" onClick={() => remove(idx)} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-start w-full my-4 font-bold">
        {t('new_service_order:total_price')}: 
        <div id="services_total_price" className="mx-4 font-normal">
          {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calcGrandTotal())}
        </div>
      </div>
    </Card>
  );
}
