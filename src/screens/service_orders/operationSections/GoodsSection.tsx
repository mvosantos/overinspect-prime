// src/screens/service_orders/operationSections/GoodsSection.tsx
// PrimeReact-based GoodsSection
import React, { useState } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Paginator } from 'primereact/paginator';
import { Calendar } from 'primereact/calendar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AttachmentsSection from '../../../components/AttachmentsSection';
import operationGoodService, { type GoodOperationCreateDto, type GoodOperationUpdateDto } from '../../../services/operationGoodService';
import type { GoodOperation } from '../../../models/service_order/goods/GoodOperation';
import type { ListParams, ApiPaginatedResponse } from '../../../models/apiTypes';
import type { AttachmentsOrderService } from '../../../models/serviceOrder';

type Props = {
  currentOrderId?: string | null;
  enable_editing?: boolean;
};

// Zod schema matching the explicit fields used in the older form you provided.
const goodSchema = z.object({
  vessel_name: z.string().min(1, 'Nome do navio obrigatório'),
  vessel_type_id: z.string().nullable().optional(),
  loading_port_id: z.string().nullable().optional(),
  discharge_port_id: z.string().nullable().optional(),
  date_of_loading: z.string().nullable().optional(),
  date_of_discharge: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  attachments: z.array(z.any()).optional(),
});

type GoodFormValues = z.infer<typeof goodSchema>;

