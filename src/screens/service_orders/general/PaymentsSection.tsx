/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { AutoComplete } from 'primereact/autocomplete';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { normalizeListResponse } from '../../../utils/apiHelpers';
import { makeAutoCompleteOnChange, resolveAutoCompleteValue } from '../../../utils/formHelpers';
import documentTypeService from '../../../services/documentTypeService';
import type { DocumentType } from '../../../models/DocumentType';
import { useTranslation } from 'react-i18next';


type Payment = { id?: string; description?: string; document_type_id?: string | null; document_type?: DocumentType | undefined; document_number?: string; unit_price?: string; quantity?: string; total_price?: string };

type Props = { control?: any; setValue?: any; getValues?: any; selectedServiceTypeId?: string | null; fieldConfigs?: Record<string, any> | undefined; formErrors?: Record<string, string | undefined> };

export default function PaymentsSection(props?: Props) {
  const ctx = useFormContext<Record<string, unknown>>();
  const control = props?.control ?? ctx.control;
  const setValue = props?.setValue ?? ctx.setValue;
  const getValues = props?.getValues ?? ctx.getValues;
  const { t } = useTranslation(['new_service_order', 'service_orders']);
  const qc = useQueryClient();

  const payments: Payment[] = (useWatch({ control, name: 'payments' }) as Payment[] | undefined) ?? [];
  const watchedServiceTypeId = useWatch({ control, name: 'service_type_id' }) as string | undefined;
  const serviceTypeId = props?.selectedServiceTypeId ?? watchedServiceTypeId;

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
    setValue?.(`payments.${index}.total_price`, String(total));
  }

  function calcGrandTotal() {
    const items = getValues?.('payments') as Payment[] | undefined;
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
            <div className="md:col-span-2">
              <label className="block mb-1">{t('new_service_order:payment_description')}</label>
              <Controller control={control} name={`payments.${idx}.description`} render={({ field }) => (
                <InputText className="w-full" value={field.value ?? ''} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1">{t('new_service_order:document_type')}</label>
              <Controller control={control} name={`payments.${idx}.document_type_id`} render={({ field }) => (
                <AutoComplete
                  value={resolveAutoCompleteValue<DocumentType>(docTypeSuggestions, docTypeCache, field.value, qc, 'document_type') as DocumentType | undefined}
                  suggestions={docTypeSuggestions}
                  field="name"
                  completeMethod={createDocTypeComplete}
                  onChange={makeAutoCompleteOnChange<DocumentType>({ setCache: (updater) => wrapSetDocTypeCache(updater), cacheKey: 'document_type', qc, objectFieldKey: `payments.${idx}.document_type`, setFormValue: setValue })(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )} />
            </div>

            <div className="md:col-span-1">
              <label className="block mb-1">{t('new_service_order:payment_document_number')}</label>
              <Controller control={control} name={`payments.${idx}.document_number`} render={({ field }) => (
                <InputText className="w-full" value={field.value ?? ''} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} />
            </div>

            <div className="md:col-span-1">
              <label className="block mb-1">{t('new_service_order:payment_unit_price')}</label>
              <Controller control={control} name={`payments.${idx}.unit_price`} render={({ field }) => (
                <InputNumber className="w-full" value={field.value ?? null} mode="currency" currency="BRL" locale="pt-BR" onValueChange={(e) => field.onChange(e.value)} onBlur={() => calcLineTotal(idx)} />
              )} />
            </div>

            <div className="md:col-span-1">
              <label className="block mb-1">{t('new_service_order:payment_quantity')}</label>
              <Controller control={control} name={`payments.${idx}.quantity`} render={({ field }) => (
                <InputNumber className="w-full" value={field.value ?? null} mode="decimal" locale="pt-BR" minFractionDigits={2} maxFractionDigits={2} onValueChange={(e) => field.onChange(e.value)} onBlur={() => calcLineTotal(idx)} />
              )} />
            </div>

            <div className="md:col-span-1">
              <label className="block mb-1">{t('new_service_order:payment_total_price')}</label>
              <Controller control={control} name={`payments.${idx}.total_price`} render={({ field }) => (
                <InputNumber className="w-full" value={field.value ?? null} mode="currency" currency="BRL" locale="pt-BR" disabled />
              )} />
            </div>

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
              const next = [...(payments ?? []), { id: crypto.randomUUID(), description: '', document_type_id: null, document_number: '', unit_price: '', quantity: '', total_price: '' }];
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
