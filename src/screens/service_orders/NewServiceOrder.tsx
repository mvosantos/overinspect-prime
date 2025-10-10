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
import { useTranslation } from 'react-i18next';
import ScheduleSection from './general/ScheduleSection';

export default function NewServiceOrder() {
  const { t }= useTranslation('new_service_order');
  const toast = useRef<Toast | null>(null);
  const queryClient = useQueryClient();

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  type ServiceTypeField = { name: string; label?: string; default_value?: unknown; visible?: boolean; required?: boolean; field_type?: string | null };
  type FieldMetaLocal = { name: string; visible?: boolean; required?: boolean; default_value?: unknown };
  const [serviceTypeFields, setServiceTypeFields] = useState<ServiceTypeField[]>([]);
  const [zodSchema, setZodSchema] = useState<z.ZodObject<Record<string, ZodTypeAny>> | null>(null);
  const [formDefaults, setFormDefaults] = useState<Record<string, unknown>>({});

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
      setFormDefaults(mergedDefaults);
      // note: we intentionally do not call reset here because the form is remounted
      // when the selected service type (and schema) changes so the defaults
      // will be applied via useForm's defaultValues in the remounted form.
    }

    loadFields();
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

  // We'll mount the actual form inside a keyed inner component so that
  // whenever `selectedServiceTypeId` (and thus `zodSchema` / `formDefaults`) changes
  // the inner component remounts and `useForm` is recreated with the latest
  // zod resolver and defaultValues.

  function FormWrapper() {
  const methodsLocal = useForm({ resolver: zodSchema ? zodResolver(zodSchema) : undefined, defaultValues: formDefaults });
  const { register, control, handleSubmit, formState, setValue, getValues } = methodsLocal;

    const onSubmitLocal = handleSubmit((data) => {
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
      const maybeServices = (payload && typeof payload === 'object' ? (payload as Record<string, unknown>)['services'] : undefined);
      if (Array.isArray(maybeServices)) {
        const normalized = maybeServices.map((s) => {
          const item = (s && typeof s === 'object') ? (s as Record<string, unknown>) : {} as Record<string, unknown>;
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

    return (
      <FormProvider {...methodsLocal}>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl">{currentOrderId ? `${t('service_orders:service_order')} ${currentOrderId}` : t('records:new_service_order')}</h1>
            <div className="flex gap-2">
              <Dropdown value={selectedServiceTypeId} options={serviceTypes.map(t => ({ label: t.name, value: t.id }))} onChange={(e) => { setSelectedServiceTypeId(e.value ?? null); setValue('service_type_id', e.value ?? null); }} placeholder={t('service_orders:select_service_type')} />
              <Button label={t('common:save')} onClick={onSubmitLocal} />
            </div>
          </div>

          <TabView>
            <TabPanel header={
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="pi pi-file" />
                ORDEM DE SERVIÇO
              </span>
            }>
              <div className="grid grid-cols-1 gap-4">
                <GeneralDataSection serviceTypeId={selectedServiceTypeId} fields={serviceTypeFields} register={register} control={control} errors={formState.errors} setValue={setValue} />
                <ServicesSection control={control} setValue={setValue} getValues={getValues} selectedServiceTypeId={selectedServiceTypeId} />
                {
                  (() => {
                    const byName: Record<string, ServiceTypeField | undefined> = {};
                    (serviceTypeFields || []).forEach((f) => { if (f && typeof f === 'object' && 'name' in f) byName[f.name] = f; });
                    const fieldConfigs = {
                      operationStartsAtField: byName['operation_starts_at'],
                      blDateField: byName['bl_date'],
                      cargoArrivalDateField: byName['cargo_arrival_date'],
                      operationFinishesAtField: byName['operation_finishes_at'],
                      operationFinishDateField: byName['operation_finish_date'],
                      firstSiteIdField: byName['first_site_id'],
                      secondSiteIdField: byName['second_site_id'],
                      thirdSiteIdField: byName['third_site_id'],
                      stuffingSiteIdField: byName['stuffing_site_id'],
                      departureSiteIdField: byName['departure_site_id'],
                      destinationField: byName['destination'],
                    } as Record<string, FieldMetaLocal | undefined>;

                    const formErrorsMap: Record<string, string | undefined> = {};
                    Object.entries(formState.errors || {}).forEach(([k, v]) => {
                      const vv = v as unknown;
                      if (vv && typeof vv === 'object' && 'message' in (vv as Record<string, unknown>)) {
                        const m = (vv as Record<string, unknown>).message;
                        formErrorsMap[k] = typeof m === 'string' ? m : undefined;
                      } else {
                        formErrorsMap[k] = undefined;
                      }
                    });

                    return (
                      <DatesSitesSection
                        control={control}
                        getValues={getValues}
                        setValue={setValue}
                        selectedServiceType={selectedServiceTypeId}
                        t={t}
                        fieldConfigs={fieldConfigs}
                        formErrors={formErrorsMap}
                      />
                    );
                  })()
                }
                <WeighingSection control={control} setValue={setValue} getValues={getValues} selectedServiceTypeId={selectedServiceTypeId} />
                <AttachmentsSection control={control} setValue={setValue} getValues={getValues} selectedServiceTypeId={selectedServiceTypeId} parentType="service_order" parentId={currentOrderId} />
              </div>
            </TabPanel>
            <TabPanel
              header={
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="pi pi-check-square" />
                  DADOS DA OPERAÇÃO
                </span>
              }
            >
              <div>Operações (aparecerá somente após criação/edição)</div>
            </TabPanel>

            <TabPanel header={
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="pi pi-calendar" />
                DESIGNAÇÕES E AGENDAMENTOS
              </span>
            }>
              <ScheduleSection control={control} setValue={setValue} getValues={getValues} selectedServiceTypeId={selectedServiceTypeId} />
            </TabPanel>
            <TabPanel header={
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="pi pi-calculator" />
                CUSTOS ENVOLVIDOS
              </span>
            }>
              <div>Custos</div>
            </TabPanel>
            <TabPanel header={
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="pi pi-dollar" />
                FATURAMENTO
              </span>
            }>
              <div>Faturamento</div>
            </TabPanel>
          </TabView>
        </div>
      </FormProvider>
    );
  }

  // onSave is handled inside the remounted FormWrapper so it can use the
  // dynamic zod resolver. Render the FormWrapper keyed by the selected service type
  // so it remounts when the schema/defaults change.

  // onSave is already defined using handleSubmit above

  return (
    <div>
      <Toast ref={toast} position="top-right" />
      <div className="mb-4">
        <BreadCrumb model={[{ label: 'Service Orders' }, { label: currentOrderId ? `${t('service_orders:service_order')} ${currentOrderId}` : t('records:new_service_order') }]} />
      </div>

      {/* Render the remounting form wrapper so the zod resolver and defaults
          update when the selected service type changes. */}
      <div>
        <FormWrapper key={selectedServiceTypeId ?? 'default'} />
      </div>
    </div>
  );
}