export default function GoodsSection({ currentOrderId, enable_editing = true }: Props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(5);
  const [newOpen, setNewOpen] = useState(false);

  const queryClient = useQueryClient();

  const goodsQuery = useQuery({
    queryKey: ['operation-goods', currentOrderId, search, page, rows],
    queryFn: async () => {
      if (!currentOrderId) return { data: [] as GoodOperation[], total: 0 };
      const params: ListParams<{ service_order_id?: string; vessel_name?: string }> = {
        page: page + 1,
        per_page: rows,
        filters: { service_order_id: currentOrderId, vessel_name: search || undefined },
      };
      const res = (await operationGoodService.list(params)) as ApiPaginatedResponse<GoodOperation>;
      const data = res?.data ?? [];
      const total = res?.total ?? 0;
      return { data: data as GoodOperation[], total: Number(total) };
    },
    enabled: Boolean(currentOrderId),
  });

  const onPageChange = (e: { page: number; rows?: number }) => {
    setPage(e.page ?? 0);
    setRows(e.rows ?? rows);
  };

  const mutationIsLoading = (m: unknown) => {
    try {
      const mm = m as Record<string, unknown>;
      const state = typeof mm.state === 'string' ? String(mm.state) : undefined;
      const fetchStatus = typeof mm.fetchStatus === 'string' ? String(mm.fetchStatus) : undefined;
      const status = typeof mm.status === 'string' ? String(mm.status) : undefined;
      return state === 'loading' || fetchStatus === 'fetching' || status === 'pending';
    } catch {
      return false;
    }
  };

  // Form for new record (separate, so accordion for new can contain it)
  const NewForm = () => {
    const methods = useForm<GoodFormValues>({ defaultValues: { vessel_name: '', vessel_type_id: '', loading_port_id: '', discharge_port_id: '', date_of_loading: '', date_of_discharge: '', description: '', attachments: [] }, resolver: zodResolver(goodSchema) });
    const { handleSubmit, control } = methods;

    const normalizePayload = (p: GoodFormValues): GoodOperationCreateDto => ({
      vessel_name: p.vessel_name,
      vessel_type_id: (p.vessel_type_id ?? undefined) as unknown as string | undefined,
      loading_port_id: (p.loading_port_id ?? undefined) as unknown as string | undefined,
      discharge_port_id: (p.discharge_port_id ?? undefined) as unknown as string | undefined,
      date_of_loading: p.date_of_loading ?? undefined,
      date_of_discharge: p.date_of_discharge ?? undefined,
      description: p.description ?? undefined,
      // Attachments are typed in the models; map to AttachmentsOrderService[] when present
      attachments: (p.attachments ? (p.attachments as unknown as AttachmentsOrderService[]) : undefined),
      service_order_id: (currentOrderId ?? undefined) as unknown as string | undefined,
    });

    const createMutation = useMutation({
      mutationFn: async (payload: GoodFormValues) => operationGoodService.create(normalizePayload(payload)),
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['operation-goods', currentOrderId] }); setNewOpen(false); }
    });

    const createLoading = mutationIsLoading(createMutation);

    const onSubmit = (data: GoodFormValues) => createMutation.mutate(data);

    return (
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller name="vessel_name" control={control} render={({ field, fieldState }) => (
              <div>
                <label className="font-medium">Nome do navio *</label>
                <InputText {...field} className="w-full" disabled={!enable_editing} />
                {fieldState.error && <div className="text-xs text-red-500">{fieldState.error.message}</div>}
              </div>
            )} />

            <Controller name="vessel_type_id" control={control} render={({ field }) => (
              <div>
                <label className="font-medium">Tipo de navio</label>
                <InputText {...field} className="w-full" disabled={!enable_editing} />
              </div>
            )} />

            <Controller name="loading_port_id" control={control} render={({ field }) => (
              <div>
                <label className="font-medium">Porto de embarque</label>
                <InputText {...field} className="w-full" disabled={!enable_editing} />
              </div>
            )} />

            <Controller name="discharge_port_id" control={control} render={({ field }) => (
              <div>
                <label className="font-medium">Porto de descarga</label>
                <InputText {...field} className="w-full" disabled={!enable_editing} />
              </div>
            )} />

            <Controller name="date_of_loading" control={control} render={({ field }) => (
              <div>
                <label className="font-medium">Data de embarque</label>
                <Calendar value={field.value ? new Date(field.value) : null} onChange={(e) => field.onChange(e.value ? (e.value as Date).toISOString() : '')} disabled={!enable_editing} className="w-full" dateFormat="dd/mm/yy" />
              </div>
            )} />

            <Controller name="date_of_discharge" control={control} render={({ field }) => (
              <div>
                <label className="font-medium">Data de descarga</label>
                <Calendar value={field.value ? new Date(field.value) : null} onChange={(e) => field.onChange(e.value ? (e.value as Date).toISOString() : '')} disabled={!enable_editing} className="w-full" dateFormat="dd/mm/yy" />
              </div>
            )} />

            <Controller name="description" control={control} render={({ field }) => (
              <div className="md:col-span-2">
                <label className="font-medium">Descrição</label>
                <InputText {...field} className="w-full" disabled={!enable_editing} />
              </div>
            )} />
          </div>

          <div>
            <AttachmentsSection name="attachments" path="operation/good" />
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={() => setNewOpen(false)}>Cancelar</Button>
            <Button type="submit" label="Cadastrar" severity="success" loading={createLoading} disabled={!enable_editing}>
              Cadastrar
            </Button>
          </div>
        </form>
      </FormProvider>
    );
  };
  const GoodAccordionItem: React.FC<{ record: GoodOperation }> = ({ record }) => {
  const methods = useForm<GoodFormValues>({ defaultValues: { vessel_name: record.vessel_name ?? '', vessel_type_id: record.vessel_type_id ?? '', loading_port_id: record.loading_port_id ?? '', discharge_port_id: record.discharge_port_id ?? '', date_of_loading: record.date_of_loading ? String(record.date_of_loading) : '', date_of_discharge: record.date_of_discharge ? String(record.date_of_discharge) : '', description: record.description ?? '', attachments: record.attachments ?? [] }, resolver: zodResolver(goodSchema) });
    const { handleSubmit, control } = methods;
    const updateMutation = useMutation({ mutationFn: (payload: GoodOperationUpdateDto) => operationGoodService.update(String(record.id), payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operation-goods', currentOrderId] }) });

    const updateLoading = mutationIsLoading(updateMutation);

    const onSubmit = (data: GoodFormValues) => {
      const dto: GoodOperationUpdateDto = {
        vessel_name: data.vessel_name,
        vessel_type_id: (data.vessel_type_id ?? undefined) as unknown as string | undefined,
        loading_port_id: (data.loading_port_id ?? undefined) as unknown as string | undefined,
        discharge_port_id: (data.discharge_port_id ?? undefined) as unknown as string | undefined,
        date_of_loading: data.date_of_loading ?? undefined,
        date_of_discharge: data.date_of_discharge ?? undefined,
        description: data.description ?? undefined,
        attachments: data.attachments ? (data.attachments as unknown as AttachmentsOrderService[]) : undefined,
        service_order_id: (currentOrderId ?? undefined) as unknown as string | undefined,
      };
      updateMutation.mutate(dto);
    };

    return (
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller name="vessel_name" control={control} render={({ field, fieldState }) => (
              <div>
                <label className="font-medium">Nome do navio *</label>
                <InputText {...field} className="w-full" disabled={!enable_editing} />
                {fieldState.error && <div className="text-xs text-red-500">{fieldState.error.message}</div>}
              </div>
            )} />

            <Controller name="vessel_type_id" control={control} render={({ field }) => (
              <div>
                <label className="font-medium">Tipo de navio</label>
                <InputText {...field} className="w-full" disabled={!enable_editing} />
              </div>
            )} />

            <Controller name="loading_port_id" control={control} render={({ field }) => (
              <div>
                <label className="font-medium">Porto de embarque</label>
                <InputText {...field} className="w-full" disabled={!enable_editing} />
              </div>
            )} />

            <Controller name="discharge_port_id" control={control} render={({ field }) => (
              <div>
                <label className="font-medium">Porto de descarga</label>
                <InputText {...field} className="w-full" disabled={!enable_editing} />
              </div>
            )} />

            <Controller name="date_of_loading" control={control} render={({ field }) => (
              <div>
                <label className="font-medium">Data de embarque</label>
                <Calendar value={field.value ? new Date(field.value) : null} onChange={(e) => field.onChange(e.value ? (e.value as Date).toISOString() : '')} disabled={!enable_editing} className="w-full" dateFormat="dd/mm/yy" />
              </div>
            )} />

            <Controller name="date_of_discharge" control={control} render={({ field }) => (
              <div>
                <label className="font-medium">Data de descarga</label>
                <Calendar value={field.value ? new Date(field.value) : null} onChange={(e) => field.onChange(e.value ? (e.value as Date).toISOString() : '')} disabled={!enable_editing} className="w-full" dateFormat="dd/mm/yy" />
              </div>
            )} />

            <Controller name="description" control={control} render={({ field }) => (
              <div className="md:col-span-2">
                <label className="font-medium">Descrição</label>
                <InputText {...field} className="w-full" disabled={!enable_editing} />
              </div>
            )} />
          </div>

          <div>
            <AttachmentsSection name="attachments" path="operation/good" />
          </div>

          <div className="flex gap-2">
            <Button type="submit" label="Salvar" loading={updateLoading} disabled={!enable_editing}>Salvar</Button>
          </div>
        </form>
      </FormProvider>
    );
  };

  const rowsData = goodsQuery.data?.data ?? [];

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <InputText placeholder="Buscar por nome do navio" value={search} onChange={(e) => setSearch((e.target as HTMLInputElement).value)} className="w-64" />
        <Button label="Buscar" icon="pi pi-search" onClick={() => goodsQuery.refetch()} />
  <Button label="Novo registro" icon="pi pi-plus" severity="success" onClick={() => { setNewOpen((v) => !v); }} />
      </div>

      {newOpen && (
        <Accordion activeIndex={0} className="mb-4">
          <AccordionTab header="Novo registro">
            <NewForm />
          </AccordionTab>
        </Accordion>
      )}

      <Accordion multiple className="mb-4">
        {rowsData.length === 0 ? (
          <AccordionTab header="Nenhum registro encontrado" />
        ) : rowsData.map((r, idx) => (
          <AccordionTab key={r.id} header={`${page * rows + idx + 1} - ${r.vessel_name ?? '—'}`}>
            <GoodAccordionItem record={r} />
          </AccordionTab>
        ))}
      </Accordion>

      <div className="flex justify-end">
        <Paginator first={page * rows} rows={rows} totalRecords={goodsQuery.data?.total ?? 0} onPageChange={onPageChange} rowsPerPageOptions={[5, 10, 20, 50]} />
      </div>
    </div>
  );
}

