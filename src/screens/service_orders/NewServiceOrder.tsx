import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { Skeleton } from 'primereact/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import serviceOrderService from '../../services/serviceOrderService';
import serviceTypeService from '../../services/serviceTypeService';
import type { ServiceOrder, ServiceType } from '../../models/serviceOrder';
import GeneralDataSection from './general/GeneralDataSection';
import ServicesSection from './general/ServicesSection';
import DatesSitesSection from './general/DatesSitesSection';
import WeighingSection from './general/WeighingSection';
// AttachmentsSection removed — attachments handling moved elsewhere
import { useForm, FormProvider } from 'react-hook-form';
import AttachmentsSection from '../../components/AttachmentsSection';
import { zodResolver } from '@hookform/resolvers/zod';
import { buildZodSchemaFromFields } from '../../utils/dynamicSchema';
import z from 'zod';
import type { ZodTypeAny } from 'zod';
import { useTranslation } from 'react-i18next';
import ScheduleSection from './general/ScheduleSection';
import PaymentsSection from './general/PaymentsSection';
import PageFooter from '../../components/PageFooter';
import { useSave } from '../../contexts/SaveContext';

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
  const currentZodRef = useRef<z.ZodTypeAny | null>(null);
  const [formDefaults, setFormDefaults] = useState<Record<string, unknown>>({});
  

  const { id: routeId } = useParams();
  const isEditing = Boolean(routeId);

  const { data: types } = useQuery({ queryKey: ['service-types'], queryFn: () => serviceTypeService.listAll() });

  const { data: fetchedServiceOrder } = useQuery({
    queryKey: ['service-order', routeId],
    queryFn: () => serviceOrderService.get(routeId as string),
    enabled: isEditing,
    retry: false,
  });

  // If we fetched the service order for editing, set the selected service type
  // and current order id immediately so the dynamic fields/schema start loading.
  useEffect(() => {
    if (!fetchedServiceOrder) return;
    const fo = fetchedServiceOrder as Record<string, unknown>;
    if (fo.service_type_id && typeof fo.service_type_id === 'string') {
      setSelectedServiceTypeId(fo.service_type_id as string);
    }
    if (fo.id && typeof fo.id === 'string') {
      setCurrentOrderId(fo.id as string);
    }
  }, [fetchedServiceOrder]);

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
  const combinedSchema = combined as unknown as z.ZodObject<Record<string, ZodTypeAny>>;
  setZodSchema(combinedSchema);
  // update ref so inner FormWrapper can validate synchronously
  currentZodRef.current = combinedSchema as z.ZodTypeAny;

      // apply defaults to form, ensure services default exists
      const mergedDefaults = { ...(defaults ?? {}), services: [] };
      setFormDefaults(mergedDefaults);
      // note: we intentionally do not call reset here because the form is remounted
      // when the selected service type (and schema) changes so the defaults
      // will be applied via useForm's defaultValues in the remounted form.
    }

    loadFields();
  }, [selectedServiceTypeId]);

  // When editing, merge fetched server record into the dynamic defaults
  useEffect(() => {
    if (!isEditing) return;
    if (!fetchedServiceOrder) return;
    if (!zodSchema) return;

  const fo = fetchedServiceOrder as Record<string, unknown>;

    // parse incoming date strings to Date where appropriate. Supported
    // incoming formats: 'yyyy-mm-dd', 'yyyy-mm-dd hh:mm' (maybe seconds),
    // or ISO-ish strings. Returns Date when parseable, otherwise returns
    // original value.
    const parseDate = (v: unknown) => {
      if (!v || typeof v !== 'string') return v;
      // try Date constructor first
      const d1 = new Date(v);
      if (!Number.isNaN(d1.getTime())) return d1;
      // try patterns like 'yyyy-mm-dd' or 'yyyy-mm-dd hh:mm[:ss]'
      const m = /^\s*(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?\s*$/.exec(v);
      if (!m) return v;
      const year = Number(m[1]);
      const month = Number(m[2]) - 1;
      const day = Number(m[3]);
      const hour = m[4] ? Number(m[4]) : 0;
      const minute = m[5] ? Number(m[5]) : 0;
      const second = m[6] ? Number(m[6]) : 0;
      const dt = new Date(year, month, day, hour, minute, second);
      return Number.isNaN(dt.getTime()) ? v : dt;
    };

    const servicesArr = Array.isArray(fo.service_order_services)
      ? (fo.service_order_services as unknown[]).map((si) => {
          const s = si as Record<string, unknown>;
          return {
            service_id: (s.service_id as string) ?? ((s.service && (s.service as Record<string, unknown>).id) as string) ?? null,
            unit_price: (s.unit_price as unknown) ?? (s.unitPrice as unknown) ?? 0,
            quantity: (s.quantity as unknown) ?? (s.qty as unknown) ?? 0,
            total_price: (s.total_price as unknown) ?? (s.totalPrice as unknown) ?? 0,
            scope: (s.scope as string) ?? '',
          };
        })
      : [];

    const paymentsArr = Array.isArray(fo.service_order_payments)
      ? (fo.service_order_payments as unknown[]).map((pi) => {
          const p = pi as Record<string, unknown>;
          return {
            id: p.id,
            document_type_id: (p.document_type_id as string) ?? ((p.document_type && (p.document_type as Record<string, unknown>).id) as string) ?? null,
            document_number: (p.document_number as string) ?? (p.documentNumber as string) ?? '',
            unit_price: (p.unit_price as unknown) ?? (p.unitPrice as unknown) ?? 0,
            quantity: (p.quantity as unknown) ?? 0,
            total_price: (p.total_price as unknown) ?? 0,
          };
        })
      : [];

    const schedulesArr = Array.isArray(fo.service_order_schedules)
      ? (fo.service_order_schedules as unknown[]).map((si) => {
          const s = si as Record<string, unknown>;
          return {
            id: s.id,
            user_id: (s.user_id as string) ?? ((s.user && (s.user as Record<string, unknown>).id) as string) ?? null,
            date: parseDate(s.date),
          };
        })
      : [];

    const attachmentsArr = Array.isArray(fo.attachments) ? fo.attachments : [];

    const scalarCopy: Record<string, unknown> = {};
    Object.entries(fo).forEach(([k, v]) => {
      if (['service_order_services', 'service_order_payments', 'service_order_schedules', 'attachments', 'service_type', 'service_order_status', 'service_order_status_history'].includes(k)) return;
      if (k.endsWith('_at') || k.endsWith('_date') || k === 'operation_starts_at' || k === 'operation_finishes_at') {
        scalarCopy[k] = parseDate(v);
      } else {
        scalarCopy[k] = v;
      }
    });

    const finalDefaults = {
      ...scalarCopy,
      services: servicesArr,
      payments: paymentsArr,
      schedules: schedulesArr,
      attachments: attachmentsArr,
    } as Record<string, unknown>;

    // Pre-seed react-query cache with any nested objects provided by the server
    // so AutoComplete can resolve ids to objects immediately (edit mode UX).
    try {
      const seedIfObj = (maybeObj: unknown, cacheKey: string) => {
        if (maybeObj && typeof maybeObj === 'object') {
          const mo = maybeObj as Record<string, unknown>;
          if (mo.id && typeof mo.id === 'string') queryClient.setQueryData([cacheKey, mo.id], mo);
        }
      };

      // scalar nested objects
      seedIfObj(fo.operation_type, 'operationType');
      seedIfObj(fo.cargo, 'cargoType');
      seedIfObj(fo.first_site, 'site');
      seedIfObj(fo.second_site, 'site');
      seedIfObj(fo.third_site, 'site');
      seedIfObj(fo.stuffing_site, 'site');
      seedIfObj(fo.departure_site, 'site');
      seedIfObj(fo.client, 'client');
      seedIfObj(fo.currency, 'currency');
      seedIfObj(fo.trader, 'trader');
      seedIfObj(fo.exporter, 'exporter');
      seedIfObj(fo.shipper, 'shipper');
      seedIfObj(fo.product, 'product');
      seedIfObj(fo.region, 'region');
      seedIfObj(fo.city, 'city');
      seedIfObj(fo.subsidiary, 'subsidiary');
      seedIfObj(fo.business_unit, 'businessUnit');

      // arrays with nested objects
      if (Array.isArray(fo.service_order_services)) {
        (fo.service_order_services as unknown[]).forEach((si) => {
          const s = si as Record<string, unknown>;
          seedIfObj(s.service, 'service');
        });
      }

      if (Array.isArray(fo.service_order_schedules)) {
        (fo.service_order_schedules as unknown[]).forEach((si) => {
          const s = si as Record<string, unknown>;
          seedIfObj(s.user, 'user');
        });
      }

      if (Array.isArray(fo.service_order_payments)) {
        (fo.service_order_payments as unknown[]).forEach((pi) => {
          const p = pi as Record<string, unknown>;
          seedIfObj(p.document_type, 'document_type');
        });
      }
    } catch {
      // ignore any cache seeding errors
    }

    // merge fetched values into current defaults (do not set selectedServiceTypeId here;
    // that is handled in the separate effect above to avoid a circular dependency)
    setFormDefaults((prev) => ({ ...(prev ?? {}), ...finalDefaults }));
  }, [isEditing, fetchedServiceOrder, zodSchema, queryClient]);

  

  // We'll mount the actual form inside a keyed inner component so that
  // whenever `selectedServiceTypeId` (and thus `zodSchema` / `formDefaults`) changes
  // the inner component remounts and `useForm` is recreated with the latest
  // zod resolver and defaultValues.

  function FormWrapper() {
  const methodsLocal = useForm({ resolver: zodSchema ? zodResolver(zodSchema) : undefined, defaultValues: formDefaults, mode: 'onChange' });
  const { register, control, handleSubmit, formState, setValue, getValues } = methodsLocal;
  
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  // keep a ref of the latest react-hook-form validity so the global footer
  // can synchronously read a stable boolean without re-registering handlers.
  const isValidRef = useRef<boolean | null>(null);

  // update the ref whenever RHF reports a change
  useEffect(() => {
    isValidRef.current = Boolean(formState.isValid);
  }, [formState.isValid]);

  // force an initial validation pass on mount so formState.isValid is populated
  // (useful when using dynamic resolvers/defaults). We don't await here; the
  // trigger will update formState and the effect above will sync the ref.
  useEffect(() => {
    // trigger returns a Promise<boolean>
    void methodsLocal.trigger();
    // intentionally run only on mount of this wrapper (it remounts when schema/defaults change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createMutation = useMutation({
    mutationFn: (payload: unknown) => serviceOrderService.create(payload),
    onMutate: () => setIsSubmittingLocal(true),
    onSuccess: (data: ServiceOrder) => {
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Ordem criada' });
      if (data?.id) setCurrentOrderId(data.id);
      // replace any temporary attachments in the form with the server-returned list
      try {
        if (data && typeof data === 'object') {
          // set attachments field so temporary file rows are removed
          // data.attachments shape should match form field
          setValue('attachments', (data as ServiceOrder).attachments ?? []);
        }
      } catch {
        // ignore
      }
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
    },
    onError: () => toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível criar' }),
    onSettled: () => setIsSubmittingLocal(false),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) => serviceOrderService.update(id, payload),
    onMutate: () => setIsSubmittingLocal(true),
    onSuccess: (data: ServiceOrder) => {
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Ordem atualizada' });
      if (data?.id) setCurrentOrderId(data.id);
      try {
        if (data && typeof data === 'object') {
          setValue('attachments', (data as ServiceOrder).attachments ?? []);
        }
      } catch {
        // ignore
      }
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
    },
    onError: () => toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível atualizar' }),
    onSettled: () => setIsSubmittingLocal(false),
  });
  // footer now handled by global AuthLayout

  const onSubmitLocal = handleSubmit((data) => {
      const payload: Record<string, unknown> = { ...data } as Record<string, unknown>;
      // ensure service_type_id is present
      if (selectedServiceTypeId) payload.service_type_id = selectedServiceTypeId;

      // serialize dates
      // helper: format Date or string to 'yyyy-mm-dd HH:MM' (no seconds)
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatDateForPayload = (v: unknown) => {
        if (!v) return v;
        let d: Date | null = null;
        if (v instanceof Date) d = v;
        else if (typeof v === 'string') {
          // try to parse strings like 'Sun Jul 20 2025 21:00:00 GMT-0300 (...)' or 'yyyy-mm-dd hh:mm[:ss]'
          const parsed = new Date(v);
          if (!Number.isNaN(parsed.getTime())) d = parsed;
          else {
            const m = /^\s*(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?\s*$/.exec(v);
            if (m) {
              const year = Number(m[1]);
              const month = Number(m[2]) - 1;
              const day = Number(m[3]);
              const hour = m[4] ? Number(m[4]) : 0;
              const minute = m[5] ? Number(m[5]) : 0;
              const second = m[6] ? Number(m[6]) : 0;
              d = new Date(year, month, day, hour, minute, second);
            }
          }
        }
        if (!d) return v;
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      // apply formatting for any date-like keys
      try {
        Object.keys(payload).forEach((k) => {
          if (!k) return;
          if (k.endsWith('_at') || k.endsWith('_date') || k === 'operation_starts_at' || k === 'operation_finishes_at') {
            const val = (payload as Record<string, unknown>)[k];
            const formatted = formatDateForPayload(val);
            (payload as Record<string, unknown>)[k] = formatted;
          }
        });
      } catch {
        // ignore any formatting errors
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

      // Ensure attachments are taken from the live form state if not present on the submitted data
      try {
        const attachmentsFromData = (payload && typeof payload === 'object') ? (payload.attachments as unknown) : undefined;
        const attachmentsFromForm = getValues('attachments');
        const finalAttachments = Array.isArray(attachmentsFromData) ? attachmentsFromData : (Array.isArray(attachmentsFromForm) ? attachmentsFromForm : []);
        payload.attachments = finalAttachments;
      } catch {
        payload.attachments = [];
      }

      if (typeof console !== 'undefined' && typeof console.info === 'function') console.info('[NewServiceOrder] About to submit payload.attachments:', payload.attachments);
      if (isEditing && routeId) {
        updateMutation.mutate({ id: routeId, payload });
      } else {
        createMutation.mutate(payload);
      }
    });
    // Register the save handler so the global footer can trigger this form's submit
    const { registerSaveHandler, unregisterSaveHandler } = useSave();
      // use refs to avoid re-registering handlers every render which caused
      // an infinite update loop. We keep refs updated and register one stable
      // invoker on mount.
      const handlerRefLocal = useRef(onSubmitLocal);
      useEffect(() => { handlerRefLocal.current = onSubmitLocal; }, [onSubmitLocal]);

      const isSubmittingRef = useRef(isSubmittingLocal);
      useEffect(() => { isSubmittingRef.current = isSubmittingLocal; }, [isSubmittingLocal]);

      // register a stable invoker once
      useEffect(() => {
        const submitInvoker = () => { if (handlerRefLocal.current) handlerRefLocal.current(); };
        registerSaveHandler(submitInvoker, {
          getIsValid: () => {
            try {
              if (isValidRef.current !== null) {
                if (typeof console !== 'undefined' && typeof console.info === 'function') console.info('[NewServiceOrder] getIsValid => using RHF isValidRef:', isValidRef.current);
                // if RHF says invalid, double-check with zod in case RHF's isValid is stale or resolver mismatched
                if (!isValidRef.current) {
                  const schema = currentZodRef.current;
                  if (schema && typeof (schema as z.ZodTypeAny).safeParse === 'function') {
                    const vals = getValues();
                    const parse = (schema as z.ZodTypeAny).safeParse(vals);
                    if (parse.success) {
                      if (typeof console !== 'undefined' && typeof console.info === 'function') console.info('[NewServiceOrder] RHF isValid false but zod safeParse succeeded — overriding to valid');
                      return true;
                    }
                    if (typeof console !== 'undefined' && typeof console.info === 'function') console.info('[NewServiceOrder] RHF isValid false and zod safeParse failed:', parse.error.format ? parse.error.format() : parse.error);
                  }
                }
                return Boolean(isValidRef.current);
              }
              const schema = currentZodRef.current;
              if (schema && typeof (schema as z.ZodTypeAny).safeParse === 'function') {
                const vals = getValues();
                const parse = (schema as z.ZodTypeAny).safeParse(vals);
                if (!parse.success) {
                  if (typeof console !== 'undefined' && typeof console.info === 'function') console.info('[NewServiceOrder] zod safeParse failed:', parse.error.format ? parse.error.format() : parse.error);
                } else {
                  if (typeof console !== 'undefined' && typeof console.info === 'function') console.info('[NewServiceOrder] zod safeParse success');
                }
                return Boolean(parse.success);
              }
              if (typeof console !== 'undefined' && typeof console.info === 'function') console.info('[NewServiceOrder] getIsValid => no schema available, defaulting to true');
              return true;
            } catch {
              return false;
            }
          },
          getIsSubmitting: () => Boolean(isSubmittingRef.current),
        });
        return () => unregisterSaveHandler();
      // run once on mount/unmount; registerSaveHandler/unregisterSaveHandler are stable from context
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

    return (
      <FormProvider {...methodsLocal}>
        <div className="pb-24 card">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl">{currentOrderId ? `${t('service_orders:service_order')} ${getValues('order_identifier')}` : t('records:new_service_order')}</h1>
            <div className="flex gap-2">
              <Dropdown value={selectedServiceTypeId} options={serviceTypes.map(t => ({ label: t.name, value: t.id }))} onChange={(e) => { setSelectedServiceTypeId(e.value ?? null); setValue('service_type_id', e.value ?? null); }} placeholder={t('service_orders:select_service_type')} />
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
                <AttachmentsSection name="attachments" path="service_order" />
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
              <PaymentsSection control={control} setValue={setValue} getValues={getValues} selectedServiceTypeId={selectedServiceTypeId} />
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

          {/* Hidden page-level save target removed: using SaveContext to register page save handlers */}
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
        <BreadCrumb model={[{ label: 'Service Orders' }, { label: currentOrderId ? `${t('service_orders:service_order')}` : t('records:new_service_order') }]} />
      </div>

      {/* Render the remounting form wrapper so the zod resolver and defaults
          update when the selected service type changes. */}
      <div>
        {(!isEditing || (isEditing && zodSchema && currentOrderId)) ? (
          <FormWrapper key={selectedServiceTypeId ?? 'default'} />
        ) : (
          <div className="p-4">
            <Skeleton width="100%" height="2rem" className="mb-4" />
            <Skeleton width="100%" height="12rem" />
          </div>
        )}
        {/* footer shows when a service type is selected (keep previous UX): PageFooter now triggers SaveContext */}
        {selectedServiceTypeId && <PageFooter />}
      </div>
    </div>
  );
}
