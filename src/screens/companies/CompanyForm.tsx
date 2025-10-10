import { useEffect, useRef } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import companyService from '../../services/companyService';
import type { Company } from '../../models/company';
import { useTranslation } from 'react-i18next';


export default function CompanyForm() {
  const { t } = useTranslation(['companies', 'common']);
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useRef<Toast | null>(null);
  const queryClient = useQueryClient();

  const schema = z.object({
    name: z.string().min(1, t('common:required_field')),
    doc_number: z.string().min(1, t('common:required_field')),
    address: z.string().optional(),
    url_address: z.string().optional(),
  });

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const { data } = useQuery({
    queryKey: ['company', id],
    queryFn: () => (id ? companyService.get(id) : Promise.resolve(undefined)),
    enabled: !!id,
  });

  useEffect(() => {
    if (data) {
      // ensure fields are set into the form
      setValue('name', data.name ?? '');
      setValue('doc_number', data.doc_number ?? '');
      setValue('address', data.address ?? '');
      setValue('url_address', data.url_address ?? '');
      reset(data as FormValues);
    }
  }, [data, reset, setValue]);

  const createMutation = useMutation({
    mutationFn: (payload: FormValues) => companyService.create(payload as Company),
    onSuccess: (company) => {
      toast.current?.show?.({ severity: 'success', summary: t("common:success"), detail: t("common:record_created_successfully") });
      if (company?.id) {
        // navigate to edit page after creation
        navigate(`/management/companies/${company.id}/edit`);
        setValue('name', company.name ?? '');
        setValue('doc_number', company.doc_number ?? '');
        setValue('address', company.address ?? '');
        setValue('url_address', company.url_address ?? '');
        queryClient.invalidateQueries({ queryKey: ['companies'] });
      }
    },
    onError: () => toast.current?.show?.({ severity: 'error', summary: t("common:error"), detail: t("common:record_created_error") }),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: FormValues) => companyService.update(id as string, payload as Company),
    onSuccess: (company) => {
      toast.current?.show?.({ severity: 'success', summary: t("common:success"), detail: t("common:record_updated_successfully") });
      if (company) {
        setValue('name', company.name ?? '');
        setValue('doc_number', company.doc_number ?? '');
        setValue('address', company.address ?? '');
        setValue('url_address', company.url_address ?? '');
        queryClient.invalidateQueries({ queryKey: ['companies'] });
      }
    },
    onError: () => toast.current?.show?.({ severity: 'error', summary: t("common:error"), detail: t("common:record_updated_error") }),
  });

  function onSubmit(values: FormValues) {
    if (id) updateMutation.mutate(values);
    else createMutation.mutate(values);
  }

  return (
    <div>
      <Toast ref={toast} position="top-right" />
      <div className="mb-4">
        <BreadCrumb model={[{ label: t("management:management") }, { label: t("companies"), url: '/management/companies' }, { label: id ? t("common:edit_record") : t("common:new_record") }]} />
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
              <label className="block mb-1">{t("document")}</label>
              <InputText {...register('doc_number' as const)} className="w-full" />
            </div>
          </div>

          <div>
            <label className="block mb-1">{t("address")}</label>
            <InputText {...register('address' as const)} className="w-full" />
          </div>

          <div>
            <label className="block mb-1">{t("url_address")}</label>
            <InputText {...register('url_address' as const)} className="w-full" />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button label={t("common:cancel")} className="p-button-secondary" onClick={() => navigate('/management/companies')} />
            <Button label={id ? t("common:save_record") : t("common:create_record")} type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
}
