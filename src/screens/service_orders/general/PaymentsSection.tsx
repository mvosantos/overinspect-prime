import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { AutoComplete } from 'primereact/autocomplete';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { Control, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import type { ServiceOrderSubmission, FormPaymentItemSubmission } from '../../../models/serviceOrder';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { normalizeListResponse } from '../../../utils/apiHelpers';
import { makeAutoCompleteOnChange, resolveAutoCompleteValue } from '../../../utils/formHelpers';
import documentTypeService from '../../../services/documentTypeService';
import type { DocumentType } from '../../../models/DocumentType';
import type { PaymentsOrderService, ServiceOrder } from '../../../models/serviceOrder';
import { useTranslation } from 'react-i18next';
import { mapPaymentsSourceToForm } from '../../../utils/formSeedHelpers';


type Payment = PaymentsOrderService | FormPaymentItemSubmission;

type FieldMeta = { name: string; visible?: boolean; required?: boolean; default_value?: unknown };

type Props = { control?: Control<ServiceOrderSubmission>; setValue?: UseFormSetValue<ServiceOrderSubmission>; getValues?: UseFormGetValues<ServiceOrderSubmission>; selectedServiceTypeId?: string | null; serviceTypeFields?: FieldMeta[] | undefined; formErrors?: Record<string, string | undefined>; paySource?: PaymentsOrderService[] | undefined };

export default function PaymentsSection(props?: Props) {
  const ctx = useFormContext<ServiceOrderSubmission>();
  const control = props?.control ?? ctx.control;
  const setValue = props?.setValue ?? ctx.setValue;
  const getValues = props?.getValues ?? ctx.getValues;
  const { t } = useTranslation(['new_service_order', 'service_orders']);
  const qc = useQueryClient();

  const rawPayments = (useWatch({ control, name: 'payments' }) as FormPaymentItemSubmission[] | undefined) ?? [];
  const payments: FormPaymentItemSubmission[] = (() => rawPayments)();
  const watchedServiceTypeId = useWatch({ control, name: 'service_type_id' }) as string | undefined;
  const serviceTypeId = props?.selectedServiceTypeId ?? watchedServiceTypeId;

  // debug: log payments when they change (development only)
  useEffect(() => {
    try {
      const meta = import.meta as unknown as { env?: { MODE?: string } };
      const isDev = (meta.env && meta.env.MODE !== 'production') || typeof window !== 'undefined';
      if (isDev) {
        try { console.debug('[PaymentsSection] payments:', payments); } catch { console.log('[PaymentsSection] payments (fallback):', payments); }
      }
    } catch {
      // fallback: always log if something goes wrong detecting env
      try { console.log('[PaymentsSection] payments:', payments); } catch { /* ignore */ }
    }
  }, [payments]);

  const [docTypeSuggestions, setDocTypeSuggestions] = useState<DocumentType[]>([]);
  const [docTypeCache, setDocTypeCache] = useState<Record<string, DocumentType>>({});

  // fetch document types directly (small helper inline to avoid extra service import issues)
  const createDocTypeComplete = async (e: { query: string }) => {
    const q = e.query;
    try {
      const res = await documentTypeService.list({ per_page: 20, filters: { name: q } });
      const items = normalizeListResponse<DocumentType>(res);
      setDocTypeSuggestions(items ?? []);
      (items ?? []).forEach((it) => { if (it?.id) qc.setQueryData(['document_type', it.id], it); });
    } catch {
      setDocTypeSuggestions([]);
    }
  };

  const wrapSetDocTypeCache = (updater: (prev: Record<string, DocumentType>) => Record<string, DocumentType>) => setDocTypeCache((prev) => updater(prev));

  // call useWatch unconditionally to preserve hook order
  useWatch({ control, name: 'service_type_id' });

  // Allow this section to compute its own mapping from `serviceTypeFields`
  const serviceTypeFieldsLocal = props?.serviceTypeFields ?? [];
  const byNameLocal: Record<string, FieldMeta | undefined> = {};
  (serviceTypeFieldsLocal || []).forEach((f) => { if (f && typeof f === 'object' && 'name' in f) byNameLocal[f.name] = f as FieldMeta; });

  const PAYMENT_FIELD_NAMES: Record<string, string> = {
    paymentDescription: 'payment_description',
    paymentDocumentTypeId: 'payment_document_type_id',
    paymentUnitPrice: 'payment_unit_price',
    paymentQuantity: 'payment_quantity',
    paymentTotalPrice: 'payment_total_price',
  };

  const fieldConfigs = Object.fromEntries(Object.entries(PAYMENT_FIELD_NAMES).map(([k, svcName]) => [k, byNameLocal[svcName]])) as Record<string, FieldMeta | undefined>;
  const paymentDescriptionField = fieldConfigs.paymentDescription;
  const paymentDocumentTypeIdField = fieldConfigs.paymentDocumentTypeId;
  const paymentUnitPriceField = fieldConfigs.paymentUnitPrice;
  const paymentQuantityField = fieldConfigs.paymentQuantity;
  const paymentTotalPriceField = fieldConfigs.paymentTotalPrice;

  // local parser (handles '.' as thousand and ',' as decimal)
  const parseNumberUniversalLocal = (v?: string | number | null) => {
    if (v === null || v === undefined) return NaN;
    if (typeof v === 'number') return v;
    const s = String(v).replace(/\./g, '').replace(/,/g, '.');
    const n = Number(s);
    return isNaN(n) ? NaN : n;
  };

  function calcLineTotal(index: number) {
    const unit = String(getValues?.(`payments.${index}.unit_price`) ?? '');
    const qty = String(getValues?.(`payments.${index}.quantity`) ?? '');
    const unitNum = parseNumberUniversalLocal(unit);
    const qtyNum = parseNumberUniversalLocal(qty);
    const total = (isNaN(unitNum) ? 0 : unitNum) * (isNaN(qtyNum) ? 0 : qtyNum);
    (setValue as unknown as (name: string, value: unknown) => void)?.(`payments.${index}.total_price`, String(total));
  }

  function calcGrandTotal() {
    const items = getValues?.('payments') as FormPaymentItemSubmission[] | undefined;
    const total = (items ?? []).reduce((acc: number, curr: Payment) => {
      const v = parseNumberUniversalLocal(curr.total_price);
      return acc + (isNaN(v) ? 0 : v);
    }, 0);
    return total;
  }

  // pre-seed when parent provided a raw payments source (edit mode)
  useEffect(() => {
    try {
      if (!props?.paySource || !Array.isArray(props.paySource)) return;
      // if form already has payments, don't overwrite
      const existing = (getValues?.('payments') as FormPaymentItemSubmission[] | undefined) ?? [];
      if (Array.isArray(existing) && existing.length > 0) return;
      const mapped = mapPaymentsSourceToForm(props.paySource as ServiceOrder['payments']);
      setValue?.('payments', mapped);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <div className="space-y-4">
        {(payments ?? []).map((_p, idx) => (
          <div key={idx} className="grid items-end grid-cols-1 gap-4 md:grid-cols-6">
            {paymentDescriptionField?.visible !== false && (
              <div className="md:col-span-2">
                <label className="block mb-1">{t('new_service_order:payment_description')}{paymentDescriptionField?.required ? ' *' : ''}</label>
                <Controller control={control} name={`payments.${idx}.description`} defaultValue={paymentDescriptionField?.default_value as string | undefined} render={({ field }) => (
                  <>                
                    <InputText
                      className="w-full"
                      value={field.value ?? ''}
                        onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                    />
                    {props?.formErrors && typeof props.formErrors === 'object' && (props.formErrors as Record<string, string | undefined>)[`payments.${idx}.description`] && (
                      <small className="p-error">{(props.formErrors as Record<string, string | undefined>)[`payments.${idx}.description`]}</small>
                    )}
                  </>
                )} />
              </div>
            )}

            {paymentDocumentTypeIdField?.visible && (
              <div className="md:col-span-2">
                <label className="block mb-1">{t('new_service_order:document_type')}{paymentDocumentTypeIdField?.required ? ' *' : ''}</label>
                <Controller control={control} name={`payments.${idx}.document_type_id`} render={({ field }) => (
                  <>
                    <AutoComplete
                      value={resolveAutoCompleteValue<DocumentType>(docTypeSuggestions, docTypeCache, field.value, qc, 'document_type') as DocumentType | undefined}
                      suggestions={docTypeSuggestions}
                      field="name"
                      aria-required={paymentDocumentTypeIdField?.required ? true : undefined}
                      completeMethod={createDocTypeComplete}
                      onChange={makeAutoCompleteOnChange<DocumentType>({ setCache: (updater) => wrapSetDocTypeCache(updater), cacheKey: 'document_type', qc, objectFieldKey: `payments.${idx}.document_type`, setFormValue: setValue })(field.onChange)}
                      dropdown
                      className="w-full"
                    />
                    {props?.formErrors && typeof props.formErrors === 'object' && (props.formErrors as Record<string, string | undefined>)[`payments.${idx}.document_type_id`] && (
                      <small className="p-error">{(props.formErrors as Record<string, string | undefined>)[`payments.${idx}.document_type_id`]}</small>
                    )}
                  </>
                )} />
              </div>
            )}

            {paymentDocumentTypeIdField?.visible && (
              <>
                <div className="md:col-span-1">
                  <label className="block mb-1">{t('new_service_order:payment_document_number')}</label>
                  <Controller control={control} name={`payments.${idx}.document_number`} render={({ field }) => (
                    <InputText className="w-full" value={field.value ?? ''} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} aria-required={paymentUnitPriceField?.required ? true : undefined} />
                  )} />
                  {props?.formErrors && typeof props.formErrors === 'object' && (props.formErrors as Record<string, string | undefined>)[`payments.${idx}.document_number`] && (
                    <small className="p-error">{(props.formErrors as Record<string, string | undefined>)[`payments.${idx}.document_number`]}</small>
                  )}
                </div>
              </>
            )}

            {paymentUnitPriceField?.visible && (
              <>
                <div className="md:col-span-1">
                  <label className="block mb-1">{t('new_service_order:payment_unit_price')}</label>
                  <Controller control={control} name={`payments.${idx}.unit_price`} render={({ field }) => (
                    <InputNumber className="w-full" value={field.value ? Number(String(field.value)) : null} mode="currency" currency="BRL" locale="pt-BR" onValueChange={(e) => field.onChange(e.value ? String(e.value) : '')} onBlur={() => calcLineTotal(idx)} aria-required={paymentUnitPriceField?.required ? true : undefined} />
                  )} />
                </div>
                {props?.formErrors && typeof props.formErrors === 'object' && (props.formErrors as Record<string, string | undefined>)[`payments.${idx}.unit_price`] && (
                  <small className="p-error">{(props.formErrors as Record<string, string | undefined>)[`payments.${idx}.unit_price`]}</small>
                )}
              </>
            )}

            {paymentQuantityField?.visible && (
              <>
                <div className="md:col-span-1">
                  <label className="block mb-1">{t('new_service_order:payment_quantity')}</label>
                  <Controller control={control} name={`payments.${idx}.quantity`} render={({ field }) => (
                    <InputNumber className="w-full" value={field.value ? Number(String(field.value)) : null} mode="decimal" locale="pt-BR" minFractionDigits={2} maxFractionDigits={2} onValueChange={(e) => field.onChange(e.value ? String(e.value) : '')} onBlur={() => calcLineTotal(idx)} />
                  )} />
                </div>
                {props?.formErrors && typeof props.formErrors === 'object' && (props.formErrors as Record<string, string | undefined>)[`payments.${idx}.quantity`] && (
                  <small className="p-error">{(props.formErrors as Record<string, string | undefined>)[`payments.${idx}.quantity`]}</small>
                )}
              </>
            )}


            {paymentTotalPriceField?.visible && (
              <>
                <div className="md:col-span-1">
                  <label className="block mb-1">{t('new_service_order:payment_total_price')}</label>
                  <Controller control={control} name={`payments.${idx}.total_price`} render={({ field }) => (
                    <InputNumber className="w-full" value={field.value ? Number(String(field.value)) : null} mode="currency" currency="BRL" locale="pt-BR" disabled />
                  )} />
                </div>
                {props?.formErrors && typeof props.formErrors === 'object' && (props.formErrors as Record<string, string | undefined>)[`payments.${idx}.total_price`] && (
                  <small className="p-error">{(props.formErrors as Record<string, string | undefined>)[`payments.${idx}.total_price`]}</small>
                )}
              </>
            )}

            <div className="flex gap-2 md:col-span-1">
              <Button type="button" icon="pi pi-trash" className="p-button-danger" label={t('new_service_order:delete_new_payment')} onClick={() => {
                // mirror ServicesSection delete behavior: remove by index and update form value
                const next = (payments ?? []).slice();
                next.splice(idx, 1);
                setValue?.('payments', next);
              }} />
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          {serviceTypeId && (
            <Button type="button" icon="pi pi-plus" className="p-button-text" aria-label={t('new_service_order:add_new_payment')} title={t('new_service_order:add_new_payment')} onClick={() => {
              const next: FormPaymentItemSubmission[] = [...(payments ?? []), { id: crypto.randomUUID(), description: '', document_type_id: null, document_number: '', unit_price: '', quantity: '', total_price: '' }];
              setValue?.('payments', next);
            }} />
          )}
        </div>

        <div className="flex justify-start w-full my-4 font-bold">
          {t('new_service_order:total_price')}:
          <div id="payments_total_price" className="mx-4 font-normal">
            {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calcGrandTotal())}
          </div>
        </div>
      </div>
    </Card>
  );
  }
