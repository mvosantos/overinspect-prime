import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Timeline } from 'primereact/timeline';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { Skeleton } from 'primereact/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import serviceOrderService from '../../services/serviceOrderService';
import serviceTypeService from '../../services/serviceTypeService';
import type { ServiceOrder, ServiceType, SchedulesOrderService } from '../../models/serviceOrder';
import GeneralDataSection from './general/GeneralDataSection';
import ServicesSection from './general/ServicesSection';
import DatesSitesSection from './general/DatesSitesSection';
import WeighingSection from './general/WeighingSection';
// AttachmentsSection removed — attachments handling moved elsewhere
import { useForm, FormProvider } from 'react-hook-form';
import AttachmentsSection from '../../components/AttachmentsSection';
import { buildZodSchemaFromFields } from '../../utils/dynamicSchema';
import z from 'zod';
import type { ZodTypeAny } from 'zod';
import { useTranslation } from 'react-i18next';
import { formatForPayload, parseToDateOrOriginal, formatShortDateTime } from '../../utils/dateHelpers';
import ScheduleSection from './general/ScheduleSection';
import PaymentsSection from './general/PaymentsSection';
import PageFooter from '../../components/PageFooter';
import { useSave } from '../../contexts/SaveContext';

// Form-level types for items (these represent the shape we send to the API)

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
  type TimelineItem = { statusName: string; dateVal: string | Date | null; userName?: string; raw?: Record<string, unknown> };
  const [timelineModalVisible, setTimelineModalVisible] = useState(false);
  const [selectedTimelineItem, setSelectedTimelineItem] = useState<TimelineItem | null>(null);
  

  const { id: routeId } = useParams();
  const isEditing = Boolean(routeId);

  const { data: types } = useQuery({ queryKey: ['service-types'], queryFn: () => serviceTypeService.listAll() });

  const { data: fetchedServiceOrder } = useQuery({
    queryKey: ['service-order', routeId],
    queryFn: () => serviceOrderService.get<ServiceOrder | null>(routeId as string),
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

  const fo = fetchedServiceOrder as ServiceOrder;

    // parse incoming date-like values to Date when possible, otherwise keep original
    const parseDate = (v: unknown) => parseToDateOrOriginal(v);

    const safeId = (obj: unknown): string | undefined => {
      if (!obj || typeof obj !== 'object') return undefined;
      const o = obj as { id?: unknown };
      return typeof o.id === 'string' ? o.id : undefined;
    };

  const svcSource: NonNullable<ServiceOrder['services']> = (Array.isArray(fo.services) ? fo.services : []) as NonNullable<ServiceOrder['services']>;
    const servicesArr = svcSource.map((s) => ({
      service_id: s?.service_id ?? safeId(s?.service) ?? null,
      unit_price: s?.unit_price ?? '0.00',
      quantity: s?.quantity ?? '0',
      total_price: s?.total_price ?? '0.00',
      scope: s?.scope ?? '',
    }));

  const paySource: NonNullable<ServiceOrder['payments']> = (Array.isArray(fo.payments) ? fo.payments : []) as NonNullable<ServiceOrder['payments']>;
    const paymentsArr = paySource.map((p) => ({
      id: p?.id,
      document_type_id: p?.document_type_id ?? safeId(p?.document_type) ?? null,
      document_number: p?.document_number ?? '',
      unit_price: p?.unit_price ?? '0.00',
      quantity: p?.quantity ?? '0',
      total_price: p?.total_price ?? '0.00',
    }));

  const schSource: NonNullable<ServiceOrder['schedules']> = (Array.isArray(fo.schedules) ? fo.schedules : []) as NonNullable<ServiceOrder['schedules']>;
    const schedulesArr = schSource.map((s) => ({
      id: s?.id,
      user_id: s?.user_id ?? safeId(s?.user) ?? null,
      date: parseDate(s?.date),
    }));

  const attachmentsArr = Array.isArray(fo.attachments) ? fo.attachments : [];

  const scalarCopy: Record<string, unknown> = {};
    const foRec = fo as unknown as Record<string, unknown>;
    Object.entries(foRec).forEach(([k, v]) => {
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
      if (svcSource.length > 0) {
        svcSource.forEach((si) => { seedIfObj(((si as unknown) as { service?: unknown }).service, 'service'); });
      }

      if (schSource.length > 0) {
        schSource.forEach((si) => { seedIfObj(((si as unknown) as { user?: unknown }).user, 'user'); });
      }

      if (paySource.length > 0) {
        paySource.forEach((pi) => { seedIfObj(((pi as unknown) as { document_type?: unknown }).document_type, 'document_type'); });
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
  // Form-level types for items (align with submission DTOs)
  type FormServiceItem = import('../../models/serviceOrder').FormServiceItemSubmission;
  type FormPaymentItem = import('../../models/serviceOrder').FormPaymentItemSubmission;
  type FormScheduleItem = import('../../models/serviceOrder').FormScheduleItemSubmission;

  // Use the shared submission type from models for payload typing
  type FormSubmission = import('../../models/serviceOrder').ServiceOrderSubmission;

  // use the submission shape as the form generic so RHF helpers are better typed
  const methodsLocal = useForm<FormSubmission>({ defaultValues: formDefaults as FormSubmission, mode: 'onChange' });
  const { register, control, handleSubmit, formState, setValue, getValues } = methodsLocal;
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
    mutationFn: (payload: FormSubmission) => serviceOrderService.createSubmission(payload),
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
    // rely on mutation.isLoading to reflect loading state
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormSubmission }) => serviceOrderService.updateSubmission(id, payload),
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
    // rely on mutation.isLoading to reflect loading state
  });
  
  // derive submitting state directly from react-query mutation internals
  // consider both `state === 'loading'` and `fetchStatus === 'fetching'` to
  // capture transient fetch phases reliably.
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
  const isSubmitting = mutationIsLoading(createMutation) || mutationIsLoading(updateMutation);
  // footer now handled by global AuthLayout

  const onSubmitLocal = handleSubmit((data) => {
    // Manual zod validation: use the current schema (if any) to validate before building payload.
    try {
      const schema = currentZodRef.current as z.ZodTypeAny | null;
      if (schema && typeof schema.safeParse === 'function') {
  // Build validation snapshot from the live form state (getValues) merged
  // with the submitted `data`. This ensures field-arrays like `payments`
  // and other live inputs are included even if `data` doesn't contain them
  // (attachments may affect what `data` contains).
  const live = typeof getValues === 'function' ? (getValues() as Record<string, unknown>) : {};
  const submitted = (data && typeof data === 'object') ? (data as Record<string, unknown>) : {};
  const valsForValidation: Record<string, unknown> = { ...(live ?? {}), ...(submitted ?? {}) };
        // Ensure gross_volume_landed is a string (zod expects string in current schema)
        if (valsForValidation.gross_volume_landed == null) valsForValidation.gross_volume_landed = '';
        // Ensure nomination_date is string or empty
        if (valsForValidation.nomination_date == null) valsForValidation.nomination_date = '';
        // Ensure business_unit_id and other id fields are present as empty string when undefined or null
        ['operation_type_id', 'packing_type_id', 'client_id', 'subsidiary_id', 'business_unit_id'].forEach((k) => {
          if ((valsForValidation as Record<string, unknown>)[k] == null) (valsForValidation as Record<string, unknown>)[k] = '';
        });
        // Normalize payments array items
        try {
          if (!Array.isArray(valsForValidation.payments)) {
            (valsForValidation as Record<string, unknown>).payments = [];
          }
          (valsForValidation.payments as unknown[]) = (valsForValidation.payments as unknown[]).map((p) => {
            if (!p || typeof p !== 'object') return { description: '' };
            const pp = p as Record<string, unknown>;
            return {
              id: pp.id,
              description: pp.description == null ? '' : String(pp.description),
              document_type_id: pp.document_type_id ?? null,
              document_number: pp.document_number == null ? '' : String(pp.document_number),
              unit_price: pp.unit_price == null ? '0.00' : String(pp.unit_price),
              quantity: pp.quantity == null ? '0' : String(pp.quantity),
              total_price: pp.total_price == null ? '0.00' : String(pp.total_price),
            };
          });
        } catch {
          // ignore
        }

        // diagnostics removed in production

        // Deep-normalize: convert null/undefined to '' and coerce primitives to strings
        const deepNormalizeStrings = (v: unknown): unknown => {
          if (v === null || v === undefined) return '';
          if (Array.isArray(v)) return v.map((it) => deepNormalizeStrings(it));
          if (typeof v === 'object') {
            try {
              const o = v as Record<string, unknown>;
              const out: Record<string, unknown> = {};
              Object.keys(o).forEach((k) => { out[k] = deepNormalizeStrings(o[k]); });
              return out;
            } catch {
              return v;
            }
          }
          // primitives (number, boolean, string) -> keep as-is but ensure string for numbers/booleans
          if (typeof v === 'number' || typeof v === 'boolean') return String(v);
          return v;
        };

        const normalizedForParse = deepNormalizeStrings(valsForValidation) as unknown;
        const parsed = schema.safeParse(normalizedForParse);
          if (!parsed.success) {
          // set form errors where possible and abort submission
          try {
            // diagnostics removed: we still map errors to the form below
          } catch {
            // ignore
          }
          const flat = parsed.error.flatten();
          const fieldErrors = flat.fieldErrors || {} as Record<string, (string[] | undefined)>;
          Object.entries(fieldErrors).forEach(([k, v]) => {
            const first = Array.isArray(v) && v.length > 0 ? v[0] : undefined;
            if (first) {
              try {
                // handle nested keys like payments.0.unit_price -> payments[0].unit_price which RHF understands
                const rhfKey = k.replace(/\.(\d+)\./g, (_, idx) => `[${idx}].`);
                methodsLocal.setError(rhfKey as unknown as keyof Record<string, unknown>, { type: 'manual', message: String(first) });
              } catch {
                // ignore setError failures
              }
            }
          });
          return;
        }
      }
    } catch {
      // ignore zod validation errors and proceed; server-side validation will catch issues
    }
  // Helper to extract nested object id safely
  const safeId = (obj: unknown): string | undefined => {
    if (!obj || typeof obj !== 'object') return undefined;
    const o = obj as { id?: unknown };
    return typeof o.id === 'string' ? o.id : undefined;
  };

  // Build a fresh submission payload from form scalar values and normalized arrays.
  const payload: FormSubmission = {} as FormSubmission;
  // copy scalar values from submitted data (avoid indexing into ServiceOrder)
  if (data && typeof data === 'object') {
    const dat = data as Record<string, unknown>;
    Object.entries(dat).forEach(([k, v]) => {
      // arrays/attachments are handled below
      if (['services', 'payments', 'schedules', 'attachments', 'service_order_status_history'].includes(k)) return;
      (payload as Record<string, unknown>)[k] = v;
    });
  }
      // ensure service_type_id is present
      if (selectedServiceTypeId) payload.service_type_id = selectedServiceTypeId;

      // serialize dates using centralized helper
      const formatDateForPayload = (v: unknown) => formatForPayload(v);

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
      if ((payload as Record<string, unknown>).num_containers !== undefined && (payload as Record<string, unknown>).num_containers !== null) {
        const n = Number((payload as Record<string, unknown>).num_containers as unknown);
        (payload as Record<string, unknown>).num_containers = Number.isFinite(n) ? n : undefined;
      }

      // Normalize services array if present (use form values)
      const maybeServices = getValues('services') as FormServiceItem[] | undefined;
      const toFixed2 = (v: unknown) => {
        const n = Number(String(v ?? 0));
        return Number.isFinite(n) ? n.toFixed(2) : '0.00';
      };
      const buildServices = (arr?: FormServiceItem[] | undefined) => {
        if (!Array.isArray(arr)) return [] as FormServiceItem[];
        return arr.map((s) => {
          const unit = Number(String(s.unit_price ?? 0));
          const qty = Math.floor(Number(String(s.quantity ?? 0)) || 0);
          const total = unit * qty;
          return {
            service_id: (s.service_id as string) ?? null,
            unit_price: toFixed2(unit),
            quantity: String(qty),
            total_price: toFixed2(total),
            scope: (s.scope as string) ?? '',
          } as FormServiceItem;
        });
      };
      payload.services = buildServices(maybeServices);

      // Normalize payments array if present (or take from form if not present)
      const paymentsFromForm = getValues('payments') as FormPaymentItem[] | undefined;
      const buildPayments = (arr?: FormPaymentItem[] | undefined) => {
        if (!Array.isArray(arr)) return [] as FormPaymentItem[];
        return arr.map((p) => {
          const unitNum = Number(String(p.unit_price ?? 0));
          const qtyNum = Math.floor(Number(String(p.quantity ?? 0)) || 0);
          const totalNum = Number(String(p.total_price ?? (unitNum * qtyNum)));
          return {
            id: (p.id as string) ?? undefined,
            description: (p.description as string) ?? '',
            document_type_id: (p.document_type_id as string) ?? null,
            document_number: (p.document_number as string) ?? '',
            unit_price: !Number.isNaN(unitNum) ? Number(unitNum).toFixed(2) : '0.00',
            quantity: String(qtyNum),
            total_price: !Number.isNaN(totalNum) ? Number(totalNum).toFixed(2) : '0.00',
          } as FormPaymentItem;
        });
      };
      payload.payments = buildPayments(paymentsFromForm);

      // Ensure attachments are taken from the live form state if not present on the submitted data
      try {
  const attachmentsFromData = (payload && typeof payload === 'object') ? (payload.attachments as unknown) : undefined;
  const attachmentsFromForm = getValues('attachments') as ServiceOrder['attachments'] | undefined;
        const finalAttachments = Array.isArray(attachmentsFromData) ? attachmentsFromData : (Array.isArray(attachmentsFromForm) ? attachmentsFromForm : []);
        payload.attachments = finalAttachments;
      } catch {
        payload.attachments = [];
      }

      // Ensure schedules are taken from the live form state if not present on the submitted data
      try {
        const schedulesFromForm = getValues('schedules') as FormScheduleItem[] | undefined;
        const schedulesFromData = (payload && typeof payload === 'object') ? (payload.schedules as unknown) : undefined;
        const normalizePartialSchedules = (arr: Partial<SchedulesOrderService>[]): FormScheduleItem[] => arr.map((s) => ({
          id: s.id as string | undefined,
          user_id: (s.user_id as string | null | undefined) ?? safeId(s.user) ?? null,
          date: parseToDateOrOriginal((s.date as unknown)) as string | Date | null,
        }));

        let finalSchedules: FormScheduleItem[] = [];
        if (Array.isArray(schedulesFromForm)) {
          finalSchedules = schedulesFromForm;
        } else if (Array.isArray(schedulesFromData)) {
          const sample = (schedulesFromData as unknown[])[0];
          const looksLikePartial = sample && typeof sample === 'object' && ('user_id' in (sample as Record<string, unknown>) || 'date' in (sample as Record<string, unknown>));
          try {
            finalSchedules = looksLikePartial ? normalizePartialSchedules(schedulesFromData as Partial<SchedulesOrderService>[]) : (schedulesFromData as FormScheduleItem[]);
          } catch {
            finalSchedules = [];
          }
        }
        payload.schedules = finalSchedules;
      } catch {
        payload.schedules = [];
      }

  // submission starting — diagnostics removed
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

      // register a save handler and re-register whenever validity/submitting state
      // changes so SaveContext.metaVersion is bumped and consumers re-render.
      useEffect(() => {
        const submitInvoker = () => { if (handlerRefLocal.current) handlerRefLocal.current(); };
        registerSaveHandler(submitInvoker, {
          getIsValid: () => {
            try {
              if (isValidRef.current !== null) return Boolean(isValidRef.current);
              return true;
            } catch {
              return false;
            }
          },
          getIsSubmitting: () => Boolean(isSubmitting),
        });
        return () => unregisterSaveHandler();
      // re-run when validity or submitting state changes so SaveContext re-evaluates
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [formState.isValid, isSubmitting, currentZodRef]);

    return (
      <FormProvider {...methodsLocal}>
        <div className="relative pb-24 card">
          {isSubmitting ? (
            // Full viewport centered loader with semi-transparent backdrop
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative flex flex-col items-center gap-3 p-6 text-lg text-gray-900 bg-white rounded-md shadow-lg dark:bg-gray-800">
                <i className="text-4xl text-gray-900 dark:text-gray-100 pi pi-spin pi-spinner" />
                <span className="text-lg font-medium text-gray-900 dark:text-gray-100">Carregando ...</span>
              </div>
            </div>
          ) : null}
          <div className="flex items-center justify-between mb-4">
            <h1 className="ml-5 text-2xl font-semibold text-teal-700">{currentOrderId ? `${t('service_orders:service_order')} ${getValues('number')}` : t('records:new_service_order')}</h1>
            <div className="flex gap-2">
              <Dropdown value={selectedServiceTypeId} options={serviceTypes.map(t => ({ label: t.name, value: t.id }))} onChange={(e) => { setSelectedServiceTypeId(e.value ?? null); setValue('service_type_id', e.value ?? null); }} placeholder={t('service_orders:select_service_type')} disabled={!!selectedServiceTypeId} className='w-[400px]' />
            </div>
          </div>

          

          <TabView>
            <TabPanel header={
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="pi pi-file" />
                ORDEM DE SERVIÇO
              </span>
            }>
              <div className="grid grid-cols-1">
                {/* Timeline: show only when editing and history exists */}
                {isEditing && !!fetchedServiceOrder && Array.isArray((fetchedServiceOrder as Record<string, unknown>).service_order_status_history) && ((fetchedServiceOrder as Record<string, unknown>).service_order_status_history as unknown[]).length > 0 && (
                  <>
                    {(() => {
                      const items: TimelineItem[] = ((fetchedServiceOrder as Record<string, unknown>).service_order_status_history as unknown[]).map((h) => {
                        const hi = h as Record<string, unknown>;
                        // primary: new_status.name, fallback to service_order_status.name or raw name fields
                        const statusName = (hi.new_status && typeof hi.new_status === 'object')
                          ? ((hi.new_status as Record<string, unknown>).name as string ?? '—')
                          : (hi.new_status_name as string) ?? ((hi.service_order_status && typeof hi.service_order_status === 'object') ? ((hi.service_order_status as Record<string, unknown>).name as string) : '—');
                        const dateVal = (hi.created_at ?? hi.date ?? hi.updated_at) as string | Date | null;
                        const userName = (hi.user && typeof hi.user === 'object') ? ((hi.user as Record<string, unknown>).name as string) : (hi.user_name as string) ?? '';
                        return { statusName, dateVal, userName, raw: hi };
                      });
                      return (
                        <>
                          <Timeline value={items} layout="horizontal" align="bottom" style={{ padding: 0, marginBottom: 0 }} className="!py-0 !my-0 !mb-0 ml-5" content={(item: TimelineItem) => (
                            <div className="text-sm text-left cursor-pointer min-w-[160px] max-w-[260px]" onClick={() => { setSelectedTimelineItem(item); setTimelineModalVisible(true); }}>
                              <div className="text-base font-semibold leading-5 truncate">{item.statusName}</div>
                              <div className="flex flex-col gap-0 overflow-hidden">
                                {item.userName ? <div className="text-base leading-4 text-gray-600 truncate">{item.userName}</div> : null}
                                <div className="text-base leading-4 text-gray-400 truncate">{String(formatShortDateTime(item.dateVal) ?? '')}</div>
                              </div>
                            </div>
                          )} />
                        </>
                      );
                    })()}
                  </>
                )}
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
          {/* Timeline detail modal */}
          <Dialog header="Detalhes do histórico" visible={timelineModalVisible} style={{ width: '600px' }} onHide={() => { setTimelineModalVisible(false); setSelectedTimelineItem(null); }}>
            {selectedTimelineItem ? (
              <div>
                <div className="font-semibold min-w-max">{selectedTimelineItem.statusName}</div>
                <div className="font-medium min-w-max">{selectedTimelineItem.userName}</div>
                <div className="text-lg text-gray-500">{String(formatShortDateTime(selectedTimelineItem.dateVal) ?? '')}</div>
                <div className="p-2 text-sm bg-gray-100 rounded">{String(((selectedTimelineItem.raw ?? {}) as Record<string, unknown>).comment ?? '')}</div>
              </div>
            ) : null}
          </Dialog>

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
  {selectedServiceTypeId && <PageFooter currentOrderId={currentOrderId} currentStatusId={(formDefaults && (formDefaults.service_order_status && (formDefaults.service_order_status as Record<string, unknown>).id) as string) ?? undefined} />}
      </div>
    </div>
  );
}
