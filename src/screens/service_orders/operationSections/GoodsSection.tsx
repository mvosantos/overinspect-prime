/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ApiPaginatedResponse } from '../../../models/apiTypes';
import type { GoodOperation } from '../../../models/service_order/goods/GoodOperation';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { AutoComplete } from 'primereact/autocomplete';
import { Toast } from 'primereact/toast';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import operationGoodService from '../../../services/operationGoodService';
import siteService from '../../../services/siteService';
import vesselTypeService from '../../../services/vesselTypeService';
import weatherService from '../../../services/weatherService';
import AttachmentsSection from '../../../components/AttachmentsSection';
import { createAutocompleteComplete } from '../../../utils/autocompleteHelpers';
import { makeAutoCompleteOnChange, resolveAutoCompleteValue, seedCachedObject, resolveFieldName, resolveFieldDefault } from '../../../utils/formHelpers';

type Props = {
  currentOrderId?: string | null;
  selectedServiceTypeId?: string | null;
  fieldConfigs?: Record<string, { name: string; visible?: boolean; required?: boolean; default_value?: unknown } | undefined>;
};

const ItemSchema = z.object({
  id: z.string().optional(),
  // allow many fields as flexible front-end values
  vessel_type_id: z.any().optional(),
  loading_port_id: z.any().optional(),
  loading_facility_id: z.any().optional(),
  discharge_port_id: z.any().optional(),
  discharge_facility_id: z.any().optional(),
  weather_id: z.any().optional(),
  vessel_name: z.any().optional(),
  imo_number: z.any().optional(),
  call_sign: z.any().optional(),
  mmsi_number: z.any().optional(),
  port_of_registry: z.any().optional(),
  flag_state: z.any().optional(),
  loa: z.any().optional(),
  breadth: z.any().optional(),
  depth: z.any().optional(),
  gross_tonnage: z.any().optional(),
  net_tonnage: z.any().optional(),
  owner: z.any().optional(),
  sold_to: z.any().optional(),
  cargo: z.any().optional(),
  description: z.any().optional(),
  weight_for_transportation: z.any().optional(),
  dimension: z.any().optional(),
  date_of_loading: z.any().optional(),
  date_of_discharge: z.any().optional(),
  vessel_voyage: z.any().optional(),
  flat_racks_and_position_on_board: z.any().optional(),
  booking_bb: z.any().optional(),
  inspector_name: z.any().optional(),
  terminal_supervisor_name: z.any().optional(),
  vessel_arrived: z.any().optional(),
  vessel_berthed: z.any().optional(),
  operations_commenced: z.any().optional(),
  surveyor_at_terminal: z.any().optional(),
  surveyor_on_board: z.any().optional(),
  unlashing: z.any().optional(),
  lifting_1: z.any().optional(),
  lifting_2: z.any().optional(),
  lifting_3: z.any().optional(),
  lifting_4: z.any().optional(),
  lifting_5: z.any().optional(),
  discharge_completed: z.any().optional(),
  final_inspection: z.any().optional(),
  surveyor_left_terminal: z.any().optional(),
  // attachments and status
  attachments: z.array(z.any()).optional().default([]),
  service_order_status: z.any().optional(),
});
// derive submitting state directly from react-query mutation internals
// consider both `state === 'loading'` and `fetchStatus === 'fetching'` to
// capture transient fetch phases reliably.
function mutationIsLoading(m: unknown) {
  try {
    const mm = m as Record<string, unknown>;
    const state = typeof mm.state === 'string' ? String(mm.state) : undefined;
    const fetchStatus = typeof mm.fetchStatus === 'string' ? String(mm.fetchStatus) : undefined;
    const status = typeof mm.status === 'string' ? String(mm.status) : undefined;
    return state === 'loading' || fetchStatus === 'fetching' || status === 'loading';
  } catch {
    return false;
  }
}

