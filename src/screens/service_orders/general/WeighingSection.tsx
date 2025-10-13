import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { AutoComplete } from 'primereact/autocomplete';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { Control, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import type { ServiceOrderSubmission } from '../../../models/serviceOrder';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { normalizeListResponse } from '../../../utils/apiHelpers';
import { makeAutoCompleteOnChange, resolveAutoCompleteValue } from '../../../utils/formHelpers';
import weightTypeService from '../../../services/weightTypeService';
import samplingTypeService from '../../../services/samplingTypeService';
import weighingRuleService from '../../../services/weighingRuleService';
import measureService from '../../../services/measureService';
import type { WeightType } from '../../../models/WeightType';
import type { SamplingType } from '../../../models/SamplingType';
import type { WeighingRule } from '../../../models/WeighingRule';
import type { Measure } from '../../../models/Measure';
import { useTranslation } from 'react-i18next';
import type { ApiPaginatedResponse } from '../../../models/apiTypes';

type FieldMeta = { name: string; visible?: boolean; required?: boolean; default_value?: unknown };
type Props = {
  control?: Control<ServiceOrderSubmission>;
  setValue?: UseFormSetValue<ServiceOrderSubmission>;
  getValues?: UseFormGetValues<ServiceOrderSubmission>;
  selectedServiceTypeId?: string | null;
  serviceTypeFields?: FieldMeta[] | undefined;
  formErrors?: Record<string, string | undefined>;
};

export default function WeighingSection(props?: Props) {
  const ctx = useFormContext<ServiceOrderSubmission>();
  const control = props?.control ?? ctx.control;
  // call useWatch unconditionally to preserve hook order; consumers may pass selectedServiceTypeId
  useWatch({ control, name: 'service_type_id' });
  const serviceTypeFieldsLocal = props?.serviceTypeFields ?? [];
  const formErrors = props?.formErrors ?? {};
  const byNameLocal: Record<string, FieldMeta | undefined> = {};
  (serviceTypeFieldsLocal || []).forEach((f) => { if (f && typeof f === 'object' && 'name' in f) byNameLocal[f.name] = f; });

  const WEIGHING_FIELD_NAMES: Record<string, string> = {
    weightTypeField: 'weight_type_id',
    samplingTypeIdField: 'sampling_type_id',
    weighingRuleField: 'weighing_rule_id',
    invoiceMetricUnitField: 'invoice_metric_unit_id',
    grossVolumeInvoiceField: 'gross_volume_invoice',
    netVolumeInvoiceField: 'net_volume_invoice',
    tareVolumeInvoiceField: 'tare_volume_invoice',
    landingMetricUnitField: 'landing_metric_unit_id',
    grossVolumeLandedField: 'gross_volume_landed',
    netVolumeLandedField: 'net_volume_landed',
    tareVolumeLandedField: 'tare_volume_landed',
  };

  const fieldConfigs = Object.fromEntries(Object.entries(WEIGHING_FIELD_NAMES).map(([k, svcName]) => [k, byNameLocal[svcName]])) as Record<string, FieldMeta | undefined>;
  const { t } = useTranslation(['new_service_order', 'service_orders']);
  const qc = useQueryClient();

  const [weightTypeSuggestions, setWeightTypeSuggestions] = useState<WeightType[]>([]);
  const [samplingTypeSuggestions, setSamplingTypeSuggestions] = useState<SamplingType[]>([]);
  const [weighingRuleSuggestions, setWeighingRuleSuggestions] = useState<WeighingRule[]>([]);
  const [measureSuggestions, setMeasureSuggestions] = useState<Measure[]>([]);

  const [weightTypeCache, setWeightTypeCache] = useState<Record<string, WeightType>>({});
  const [samplingTypeCache, setSamplingTypeCache] = useState<Record<string, SamplingType>>({});
  const [weighingRuleCache, setWeighingRuleCache] = useState<Record<string, WeighingRule>>({});
  const [measureCache, setMeasureCache] = useState<Record<string, Measure>>({});

  const createComplete = function <T extends { id?: string }>(service: {
    list: <P extends Record<string, unknown> = Record<string, unknown>>(params?: P) => Promise<ApiPaginatedResponse<T>>;
  }, setSuggestions: (s: T[]) => void, cacheKey: string) {
    return async (e: { query: string }) => {
      const q = e.query;
      try {
        const res = await (service.list as (p?: unknown) => Promise<unknown>)({ per_page: 20, filters: { name: q } });
        const items = normalizeListResponse<T>(res);
        setSuggestions(items ?? []);
        (items ?? []).forEach((it) => { if (it?.id) qc.setQueryData([cacheKey, it.id], it); });
      } catch {
        setSuggestions([]);
      }
    };
  };
  // destructure expected field config keys for this section
  const {
    weightTypeField,
    samplingTypeIdField,
    weighingRuleField,
    invoiceMetricUnitField,
    grossVolumeInvoiceField,
    netVolumeInvoiceField,
    tareVolumeInvoiceField,
    landingMetricUnitField,
    grossVolumeLandedField,
    netVolumeLandedField,
    tareVolumeLandedField,
  } = fieldConfigs as Record<string, FieldMeta | undefined>;

  const hasVisibleFields =
    weightTypeField?.visible ||
    samplingTypeIdField?.visible ||
    weighingRuleField?.visible ||
    invoiceMetricUnitField?.visible ||
    grossVolumeInvoiceField?.visible ||
    netVolumeInvoiceField?.visible ||
    tareVolumeInvoiceField?.visible ||
    landingMetricUnitField?.visible;

  // include landed fields in overall visibility
  const hasLanded = grossVolumeLandedField?.visible || netVolumeLandedField?.visible || tareVolumeLandedField?.visible;

  const overallHasVisible = hasVisibleFields || hasLanded;

  if (!overallHasVisible) return null;

  return (
    <Card>
      <div className="mb-4 text-center">
        <div className="inline-block w-full px-4 py-1 border border-teal-100 rounded-md bg-teal-50">
          <h3 className="text-lg font-semibold text-teal-700">{t('service_orders:weighing_sampling_details').toUpperCase()}</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

        {weightTypeField?.visible && (
          <div>
            <label className="block mb-1">{t('new_service_order:weight_type')}{weightTypeField?.required ? ' *' : ''}</label>
            <Controller
              control={control}
              name="weight_type_id"
              defaultValue={weightTypeField?.default_value}
              render={({ field }) => (
                <AutoComplete
                  value={resolveAutoCompleteValue<WeightType>(weightTypeSuggestions, weightTypeCache, field.value, qc, 'weightType') as WeightType | undefined}
                  suggestions={weightTypeSuggestions}
                  field="name"
                  completeMethod={createComplete<WeightType>(weightTypeService, setWeightTypeSuggestions, 'weightType')}
                  onChange={makeAutoCompleteOnChange<WeightType>({ setCache: (updater) => setWeightTypeCache((prev) => updater(prev)), cacheKey: 'weightType', qc })(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {formErrors?.weight_type_id && <small className="p-error">{formErrors.weight_type_id}</small>}
          </div>
        )}

        {samplingTypeIdField?.visible && (
          <div>
            <label className="block mb-1">{t('new_service_order:sampling_type')}{samplingTypeIdField?.required ? ' *' : ''}</label>
            <Controller
              control={control}
              name="sampling_type_id"
              defaultValue={samplingTypeIdField?.default_value}
              render={({ field }) => (
                <AutoComplete
                  value={resolveAutoCompleteValue<SamplingType>(samplingTypeSuggestions, samplingTypeCache, field.value, qc, 'samplingType') as SamplingType | undefined}
                  suggestions={samplingTypeSuggestions}
                  field="name"
                  completeMethod={createComplete<SamplingType>(samplingTypeService, setSamplingTypeSuggestions, 'samplingType')}
                  onChange={makeAutoCompleteOnChange<SamplingType>({ setCache: (updater) => setSamplingTypeCache((prev) => updater(prev)), cacheKey: 'samplingType', qc })(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {formErrors?.sampling_type_id && <small className="p-error">{formErrors.sampling_type_id}</small>}
          </div>
        )}

        {weighingRuleField?.visible && (
          <div>
            <label className="block mb-1">{t('new_service_order:weighing_rule')}{weighingRuleField?.required ? ' *' : ''}</label>
            <Controller
              control={control}
              name="weighing_rule_id"
              defaultValue={weighingRuleField?.default_value}
              render={({ field }) => (
                <AutoComplete
                  value={resolveAutoCompleteValue<WeighingRule>(weighingRuleSuggestions, weighingRuleCache, field.value, qc, 'weighingRule') as WeighingRule | undefined}
                  suggestions={weighingRuleSuggestions}
                  field="name"
                  completeMethod={createComplete<WeighingRule>(weighingRuleService, setWeighingRuleSuggestions, 'weighingRule')}
                  onChange={makeAutoCompleteOnChange<WeighingRule>({ setCache: (updater) => setWeighingRuleCache((prev) => updater(prev)), cacheKey: 'weighingRule', qc })(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {formErrors?.weighing_rule_id && <small className="p-error">{formErrors.weighing_rule_id}</small>}
          </div>
        )}

        {invoiceMetricUnitField?.visible && (
          <div>
            <label className="block mb-1">{t('new_service_order:invoice_measure')}{invoiceMetricUnitField?.required ? ' *' : ''}</label>
            <Controller
              control={control}
              name="invoice_metric_unit_id"
              defaultValue={invoiceMetricUnitField?.default_value}
              render={({ field }) => (
                <AutoComplete
                  value={resolveAutoCompleteValue<Measure>(measureSuggestions, measureCache, field.value, qc, 'measure') as Measure | undefined}
                  suggestions={measureSuggestions}
                  field="name"
                  completeMethod={createComplete<Measure>(measureService, setMeasureSuggestions, 'measure')}
                  onChange={makeAutoCompleteOnChange<Measure>({ setCache: (updater) => setMeasureCache((prev) => updater(prev)), cacheKey: 'measure', qc })(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {formErrors?.invoice_metric_unit_id && <small className="p-error">{formErrors.invoice_metric_unit_id}</small>}
          </div>
        )}

        {grossVolumeInvoiceField?.visible && (
          <div>
            <label className="block mb-1">{t('new_service_order:gross_volume_invoice')}{grossVolumeInvoiceField?.required ? ' *' : ''}</label>
            <Controller control={control} name="gross_volume_invoice" defaultValue={grossVolumeInvoiceField?.default_value} render={({ field }) => <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />} />
            {formErrors?.gross_volume_invoice && <small className="p-error">{formErrors.gross_volume_invoice}</small>}
          </div>
        )}

        {netVolumeInvoiceField?.visible && (
          <div>
            <label className="block mb-1">{t('new_service_order:net_volume_invoice')}{netVolumeInvoiceField?.required ? ' *' : ''}</label>
            <Controller control={control} name="net_volume_invoice" defaultValue={netVolumeInvoiceField?.default_value} render={({ field }) => <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />} />
            {formErrors?.net_volume_invoice && <small className="p-error">{formErrors.net_volume_invoice}</small>}
          </div>
        )}

        {landingMetricUnitField?.visible && (
          <div>
            <label className="block mb-1">{t('new_service_order:landing_measure')}{landingMetricUnitField?.required ? ' *' : ''}</label>
            <Controller
              control={control}
              name="landing_metric_unit_id"
              defaultValue={landingMetricUnitField?.default_value}
              render={({ field }) => (
                <AutoComplete
                  value={resolveAutoCompleteValue<Measure>(measureSuggestions, measureCache, field.value, qc, 'measure') as Measure | undefined}
                  suggestions={measureSuggestions}
                  field="name"
                  completeMethod={createComplete<Measure>(measureService, setMeasureSuggestions, 'measure')}
                  onChange={makeAutoCompleteOnChange<Measure>({ setCache: (updater) => setMeasureCache((prev) => updater(prev)), cacheKey: 'measure', qc })(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {formErrors?.landing_metric_unit_id && <small className="p-error">{formErrors.landing_metric_unit_id}</small>}
          </div>
        )}

        {grossVolumeLandedField?.visible && (
          <div>
            <label className="block mb-1">{t('new_service_order:gross_volume_landed')}{grossVolumeLandedField?.required ? ' *' : ''}</label>
            <Controller
              control={control}
              name="gross_volume_landed"
              defaultValue={grossVolumeLandedField?.default_value}
              render={({ field }) =>
                <InputText className="w-full"
                  value={String(field.value ?? '')}
                  onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />}
            />
            {formErrors?.gross_volume_landed && <small className="p-error">{formErrors.gross_volume_landed}</small>}
          </div>
        )}

        {netVolumeLandedField?.visible && (
          <div>
            <label className="block mb-1">{t('new_service_order:net_volume_landed')}{netVolumeLandedField?.required ? ' *' : ''}</label>
            <Controller control={control} name="net_volume_landed" defaultValue={netVolumeLandedField?.default_value} render={({ field }) => <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />} />
            {formErrors?.net_volume_landed && <small className="p-error">{formErrors.net_volume_landed}</small>}
          </div>
        )}

        {tareVolumeLandedField?.visible && (
          <div>
            <label className="block mb-1">{t('new_service_order:tare_volume_landed')}{tareVolumeLandedField?.required ? ' *' : ''}</label>
            <Controller control={control} name="tare_volume_landed" defaultValue={tareVolumeLandedField?.default_value} render={({ field }) => <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />} />
            {formErrors?.tare_volume_landed && <small className="p-error">{formErrors.tare_volume_landed}</small>}
          </div>
        )}

      </div>
    </Card>
  );
}
