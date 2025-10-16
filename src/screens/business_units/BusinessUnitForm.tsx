import { useEffect, useRef } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Toast } from 'primereact/toast';
import SaveFooter from '../../components/SaveFooter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import businessUnitService from '../../services/businessUnitService';
import { useTranslation } from 'react-i18next';
import type { BusinessUnit } from '../../models/businessUnit';



export default function BusinessUnitForm() {
  const { t } = useTranslation(['business_units', 'common']);
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useRef<Toast | null>(null);
  const queryClient = useQueryClient();

  const schema = z.object({
    name: z.string().min(1, t("required_field")),
    internal_code: z.string().optional()
  });

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const { data } = useQuery({
    queryKey: ['company', id],
    queryFn: () => (id ? businessUnitService.get(id) : Promise.resolve(undefined)),
    enabled: !!id,
  });

  useEffect(() => {
    if (data) {
      // ensure fields are set into the form
      setValue('name', data.name ?? '');
      setValue('internal_code', data.internal_code ?? '');
      reset(data as FormValues);
    }
  }, [data, reset, setValue]);

  const createMutation = useMutation({
    mutationFn: (payload: FormValues) => businessUnitService.create(payload as BusinessUnit),
    onSuccess: (businessUnit) => {
      toast.current?.show?.({ severity: 'success', summary: t("common:success"), detail: t("common:record_created_successfully") });
      if (businessUnit?.id) {
        // navigate to edit page after creation
        navigate(`/management/business-units/${businessUnit.id}/edit`);
        setValue('name', businessUnit.name ?? '');
        setValue('internal_code', businessUnit.internal_code ?? '');
        queryClient.invalidateQueries({ queryKey: ['business_units'] });
      }
    },
    onError: () => toast.current?.show?.({ severity: 'error', summary: t("common:error"), detail: t("common:could_not_create") }),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: FormValues) => businessUnitService.update(id as string, payload as BusinessUnit),
    onSuccess: (businessUnit) => {
      toast.current?.show?.({ severity: 'success', summary: t("common:success"), detail: t("common:record_updated_successfully") });
      if (businessUnit) {
        setValue('name', businessUnit.name ?? '');
        setValue('internal_code', businessUnit.internal_code ?? '');
        queryClient.invalidateQueries({ queryKey: ['business_units'] });
      }
    },
    onError: () => toast.current?.show?.({ severity: 'error', summary: t("common:error"), detail: t("common:could_not_update") }),
  });

  function onSubmit(values: FormValues) {
    if (id) updateMutation.mutate(values);
    else createMutation.mutate(values);
  }

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

  const submitting = mutationIsLoading(createMutation) || mutationIsLoading(updateMutation);

  return (
    <div>
      <Toast ref={toast} position="top-right" />
      <div className="mb-4">
        <BreadCrumb model={[{ label: t("management:management") }, { label: t("business_units"), url: '/management/business_units' }, { label: id ? t("common:edit_record") : t("common:new_record") }]} />
      </div>

      <div className="max-w-3xl p-6 card">
        <h3 className="mb-4 text-lg font-medium">{id ? t("common:edit_record") : t("common:new_record")}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1">{t("name")}</label>
              <InputText {...register('name' as const, { required: true })} className="w-full" />
              {errors.name && <small className="p-error">{t("common:required_field")}</small>}
            </div>

            <div>
              <label className="block mb-1">{t("common:internal_code")}</label>
              <InputText {...register('internal_code' as const)} className="w-full" />
            </div>
          </div>
        </form>
      </div>
      <SaveFooter loading={submitting} onSave={() => handleSubmit(onSubmit)()} onCancel={() => navigate('/management/business-units')} />
    </div>
  );
}
