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
// import { normalizeListResponse } from '../../../utils/apiHelpers';
import { createAutocompleteComplete } from '../../../utils/autocompleteHelpers';
import { makeAutoCompleteOnChange, resolveAutoCompleteValue } from '../../../utils/formHelpers';
import documentTypeService from '../../../services/documentTypeService';
import type { DocumentType } from '../../../models/DocumentType';
import type { PaymentsOrderService, ServiceOrder } from '../../../models/serviceOrder';
import { useTranslation } from 'react-i18next';
import { mapPaymentsSourceToForm } from '../../../utils/formSeedHelpers';


type Payment = PaymentsOrderService | FormPaymentItemSubmission;

import type { FieldMeta } from '../../../utils/formSectionHelpers';
import { showIfVisible as _showIfVisible, isRequired as _isRequired, paymentsAreaVisible as _paymentsAreaVisible, getErrorMessage as _getErrorMessage, makeFormFieldMapper } from '../../../utils/formSectionHelpers';

type Props = { control?: Control<ServiceOrderSubmission>; setValue?: UseFormSetValue<ServiceOrderSubmission>; getValues?: UseFormGetValues<ServiceOrderSubmission>; selectedServiceTypeId?: string | null; fieldConfigs?: Record<string, unknown> | undefined; formErrors?: Record<string, string | undefined>; fields?: FieldMeta[] };

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

  // service type dynamic fields passed from parent
  const fields = props?.fields ?? [];

  const showIfVisible = _showIfVisible(fields);
  const isRequired = _isRequired(fields);

  // map API parameter names to local form paths (supports per-index mapping for array items)
  const formFields: Record<string, ((idx: number) => string) | string> = {
    payment_description: (idx: number) => `payments.${idx}.description`,
    payment_document_type_id: (idx: number) => `payments.${idx}.document_type_id`,
    payment_document_number: (idx: number) => `payments.${idx}.document_number`,
    payment_unit_price: (idx: number) => `payments.${idx}.unit_price`,
    payment_quantity: (idx: number) => `payments.${idx}.quantity`,
    payment_total_price: (idx: number) => `payments.${idx}.total_price`,
  };

  const getFieldPath = makeFormFieldMapper(formFields);

  const paymentsVisible = _paymentsAreaVisible(fields)();

  // helper to get error message from formState
  const formErrors = props?.formErrors ?? (ctx.formState && (ctx.formState.errors as Record<string, unknown>)) ?? {};
  const getErrorMessage = (name: string) => _getErrorMessage(formErrors, name);

  // fetch document types (reused helper)
  const createDocTypeComplete = createAutocompleteComplete<DocumentType>({ listFn: documentTypeService.list, qc, cacheKeyRoot: 'document_type', setSuggestions: setDocTypeSuggestions, setCache: (updater) => setDocTypeCache((prev) => updater(prev)), per_page: 20, filterKey: 'name' });

  const wrapSetDocTypeCache = (updater: (prev: Record<string, DocumentType>) => Record<string, DocumentType>) => setDocTypeCache((prev) => updater(prev));

  // Use numeric values from PrimeReact InputNumber (locale-aware). Store numbers in the form
  function calcLineTotal(index: number) {
    const unitVal = getValues?.(`payments.${index}.unit_price`);
    const qtyVal = getValues?.(`payments.${index}.quantity`);
    const unitNum = unitVal == null ? 0 : Number(unitVal as unknown);
    const qtyNum = qtyVal == null ? 0 : Number(qtyVal as unknown);
    const total = (Number.isNaN(unitNum) ? 0 : unitNum) * (Number.isNaN(qtyNum) ? 0 : qtyNum);
    (setValue as unknown as (name: string, value: unknown) => void)?.(`payments.${index}.total_price`, total);
  }

  function calcGrandTotal() {
    const items = (getValues?.('payments') as FormPaymentItemSubmission[] | undefined) ?? [];
    const total = items.reduce((acc: number, curr: Payment) => {
      const v = curr && curr.total_price != null ? Number(curr.total_price as unknown) : 0;
      return acc + (Number.isNaN(v) ? 0 : v);
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
            {showIfVisible('payment_description') && (
              <div className="md:col-span-2">
                <label className="block mb-1">{t('new_service_order:payment_description')} 
                  {isRequired('payment_description') ? '*' : ''}
                </label>
                <Controller control={control} name={`payments.${idx}.description`} render={({ field }) => (
                  <InputText className={`w-full ${getErrorMessage(getFieldPath('payment_description', idx)) ? 'p-invalid' : ''}`} value={field.value ?? ''} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
                )} />

                {getErrorMessage(getFieldPath('payment_description', idx)) && <small className="p-error">{getErrorMessage(getFieldPath('payment_description', idx))}</small>}
              </div>
            )}

            {showIfVisible('payment_document_type_id') && (
              <div className="md:col-span-2">
                <label className="block mb-1">{t('new_service_order:document_type')} 
                  {isRequired('payment_document_type_id') ? '*' : ''}
                </label>

                <Controller control={control} name={`payments.${idx}.document_type_id`} render={({ field }) => (
                  <AutoComplete
                    value={resolveAutoCompleteValue<DocumentType>(docTypeSuggestions, docTypeCache, field.value, qc, 'document_type') as DocumentType | undefined}
                    suggestions={docTypeSuggestions}
                    field="name"
                    completeMethod={createDocTypeComplete}
                    onChange={makeAutoCompleteOnChange<DocumentType>({ setCache: (updater) => wrapSetDocTypeCache(updater), cacheKey: 'document_type', qc, objectFieldKey: `payments.${idx}.document_type`, setFormValue: setValue })(field.onChange)}
                    dropdown
                    className={`w-full ${getErrorMessage(getFieldPath('payment_document_type_id', idx)) ? 'p-invalid' : ''}`}
                  />
                )} />

                {getErrorMessage(getFieldPath('payment_document_type_id', idx)) && <small className="p-error">{getErrorMessage(getFieldPath('payment_document_type_id', idx))}</small>}
              </div>
            )}

            {showIfVisible('payment_document_number') && (
              <div className="md:col-span-1">
                <label className="block mb-1">{t('new_service_order:payment_document_number')} 
                  {isRequired('payment_document_number') ? '*' : ''}
                </label>

                <Controller control={control} name={`payments.${idx}.document_number`} render={({ field }) => (
                  <InputText className={`w-full ${getErrorMessage(getFieldPath('payment_document_number', idx)) ? 'p-invalid' : ''}`} value={field.value ?? ''} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
                )} />

                {getErrorMessage(getFieldPath('payment_document_number', idx)) && <small className="p-error">{getErrorMessage(getFieldPath('payment_document_number', idx))}</small>}
              </div>
            )}

            {showIfVisible('payment_unit_price') && (
              <div className="md:col-span-1">
                <label className="block mb-1">{t('new_service_order:payment_unit_price')} 
                  {isRequired('payment_unit_price') ? '*' : ''}
                </label>

                <Controller control={control} name={`payments.${idx}.unit_price`} render={({ field }) => (
                  <InputNumber className={`w-full ${getErrorMessage(getFieldPath('payment_unit_price', idx)) ? 'p-invalid' : ''}`} value={field.value == null ? null : Number(field.value as unknown)} mode="currency" currency="BRL" locale="pt-BR" minFractionDigits={2} maxFractionDigits={2} onValueChange={(e) => field.onChange(e.value ?? null)} onBlur={() => calcLineTotal(idx)} />
                )} />

                {getErrorMessage(getFieldPath('payment_unit_price', idx)) && <small className="p-error">{getErrorMessage(getFieldPath('payment_unit_price', idx))}</small>}
              </div>
            )}

            {showIfVisible('payment_quantity') && (
              <div className="md:col-span-1">
                <label className="block mb-1">{t('new_service_order:payment_quantity')} 
                  {isRequired('payment_quantity') ? '*' : ''}
                </label>

                <Controller control={control} name={`payments.${idx}.quantity`} render={({ field }) => (
                  <InputNumber className={`w-full ${getErrorMessage(getFieldPath('payment_quantity', idx)) ? 'p-invalid' : ''}`} value={field.value == null ? null : Number(field.value as unknown)} mode="decimal" locale="pt-BR" minFractionDigits={2} maxFractionDigits={2} onValueChange={(e) => field.onChange(e.value ?? null)} onBlur={() => calcLineTotal(idx)} />
                )} />

                {getErrorMessage(getFieldPath('payment_quantity', idx)) && <small className="p-error">{getErrorMessage(getFieldPath('payment_quantity', idx))}</small>}
              </div>
            )}

            {showIfVisible('payment_total_price') && (
              <div className="md:col-span-1">
                <label className="block mb-1">{t('new_service_order:payment_total_price')} 
                    {isRequired('payment_total_price') ? '*' : ''}
                </label>

                <Controller control={control} name={`payments.${idx}.total_price`} render={({ field }) => (
                  <InputNumber className={`w-full ${getErrorMessage(getFieldPath('payment_total_price', idx)) ? 'p-invalid' : ''}`} value={field.value ? Number(String(field.value)) : null} mode="currency" currency="BRL" locale="pt-BR" disabled />
                )} />

                {getErrorMessage(getFieldPath('payment_total_price', idx)) && <small className="p-error">{getErrorMessage(getFieldPath('payment_total_price', idx))}</small>}
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
              const newItem = { id: crypto.randomUUID(), description: '', document_type_id: null, document_number: '', unit_price: 0, quantity: 0, total_price: 0 } as unknown as FormPaymentItemSubmission;
              const next: FormPaymentItemSubmission[] = [...(payments ?? []), newItem];
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
