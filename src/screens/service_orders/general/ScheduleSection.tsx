import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { AutoComplete } from 'primereact/autocomplete';
import { Calendar } from 'primereact/calendar';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { Control, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import type { ServiceOrderSubmission, FormScheduleItemSubmission } from '../../../models/serviceOrder';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import userService from '../../../services/userService';
// normalizeListResponse not needed; using createAutocompleteComplete
import { makeAutoCompleteOnChange, resolveAutoCompleteValue } from '../../../utils/formHelpers';
import { createAutocompleteComplete } from '../../../utils/autocompleteHelpers';
import type { User } from '../../../models/User';
import { useTranslation } from 'react-i18next';

type Props = { control?: Control<ServiceOrderSubmission>; setValue?: UseFormSetValue<ServiceOrderSubmission>; getValues?: UseFormGetValues<ServiceOrderSubmission>; selectedServiceTypeId?: string | null };

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

  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [userCache, setUserCache] = useState<Record<string, User>>({});

  const createUserComplete = createAutocompleteComplete<User>({ listFn: userService.list, qc, cacheKeyRoot: 'user', setSuggestions: setUserSuggestions, setCache: (updater) => setUserCache((prev) => updater(prev)), per_page: 20, filterKey: 'name' });

  const wrapSetUserCache = (updater: (prev: Record<string, User>) => Record<string, User>) => setUserCache((prev) => updater(prev));

  return (
    <Card>
      <div className="space-y-4">
  {schedules.map((_s, idx) => (
          <div key={idx} className="grid items-end grid-cols-1 gap-4 md:grid-cols-6">
            <div className="md:col-span-2">
              <label className="block mb-1">{t('new_service_order:inspection_date')}</label>
              <Controller control={control} name={`schedules.${idx}.date`} render={({ field }) => (
                <Calendar showIcon className="w-full" value={field.value as Date | undefined} onChange={(e: { value?: Date | Date[] | null }) => field.onChange(e?.value ?? null)} />
              )} />
            </div>

            <div className="md:col-span-3">
              <label className="block mb-1">{t('new_service_order:inspector_name') || t('new_service_order:inspector_name')}</label>
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