export default function GoodsSection({ currentOrderId, fieldConfigs }: Props) {
  const qc = useQueryClient();
  const toast = useRef<Toast | null>(null);
  const { t } = useTranslation(['new_service_order', 'service_orders']);

  const parentForm = useFormContext();
  const parentStatus = (parentForm && typeof parentForm.getValues === 'function') ? (parentForm.getValues('service_order_status') as Record<string, unknown> | undefined) : undefined;
  const parentEnableEditing = parentStatus ? Boolean(parentStatus?.enable_editing ?? true) : true;

  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);
  const storageKey = (() => `goods_section:active_indexes:${currentOrderId ?? 'global'}`)();
  const [activeIndexes, setActiveIndexesState] = useState<number[] | number | null>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed ?? null;
    } catch {
      return null;
    }
  });
  const setActiveIndexes = useCallback((v: number[] | number | null) => {
    try {
      if (v == null) sessionStorage.removeItem(storageKey);
      else sessionStorage.setItem(storageKey, JSON.stringify(v));
    } catch {
      // ignore
    }
    setActiveIndexesState(v);
  }, [storageKey]);

  // debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(id);
  }, [search]);

  const queryKey = useMemo(() => ['operation-goods', currentOrderId, page, perPage, debouncedSearch], [currentOrderId, page, perPage, debouncedSearch]);

  const { data, refetch } = useQuery<ApiPaginatedResponse<GoodOperation>, Error>({
    queryKey,
    queryFn: () => operationGoodService.list({ page, per_page: perPage, filters: { service_order_id: currentOrderId ?? undefined, vessel_name: debouncedSearch } as any } as any),
    enabled: Boolean(currentOrderId),
  });

  const createMutation = useMutation<GoodOperation, Error, any>({ mutationFn: (payload: any) => operationGoodService.create(payload), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['operation-goods', currentOrderId] } as any); void refetch(); } });
  const updateMutation = useMutation<GoodOperation, Error, { id: string; payload: any }>({ mutationFn: ({ id, payload }) => operationGoodService.update(id, payload), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['operation-goods', currentOrderId] } as any); void refetch(); } });
  const deleteMutation = useMutation<void, Error, string>({ mutationFn: (id: string) => operationGoodService.remove(id), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['operation-goods', currentOrderId] } as any); void refetch(); } });

  // items and total derived from query (memoized so hooks depending on items are stable)
  const items = useMemo(() => ((data && Array.isArray((data as any).data)) ? (data as any).data : []), [data]);
  const total = useMemo(() => ((data && typeof (data as any).total === 'number') ? (data as any).total : 0), [data]);

  // destructure expected field config keys for this section
  const goodsVesselLoadingPortField = fieldConfigs ? fieldConfigs['goods_vessel_loading_port_id'] : undefined;
  const goodsVesselDischargePortField = fieldConfigs ? fieldConfigs['goods_vessel_discharge_port_id'] : undefined;
  const goodsVesselNameField = fieldConfigs ? fieldConfigs['goods_vessel_name'] : undefined;
  const goodsWeightField = fieldConfigs ? fieldConfigs['goods_weight_for_transportation'] : undefined;
  const goodsVesselTypeField = fieldConfigs ? fieldConfigs['goods_vessel_type_id'] : undefined;
  const goodsLoadingFacilityField = fieldConfigs ? fieldConfigs['goods_loading_facility_id'] : undefined;
  const goodsDischargeFacilityField = fieldConfigs ? fieldConfigs['goods_discharge_facility_id'] : undefined;
  const goodsWeatherField = fieldConfigs ? fieldConfigs['goods_weather_id'] : undefined;
  // other configurable fields (text/date/etc)
  const goodsImoNumberField = fieldConfigs ? fieldConfigs['goods_imo_number'] : undefined;
  const goodsCallSignField = fieldConfigs ? fieldConfigs['goods_call_sign'] : undefined;
  const goodsMmsiNumberField = fieldConfigs ? fieldConfigs['goods_mmsi_number'] : undefined;
  const goodsPortOfRegistryField = fieldConfigs ? fieldConfigs['goods_port_of_registry'] : undefined;
  const goodsFlagStateField = fieldConfigs ? fieldConfigs['goods_flag_state'] : undefined;
  const goodsLoaField = fieldConfigs ? fieldConfigs['goods_loa'] : undefined;
  const goodsBreadthField = fieldConfigs ? fieldConfigs['goods_breadth'] : undefined;
  const goodsDepthField = fieldConfigs ? fieldConfigs['goods_depth'] : undefined;
  const goodsGrossTonnageField = fieldConfigs ? fieldConfigs['goods_gross_tonnage'] : undefined;
  const goodsNetTonnageField = fieldConfigs ? fieldConfigs['goods_net_tonnage'] : undefined;
  const goodsOwnerField = fieldConfigs ? fieldConfigs['goods_owner'] : undefined;
  const goodsSoldToField = fieldConfigs ? fieldConfigs['goods_sold_to'] : undefined;
  const goodsCargoField = fieldConfigs ? fieldConfigs['goods_cargo'] : undefined;
  const goodsBookingBBField = fieldConfigs ? fieldConfigs['goods_booking_bb'] : undefined;
  const goodsInspectorNameField = fieldConfigs ? fieldConfigs['goods_inspector_name'] : undefined;
  const goodsTerminalSupervisorField = fieldConfigs ? fieldConfigs['goods_terminal_supervisor_name'] : undefined;
  const goodsVesselVoyageField = fieldConfigs ? fieldConfigs['goods_vessel_voyage'] : undefined;
  const goodsFlatRacksField = fieldConfigs ? fieldConfigs['goods_flat_racks_and_position_on_board'] : undefined;
  const goodsDimensionField = fieldConfigs ? fieldConfigs['goods_dimension'] : undefined;
  // date/time fields
  const goodsDateOfLoadingField = fieldConfigs ? fieldConfigs['goods_date_of_loading'] : undefined;
  const goodsDateOfDischargeField = fieldConfigs ? fieldConfigs['goods_date_of_discharge'] : undefined;
  const goodsVesselArrivedField = fieldConfigs ? fieldConfigs['goods_vessel_arrived'] : undefined;
  const goodsVesselBerthedField = fieldConfigs ? fieldConfigs['goods_vessel_berthed'] : undefined;
  const goodsOperationsCommencedField = fieldConfigs ? fieldConfigs['goods_operations_commenced'] : undefined;
  const goodsSurveyorAtTerminalField = fieldConfigs ? fieldConfigs['goods_surveyor_at_terminal'] : undefined;
  const goodsSurveyorOnBoardField = fieldConfigs ? fieldConfigs['goods_surveyor_on_board'] : undefined;
  const goodsUnlashingField = fieldConfigs ? fieldConfigs['goods_unlashing'] : undefined;
  const goodsLifting1Field = fieldConfigs ? fieldConfigs['goods_lifting_1'] : undefined;
  const goodsLifting2Field = fieldConfigs ? fieldConfigs['goods_lifting_2'] : undefined;
  const goodsLifting3Field = fieldConfigs ? fieldConfigs['goods_lifting_3'] : undefined;
  const goodsLifting4Field = fieldConfigs ? fieldConfigs['goods_lifting_4'] : undefined;
  const goodsLifting5Field = fieldConfigs ? fieldConfigs['goods_lifting_5'] : undefined;
  const goodsDischargeCompletedField = fieldConfigs ? fieldConfigs['goods_discharge_completed'] : undefined;
  const goodsFinalInspectionField = fieldConfigs ? fieldConfigs['goods_final_inspection'] : undefined;
  const goodsSurveyorLeftTerminalField = fieldConfigs ? fieldConfigs['goods_surveyor_left_terminal'] : undefined;

  // helper to open/close all (defined after items so it can reference them)
  const collapseAll = useCallback(() => setActiveIndexes(null), [setActiveIndexes]);
  const expandAll = useCallback(() => {
    const totalItems = items.length + (creatingNew ? 1 : 0);
    setActiveIndexes(Array.from({ length: totalItems }, (_, i) => i));
  }, [items, creatingNew]);

  // inner component for each item (existing or new)
  function GoodItemForm({ item, isNew }: { item?: any; isNew?: boolean }) {
  const loadingPortFieldName = resolveFieldName(goodsVesselLoadingPortField, 'loading_port_id');
  const dischargePortFieldName = resolveFieldName(goodsVesselDischargePortField, 'discharge_port_id');
  const vesselNameFieldName = resolveFieldName(goodsVesselNameField, 'vessel_name');
  const weightFieldName = resolveFieldName(goodsWeightField, 'weight_for_transportation');
  const vesselTypeFieldName = resolveFieldName(goodsVesselTypeField, 'vessel_type_id');
  const loadingFacilityFieldName = resolveFieldName(goodsLoadingFacilityField, 'loading_facility_id');
  const dischargeFacilityFieldName = resolveFieldName(goodsDischargeFacilityField, 'discharge_facility_id');
  const weatherFieldName = resolveFieldName(goodsWeatherField, 'weather_id');
  // text fields
  const imoNumberFieldName = resolveFieldName(goodsImoNumberField, 'imo_number');
  const callSignFieldName = resolveFieldName(goodsCallSignField, 'call_sign');
  const mmsiNumberFieldName = resolveFieldName(goodsMmsiNumberField, 'mmsi_number');
  const portOfRegistryFieldName = resolveFieldName(goodsPortOfRegistryField, 'port_of_registry');
  const flagStateFieldName = resolveFieldName(goodsFlagStateField, 'flag_state');
  const loaFieldName = resolveFieldName(goodsLoaField, 'loa');
  const breadthFieldName = resolveFieldName(goodsBreadthField, 'breadth');
  const depthFieldName = resolveFieldName(goodsDepthField, 'depth');
  const grossTonnageFieldName = resolveFieldName(goodsGrossTonnageField, 'gross_tonnage');
  const netTonnageFieldName = resolveFieldName(goodsNetTonnageField, 'net_tonnage');
  const ownerFieldName = resolveFieldName(goodsOwnerField, 'owner');
  const soldToFieldName = resolveFieldName(goodsSoldToField, 'sold_to');
  const cargoFieldName = resolveFieldName(goodsCargoField, 'cargo');
  const bookingBBFieldName = resolveFieldName(goodsBookingBBField, 'booking_bb');
  const inspectorNameFieldName = resolveFieldName(goodsInspectorNameField, 'inspector_name');
  const terminalSupervisorFieldName = resolveFieldName(goodsTerminalSupervisorField, 'terminal_supervisor_name');
  const vesselVoyageFieldName = resolveFieldName(goodsVesselVoyageField, 'vessel_voyage');
  const flatRacksFieldName = resolveFieldName(goodsFlatRacksField, 'flat_racks_and_position_on_board');
  const dimensionFieldName = resolveFieldName(goodsDimensionField, 'dimension');
  // date/time fields
  const dateOfLoadingFieldName = resolveFieldName(goodsDateOfLoadingField, 'date_of_loading');
  const dateOfDischargeFieldName = resolveFieldName(goodsDateOfDischargeField, 'date_of_discharge');
  const vesselArrivedFieldName = resolveFieldName(goodsVesselArrivedField, 'vessel_arrived');
  const vesselBerthedFieldName = resolveFieldName(goodsVesselBerthedField, 'vessel_berthed');
  const operationsCommencedFieldName = resolveFieldName(goodsOperationsCommencedField, 'operations_commenced');
  const surveyorAtTerminalFieldName = resolveFieldName(goodsSurveyorAtTerminalField, 'surveyor_at_terminal');
  const surveyorOnBoardFieldName = resolveFieldName(goodsSurveyorOnBoardField, 'surveyor_on_board');
  const unlashingFieldName = resolveFieldName(goodsUnlashingField, 'unlashing');
  const lifting1FieldName = resolveFieldName(goodsLifting1Field, 'lifting_1');
  const lifting2FieldName = resolveFieldName(goodsLifting2Field, 'lifting_2');
  const lifting3FieldName = resolveFieldName(goodsLifting3Field, 'lifting_3');
  const lifting4FieldName = resolveFieldName(goodsLifting4Field, 'lifting_4');
  const lifting5FieldName = resolveFieldName(goodsLifting5Field, 'lifting_5');
  const dischargeCompletedFieldName = resolveFieldName(goodsDischargeCompletedField, 'discharge_completed');
  const finalInspectionFieldName = resolveFieldName(goodsFinalInspectionField, 'final_inspection');
  const surveyorLeftTerminalFieldName = resolveFieldName(goodsSurveyorLeftTerminalField, 'surveyor_left_terminal');

  const defaultVals: any = { ...(item ?? {}), attachments: (item && Array.isArray(item.attachments)) ? item.attachments : [] };
  // ensure the named fields are populated: prefer existing item value, then field default_value, then null
  defaultVals[loadingPortFieldName] = resolveFieldDefault(goodsVesselLoadingPortField, item?.loading_port_id);
  defaultVals[dischargePortFieldName] = resolveFieldDefault(goodsVesselDischargePortField, item?.discharge_port_id);
  defaultVals[vesselNameFieldName] = resolveFieldDefault(goodsVesselNameField, item?.vessel_name);
  defaultVals[weightFieldName] = resolveFieldDefault(goodsWeightField, item?.weight_for_transportation);
  defaultVals[vesselTypeFieldName] = resolveFieldDefault(goodsVesselTypeField, item?.vessel_type_id);
  defaultVals[loadingFacilityFieldName] = resolveFieldDefault(goodsLoadingFacilityField, item?.loading_facility_id);
  defaultVals[dischargeFacilityFieldName] = resolveFieldDefault(goodsDischargeFacilityField, item?.discharge_facility_id);
  defaultVals[weatherFieldName] = resolveFieldDefault(goodsWeatherField, item?.weather_id);
  // text defaults
  defaultVals[imoNumberFieldName] = resolveFieldDefault(goodsImoNumberField, item?.imo_number);
  defaultVals[callSignFieldName] = resolveFieldDefault(goodsCallSignField, item?.call_sign);
  defaultVals[mmsiNumberFieldName] = resolveFieldDefault(goodsMmsiNumberField, item?.mmsi_number);
  defaultVals[portOfRegistryFieldName] = resolveFieldDefault(goodsPortOfRegistryField, item?.port_of_registry);
  defaultVals[flagStateFieldName] = resolveFieldDefault(goodsFlagStateField, item?.flag_state);
  defaultVals[loaFieldName] = resolveFieldDefault(goodsLoaField, item?.loa);
  defaultVals[breadthFieldName] = resolveFieldDefault(goodsBreadthField, item?.breadth);
  defaultVals[depthFieldName] = resolveFieldDefault(goodsDepthField, item?.depth);
  defaultVals[grossTonnageFieldName] = resolveFieldDefault(goodsGrossTonnageField, item?.gross_tonnage);
  defaultVals[netTonnageFieldName] = resolveFieldDefault(goodsNetTonnageField, item?.net_tonnage);
  defaultVals[ownerFieldName] = resolveFieldDefault(goodsOwnerField, item?.owner);
  defaultVals[soldToFieldName] = resolveFieldDefault(goodsSoldToField, item?.sold_to);
  defaultVals[cargoFieldName] = resolveFieldDefault(goodsCargoField, item?.cargo);
  defaultVals[bookingBBFieldName] = resolveFieldDefault(goodsBookingBBField, item?.booking_bb);
  defaultVals[inspectorNameFieldName] = resolveFieldDefault(goodsInspectorNameField, item?.inspector_name);
  defaultVals[terminalSupervisorFieldName] = resolveFieldDefault(goodsTerminalSupervisorField, item?.terminal_supervisor_name);
  defaultVals[vesselVoyageFieldName] = resolveFieldDefault(goodsVesselVoyageField, item?.vessel_voyage);
  defaultVals[flatRacksFieldName] = resolveFieldDefault(goodsFlatRacksField, item?.flat_racks_and_position_on_board);
  defaultVals[dimensionFieldName] = resolveFieldDefault(goodsDimensionField, item?.dimension);
  // date defaults
  defaultVals[dateOfLoadingFieldName] = resolveFieldDefault(goodsDateOfLoadingField, item?.date_of_loading);
  defaultVals[dateOfDischargeFieldName] = resolveFieldDefault(goodsDateOfDischargeField, item?.date_of_discharge);
  defaultVals[vesselArrivedFieldName] = resolveFieldDefault(goodsVesselArrivedField, item?.vessel_arrived);
  defaultVals[vesselBerthedFieldName] = resolveFieldDefault(goodsVesselBerthedField, item?.vessel_berthed);
  defaultVals[operationsCommencedFieldName] = resolveFieldDefault(goodsOperationsCommencedField, item?.operations_commenced);
  defaultVals[surveyorAtTerminalFieldName] = resolveFieldDefault(goodsSurveyorAtTerminalField, item?.surveyor_at_terminal);
  defaultVals[surveyorOnBoardFieldName] = resolveFieldDefault(goodsSurveyorOnBoardField, item?.surveyor_on_board);
  defaultVals[unlashingFieldName] = resolveFieldDefault(goodsUnlashingField, item?.unlashing);
  defaultVals[lifting1FieldName] = resolveFieldDefault(goodsLifting1Field, item?.lifting_1);
  defaultVals[lifting2FieldName] = resolveFieldDefault(goodsLifting2Field, item?.lifting_2);
  defaultVals[lifting3FieldName] = resolveFieldDefault(goodsLifting3Field, item?.lifting_3);
  defaultVals[lifting4FieldName] = resolveFieldDefault(goodsLifting4Field, item?.lifting_4);
  defaultVals[lifting5FieldName] = resolveFieldDefault(goodsLifting5Field, item?.lifting_5);
  defaultVals[dischargeCompletedFieldName] = resolveFieldDefault(goodsDischargeCompletedField, item?.discharge_completed);
  defaultVals[finalInspectionFieldName] = resolveFieldDefault(goodsFinalInspectionField, item?.final_inspection);
  defaultVals[surveyorLeftTerminalFieldName] = resolveFieldDefault(goodsSurveyorLeftTerminalField, item?.surveyor_left_terminal);
    // also expose parent service_order_status into this form so AttachmentsSection can read enable flags
    const form = useForm<any>({ resolver: zodResolver(ItemSchema), defaultValues: { ...defaultVals, service_order_status: parentStatus } as any });
    const { handleSubmit, control, setValue } = form;

    // Site autocomplete helpers (used for loading_port and discharge_port)
  const [siteSuggestions, setSiteSuggestions] = useState<any[]>([]);
  const [siteCache, setSiteCache] = useState<Record<string, any>>({});
  const [siteSuggestError, setSiteSuggestError] = useState<string | null>(null);
    const createSiteComplete = async (e: { query: string }) => {
      try {
        setSiteSuggestError(null);
        await createAutocompleteComplete<any>({ listFn: siteService.list, qc, cacheKeyRoot: 'site', setSuggestions: setSiteSuggestions, setCache: (updater) => setSiteCache((prev) => updater(prev)), per_page: 20, filterKey: 'name' })(e);
      } catch {
        setSiteSuggestions([]);
        setSiteSuggestError('Falha ao carregar sugestões');
      }
    };

    // vessel type autocomplete
    const [vesselTypeSuggestions, setVesselTypeSuggestions] = useState<any[]>([]);
    const [vesselTypeCache, setVesselTypeCache] = useState<Record<string, any>>({});
    const createVesselTypeComplete = async (e: { query: string }) => {
      try {
        await createAutocompleteComplete<any>({ listFn: (vesselTypeService as any).list, qc, cacheKeyRoot: 'vesselType', setSuggestions: setVesselTypeSuggestions, setCache: (updater) => setVesselTypeCache((prev) => updater(prev)), per_page: 20, filterKey: 'name' })(e);
      } catch {
        setVesselTypeSuggestions([]);
      }
    };

    // weather autocomplete
    const [weatherSuggestions, setWeatherSuggestions] = useState<any[]>([]);
    const [weatherCache, setWeatherCache] = useState<Record<string, any>>({});
    const createWeatherComplete = async (e: { query: string }) => {
      try {
        await createAutocompleteComplete<any>({ listFn: (weatherService as any).list, qc, cacheKeyRoot: 'weather', setSuggestions: setWeatherSuggestions, setCache: (updater) => setWeatherCache((prev) => updater(prev)), per_page: 20, filterKey: 'name' })(e);
      } catch {
        setWeatherSuggestions([]);
      }
    };

    // If this item already contains the full loading_port or discharge_port object (from server),
    // seed the local cache and react-query cache so AutoComplete shows the name
    useEffect(() => {
      try {
        // seed cached objects (uses util imported from formHelpers)

        const lp = item && (item.loading_port || item.loading_port_id ? (item.loading_port ?? undefined) : undefined);
        const lpId = item && (item.loading_port_id ?? (lp && lp.id)) as string | undefined;
  seedCachedObject(lp, lpId, setSiteCache, qc, 'site');

        const dp = item && (item.discharge_port || item.discharge_port_id ? (item.discharge_port ?? undefined) : undefined);
        const dpId = item && (item.discharge_port_id ?? (dp && dp.id)) as string | undefined;
  seedCachedObject(dp, dpId, setSiteCache, qc, 'site');

        // seed vessel type if present
        const vt = item && (item.vessel_type || item.vessel_type_id ? (item.vessel_type ?? undefined) : undefined);
        const vtId = item && (item.vessel_type_id ?? (vt && vt.id)) as string | undefined;
  seedCachedObject(vt, vtId, setVesselTypeCache, qc, 'vesselType');

        // seed loading facility if present (shares site cache)
        const lf = item && (item.loading_facility || item.loading_facility_id ? (item.loading_facility ?? undefined) : undefined);
        const lfId = item && (item.loading_facility_id ?? (lf && lf.id)) as string | undefined;
  seedCachedObject(lf, lfId, setSiteCache, qc, 'site');

        // seed discharge facility if present (shares site cache)
        const df = item && (item.discharge_facility || item.discharge_facility_id ? (item.discharge_facility ?? undefined) : undefined);
        const dfId = item && (item.discharge_facility_id ?? (df && df.id)) as string | undefined;
  seedCachedObject(df, dfId, setSiteCache, qc, 'site');

        // seed weather if present
        const w = item && (item.weather || item.weather_id ? (item.weather ?? undefined) : undefined);
        const wId = item && (item.weather_id ?? (w && w.id)) as string | undefined;
  seedCachedObject(w, wId, setWeatherCache, qc, 'weather');
        // If only an id is present for site-like objects (loading/discharge ports/facilities),
        // try to fetch the object so the AutoComplete can show the name immediately.
        try {
          const fetchIfMissing = async (id?: string | undefined) => {
            if (!id) return;
            try {
              const existing = qc.getQueryData(['site', id]);
              if (existing) return;
              const fetched = await siteService.get(id);
              if (fetched && typeof fetched === 'object') {
                setSiteCache((prev) => ({ ...(prev || {}), [id]: fetched }));
                try { qc.setQueryData(['site', id], fetched); } catch { /* ignore */ }
              }
            } catch {
              // ignore fetch errors
            }
          };
          // loading port / discharge port / loading facility / discharge facility ids
          void fetchIfMissing(lpId as string | undefined);
          void fetchIfMissing(dpId as string | undefined);
          void fetchIfMissing(lfId as string | undefined);
          void fetchIfMissing(dfId as string | undefined);
        } catch {
          // ignore
        }
      } catch {
        // ignore
      }
      // only run on mount per item
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [localSubmitting, setLocalSubmitting] = useState(false);

  const submitting = localSubmitting || (isNew ? mutationIsLoading(createMutation) : mutationIsLoading(updateMutation));

  const onSave = handleSubmit(async (vals) => {
      try {
        // map named form fields back to API-expected keys
        const payload: any = { ...vals };
        // ensure loading_port_id exists in payload for API
        if (loadingPortFieldName !== 'loading_port_id') {
          payload.loading_port_id = vals[loadingPortFieldName] ?? null;
          // avoid sending the custom-named field to API
          delete payload[loadingPortFieldName];
        }
        // discharge port
        if (dischargePortFieldName !== 'discharge_port_id') {
          payload.discharge_port_id = vals[dischargePortFieldName] ?? null;
          delete payload[dischargePortFieldName];
        }
        // vessel name
        if (vesselNameFieldName !== 'vessel_name') {
          payload.vessel_name = vals[vesselNameFieldName] ?? null;
          delete payload[vesselNameFieldName];
        }
        // weight
        if (weightFieldName !== 'weight_for_transportation') {
          payload.weight_for_transportation = vals[weightFieldName] ?? null;
          delete payload[weightFieldName];
        }
        // vessel type
        if (vesselTypeFieldName !== 'vessel_type_id') {
          payload.vessel_type_id = vals[vesselTypeFieldName] ?? null;
          delete payload[vesselTypeFieldName];
        }
        // loading facility
        if (loadingFacilityFieldName !== 'loading_facility_id') {
          payload.loading_facility_id = vals[loadingFacilityFieldName] ?? null;
          delete payload[loadingFacilityFieldName];
        }
        // discharge facility
        if (dischargeFacilityFieldName !== 'discharge_facility_id') {
          payload.discharge_facility_id = vals[dischargeFacilityFieldName] ?? null;
          delete payload[dischargeFacilityFieldName];
        }
        // weather
        if (weatherFieldName !== 'weather_id') {
          payload.weather_id = vals[weatherFieldName] ?? null;
          delete payload[weatherFieldName];
        }
        payload.service_order_id = currentOrderId;
        // ensure attachments node present
        if (!payload.attachments) payload.attachments = [];
        // Ensure each attachment includes `filename` matching `name` (backend expects filename attr)
        try {
          if (Array.isArray(payload.attachments)) {
            payload.attachments = payload.attachments.map((att: any) => {
              if (att && typeof att === 'object') {
                // prefer name -> filename, fallback to existing filename
                const filename = att.name ?? att.filename ?? null;
                return { ...att, filename };
              }
              return att;
            });
            // Only send attachments that are new (no `id`) to the attachments creation node.
            // Persisted attachments (which already have an `id`) should not be re-sent as new records
            // because that causes duplicate attachments to be created on the backend.
            try {
              payload.attachments = payload.attachments.filter((att: any) => !att || !att.id).map((att: any) => ({ ...att }));
            } catch {
              // ignore filtering errors
            }
          }
        } catch {
          // ignore normalization errors
        }
        // set local submitting state so UI responds immediately
        setLocalSubmitting(true);
        if (isNew) {
          await createMutation.mutateAsync(payload);
          toast.current?.show({ severity: 'success', summary: 'Criado', detail: `Registro criado` });
          setCreatingNew(false);
        } else if (item && item.id) {
          await updateMutation.mutateAsync({ id: item.id, payload });
          toast.current?.show({ severity: 'success', summary: 'Atualizado', detail: `Registro atualizado` });
        }
        setLocalSubmitting(false);
      } catch (err: any) {
          // try to map server-side field errors into the form
          try {
            const body = err?.response?.data ?? err?.data ?? null;
            if (body && typeof body === 'object') {
              // common Laravel style: { errors: { field: ['msg'] } }
              const errors = (body.errors ?? body) as Record<string, any>;
              if (errors && typeof errors === 'object') {
                Object.entries(errors).forEach(([k, v]) => {
                  const message = Array.isArray(v) ? String(v[0]) : String(v);
                  // mapping from API keys to configured form field names
                  const map: Record<string, string | undefined> = {
                    loading_port_id: loadingPortFieldName,
                    discharge_port_id: dischargePortFieldName,
                    vessel_name: vesselNameFieldName,
                    weight_for_transportation: weightFieldName,
                    vessel_type_id: vesselTypeFieldName,
                    loading_facility_id: loadingFacilityFieldName,
                    discharge_facility_id: dischargeFacilityFieldName,
                    weather_id: weatherFieldName,
                    imo_number: imoNumberFieldName,
                    call_sign: callSignFieldName,
                    mmsi_number: mmsiNumberFieldName,
                    port_of_registry: portOfRegistryFieldName,
                    flag_state: flagStateFieldName,
                    loa: loaFieldName,
                    breadth: breadthFieldName,
                    depth: depthFieldName,
                    gross_tonnage: grossTonnageFieldName,
                    net_tonnage: netTonnageFieldName,
                    owner: ownerFieldName,
                    sold_to: soldToFieldName,
                    cargo: cargoFieldName,
                    booking_bb: bookingBBFieldName,
                    inspector_name: inspectorNameFieldName,
                    terminal_supervisor_name: terminalSupervisorFieldName,
                    vessel_voyage: vesselVoyageFieldName,
                    flat_racks_and_position_on_board: flatRacksFieldName,
                    dimension: dimensionFieldName,
                    date_of_loading: dateOfLoadingFieldName,
                    date_of_discharge: dateOfDischargeFieldName,
                    vessel_arrived: vesselArrivedFieldName,
                    vessel_berthed: vesselBerthedFieldName,
                    operations_commenced: operationsCommencedFieldName,
                    surveyor_at_terminal: surveyorAtTerminalFieldName,
                    surveyor_on_board: surveyorOnBoardFieldName,
                    unlashing: unlashingFieldName,
                    lifting_1: lifting1FieldName,
                    lifting_2: lifting2FieldName,
                    lifting_3: lifting3FieldName,
                    lifting_4: lifting4FieldName,
                    lifting_5: lifting5FieldName,
                    discharge_completed: dischargeCompletedFieldName,
                    final_inspection: finalInspectionFieldName,
                    surveyor_left_terminal: surveyorLeftTerminalFieldName,
                  };

                  const target = map[k] ?? k;
                  try { form.setError(target, { type: 'server', message }); } catch { /* ignore */ }
                });
              }
            }
          } catch {
            // ignore mapping errors
          }
          toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar' });
        }
  });

    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
    const [cancelConfirmVisible, setCancelConfirmVisible] = useState(false);

    const onDelete = () => {
      // open confirmation dialog
      setDeleteConfirmVisible(true);
    };

    const confirmDelete = async () => {
      if (!item || !item.id) {
        setDeleteConfirmVisible(false);
        return;
      }
      try {
        await deleteMutation.mutateAsync(item.id);
        toast.current?.show({ severity: 'success', summary: 'Removido', detail: 'Registro removido' });
      } catch {
        toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao remover' });
      } finally {
        setDeleteConfirmVisible(false);
      }
    };

    // When parent status changes, keep the hidden field in sync so AttachmentsSection reads it
    useEffect(() => {
      try { setValue('service_order_status', parentStatus as any); } catch { /* ignore */ }
      // parentStatus comes from the parent form context and isn't a stable React dependency
      // so we intentionally only depend on setValue to avoid false lint warnings.
    }, [setValue]);

    

  
  return (
    <FormProvider {...form}>
      <div className="p-4">
        {/* Grid principal com responsividade */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Vessel Type */}
          {goodsVesselTypeField?.visible !== false && (
            <div className="flex flex-col">
              <label className="block mb-1">{t('goods_service_order:vessel_type')}
                {goodsVesselTypeField?.required ? ' *' : ''}
              </label>
              <Controller 
                control={control} 
                name={vesselTypeFieldName} 
                defaultValue={goodsVesselTypeField?.default_value} 
                render={({ field }) => (
                  <AutoComplete
                    value={resolveAutoCompleteValue<any>(vesselTypeSuggestions, vesselTypeCache, field.value, qc, 'vesselType') as any}
                    suggestions={vesselTypeSuggestions}
                    field="name"
                    completeMethod={createVesselTypeComplete}
                    onChange={makeAutoCompleteOnChange<any>({ setCache: (updater) => setVesselTypeCache((prev) => updater(prev)), cacheKey: 'vesselType', qc })(field.onChange)}
                    dropdown
                    className="w-full"
                  />
                )} 
              />
              {((form.formState && (form.formState.errors as Record<string, any>)) || {})[vesselTypeFieldName]?.message && (
                <small className="p-error">{((form.formState && (form.formState.errors as Record<string, any>)) || {})[vesselTypeFieldName].message}</small>
              )}
            </div>
          )}

          {/* Loading Port */}
          {goodsVesselLoadingPortField?.visible !== false && (
            <div className="flex flex-col">
              <label className="block mb-1">{t('goods_service_order:loading_port')}
                {goodsVesselLoadingPortField?.required ? ' *' : ''}
              </label>
              <Controller 
                control={control} 
                name={loadingPortFieldName} 
                defaultValue={goodsVesselLoadingPortField?.default_value} 
                render={({ field }) => {
                  const displayValue = item && item.loading_port ? item.loading_port : field.value;
                  return (
                    <AutoComplete
                      value={resolveAutoCompleteValue<any>(siteSuggestions, siteCache, displayValue, qc, 'site') as any}
                      suggestions={siteSuggestions}
                      field="name"
                      completeMethod={createSiteComplete}
                      onChange={makeAutoCompleteOnChange<any>({ setCache: (updater) => setSiteCache((prev) => updater(prev)), cacheKey: 'site', qc })(field.onChange)}
                      dropdown
                      className="w-full"
                    />
                  );
                }} 
              />
              {((form.formState && (form.formState.errors as Record<string, any>)) || {})[loadingPortFieldName]?.message && (
                <small className="p-error">{((form.formState && (form.formState.errors as Record<string, any>)) || {})[loadingPortFieldName].message}</small>
              )}
              {siteSuggestError && <small className="p-error">{siteSuggestError}</small>}
            </div>
          )}

          {/* Loading Facility */}
          {goodsLoadingFacilityField?.visible !== false && (
            <div className="flex flex-col">
              <label className="block mb-1">{t('goods_service_order:loading_facility')}
                {goodsLoadingFacilityField?.required ? ' *' : ''}
              </label>
              <Controller 
                control={control} 
                name={loadingFacilityFieldName} 
                defaultValue={goodsLoadingFacilityField?.default_value} 
                render={({ field }) => {
                  const displayValue = item && item.loading_facility ? item.loading_facility : field.value;
                  return (
                    <AutoComplete
                      value={resolveAutoCompleteValue<any>(siteSuggestions, siteCache, displayValue, qc, 'site') as any}
                      suggestions={siteSuggestions}
                      field="name"
                      completeMethod={createSiteComplete}
                      onChange={makeAutoCompleteOnChange<any>({ setCache: (updater) => setSiteCache((prev) => updater(prev)), cacheKey: 'site', qc })(field.onChange)}
                      dropdown
                      className="w-full"
                    />
                  );
                }} 
              />
              {((form.formState && (form.formState.errors as Record<string, any>)) || {})[loadingFacilityFieldName]?.message && (
                <small className="p-error">{((form.formState && (form.formState.errors as Record<string, any>)) || {})[loadingFacilityFieldName].message}</small>
              )}
            </div>
          )}

          {/* Discharge Port */}
          {goodsVesselDischargePortField?.visible !== false && (
            <div className="flex flex-col">
              <label className="block mb-1">{t('goods_service_order:discharge_port')}
                {goodsVesselDischargePortField?.required ? ' *' : ''}
              </label>
              <Controller 
                control={control} 
                name={dischargePortFieldName} 
                defaultValue={goodsVesselDischargePortField?.default_value} 
                render={({ field }) => {
                  const displayValue = item && item.discharge_port ? item.discharge_port : field.value;
                  return (
                    <AutoComplete
                      value={resolveAutoCompleteValue<any>(siteSuggestions, siteCache, displayValue, qc, 'site') as any}
                      suggestions={siteSuggestions}
                      field="name"
                      completeMethod={createSiteComplete}
                      onChange={makeAutoCompleteOnChange<any>({ setCache: (updater) => setSiteCache((prev) => updater(prev)), cacheKey: 'site', qc })(field.onChange)}
                      dropdown
                      className="w-full"
                    />
                  );
                }} 
              />
              {((form.formState && (form.formState.errors as Record<string, any>)) || {})[dischargePortFieldName]?.message && (
                <small className="p-error">{((form.formState && (form.formState.errors as Record<string, any>)) || {})[dischargePortFieldName].message}</small>
              )}
            </div>
          )}

          {/* Discharge Facility */}
          {goodsDischargeFacilityField?.visible !== false && (
            <div className="flex flex-col">
              <label className="block mb-1">{t('goods_service_order:discharge_facility')}
                {goodsDischargeFacilityField?.required ? ' *' : ''}
              </label>
              <Controller 
                control={control} 
                name={dischargeFacilityFieldName} 
                defaultValue={goodsDischargeFacilityField?.default_value} 
                render={({ field }) => {
                  const displayValue = item && item.discharge_facility ? item.discharge_facility : field.value;
                  return (
                    <AutoComplete
                      value={resolveAutoCompleteValue<any>(siteSuggestions, siteCache, displayValue, qc, 'site') as any}
                      suggestions={siteSuggestions}
                      field="name"
                      completeMethod={createSiteComplete}
                      onChange={makeAutoCompleteOnChange<any>({ setCache: (updater) => setSiteCache((prev) => updater(prev)), cacheKey: 'site', qc })(field.onChange)}
                      dropdown
                      className="w-full"
                    />
                  );
                }} 
              />
              {((form.formState && (form.formState.errors as Record<string, any>)) || {})[dischargeFacilityFieldName]?.message && (
                <small className="p-error">{((form.formState && (form.formState.errors as Record<string, any>)) || {})[dischargeFacilityFieldName].message}</small>
              )}
            </div>
          )}

          {/* Weather */}
          {goodsWeatherField?.visible !== false && (
            <div className="flex flex-col">
              <label className="block mb-1">{t('goods_service_order:weather')}
                {goodsWeatherField?.required ? ' *' : ''}
              </label>
              <Controller 
                control={control} 
                name={weatherFieldName} 
                defaultValue={goodsWeatherField?.default_value} 
                render={({ field }) => (
                  <AutoComplete
                    value={resolveAutoCompleteValue<any>(weatherSuggestions, weatherCache, field.value, qc, 'weather') as any}
                    suggestions={weatherSuggestions}
                    field="name"
                    completeMethod={createWeatherComplete}
                    onChange={makeAutoCompleteOnChange<any>({ setCache: (updater) => setWeatherCache((prev) => updater(prev)), cacheKey: 'weather', qc })(field.onChange)}
                    dropdown
                    className="w-full"
                  />
                )} 
              />
              {((form.formState && (form.formState.errors as Record<string, any>)) || {})[weatherFieldName]?.message && (
                <small className="p-error">{((form.formState && (form.formState.errors as Record<string, any>)) || {})[weatherFieldName].message}</small>
              )}
            </div>
          )}

          {/* Vessel Name */}
          {goodsVesselNameField?.visible !== false && (
            <div className="flex flex-col">
              <label className="block mb-1">{t('goods_service_order:vessel_name')}
                {goodsVesselNameField?.required ? ' *' : ''}
              </label>
              <Controller 
                control={control} 
                name={vesselNameFieldName} 
                defaultValue={goodsVesselNameField?.default_value} 
                render={({ field }) => (
                  <InputText className="w-full" {...field} />
                )} 
              />
              {((form.formState && (form.formState.errors as Record<string, any>)) || {})[vesselNameFieldName]?.message && (
                <small className="p-error">{((form.formState && (form.formState.errors as Record<string, any>)) || {})[vesselNameFieldName].message}</small>
              )}
            </div>
          )}

          {/* IMO Number */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:imo_number')}</label>
            <Controller 
              control={control} 
              name="imo_number" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* Call Sign */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:call_sign')}</label>
            <Controller 
              control={control} 
              name="call_sign" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* MMSI Number */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:mmsi_number')}</label>
            <Controller 
              control={control} 
              name="mmsi_number" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* Port of Registry */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:port_of_registry')}</label>
            <Controller 
              control={control} 
              name="port_of_registry" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* Flag State */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:flag_state')}</label>
            <Controller 
              control={control} 
              name="flag_state" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* LOA */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:loa')}</label>
            <Controller 
              control={control} 
              name="loa" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* Breadth */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:breadth')}</label>
            <Controller 
              control={control} 
              name="breadth" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* Depth */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:depth')}</label>
            <Controller 
              control={control} 
              name="depth" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* Gross Tonnage */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:gross_tonnage')}</label>
            <Controller 
              control={control} 
              name="gross_tonnage" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* Net Tonnage */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:net_tonnage')}</label>
            <Controller 
              control={control} 
              name="net_tonnage" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* Owner */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:owner')}</label>
            <Controller 
              control={control} 
              name="owner" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* Sold To */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:sold_to')}</label>
            <Controller 
              control={control} 
              name="sold_to" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* Cargo */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:cargo')}</label>
            <Controller 
              control={control} 
              name="cargo" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* Description - full width textarea */}
          <div className="flex flex-col lg:col-span-4 md:col-span-2 sm:col-span-1">
            <label className="block mb-1">{t('goods_service_order:description')}</label>
            <Controller 
              control={control} 
              name="description" 
              defaultValue={''} 
              render={({ field }) => (
                <InputTextarea 
                  rows={4} 
                  className="w-full" 
                  value={String(field.value ?? '')} 
                  onChange={(e) => field.onChange((e.target as HTMLTextAreaElement).value)} 
                />
              )} 
            />
          </div>

          {/* Weight for Transportation */}
          {goodsWeightField?.visible !== false && (
            <div className="flex flex-col">
              <label className="block mb-1">{t('goods_service_order:weight_for_transportation')}
                {goodsWeightField?.required ? ' *' : ''}
              </label>
              <Controller 
                control={control} 
                name={weightFieldName} 
                defaultValue={goodsWeightField?.default_value ?? null} 
                render={({ field }) => (
                  <InputNumber 
                    className="w-full" 
                    value={field.value as any} 
                    mode="decimal" 
                    locale="pt-BR" 
                    minFractionDigits={2} 
                    maxFractionDigits={2} 
                    onValueChange={(e) => field.onChange(e.value)} 
                  />
                )} 
              />
              {((form.formState && (form.formState.errors as Record<string, any>)) || {})[weightFieldName]?.message && (
                <small className="p-error">{((form.formState && (form.formState.errors as Record<string, any>)) || {})[weightFieldName].message}</small>
              )}
            </div>
          )}

          {/* Dimension */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:dimension')}</label>
            <Controller 
              control={control} 
              name="dimension" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* Date of Loading - CALENDAR */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:date_of_loading')}</label>
            <Controller 
              control={control} 
              name="date_of_loading" 
              defaultValue={null} 
              render={({ field }) => (
                <Calendar 
                  showIcon 
                  showTime 
                  hourFormat="24" 
                  className="w-full" 
                  value={field.value as Date | null} 
                  onChange={(e: any) => field.onChange(e?.value ?? null)} 
                  hideOnDateTimeSelect
                />
              )} 
            />
          </div>

          {/* Date of Discharge - CALENDAR */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:date_of_discharge')}</label>
            <Controller 
              control={control} 
              name="date_of_discharge" 
              defaultValue={null} 
              render={({ field }) => (
                <Calendar 
                  showIcon 
                  dateFormat="dd/mm/yy" 
                  showTime 
                  hourFormat="24" 
                  className="w-full" 
                  value={field.value as Date | null} 
                  onChange={(e: any) => field.onChange(e?.value ?? null)} 
                  hideOnDateTimeSelect
                />
              )} 
            />
          </div>

          {/* Vessel Voyage */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:vessel_voyage')}</label>
            <Controller 
              control={control} 
              name="vessel_voyage" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* Flat Racks and Position on Board */}
          <div className="flex flex-col">
            <label className="block mb-1">{t('goods_service_order:flat_racks_and_position_on_board')}</label>
            <Controller 
              control={control} 
              name="flat_racks_and_position_on_board" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* Booking BB */}
          <div className="flex flex-col md:col-span-1">
            <label className="block mb-1">{t('goods_service_order:booking_bb')}</label>
            <Controller 
              control={control} 
              name="booking_bb" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* Inspector Name */}
          <div className="flex flex-col md:col-span-1">
            <label className="block mb-1">{t('goods_service_order:inspector_name')}</label>
            <Controller 
              control={control} 
              name="inspector_name" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* Terminal Supervisor Name */}
          <div className="flex flex-col md:col-span-1">
            <label className="block mb-1">{t('goods_service_order:terminal_supervisor_name')}</label>
            <Controller 
              control={control} 
              name="terminal_supervisor_name" 
              defaultValue={''} 
              render={({ field }) => (
                <InputText className="w-full" value={String(field.value ?? '')} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />
              )} 
            />
          </div>

          {/* Date/time fields (Calendar with showTime) */}

          {/* Vessel Arrived - CALENDAR */}
          <div className="flex flex-col md:col-span-1">
            <label className="block mb-1">{t('goods_service_order:vessel_arrived')}</label>
            <Controller 
              control={control} 
              name="vessel_arrived" 
              defaultValue={null} 
              render={({ field }) => (
                <Calendar 
                  showIcon 
                  dateFormat="dd/mm/yy" 
                  showTime 
                  hourFormat="24" 
                  className="w-full" 
                  value={field.value as Date | null} 
                  onChange={(e: any) => field.onChange(e?.value ?? null)} 
                />
              )} 
            />
          </div>

          {/* Vessel Berthed - CALENDAR */}
          <div className="flex flex-col md:col-span-1">
            <label className="block mb-1">{t('goods_service_order:vessel_berthed')}</label>
            <Controller 
              control={control} 
              name="vessel_berthed" 
              defaultValue={null} 
              render={({ field }) => (
                <Calendar 
                  showIcon 
                  dateFormat="dd/mm/yy" 
                  showTime 
                  hourFormat="24" 
                  className="w-full" 
                  value={field.value as Date | null} 
                  onChange={(e: any) => field.onChange(e?.value ?? null)} 
                />
              )} 
            />
          </div>

          {/* Operations Commenced - CALENDAR */}
          <div className="flex flex-col md:col-span-1">
            <label className="block mb-1">{t('goods_service_order:operations_commenced')}</label>
            <Controller 
              control={control} 
              name="operations_commenced" 
              defaultValue={null} 
              render={({ field }) => (
                <Calendar 
                  showIcon 
                  dateFormat="dd/mm/yy" 
                  showTime 
                  hourFormat="24" 
                  className="w-full" 
                  value={field.value as Date | null} 
                  onChange={(e: any) => field.onChange(e?.value ?? null)} 
                />
              )} 
            />
          </div>

          {/* Surveyor at Terminal - CALENDAR */}
          <div className="flex flex-col md:col-span-1">
            <label className="block mb-1">{t('goods_service_order:surveyor_at_terminal')}</label>
            <Controller 
              control={control} 
              name="surveyor_at_terminal" 
              defaultValue={null} 
              render={({ field }) => (
                <Calendar 
                  showIcon 
                  dateFormat="dd/mm/yy" 
                  showTime 
                  hourFormat="24" 
                  className="w-full" 
                  value={field.value as Date | null} 
                  onChange={(e: any) => field.onChange(e?.value ?? null)} 
                />
              )} 
            />
          </div>

          {/* Surveyor on Board - CALENDAR */}
          <div className="flex flex-col md:col-span-1">
            <label className="block mb-1">{t('goods_service_order:surveyor_on_board')}</label>
            <Controller 
              control={control} 
              name="surveyor_on_board" 
              defaultValue={null} 
              render={({ field }) => (
                <Calendar 
                  showIcon 
                  dateFormat="dd/mm/yy" 
                  showTime 
                  hourFormat="24" 
                  className="w-full" 
                  value={field.value as Date | null} 
                  onChange={(e: any) => field.onChange(e?.value ?? null)} 
                  hideOnDateTimeSelect
                />
              )} 
            />
          </div>

          {/* Unlashing - CALENDAR */}
          <div className="flex flex-col md:col-span-1">
            <label className="block mb-1">{t('goods_service_order:unlashing')}</label>
            <Controller 
              control={control} 
              name="unlashing" 
              defaultValue={null} 
              render={({ field }) => (
                <Calendar 
                  showIcon 
                  dateFormat="dd/mm/yy" 
                  showTime 
                  hourFormat="24" 
                  className="w-full" 
                  value={field.value as Date | null} 
                  onChange={(e: any) => field.onChange(e?.value ?? null)} 
                  hideOnDateTimeSelect
                />
              )} 
            />
          </div>

          {/* Liftings 1-5 - CALENDAR */}
          {['lifting_1','lifting_2','lifting_3','lifting_4','lifting_5'].map((k) => (
            <div key={k} className="flex flex-col md:col-span-1">
              <label className="block mb-1">{t(`goods_service_order:${k}`)}</label>
              <Controller 
                control={control} 
                name={k} 
                defaultValue={null} 
                render={({ field }) => (
                  <Calendar 
                    showIcon 
                    dateFormat="dd/mm/yy" 
                    showTime 
                    hourFormat="24" 
                    className="w-full" 
                    value={field.value as Date | null} 
                    onChange={(e: any) => field.onChange(e?.value ?? null)} 
                    hideOnDateTimeSelect
                  />
                )} 
              />
            </div>
          ))}

          {/* Discharge Completed - CALENDAR */}
          <div className="flex flex-col md:col-span-1">
            <label className="block mb-1">{t('goods_service_order:discharge_completed')}</label>
            <Controller 
              control={control} 
              name="discharge_completed" 
              defaultValue={null} 
              render={({ field }) => (
                <Calendar 
                  showIcon 
                  dateFormat="dd/mm/yy" 
                  showTime 
                  hourFormat="24" 
                  className="w-full" 
                  value={field.value as Date | null} 
                  onChange={(e: any) => field.onChange(e?.value ?? null)} 
                  hideOnDateTimeSelect
                />
              )} 
            />
          </div>

          {/* Final Inspection - CALENDAR */}
          <div className="flex flex-col md:col-span-1">
            <label className="block mb-1">{t('goods_service_order:final_inspection')}</label>
            <Controller 
              control={control} 
              name="final_inspection" 
              defaultValue={null} 
              render={({ field }) => (
                <Calendar 
                  showIcon 
                  dateFormat="dd/mm/yy" 
                  showTime 
                  hourFormat="24" 
                  className="w-full" 
                  value={field.value as Date | null} 
                  onChange={(e: any) => field.onChange(e?.value ?? null)} 
                  hideOnDateTimeSelect 
                />
              )} 
            />
          </div>

          {/* Surveyor Left Terminal - CALENDAR */}
          <div className="flex flex-col md:col-span-1">
            <label className="block mb-1">{t('goods_service_order:surveyor_left_terminal')}</label>
            <Controller 
              control={control} 
              name="surveyor_left_terminal" 
              defaultValue={null} 
              render={({ field }) => (
                <Calendar 
                  showIcon 
                  dateFormat="dd/mm/yy" 
                  showTime 
                  hourFormat="24" 
                  className="w-full" 
                  value={field.value as Date | null} 
                  onChange={(e: any) => field.onChange(e?.value ?? null)} 
                  hideOnDateTimeSelect
                />
              )} 
            />
          </div>

        </div>

        {/* Attachments Section */}
        <div className="mt-6">
          <AttachmentsSection name="attachments" path="operation/good" />
        </div>
        {/* Confirm dialogs */}
        <Dialog header="Confirmar exclusão" visible={deleteConfirmVisible} onHide={() => setDeleteConfirmVisible(false)}>
          <p>{t('common:delete_record_confirmation')}</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button label={t('common:cancelUCase')} onClick={() => setDeleteConfirmVisible(false)} />
            <Button label="Sim, excluir" className="p-button-danger" onClick={confirmDelete} disabled={mutationIsLoading(deleteMutation)} />
          </div>
        </Dialog>

        <Dialog header="Confirmar" visible={cancelConfirmVisible} onHide={() => setCancelConfirmVisible(false)}>
          <p>Deseja cancelar a criação deste registro?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button label={t('common:cancelUCase')} onClick={() => setCancelConfirmVisible(false)} />
            <Button label="Sim, cancelar" className="p-button-secondary" onClick={() => { setCancelConfirmVisible(false); setCreatingNew(false); }} />
          </div>
        </Dialog>

        {/* Botões no final */}
        <div className="flex items-end justify-end gap-2 mt-6">
          <div className="flex gap-2">
            {/* Save button: show spinner icon + translated label while submitting (match PageFooter behavior) */}
            <button
              type="button"
              aria-label={parentEnableEditing ? (submitting ? t('common:saving') : 'Salvar') : undefined}
              className={`pf-save-btn p-button p-component p-button-primary ${(!parentEnableEditing || submitting) ? 'p-disabled' : ''}`}
              onClick={onSave}
              disabled={!parentEnableEditing || submitting}
            >
              {submitting ? <i className="pi pi-spin pi-spinner" /> : <i className="pi pi-save" />}
              <span className="ml-2">{submitting ? t('common:saving') : 'Salvar'}</span>
            </button>
            {!isNew && (
              <Button label="Excluir" icon="pi pi-trash" className="p-button-danger" onClick={onDelete} disabled={!parentEnableEditing} />
            )}
            {isNew && (
              <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setCancelConfirmVisible(true)} />
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}


  

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
          <Button label="Novo" icon="pi pi-plus" onClick={() => {
            setCreatingNew(true);
            // open the new top panel (index 0)
            const next = Array.isArray(activeIndexes) ? [0, ...activeIndexes] : [0];
            setActiveIndexes(next);
          }} disabled={!parentEnableEditing} />

          <Button label="Expandir todos" onClick={expandAll} className="p-button-text" />

          <Button label="Colapsar" onClick={collapseAll} className="p-button-text" />
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted">Total: {total}</div>  
          <InputText placeholder="Buscar por navio" value={search} onChange={(e) => setSearch((e.target as HTMLInputElement).value)} />
        </div>
      </div>

  <Accordion multiple activeIndex={activeIndexes} onTabChange={(e: { index: number | number[] | null }) => setActiveIndexes(e.index as number[] | number | null)}>
        {creatingNew && (
          <AccordionTab header={`0 - Novo registro`}>
            <GoodItemForm isNew />
          </AccordionTab>
        )}

        {items.map((it: any, idx: number) => (
          <AccordionTab key={it.id ?? idx} header={`${(page - 1) * perPage + idx + 1} - ${it.vessel_name ?? '—'}`}>
            <GoodItemForm item={it} />
          </AccordionTab>
        ))}
      </Accordion>

      <div className="flex items-center justify-between mt-4">
        <div>Exibindo página {page} de 
{data?.last_page ?? 1}</div>

        <div className="flex gap-2">
          <Button label="Anterior" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} />

          <Button label="Próxima" onClick={() => setPage(Math.min((data?.last_page as number) ?? 1, page + 1))} disabled={page >= ((data?.last_page as number) ?? 1)} />
        </div>
      </div>
    </div>
  );
}