import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from 'primereact/inputtext';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Dropdown } from 'primereact/dropdown';
import SaveFooter from '../../components/SaveFooter';
import { Toast } from 'primereact/toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import inspectionSiteService from '../../services/inspectionSiteService';
import type { InspectionSite } from '../../models/inspectionSite';
import type { Company } from '../../models/company';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export default function InspectionSiteForm() {
  const { t } = useTranslation(['inspection_sites', 'common']);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const [currentId, setCurrentId] = useState<string | null>(id ?? null);
  const queryClient = useQueryClient();

  const schema = z.object({
    company_id: z.string().min(1, t('common:required_field')),
    name: z.string().min(1, t('common:required_field')),
    order: z.string().optional(),
  });

  type FormValues = z.infer<typeof schema>;

  const { data: companies } = useQuery<Company[]>({ queryKey: ['inspection_sites_companies'], queryFn: () => inspectionSiteService.listCompanies() });

  const { register, handleSubmit, setValue, formState: { errors }, control } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<InspectionSite>) => inspectionSiteService.create(payload),
    onSuccess: (item) => {
      toast.current?.show({ severity: 'success', summary: t("common:success"), detail: t("common:record_created_successfully") });
      if (item?.id) {
        setCurrentId(item.id);
        navigate(`/management/inspection-sites/${item.id}/edit`);
        setValue('company_id', item.company_id);
        setValue('name', item.name);
        queryClient.invalidateQueries({ queryKey: ['inspection_sites'] });
      }
    },
    onError: () => {
      toast.current?.show({ severity: 'error', summary: t("common:error"), detail: t("common:record_created_error") });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<InspectionSite> }) => inspectionSiteService.update(id, payload),
    onSuccess: (item) => {
      toast.current?.show({ severity: 'success', summary: t("common:success"), detail: t("common:record_updated_successfully") });
      if (item) {
        setValue('company_id', item.company_id);
        setValue('name', item.name);
        queryClient.invalidateQueries({ queryKey: ['inspection_sites'] });
      }
    },
    onError: () => {
      toast.current?.show({ severity: 'error', summary: t("common:error"), detail: t("common:record_updated_error") });
    },
  });

  const { data: existing } = useQuery<InspectionSite | null>({ queryKey: ['inspection_site', id], queryFn: () => id ? inspectionSiteService.get(id) : Promise.resolve(null), enabled: !!id });

  useEffect(() => {
    if (existing) {
      setValue('company_id', existing.company_id);
      setValue('name', existing.name);
      if (existing.order !== undefined && existing.order !== null) setValue('order', String(existing.order));
      setCurrentId(existing.id);
    }
  }, [existing, setValue]);

  const onSubmit = (values: FormValues) => {
    const payload: Partial<InspectionSite> = {
      company_id: values.company_id,
      name: values.name,
      order: values.order ? Number(values.order) : undefined,
    };
    if (currentId) {
      updateMutation.mutate({ id: currentId, payload: payload as Partial<InspectionSite> });
    } else {
      createMutation.mutate(payload as Partial<InspectionSite>);
    }
  };

  // derive submitting state from react-query mutation internals (robust across typings)
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
  const submitForm = () => { handleSubmit(onSubmit)(); };

  return (
    <div>
      <Toast ref={toast} position="top-right" />
      <div className="mb-4">
        <BreadCrumb model={[{ label: t("management:management") }, { label: t('inspection_sites:inspection_sites'), url: '/management/inspection-sites' }, { label: id ? t("common:edit_record") : t("common:new_record") }]} />
      </div>

      <div className="max-w-3xl p-6 card">
        <h3 className="mb-4 text-lg font-medium">{id ? t("common:edit_record") : t("common:new_record")}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1">{t("inspection_sites:company")}</label>
              <Controller
                control={control}
                name="company_id"
                render={({ field }) => (
                  <Dropdown value={field.value} options={companies || []} optionLabel="name" optionValue="id" onChange={(e) => field.onChange(e.value)} className="w-full" />
                )}
              />
              {errors.company_id && <small className="p-error">{errors.company_id.message}</small>}
            </div>

            <div>
              <label className="block mb-1">{t("inspection_sites:order")}</label>
              <InputText {...register('order')} className="w-full" />
            </div>
          </div>

          <div>
            <label className="block mb-1">{t("inspection_sites:name")}</label>
            <InputText {...register('name')} className="w-full" />
            {errors.name && <small className="p-error">{errors.name.message}</small>}
          </div>

          <div style={{ height: 80 }} />
        </form>
      </div>
      <SaveFooter loading={submitting} onSave={submitForm} />
    </div>
  );
}
