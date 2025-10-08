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

const schema = z.object({
  company_id: z.string().min(1, 'Empresa é obrigatória'),
  name: z.string().min(1, 'Nome é obrigatório'),
  doc_number: z.string().min(1, 'CPF/CNPJ é obrigatório'),
});

type FormValues = z.infer<typeof schema>;

export default function SubsidiaryForm() {
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const [currentId, setCurrentId] = useState<string | null>(id ?? null);
  const queryClient = useQueryClient();

  const { data: companies } = useQuery<Company[]>({ queryKey: ['companies'], queryFn: () => subsidiaryService.listCompanies() });

  const { register, handleSubmit, setValue, formState: { errors }, control } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: (payload: FormValues) => subsidiaryService.create(payload),
    onSuccess: (subsidiary) => {
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Registro criado' });
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
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível criar' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormValues }) => subsidiaryService.update(id, payload),
    onSuccess: (subsidiary) => {
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Registro atualizado' });
      if (subsidiary) {
        setValue('company_id', subsidiary.company_id);
        setValue('name', subsidiary.name);
        setValue('doc_number', subsidiary.doc_number || '');
        queryClient.invalidateQueries({ queryKey: ['subsidiaries'] });
      }
    },
    onError: () => {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível atualizar' });
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
        <BreadCrumb model={[{ label: 'Management' }, { label: 'Subsidiaries', url: '/management/subsidiaries' }, { label: id ? 'Edit' : 'New' }]} />
      </div>

      <div className="card p-6 max-w-3xl">
        <h3 className="text-lg font-medium mb-4">{id ? 'Editar Filial' : 'Nova Filial'}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Empresa</label>
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
              <label className="block mb-1">CPF/CNPJ</label>
              <InputText {...register('doc_number')} className="w-full" />
            </div>
          </div>

          <div>
            <label className="block mb-1">Nome</label>
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
