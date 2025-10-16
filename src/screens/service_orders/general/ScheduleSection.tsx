import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { AutoComplete } from 'primereact/autocomplete';
import { Calendar } from 'primereact/calendar';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { Control, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import type { ServiceOrderSubmission, FormScheduleItemSubmission, ServiceOrder } from '../../../models/serviceOrder';
import { mapSchedulesSourceToForm } from '../../../utils/formSeedHelpers';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import userService from '../../../services/userService';
// normalizeListResponse not needed; using createAutocompleteComplete
import { makeAutoCompleteOnChange, resolveAutoCompleteValue } from '../../../utils/formHelpers';
import { createAutocompleteComplete } from '../../../utils/autocompleteHelpers';
import type { User } from '../../../models/User';
import { useTranslation } from 'react-i18next';

type FieldMeta = { name: string; visible?: boolean; required?: boolean; default_value?: unknown };
type Props = { control?: Control<ServiceOrderSubmission>; setValue?: UseFormSetValue<ServiceOrderSubmission>; getValues?: UseFormGetValues<ServiceOrderSubmission>; selectedServiceTypeId?: string | null; serviceTypeFields?: FieldMeta[] | undefined; schSource?: Partial<FormScheduleItemSubmission>[] | undefined };

export default function ScheduleSection(props?: Props) {
  // this section expects to be used inside a parent FormProvider
  const ctx = useFormContext<ServiceOrderSubmission>();
  const control = props?.control ?? ctx.control;
  const setValue = props?.setValue ?? ctx.setValue;
  const { t } = useTranslation(['new_service_order', 'service_orders']);
  const qc = useQueryClient();

  // watch schedules array from parent form
  const schedules = (useWatch({ control, name: 'schedules' }) as FormScheduleItemSubmission[] | undefined) ?? [];

  // only allow adding schedules after a service type has been chosen
  const watchedServiceTypeId = useWatch({ control, name: 'service_type_id' }) as string | undefined;
  const serviceTypeId = props?.selectedServiceTypeId ?? watchedServiceTypeId;

  // allow per-section metadata mapping
  const serviceTypeFieldsLocal = props?.serviceTypeFields ?? [];
  const byNameLocal: Record<string, FieldMeta | undefined> = {};
  (serviceTypeFieldsLocal || []).forEach((f) => { if (f && typeof f === 'object' && 'name' in f) byNameLocal[f.name] = f as FieldMeta; });

  const SCHEDULE_FIELD_NAMES: Record<string, string> = {
    userField: 'schedules_user_idschedules_user_id',
  };

  const fieldConfigs = Object.fromEntries(Object.entries(SCHEDULE_FIELD_NAMES).map(([k, svcName]) => [k, byNameLocal[svcName]])) as Record<string, FieldMeta | undefined>;

  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [userCache, setUserCache] = useState<Record<string, User>>({});

  const createUserComplete = createAutocompleteComplete<User>({ listFn: (params) => userService.list(params), qc, cacheKeyRoot: 'user', setSuggestions: setUserSuggestions, setCache: (updater) => setUserCache((prev) => updater(prev)), per_page: 20, filterKey: 'name' });

  const wrapSetUserCache = (updater: (prev: Record<string, User>) => Record<string, User>) => setUserCache((prev) => updater(prev));

  const { dateField, userField } = fieldConfigs as Record<string, FieldMeta | undefined>;

  // pre-seed schedules from server source if provided and form is empty
  useEffect(() => {
    try {
      if (!props?.schSource || !Array.isArray(props.schSource)) return;
      const existing = (schedules ?? []);
      if (Array.isArray(existing) && existing.length > 0) return;
      const mapped = mapSchedulesSourceToForm(props.schSource as ServiceOrder['schedules']);
      setValue?.('schedules', mapped);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasVisible = (dateField?.visible || userField?.visible) ?? true;
  if (!hasVisible) return null;

  return (
    <Card>
      <div className="space-y-4">
  {schedules.map((_s, idx) => (
          <div key={idx} className="grid items-end grid-cols-1 gap-4 md:grid-cols-6">
            {dateField?.visible !== false && (
            <div className="md:col-span-2">
              <label className="block mb-1">{t('new_service_order:inspection_date')}{dateField?.required ? ' *' : ''}</label>
              <Controller control={control} name={`schedules.${idx}.date`} render={({ field }) => (
                <Calendar showIcon className="w-full" value={field.value as Date | undefined} onChange={(e: { value?: Date | Date[] | null }) => field.onChange(e?.value ?? null)} />
              )} />
            </div>
            )}

            {userField?.visible !== false && (
            <div className="md:col-span-3">
              <label className="block mb-1">{t('new_service_order:inspector_name') || t('new_service_order:inspector_name')}{userField?.required ? ' *' : ''}</label>
              <Controller control={control} name={`schedules.${idx}.user_id`} render={({ field }) => (
                <AutoComplete
                  value={resolveAutoCompleteValue<User>(userSuggestions, userCache, field.value, qc, 'user') as User | undefined}
                  suggestions={userSuggestions} 
                  field="name"
                  completeMethod={createUserComplete}
                  onChange={makeAutoCompleteOnChange<User>({ setCache: (updater) => wrapSetUserCache(updater), cacheKey: 'user', qc, objectFieldKey: `schedules.${idx}.user`, setFormValue: setValue })(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )} />
            </div>
            )}

            <div className="flex gap-2 md:col-span-1">
              <Button type="button" icon="pi pi-trash" className="p-button-danger" label="Remover" onClick={() => {
                const next = schedules.slice();
                next.splice(idx, 1);
                setValue('schedules', next);
              }} />
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          {serviceTypeId && (
            <Button type="button" icon="pi pi-plus" className="p-button-text" aria-label={t('new_service_order:add_schedule')} title={t('new_service_order:add_schedule')} onClick={() => setValue('schedules', [...schedules, { date: null, user_id: null } as FormScheduleItemSubmission])} />
          )}
        </div>
      </div>
    </Card>
  );
}
