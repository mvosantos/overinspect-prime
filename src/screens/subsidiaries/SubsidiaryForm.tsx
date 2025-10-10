import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from 'primereact/inputtext';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import subsidiaryService from '../../services/subsidiaryService';
import type { Subsidiary } from '../../models/subsidiary';
import type { Company } from '../../models/company';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';


export default function SubsidiaryForm() {
  const { t } = useTranslation(['subsidiaries', 'common']);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const [currentId, setCurrentId] = useState<string | null>(id ?? null);
  const queryClient = useQueryClient();

  const schema = z.object({
    company_id: z.string().min(1, t('common:required_field')),
    name: z.string().min(1, t('common:required_field')),
    doc_number: z.string().min(1, t('common:required_field')),
  });

  type FormValues = z.infer<typeof schema>;

  const { data: companies } = useQuery<Company[]>({ queryKey: ['subsidiaries'], queryFn: () => subsidiaryService.listCompanies() });

  const { register, handleSubmit, setValue, formState: { errors }, control } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: (payload: FormValues) => subsidiaryService.create(payload),
    onSuccess: (subsidiary) => {
      toast.current?.show({ severity: 'success', summary: t("common:success"), detail: t("common:record_created_successfully") });
      if (subsidiary?.id) {
        setCurrentId(subsidiary.id);
        navigate(`/management/subsidiaries/${subsidiary.id}/edit`);
        setValue('company_id', subsidiary.company_id);
        setValue('name', subsidiary.name);
        setValue('doc_number', subsidiary.doc_number || '');
        queryClient.invalidateQueries({ queryKey: ['subsidiaries'] });
      }
    },
    onError: () => {
      toast.current?.show({ severity: 'error', summary: t("common:error"), detail: t("common:record_created_error") });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormValues }) => subsidiaryService.update(id, payload),
    onSuccess: (subsidiary) => {
      toast.current?.show({ severity: 'success', summary: t("common:success"), detail: t("common:record_updated_successfully") });
      if (subsidiary) {
        setValue('company_id', subsidiary.company_id);
        setValue('name', subsidiary.name);
        setValue('doc_number', subsidiary.doc_number || '');
        queryClient.invalidateQueries({ queryKey: ['subsidiaries'] });
      }
    },
    onError: () => {
      toast.current?.show({ severity: 'error', summary: t("common:error"), detail: t("common:record_updated_error") });
    },
  });

  const { data: existing } = useQuery<Subsidiary | null>({ queryKey: ['subsidiary', id], queryFn: () => id ? subsidiaryService.get(id) : Promise.resolve(null), enabled: !!id });

  useEffect(() => {
    if (existing) {
      setValue('company_id', existing.company_id);
      setValue('name', existing.name);
      setValue('doc_number', existing.doc_number || '');
      setCurrentId(existing.id);
    }
  }, [existing, setValue]);

  const onSubmit = (values: FormValues) => {
    if (currentId) {
      updateMutation.mutate({ id: currentId, payload: values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div>
      <Toast ref={toast} position="top-right" />
      <div className="mb-4">
        <BreadCrumb model={[{ label: t("management:management") }, { label: t("subsidiaries:subsidiaries"), url: '/management/subsidiaries' }, { label: id ? t("common:edit_record") : t("common:new_record") }]} />
      </div>

      <div className="max-w-3xl p-6 card">
        <h3 className="mb-4 text-lg font-medium">{id ? t("common:edit_record") : t("common:new_record")}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1">{t("subsidiaries:company")}</label>
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
              <label className="block mb-1">{t("subsidiaries:document")}</label>
              <InputText {...register('doc_number')} className="w-full" />
            </div>
          </div>

          <div>
            <label className="block mb-1">{t("subsidiaries:name")}</label>
            <InputText {...register('name')} className="w-full" />
            {errors.name && <small className="p-error">{errors.name.message}</small>}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button label="Salvar" type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
}
