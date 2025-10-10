import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { AutoComplete } from 'primereact/autocomplete';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import siteService from '../../../services/siteService';
import { normalizeListResponse } from '../../../utils/apiHelpers';
import type { Site } from '../../../models/Site';
import { Controller } from 'react-hook-form';
import type { Control, UseFormGetValues, UseFormSetValue } from 'react-hook-form';

type FieldMeta = { name: string; visible?: boolean; required?: boolean; default_value?: unknown };

type DatesSitesSectionProps = {
  control?: Control<Record<string, unknown>>;
  getValues: UseFormGetValues<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;
  selectedServiceType?: string | null;
  t: (key: string) => string;
  fieldConfigs: Record<string, FieldMeta | undefined>;
  formErrors: Record<string, string | undefined>;
};

export default function DatesSitesSection({
  control,
  getValues,
  setValue,
  selectedServiceType,
  t,
  fieldConfigs = {},
  formErrors = {},
}: DatesSitesSectionProps) {
  // keep references to props that may be used by parent wiring (avoids unused var lint)
  void getValues;
  void setValue;
  void selectedServiceType;
  const {
    operationStartsAtField,
    blDateField,
    cargoArrivalDateField,
    operationFinishesAtField,
    operationFinishDateField,
    firstSiteIdField,
    secondSiteIdField,
    thirdSiteIdField,
    stuffingSiteIdField,
    departureSiteIdField,
    destinationField,
  } = fieldConfigs as Record<string, FieldMeta | undefined>;

  const qc = useQueryClient();
  const [firstSiteSuggestions, setFirstSiteSuggestions] = useState<Site[]>([]);
  const [secondSiteSuggestions, setSecondSiteSuggestions] = useState<Site[]>([]);
  const [thirdSiteSuggestions, setThirdSiteSuggestions] = useState<Site[]>([]);
  const [stuffingSiteSuggestions, setStuffingSiteSuggestions] = useState<Site[]>([]);
  const [departureSiteSuggestions, setDepartureSiteSuggestions] = useState<Site[]>([]);

  // Resolve field value (id or object) into an object so AutoComplete displays the 'name'
  const getAutoCompleteValue = (suggestions: Site[], fieldValue: unknown) => {
    // If already an object, return it
    if (fieldValue && typeof fieldValue === 'object') return fieldValue as Site;
    const id = String(fieldValue ?? '');
    if (!id) return fieldValue;
    // Try suggestions first
    const found = suggestions.find((s) => s.id === id);
    if (found) return found;
    // Try react-query cache
    const cached = qc.getQueryData(['site', id]) as Site | undefined;
    if (cached) return cached;
    // fallback to raw value (will display id)
    return fieldValue;
  };


  const createSiteCompleteHandler = (setSuggestions: (s: Site[]) => void) => async (event: { query: string }) => {
    const q = event.query;
    try {
  const res = await siteService.list({ per_page: 20, filters: { name: q } });
      const items = normalizeListResponse<Site>(res);
      setSuggestions(items ?? []);
      (items ?? []).forEach((it) => { if (it?.id) qc.setQueryData(['site', it.id], it); });
    } catch {
      setSuggestions([]);
    }
  };

  const onFirstSiteComplete = createSiteCompleteHandler(setFirstSiteSuggestions);
  const onSecondSiteComplete = createSiteCompleteHandler(setSecondSiteSuggestions);
  const onThirdSiteComplete = createSiteCompleteHandler(setThirdSiteSuggestions);
  const onStuffingSiteComplete = createSiteCompleteHandler(setStuffingSiteSuggestions);
  const onDepartureSiteComplete = createSiteCompleteHandler(setDepartureSiteSuggestions);

  const hasVisibleFields =
    operationStartsAtField?.visible ||
    blDateField?.visible ||
    cargoArrivalDateField?.visible ||
    operationFinishesAtField?.visible ||
    operationFinishDateField?.visible ||
    firstSiteIdField?.visible ||
    secondSiteIdField?.visible ||
    thirdSiteIdField?.visible ||
    stuffingSiteIdField?.visible ||
    departureSiteIdField?.visible ||
    destinationField?.visible;

  if (!hasVisibleFields) return null;

  return (
    <Card>
      <div className="mb-4 text-center">
        <div className="inline-block px-4 py-1 border border-teal-100 rounded-md bg-teal-50">
          <h3 className="text-lg font-semibold text-teal-700">{t('service_orders:dates_sites_forecasts') || 'Datas, Locais e Previsões'}</h3>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

          {/* Operation Starts At */}
          {operationStartsAtField?.visible && (
            <div>
              <label className="block mb-1">{t('new_service_order:operation_starts_at')}</label>
              <Controller
                control={control}
                name="operation_starts_at"
                defaultValue={operationStartsAtField?.default_value}
                render={({ field }) => (
                  <Calendar className="w-full" value={field.value as Date | undefined} onChange={(e: { value?: Date | Date[] | null }) => field.onChange(e?.value ?? null)} />
                )}
              />
              {formErrors.operation_starts_at && <small className="p-error">{formErrors.operation_starts_at}</small>}
            </div>
          )}

          {/* BL Date */}
          {blDateField?.visible && (
            <div>
              <label className="block mb-1">{t('new_service_order:bl_date')}</label>
              <Controller
                control={control}
                name="bl_date"
                defaultValue={blDateField?.default_value}
                render={({ field }) => (
                  <Calendar className="w-full" value={field.value as Date | undefined} onChange={(e: { value?: Date | Date[] | null }) => field.onChange(e?.value ?? null)} />
                )}
              />
              {formErrors.bl_date && <small className="p-error">{formErrors.bl_date}</small>}
            </div>
          )}

          {/* Cargo Arrival Date */}
          {cargoArrivalDateField?.visible && (
            <div>
              <label className="block mb-1">{t('new_service_order:cargo_arrival_date')}</label>
              <Controller
                control={control}
                name="cargo_arrival_date"
                defaultValue={cargoArrivalDateField?.default_value}
                render={({ field }) => (
                  <Calendar className="w-full" value={field.value as Date | undefined} onChange={(e: { value?: Date | Date[] | null }) => field.onChange(e?.value ?? null)} />
                )}
              />
              {formErrors.cargo_arrival_date && <small className="p-error">{formErrors.cargo_arrival_date}</small>}
            </div>
          )}

          {/* Operation Finishes At */}
          {operationFinishesAtField?.visible && (
            <div>
              <label className="block mb-1">{t('new_service_order:operation_finishes_at')}</label>
              <Controller
                control={control}
                name="operation_finishes_at"
                defaultValue={operationFinishesAtField?.default_value}
                render={({ field }) => (
                  <Calendar className="w-full" value={field.value as Date | undefined} onChange={(e: { value?: Date | Date[] | null }) => field.onChange(e?.value ?? null)} />
                )}
              />
              {formErrors.operation_finishes_at && <small className="p-error">{formErrors.operation_finishes_at}</small>}
            </div>
          )}

          {/* Operation Finish Date */}
          {operationFinishDateField?.visible && (
            <div>
              <label className="block mb-1">{t('new_service_order:operation_finish_date')}</label>
              <Controller
                control={control}
                name="operation_finish_date"
                defaultValue={operationFinishDateField?.default_value}
                render={({ field }) => (
                  <Calendar className="w-full" value={field.value as Date | undefined} onChange={(e: { value?: Date | Date[] | null }) => field.onChange(e?.value ?? null)} />
                )}
              />
              {formErrors.operation_finish_date && <small className="p-error">{formErrors.operation_finish_date}</small>}
            </div>
          )}

          {/* First Site */}
          {firstSiteIdField?.visible && (
            <div>
              <label className="block mb-1">{t('new_service_order:inspection_site_1')}</label>
              <Controller
                control={control}
                name="first_site_id"
                defaultValue={firstSiteIdField?.default_value}
                render={({ field }) => (
                  <AutoComplete
                    value={getAutoCompleteValue(firstSiteSuggestions, field.value)}
                    suggestions={firstSiteSuggestions}
                    field="name"
                    completeMethod={onFirstSiteComplete}
                    onChange={(e: { value: unknown }) => {
                      const value = e.value;
                      if (value && typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
                        const id = (value as Record<string, unknown>).id as string;
                        field.onChange(id);
                        setValue('first_site', value as Site);
                        qc.setQueryData(['site', id], value as Site);
                      } else {
                        field.onChange(String(value ?? '') || null);
                        setValue('first_site', undefined);
                      }
                    }}
                    dropdown
                    className="w-full"
                  />
                )}
              />
              {formErrors.first_site_id && <small className="p-error">{formErrors.first_site_id}</small>}
            </div>
          )}

          {/* Second Site */}
          {secondSiteIdField?.visible && (
            <div>
              <label className="block mb-1">{t('new_service_order:inspection_site_2')}</label>
              <Controller
                control={control}
                name="second_site_id"
                defaultValue={secondSiteIdField?.default_value}
                render={({ field }) => (
                  <AutoComplete
                    value={getAutoCompleteValue(secondSiteSuggestions, field.value)}
                    suggestions={secondSiteSuggestions}
                    field="name"
                    completeMethod={onSecondSiteComplete}
                    onChange={(e: { value: unknown }) => {
                      const value = e.value;
                      if (value && typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
                        const id = (value as Record<string, unknown>).id as string;
                        field.onChange(id);
                        setValue('second_site', value as Site);
                        qc.setQueryData(['site', id], value as Site);
                      } else {
                        field.onChange(String(value ?? '') || null);
                        setValue('second_site', undefined);
                      }
                    }}
                    dropdown
                    className="w-full"
                  />
                )}
              />
              {formErrors.second_site_id && <small className="p-error">{formErrors.second_site_id}</small>}
            </div>
          )}

          {/* Third Site */}
          {thirdSiteIdField?.visible && (
            <div>
              <label className="block mb-1">{t('new_service_order:inspection_site_3')}</label>
              <Controller
                control={control}
                name="third_site_id"
                defaultValue={thirdSiteIdField?.default_value}
                render={({ field }) => (
                  <AutoComplete
                    value={getAutoCompleteValue(thirdSiteSuggestions, field.value)}
                    suggestions={thirdSiteSuggestions}
                    field="name"
                    completeMethod={onThirdSiteComplete}
                    onChange={(e: { value: unknown }) => {
                      const value = e.value;
                      if (value && typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
                        const id = (value as Record<string, unknown>).id as string;
                        field.onChange(id);
                        setValue('third_site', value as Site);
                        qc.setQueryData(['site', id], value as Site);
                      } else {
                        field.onChange(String(value ?? '') || null);
                        setValue('third_site', undefined);
                      }
                    }}
                    dropdown
                    className="w-full"
                  />
                )}
              />
              {formErrors.third_site_id && <small className="p-error">{formErrors.third_site_id}</small>}
            </div>
          )}

          {/* Stuffing Site */}
          {stuffingSiteIdField?.visible && (
            <div>
              <label className="block mb-1">{t('new_service_order:inspection_stuffing_site')}</label>
              <Controller
                control={control}
                name="stuffing_site_id"
                defaultValue={stuffingSiteIdField?.default_value}
                render={({ field }) => (
                  <AutoComplete
                    value={getAutoCompleteValue(stuffingSiteSuggestions, field.value)}
                    suggestions={stuffingSiteSuggestions}
                    field="name"
                    completeMethod={onStuffingSiteComplete}
                    onChange={(e: { value: unknown }) => {
                      const value = e.value;
                      if (value && typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
                        const id = (value as Record<string, unknown>).id as string;
                        field.onChange(id);
                        setValue('stuffing_site', value as Site);
                        qc.setQueryData(['site', id], value as Site);
                      } else {
                        field.onChange(String(value ?? '') || null);
                        setValue('stuffing_site', undefined);
                      }
                    }}
                    dropdown
                    className="w-full"
                  />
                )}
              />
              {formErrors.stuffing_site_id && <small className="p-error">{formErrors.stuffing_site_id}</small>}
            </div>
          )}

          {/* Departure Site */}
          {departureSiteIdField?.visible && (
            <div>
              <label className="block mb-1">{t('new_service_order:departure_site')}</label>
              <Controller
                control={control}
                name="departure_site_id"
                defaultValue={departureSiteIdField?.default_value}
                render={({ field }) => (
                  <AutoComplete
                    value={getAutoCompleteValue(departureSiteSuggestions, field.value)}
                    suggestions={departureSiteSuggestions}
                    field="name"
                    completeMethod={onDepartureSiteComplete}
                    onChange={(e: { value: unknown }) => {
                      const value = e.value;
                      if (value && typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
                        const id = (value as Record<string, unknown>).id as string;
                        field.onChange(id);
                        setValue('departure_site', value as Site);
                        qc.setQueryData(['site', id], value as Site);
                      } else {
                        field.onChange(String(value ?? '') || null);
                        setValue('departure_site', undefined);
                      }
                    }}
                    dropdown
                    className="w-full"
                  />
                )}
              />
              {formErrors.departure_site_id && <small className="p-error">{formErrors.departure_site_id}</small>}
            </div>
          )}

          {/* Destination */}
          {destinationField?.visible && (
            <div>
              <label className="block mb-1">{t('new_service_order:destination')}</label>
              <Controller
                control={control}
                name="destination"
                defaultValue={destinationField?.default_value}
                render={({ field }) => (
                  <InputText className="w-full" value={(field.value as string) ?? ''} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
                )}
              />
              {formErrors.destination && <small className="p-error">{formErrors.destination}</small>}
            </div>
          )}

        </div>
      </div>
    </Card>
  );
}
