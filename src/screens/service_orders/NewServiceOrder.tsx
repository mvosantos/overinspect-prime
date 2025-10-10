import { useEffect, useRef, useState } from 'react';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import serviceOrderService from '../../services/serviceOrderService';
import serviceTypeService from '../../services/serviceTypeService';
import type { ServiceOrder, ServiceType } from '../../models/serviceOrder';
import GeneralDataSection from './general/GeneralDataSection';
import ServicesSection from './general/ServicesSection';
import DatesSitesSection from './general/DatesSitesSection';
import WeighingSection from './general/WeighingSection';
import AttachmentsSection from './general/AttachmentsSection';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { buildZodSchemaFromFields } from '../../utils/dynamicSchema';
import z from 'zod';
import type { ZodTypeAny } from 'zod';

export default function NewServiceOrder() {
  const toast = useRef<Toast | null>(null);
  const queryClient = useQueryClient();

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  type ServiceTypeField = { name: string; label?: string; default_value?: unknown; visible?: boolean; required?: boolean; field_type?: string | null };
  const [serviceTypeFields, setServiceTypeFields] = useState<ServiceTypeField[]>([]);
  const [zodSchema, setZodSchema] = useState<z.ZodObject<Record<string, ZodTypeAny>> | null>(null);

  const { data: types } = useQuery({ queryKey: ['service-types'], queryFn: () => serviceTypeService.listAll() });

  useEffect(() => {
    if (Array.isArray(types)) setServiceTypes(types as ServiceType[]);
  }, [types]);

  useEffect(() => {
    async function loadFields() {
      if (!selectedServiceTypeId) {
        setServiceTypeFields([]);
        setZodSchema(null);
        return;
      }

      const res = await serviceTypeService.getByServiceTypeId(selectedServiceTypeId);

      // safely extract service_type_fields from response
      let fields: ServiceTypeField[] = [];
      const resBody = res as unknown;
      if (resBody && typeof resBody === 'object') {
        const obj = resBody as Record<string, unknown>;
        if (Array.isArray(obj.service_type_fields)) {
          fields = obj.service_type_fields as ServiceTypeField[];
        } else if (Array.isArray(resBody)) {
          fields = resBody as ServiceTypeField[];
        }
      }

      setServiceTypeFields(fields);

      const { schema, defaults } = buildZodSchemaFromFields(fields || []);

      // schema for services array items
        const serviceItemSchema = z.object({
          service_id: z.string().min(1, 'Serviço obrigatório'),
          unit_price: z.union([z.string(), z.number()]).refine((v) => {
            const n = Number(String(v));
            return !Number.isNaN(n);
          }, { message: 'Valor inválido' }),
          quantity: z.union([z.string(), z.number()]).transform((v) => Math.floor(Number(String(v)))),
          total_price: z.union([z.string(), z.number()]).refine((v) => {
            const n = Number(String(v));
            return !Number.isNaN(n);
          }, { message: 'Valor inválido' }),
          scope: z.string().optional(),
        });

      const servicesSchema = z.object({ services: z.array(serviceItemSchema).optional().default([]) });

      // combine dynamic schema with services array schema
      const combined = schema ? schema.merge(servicesSchema) : servicesSchema;
      setZodSchema(combined as unknown as z.ZodObject<Record<string, ZodTypeAny>>);

      // apply defaults to form, ensure services default exists
      const mergedDefaults = { ...(defaults ?? {}), services: [] };
      reset(mergedDefaults);
    }

    loadFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServiceTypeId]);

  const createMutation = useMutation({
    mutationFn: (payload: unknown) => serviceOrderService.create(payload),
    onSuccess: (data: ServiceOrder) => {
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Ordem criada' });
      if (data?.id) setCurrentOrderId(data.id);
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
    },
    onError: () => toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível criar' }),
  });

  // react-hook-form setup (schema will be set dynamically)
    const methods = useForm({ resolver: zodSchema ? zodResolver(zodSchema) : undefined });
    const { register, control, handleSubmit, reset, formState, setValue } = methods;

  const onSubmit = handleSubmit((data) => {
    const payload: Record<string, unknown> = { ...data } as Record<string, unknown>;
    // ensure service_type_id is present
    if (selectedServiceTypeId) payload.service_type_id = selectedServiceTypeId;

    // serialize dates
    if (payload.operation_starts_at && payload.operation_starts_at instanceof Date) {
      payload.operation_starts_at = (payload.operation_starts_at as Date).toISOString();
    }

    // ensure num_containers is numeric or undefined
    if (payload.num_containers !== undefined && payload.num_containers !== null) {
      const n = Number(payload.num_containers as unknown);
      payload.num_containers = Number.isFinite(n) ? n : undefined;
    }

    // Normalize services array if present
    const maybeServices = (payload as unknown as Record<string, unknown>)['services'];
    if (Array.isArray(maybeServices)) {
      const normalized = maybeServices.map((s) => {
        const item = s as Record<string, unknown>;
        const unit = Number(String(item.unit_price ?? 0));
        const qty = Math.floor(Number(String(item.quantity ?? 0)) || 0);
        const total = unit * qty;
        return {
          service_id: (item.service_id as string) ?? null,
          unit_price: !Number.isNaN(unit) ? unit.toFixed(2) : '0.00',
          quantity: String(qty),
          total_price: !Number.isNaN(total) ? total.toFixed(2) : '0.00',
          scope: (item.scope as string) ?? '',
        };
      });
      payload.services = normalized;
    }

    createMutation.mutate(payload);
  });

  // onSave is already defined using handleSubmit above

  return (
    <div>
      <Toast ref={toast} position="top-right" />
      <div className="mb-4">
        <BreadCrumb model={[{ label: 'Service Orders' }, { label: currentOrderId ? `ORDEM DE SERVIÇO ${currentOrderId}` : 'NOVA ORDEM DE SERVIÇO' }]} />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl">{currentOrderId ? `ORDEM DE SERVIÇO ${currentOrderId}` : 'NOVA ORDEM DE SERVIÇO'}</h1>
          <div className="flex gap-2">
            <Dropdown value={selectedServiceTypeId} options={serviceTypes.map(t => ({ label: t.name, value: t.id }))} onChange={(e) => setSelectedServiceTypeId(e.value ?? null)} placeholder="Selecione o tipo de serviço" />
            <Button label="Salvar" onClick={onSubmit} />
          </div>
        </div>

        <TabView>
          <TabPanel header="ORDEM DE SERVIÇO">
            <FormProvider {...methods}>
              <div className="grid grid-cols-1 gap-4">
                <GeneralDataSection serviceTypeId={selectedServiceTypeId} fields={serviceTypeFields} register={register} control={control} errors={formState.errors} setValue={setValue} />
                { /*<ServicesSection serviceTypeId={selectedServiceTypeId} /> */}
                <ServicesSection />
                <DatesSitesSection control={control} />
                <WeighingSection control={control} />
                <AttachmentsSection parentType="service_order" parentId={currentOrderId} />
              </div>
            </FormProvider>
          </TabPanel>
          <TabPanel header="DADOS DA OPERAÇÃO">
            <div>Operações (aparecerá somente após criação/edição)</div>
          </TabPanel>
          <TabPanel header="DESIGNAÇÕES E AGENDAMENTOS">
            <div>Designações e Agendamentos</div>
          </TabPanel>
          <TabPanel header="CUSTOS ENVOLVIDOS">
            <div>Custos</div>
          </TabPanel>
          <TabPanel header="FATURAMENTO">
            <div>Faturamento</div>
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
}
