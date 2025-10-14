import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { AutoComplete } from 'primereact/autocomplete';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { Control, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import type { ServiceOrderSubmission, FormPaymentItemSubmission } from '../../../models/serviceOrder';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { normalizeListResponse } from '../../../utils/apiHelpers';
import { makeAutoCompleteOnChange, resolveAutoCompleteValue } from '../../../utils/formHelpers';
import documentTypeService from '../../../services/documentTypeService';
import type { DocumentType } from '../../../models/DocumentType';
import type { PaymentsOrderService } from '../../../models/serviceOrder';
import { useTranslation } from 'react-i18next';


type Payment = PaymentsOrderService | FormPaymentItemSubmission;

type FieldMeta = {
  name: string;
  label?: string;
  default_value?: unknown;
  visible?: boolean;
  required?: boolean;
  field_type?: string | null;
  area?: string | null;
};

type Props = { control?: Control<ServiceOrderSubmission>; setValue?: UseFormSetValue<ServiceOrderSubmission>; getValues?: UseFormGetValues<ServiceOrderSubmission>; selectedServiceTypeId?: string | null; fieldConfigs?: Record<string, unknown> | undefined; formErrors?: Record<string, string | undefined>; fields?: FieldMeta[] };

export default function PaymentsSection(props?: Props) {
  const ctx = useFormContext<ServiceOrderSubmission>();
  const control = props?.control ?? ctx.control;
  const setValue = props?.setValue ?? ctx.setValue;
  const getValues = props?.getValues ?? ctx.getValues;
  const { t } = useTranslation(['new_service_order', 'service_orders']);
  const qc = useQueryClient();

  const payments: FormPaymentItemSubmission[] = (useWatch({ control, name: 'payments' }) as FormPaymentItemSubmission[] | undefined) ?? [];
  const watchedServiceTypeId = useWatch({ control, name: 'service_type_id' }) as string | undefined;
  const serviceTypeId = props?.selectedServiceTypeId ?? watchedServiceTypeId;

  const [docTypeSuggestions, setDocTypeSuggestions] = useState<DocumentType[]>([]);
  const [docTypeCache, setDocTypeCache] = useState<Record<string, DocumentType>>({});

  // service type dynamic fields passed from parent
  const fields = props?.fields ?? [];

  const metaFor = (name: string) => (fields || []).find((f) => f.name === name) as FieldMeta | undefined;
  const showIfVisible = (name: string) => !!(metaFor(name) && metaFor(name)?.visible === true);
  const isRequired = (name: string) => !!(metaFor(name) && metaFor(name)?.required === true);

  // map API parameter names to local form paths (supports per-index mapping for array items)
  const formFields: Record<string, ((idx: number) => string) | string> = {
    payment_description: (idx: number) => `payments.${idx}.description`,
    payment_document_type_id: (idx: number) => `payments.${idx}.document_type_id`,
    payment_document_number: (idx: number) => `payments.${idx}.document_number`,
    payment_unit_price: (idx: number) => `payments.${idx}.unit_price`,
    payment_quantity: (idx: number) => `payments.${idx}.quantity`,
    payment_total_price: (idx: number) => `payments.${idx}.total_price`,
  };

  const getFieldPath = (apiName: string, idx?: number) => {
    const f = formFields[apiName];
    if (!f) return apiName;
    if (typeof f === 'string') return f;
    return typeof idx === 'number' ? f(idx) : f(0);
  };

  // determine whether payments area should be shown: if there are any visible payment-area fields
  const paymentsAreaVisible = () => {
    if (!fields || fields.length === 0) return true; // default to visible when no metadata
    return (fields || []).some((f) => {
      if (!f) return false;
      const isPaymentName = f.name.startsWith('payment_') || f.name.startsWith('payments_') || f.area === 'payments' || f.name.includes('payments.');
      return isPaymentName && f.visible === true;
    });
  };

  const paymentsVisible = paymentsAreaVisible();

  // helper to get error message from formState
  const formErrors = props?.formErrors ?? (ctx.formState && (ctx.formState.errors as Record<string, unknown>)) ?? {};
  function getErrorMessage(errors: Record<string, unknown> | undefined, name: string) {
    if (!errors) return '';
    const e = errors[name] as unknown;
    if (e && typeof e === 'object' && 'message' in (e as Record<string, unknown>)) {
      const m = (e as Record<string, unknown>).message;
      return typeof m === 'string' ? m : '';
    }
    return '';
  }

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

  return (
    <Card>
      <div className="space-y-4">
  {(payments ?? []).map((_p, idx) => (
          <div key={idx} className="grid items-end grid-cols-1 gap-4 md:grid-cols-6">
            {showIfVisible('payment_description') && (
              <div className="md:col-span-2">
                <label className="block mb-1">{t('new_service_order:payment_description')} {isRequired('payment_description') ? '*' : ''}</label>
                <Controller control={control} name={`payments.${idx}.description`} render={({ field }) => (
                  <InputText className={`w-full ${getErrorMessage(formErrors, getFieldPath('payment_description', idx)) ? 'p-invalid' : ''}`} value={field.value ?? ''} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
                )} />
                {getErrorMessage(formErrors, getFieldPath('payment_description', idx)) && <small className="p-error">{getErrorMessage(formErrors, getFieldPath('payment_description', idx))}</small>}
              </div>
            )}

            {showIfVisible('payment_document_type_id') && (
              <div className="md:col-span-2">
                <label className="block mb-1">{t('new_service_order:document_type')} {isRequired('payment_document_type_id') ? '*' : ''}</label>
                <Controller control={control} name={`payments.${idx}.document_type_id`} render={({ field }) => (
                  <AutoComplete
                    value={resolveAutoCompleteValue<DocumentType>(docTypeSuggestions, docTypeCache, field.value, qc, 'document_type') as DocumentType | undefined}
                    suggestions={docTypeSuggestions}
                    field="name"
                    completeMethod={createDocTypeComplete}
                    onChange={makeAutoCompleteOnChange<DocumentType>({ setCache: (updater) => wrapSetDocTypeCache(updater), cacheKey: 'document_type', qc, objectFieldKey: `payments.${idx}.document_type`, setFormValue: setValue })(field.onChange)}
                    dropdown
                    className={`w-full ${getErrorMessage(formErrors, getFieldPath('payment_document_type_id', idx)) ? 'p-invalid' : ''}`}
                  />
                )} />
                  {getErrorMessage(formErrors, getFieldPath('payment_document_type_id', idx)) && <small className="p-error">{getErrorMessage(formErrors, getFieldPath('payment_document_type_id', idx))}</small>}
              </div>
            )}

            {showIfVisible('payment_document_number') && (
              <div className="md:col-span-1">
                <label className="block mb-1">{t('new_service_order:payment_document_number')} {isRequired('payment_document_number') ? '*' : ''}</label>
                <Controller control={control} name={`payments.${idx}.document_number`} render={({ field }) => (
                  <InputText className={`w-full ${getErrorMessage(formErrors, getFieldPath('payment_document_number', idx)) ? 'p-invalid' : ''}`} value={field.value ?? ''} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
                )} />
                {getErrorMessage(formErrors, getFieldPath('payment_document_number', idx)) && <small className="p-error">{getErrorMessage(formErrors, getFieldPath('payment_document_number', idx))}</small>}
              </div>
            )}

            {showIfVisible('payment_unit_price') && (
              <div className="md:col-span-1">
                <label className="block mb-1">{t('new_service_order:payment_unit_price')} {isRequired('payment_unit_price') ? '*' : ''}</label>
                <Controller control={control} name={`payments.${idx}.unit_price`} render={({ field }) => (
                  <InputNumber className={`w-full ${getErrorMessage(formErrors, getFieldPath('payment_unit_price', idx)) ? 'p-invalid' : ''}`} value={field.value ? Number(String(field.value)) : null} mode="currency" currency="BRL" locale="pt-BR" onValueChange={(e) => field.onChange(e.value ? String(e.value) : '')} onBlur={() => calcLineTotal(idx)} />
                )} />
                {getErrorMessage(formErrors, getFieldPath('payment_unit_price', idx)) && <small className="p-error">{getErrorMessage(formErrors, getFieldPath('payment_unit_price', idx))}</small>}
              </div>
            )}

            {showIfVisible('payment_quantity') && (
              <div className="md:col-span-1">
                <label className="block mb-1">{t('new_service_order:payment_quantity')} {isRequired('payment_quantity') ? '*' : ''}</label>
                <Controller control={control} name={`payments.${idx}.quantity`} render={({ field }) => (
                  <InputNumber className={`w-full ${getErrorMessage(formErrors, getFieldPath('payment_quantity', idx)) ? 'p-invalid' : ''}`} value={field.value ? Number(String(field.value)) : null} mode="decimal" locale="pt-BR" minFractionDigits={2} maxFractionDigits={2} onValueChange={(e) => field.onChange(e.value ? String(e.value) : '')} onBlur={() => calcLineTotal(idx)} />
                )} />
                {getErrorMessage(formErrors, getFieldPath('payment_quantity', idx)) && <small className="p-error">{getErrorMessage(formErrors, getFieldPath('payment_quantity', idx))}</small>}
              </div>
            )}

            {showIfVisible('payment_total_price') && (
              <div className="md:col-span-1">
                <label className="block mb-1">{t('new_service_order:payment_total_price')} {isRequired('payment_total_price') ? '*' : ''}</label>
                <Controller control={control} name={`payments.${idx}.total_price`} render={({ field }) => (
                  <InputNumber className={`w-full ${getErrorMessage(formErrors, getFieldPath('payment_total_price', idx)) ? 'p-invalid' : ''}`} value={field.value ? Number(String(field.value)) : null} mode="currency" currency="BRL" locale="pt-BR" disabled />
                )} />
                {getErrorMessage(formErrors, getFieldPath('payment_total_price', idx)) && <small className="p-error">{getErrorMessage(formErrors, getFieldPath('payment_total_price', idx))}</small>}
              </div>
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
          {serviceTypeId && paymentsVisible && (
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
