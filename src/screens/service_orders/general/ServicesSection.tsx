import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { AutoComplete } from 'primereact/autocomplete';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import serviceService from '../../../services/serviceService';
import type { Service } from '../../../models/service';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export default function ServicesSection() {
  const { control, setValue, getValues } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'services' });

  const [serviceSuggestions, setServiceSuggestions] = useState<Service[]>([]);
  const [serviceCache, setServiceCache] = useState<Record<string, Service>>({});
  const qc = useQueryClient();
  // when fields change (e.g., editing existing order) ensure cached items exist
  useEffect(() => {
    // collect ids currently present in services field values
    const ids: string[] = [];
    try {
      const raw = getValues('services') as unknown;
      if (Array.isArray(raw)) {
        (raw as unknown[]).forEach((it) => { const item = it as Record<string, unknown>; if (item && item.service_id) ids.push(String(item.service_id)); });
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

  const onServiceComplete = async (query: string) => {
    try {
      const res = await serviceService.list({ per_page: 20, filters: { name: query } });
  const items = (res && typeof res === 'object' && 'data' in res) ? (res as unknown as { data: Service[] }).data : (res as Service[]);
      setServiceSuggestions(items ?? []);
      const map: Record<string, Service> = {};
      (items ?? []).forEach((it) => { if (it?.id) { map[it.id] = it; qc.setQueryData(['service', it.id], it); } });
      setServiceCache((prev) => ({ ...prev, ...map }));
    } catch {
      setServiceSuggestions([]);
    }
  };

  const addRow = () => append({ service_id: null, unit_price: '0.00', quantity: 1, total_price: '0.00', scope: '' });

  return (
    <Card>
      <div className="text-center mb-4">
        <div className="inline-block px-4 py-1 rounded-md bg-teal-50 border border-teal-100">
          <h3 className="text-lg font-semibold text-teal-700">Serviços a serem realizados</h3>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="mt-2 text-sm text-muted">Adicione os serviços (N registros)</div>
        <Button icon="pi pi-plus" className="p-button-text" onClick={addRow} />
      </div>

      <div className="mt-4 space-y-3">
        {fields.map((f, idx) => (
          <div key={f.id} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block mb-1">Serviço</label>
              <Controller
                control={control}
                name={`services.${idx}.service_id`}
                render={({ field }) => (
                  <AutoComplete
                    value={
                      (serviceSuggestions.find((s) => s.id === (field.value as unknown as string)) as Service)
                      ?? (serviceCache[(field.value as unknown as string)] as Service)
                      ?? (field.value as unknown as Service)
                    }
                    suggestions={serviceSuggestions}
                    field="name"
                    completeMethod={(e: { query: string }) => onServiceComplete(e.query)}
                    onChange={(e: { value: unknown }) => {
                      const val = e.value as unknown;
                      if (val && typeof val === 'object' && 'id' in val) {
                        const id = (val as { id: string }).id;
                        setServiceCache((prev) => ({ ...prev, [id]: val as Service }));
                        field.onChange(id);
                      } else field.onChange(val ?? null);
                    }}
                    dropdown
                    className="w-full"
                  />
                )}
              />
            </div>

            <div>
              <label className="block mb-1">Valor unitário</label>
              <Controller
                control={control}
                name={`services.${idx}.unit_price`}
                render={({ field }) => (
                  <InputNumber
                    className="w-full"
                    value={Number(field.value) || 0}
                    onValueChange={(e) => {
                      const unit = Number(e.value ?? 0);
                      field.onChange(unit.toFixed(2));
                      const q = Number(getValues(`services.${idx}.quantity`) ?? 0);
                      setValue(`services.${idx}.total_price`, (unit * q).toFixed(2));
                    }}
                    mode="currency"
                    currency="BRL"
                    locale="pt-BR"
                    min={0}
                  />
                )}
              />
            </div>

            <div>
              <label className="block mb-1">Quantidade</label>
              <Controller
                control={control}
                name={`services.${idx}.quantity`}
                render={({ field }) => (
                  <InputNumber
                    className="w-full"
                    value={Number(field.value) || 0}
                    onValueChange={(e) => {
                      const q = Number(e.value ?? 0);
                      field.onChange(q);
                      const unit = Number(getValues(`services.${idx}.unit_price`) ?? 0);
                      setValue(`services.${idx}.total_price`, (unit * q).toFixed(2));
                    }}
                    showButtons
                    min={0}
                    step={1}
                    mode="decimal"
                  />
                )}
              />
            </div>

            <div>
              <label className="block mb-1">Total</label>
              <Controller
                control={control}
                name={`services.${idx}.total_price`}
                render={({ field }) => (
                  <InputNumber className="w-full" value={Number(field.value) || 0} mode="currency" currency="BRL" locale="pt-BR" disabled />
                )}
              />
            </div>

            <div className="col-span-full flex justify-end gap-2">
              <Button icon="pi pi-trash" className="p-button-text p-button-danger" onClick={() => remove(idx)} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
