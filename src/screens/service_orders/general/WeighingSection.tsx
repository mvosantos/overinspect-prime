import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { AutoComplete } from 'primereact/autocomplete';
import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';
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

type Props = { control?: Control<Record<string, unknown>> };

export default function WeighingSection({ control }: Props) {
  const qc = useQueryClient();

  const [weightTypeSuggestions, setWeightTypeSuggestions] = useState<WeightType[]>([]);
  const [samplingTypeSuggestions, setSamplingTypeSuggestions] = useState<SamplingType[]>([]);
  const [weighingRuleSuggestions, setWeighingRuleSuggestions] = useState<WeighingRule[]>([]);
  const [measureSuggestions, setMeasureSuggestions] = useState<Measure[]>([]);

  const [weightTypeCache, setWeightTypeCache] = useState<Record<string, WeightType>>({});
  const [samplingTypeCache, setSamplingTypeCache] = useState<Record<string, SamplingType>>({});
  const [weighingRuleCache, setWeighingRuleCache] = useState<Record<string, WeighingRule>>({});
  const [measureCache, setMeasureCache] = useState<Record<string, Measure>>({});

  const createComplete = <T extends { id?: string }>(service: {
    list: <P extends Record<string, unknown> = Record<string, unknown>>(params?: P) => Promise<import('../../../models/apiTypes').ApiPaginatedResponse<T>>;
  }, setSuggestions: (s: T[]) => void, cacheKey: string) =>
    async (e: { query: string }) => {
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

  return (
    <Card>
      <div className="mb-4 text-center">
        <div className="inline-block w-full px-4 py-1 border border-teal-100 rounded-md bg-teal-50">
          <h3 className="text-lg font-semibold text-teal-700">Dados referente à Pesagem e Amostragem</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

        <div>
          <label className="block mb-1">Tipo de peso</label>
          <Controller
            control={control}
            name="weight_type_id"
            render={({ field }) => (
              <AutoComplete
                value={resolveAutoCompleteValue<WeightType>(weightTypeSuggestions, weightTypeCache, field.value) as WeightType | undefined}
                suggestions={weightTypeSuggestions}
                field="name"
                completeMethod={createComplete<WeightType>(weightTypeService, setWeightTypeSuggestions, 'weightType')}
                onChange={makeAutoCompleteOnChange<WeightType>({ setCache: (updater) => setWeightTypeCache((prev) => updater(prev)), cacheKey: 'weightType', qc })(field.onChange)}
                dropdown
                className="w-full"
              />
            )}
          />
        </div>

        <div>
          <label className="block mb-1">Tipo de amostragem</label>
          <Controller
            control={control}
            name="sampling_type_id"
            render={({ field }) => (
              <AutoComplete
                value={resolveAutoCompleteValue<SamplingType>(samplingTypeSuggestions, samplingTypeCache, field.value) as SamplingType | undefined}
                suggestions={samplingTypeSuggestions}
                field="name"
                completeMethod={createComplete<SamplingType>(samplingTypeService, setSamplingTypeSuggestions, 'samplingType')}
                onChange={makeAutoCompleteOnChange<SamplingType>({ setCache: (updater) => setSamplingTypeCache((prev) => updater(prev)), cacheKey: 'samplingType', qc })(field.onChange)}
                dropdown
                className="w-full"
              />
            )}
          />
        </div>

        <div>
          <label className="block mb-1">Regra de pesagem</label>
          <Controller
            control={control}
            name="weighing_rule_id"
            render={({ field }) => (
              <AutoComplete
                value={resolveAutoCompleteValue<WeighingRule>(weighingRuleSuggestions, weighingRuleCache, field.value) as WeighingRule | undefined}
                suggestions={weighingRuleSuggestions}
                field="name"
                completeMethod={createComplete<WeighingRule>(weighingRuleService, setWeighingRuleSuggestions, 'weighingRule')}
                onChange={makeAutoCompleteOnChange<WeighingRule>({ setCache: (updater) => setWeighingRuleCache((prev) => updater(prev)), cacheKey: 'weighingRule', qc })(field.onChange)}
                dropdown
                className="w-full"
              />
            )}
          />
        </div>

        <div>
          <label className="block mb-1">Unidade métrica da invoice</label>
          <Controller
            control={control}
            name="invoice_metric_unit_id"
            render={({ field }) => (
              <AutoComplete
                value={resolveAutoCompleteValue<Measure>(measureSuggestions, measureCache, field.value) as Measure | undefined}
                suggestions={measureSuggestions}
                field="name"
                completeMethod={createComplete<Measure>(measureService, setMeasureSuggestions, 'measure')}
                onChange={makeAutoCompleteOnChange<Measure>({ setCache: (updater) => setMeasureCache((prev) => updater(prev)), cacheKey: 'measure', qc })(field.onChange)}
                dropdown
                className="w-full"
              />
            )}
          />
        </div>

        <div>
          <label className="block mb-1">Peso bruto</label>
          <Controller control={control} name="gross_weight" render={({ field }) => <InputText className="w-full" value={(field.value as string) ?? ''} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />} />
        </div>

        <div>
          <label className="block mb-1">Peso líquido</label>
          <Controller control={control} name="net_weight" render={({ field }) => <InputText className="w-full" value={(field.value as string) ?? ''} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />} />
        </div>

        <div>
          <label className="block mb-1">Unidade métrica do desembarque</label>
          <Controller
            control={control}
            name="landing_metric_unit_id"
            render={({ field }) => (
              <AutoComplete
                value={resolveAutoCompleteValue<Measure>(measureSuggestions, measureCache, field.value) as Measure | undefined}
                suggestions={measureSuggestions}
                field="name"
                completeMethod={createComplete<Measure>(measureService, setMeasureSuggestions, 'measure')}
                onChange={makeAutoCompleteOnChange<Measure>({ setCache: (updater) => setMeasureCache((prev) => updater(prev)), cacheKey: 'measure', qc })(field.onChange)}
                dropdown
                className="w-full"
              />
            )}
          />
        </div>

      </div>
    </Card>
  );
}
