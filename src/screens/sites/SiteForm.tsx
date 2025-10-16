import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from 'primereact/inputtext';
import { BreadCrumb } from 'primereact/breadcrumb';
import type { InspectionSite } from '../../models/inspectionSite';
import SaveFooter from '../../components/SaveFooter';
import { AutoComplete } from 'primereact/autocomplete';
import type { AutoCompleteCompleteEvent } from 'primereact/autocomplete';
import { Toast } from 'primereact/toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import siteService from '../../services/siteService';
import inspectionSiteService from '../../services/inspectionSiteService';
import companyService from '../../services/companyService';
import { createAutocompleteComplete } from '../../utils/autocompleteHelpers';
import { makeAutoCompleteOnChange, resolveAutoCompleteValue, seedCachedObject } from '../../utils/formHelpers';
import type { Site } from '../../models/Site';
import type { Company } from '../../models/company';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export default function SiteForm() {
  const { t } = useTranslation(['sites', 'common']);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const [currentId, setCurrentId] = useState<string | null>(id ?? null);
  const queryClient = useQueryClient();

  const schema = z.object({
    company_id: z.string().min(1, t('common:required_field')),
    inspection_site_id: z.string().optional(),
    name: z.string().min(1, t('common:required_field')),
    internal_code: z.string().optional(),
    address: z.string().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
  });

  type FormValues = z.infer<typeof schema>;

  const qc = useQueryClient();
  const [companySuggestions, setCompanySuggestions] = useState<Company[]>([]);
  const [companyCache, setCompanyCache] = useState<Record<string, Company> | undefined>(undefined);
  type UpdateArgs = { id: string; payload: Partial<Site> };

  
  const onCompanyComplete = createAutocompleteComplete<Company>({ listFn: companyService.list, qc, cacheKeyRoot: 'company', setSuggestions: setCompanySuggestions, setCache: (updater) => setCompanyCache((prev) => updater(prev || {})), per_page: 20, filterKey: 'name' });

  // inspection site auto-complete state
  const [inspectionSiteSuggestions, setInspectionSiteSuggestions] = useState<InspectionSite[]>([]);
  const [inspectionSiteCache, setInspectionSiteCache] = useState<Record<string, InspectionSite> | undefined>(undefined);
  const onInspectionSiteComplete = createAutocompleteComplete<InspectionSite>({ listFn: inspectionSiteService.list, qc, cacheKeyRoot: 'inspectionSite', setSuggestions: setInspectionSiteSuggestions, setCache: (updater) => setInspectionSiteCache((prev) => updater(prev || {})), per_page: 20, filterKey: 'name' });

  const { register, handleSubmit, setValue, formState: { errors }, control } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const createMutation = useMutation<Site, Error, Partial<Site>, void>({
    mutationFn: (payload: Partial<Site>) => siteService.create(payload),
    onSuccess: (item) => {
      toast.current?.show({ severity: 'success', summary: t('common:success'), detail: t('common:record_created_successfully') });
      if (item?.id) {
        setCurrentId(item.id);
        navigate(`/records/sites/${item.id}/edit`);
        setValue('company_id', item.company_id);
        setValue('name', item.name);
        queryClient.invalidateQueries({ queryKey: ['sites'] });
      }
    },
    onError: () => toast.current?.show({ severity: 'error', summary: t('common:error'), detail: t('common:record_created_error') }),
  });

  const updateMutation = useMutation<Site, Error, UpdateArgs, void>({
    mutationFn: ({ id, payload }: UpdateArgs) => siteService.update(id, payload),
    onSuccess: (item) => {
      toast.current?.show({ severity: 'success', summary: t('common:success'), detail: t('common:record_updated_successfully') });
      if (item) {
        setValue('company_id', item.company_id);
        setValue('name', item.name);
        queryClient.invalidateQueries({ queryKey: ['sites'] });
      }
    },
    onError: () => toast.current?.show({ severity: 'error', summary: t('common:error'), detail: t('common:record_updated_error') }),
  });

  const { data: existing } = useQuery<Site | null>({ queryKey: ['site', id], queryFn: () => id ? siteService.get(id) : Promise.resolve(null), enabled: !!id });

  useEffect(() => {
    if (existing) {
      setValue('company_id', existing.company_id);
      seedCachedObject<Company>(existing.company as Company | undefined, existing.company_id, (updater) => setCompanyCache((prev) => updater(prev || {})), qc, 'company');
      // seed inspection site if present
      if (existing.inspection_site && typeof existing.inspection_site === 'object' && 'id' in (existing.inspection_site as Record<string, unknown>)) {
        const ins = existing.inspection_site as InspectionSite;
        seedCachedObject<InspectionSite>(ins, String(ins.id), (updater) => setInspectionSiteCache((prev) => updater(prev || {})), qc, 'inspectionSite');
        setValue('inspection_site_id', String(ins.id));
      }
      setValue('name', existing.name);
      setValue('internal_code', existing.internal_code ?? '');
      setValue('address', existing.address ?? '');
      setValue('latitude', existing.latitude ?? '');
      setValue('longitude', existing.longitude ?? '');
      setCurrentId(existing.id);
    }
  }, [existing, setValue, qc]);

  const onSubmit = (values: FormValues) => {
    const payload: Partial<Site> = {
      company_id: values.company_id,
      inspection_site_id: values.inspection_site_id || undefined,
      name: values.name,
      internal_code: values.internal_code || undefined,
      address: values.address || undefined,
      latitude: values.latitude || undefined,
      longitude: values.longitude || undefined,
    };
    if (currentId) updateMutation.mutate({ id: currentId, payload });
    else createMutation.mutate(payload as Partial<Site>);
  };
  // derive submitting state from react-query mutation result (typed)
  type CreateMut = UseMutationResult<Site, Error, Partial<Site>, unknown>;
  type UpdateMut = UseMutationResult<Site, Error, { id: string; payload: Partial<Site> }, unknown>;
  const mutationIsLoading = (m: CreateMut | UpdateMut) => {
    try {
      const mm = m as unknown as Record<string, unknown>;
      const state = typeof mm.state === 'string' ? String(mm.state) : undefined;
      const fetchStatus = typeof mm.fetchStatus === 'string' ? String(mm.fetchStatus) : undefined;
      const status = typeof mm.status === 'string' ? String(mm.status) : undefined;
      return state === 'loading' || fetchStatus === 'fetching' || status === 'pending';
    } catch {
      return false;
    }
  };
  const submitting = mutationIsLoading(createMutation as CreateMut) || mutationIsLoading(updateMutation as UpdateMut);
  const submitForm = () => { handleSubmit(onSubmit)(); };

  return (
    <div>
      <Toast ref={toast} position="top-right" />
      <div className="mb-4">
        <BreadCrumb model={[{ label: t('records:records') }, { label: t('sites:sites'), url: '/records/sites' }, { label: id ? t('common:edit_record') : t('common:new_record') }]} />
      </div>

      <div className="max-w-3xl p-6 card">
        <h3 className="mb-4 text-lg font-medium">{id ? t('common:edit_record') : t('common:new_record')}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1">{t('sites:company')}</label>
              <Controller
                control={control}
                name="company_id"
                render={({ field }) => (
                  <AutoComplete
                    value={resolveAutoCompleteValue<Company>(companySuggestions, companyCache, field.value, qc, 'company') as Company | string}
                    suggestions={companySuggestions}
                    completeMethod={(e: AutoCompleteCompleteEvent) => onCompanyComplete(e)}
                    field="name"
                    dropdown
                    forceSelection
                    onChange={makeAutoCompleteOnChange<Company>({ setCache: (updater) => setCompanyCache((prev) => updater(prev || {})), cacheKey: 'company', qc })(field.onChange)}
                    className="w-full"
                  />
                )}
              />
              {errors.company_id && <small className="p-error">{errors.company_id.message}</small>}
            </div>

            <div>
              <label className="block mb-1">{t('common:internal_code')}</label>
              <InputText {...register('internal_code' as const)} className="w-full" />
            </div>
          </div>

          <div>
            <label className="block mb-1">{t('sites:inspection_site')}</label>
            <Controller
              control={control}
              name="inspection_site_id"
              render={({ field }) => (
                  <AutoComplete
                    value={resolveAutoCompleteValue<InspectionSite>(inspectionSiteSuggestions, inspectionSiteCache, field.value, qc, 'inspectionSite') as InspectionSite | string}
                    suggestions={inspectionSiteSuggestions}
                    completeMethod={(e: AutoCompleteCompleteEvent) => onInspectionSiteComplete(e)}
                    field="name"
                    dropdown
                    forceSelection
                    onChange={makeAutoCompleteOnChange<InspectionSite>({ setCache: (updater) => setInspectionSiteCache((prev) => updater(prev || {})), cacheKey: 'inspectionSite', qc })(field.onChange)}
                    className="w-full"
                  />
              )}
            />
          </div>

          <div>
            <label className="block mb-1">{t('sites:name')}</label>
            <InputText {...register('name' as const)} className="w-full" />
            {errors.name && <small className="p-error">{errors.name.message}</small>}
          </div>

          <div>
            <label className="block mb-1">{t('sites:address')}</label>
            <InputText {...register('address' as const)} className="w-full" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1">{t('sites:latitude')}</label>
              <InputText {...register('latitude' as const)} className="w-full" />
            </div>
            <div>
              <label className="block mb-1">{t('sites:longitude')}</label>
              <InputText {...register('longitude' as const)} className="w-full" />
            </div>
          </div>

          <div style={{ height: 80 }} />
        </form>
      </div>
      <SaveFooter loading={submitting} onSave={submitForm} />
    </div>
  );
}
