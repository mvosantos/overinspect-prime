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
import { makeAutoCompleteOnChange, resolveAutoCompleteValue } from '../../../utils/formHelpers';

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
  const [activeIndexes, setActiveIndexes] = useState<number[] | number | null>(null);

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
  const collapseAll = useCallback(() => setActiveIndexes(null), []);
  const expandAll = useCallback(() => {
    const totalItems = items.length + (creatingNew ? 1 : 0);
    setActiveIndexes(Array.from({ length: totalItems }, (_, i) => i));
  }, [items, creatingNew]);

  // inner component for each item (existing or new)
  function GoodItemForm({ item, isNew }: { item?: any; isNew?: boolean }) {
  const loadingPortFieldName = goodsVesselLoadingPortField?.name ?? 'loading_port_id';
  const dischargePortFieldName = goodsVesselDischargePortField?.name ?? 'discharge_port_id';
  const vesselNameFieldName = goodsVesselNameField?.name ?? 'vessel_name';
  const weightFieldName = goodsWeightField?.name ?? 'weight_for_transportation';
  const vesselTypeFieldName = goodsVesselTypeField?.name ?? 'vessel_type_id';
  const loadingFacilityFieldName = goodsLoadingFacilityField?.name ?? 'loading_facility_id';
  const dischargeFacilityFieldName = goodsDischargeFacilityField?.name ?? 'discharge_facility_id';
  const weatherFieldName = goodsWeatherField?.name ?? 'weather_id';
  // text fields
  const imoNumberFieldName = goodsImoNumberField?.name ?? 'imo_number';
  const callSignFieldName = goodsCallSignField?.name ?? 'call_sign';
  const mmsiNumberFieldName = goodsMmsiNumberField?.name ?? 'mmsi_number';
  const portOfRegistryFieldName = goodsPortOfRegistryField?.name ?? 'port_of_registry';
  const flagStateFieldName = goodsFlagStateField?.name ?? 'flag_state';
  const loaFieldName = goodsLoaField?.name ?? 'loa';
  const breadthFieldName = goodsBreadthField?.name ?? 'breadth';
  const depthFieldName = goodsDepthField?.name ?? 'depth';
  const grossTonnageFieldName = goodsGrossTonnageField?.name ?? 'gross_tonnage';
  const netTonnageFieldName = goodsNetTonnageField?.name ?? 'net_tonnage';
  const ownerFieldName = goodsOwnerField?.name ?? 'owner';
  const soldToFieldName = goodsSoldToField?.name ?? 'sold_to';
  const cargoFieldName = goodsCargoField?.name ?? 'cargo';
  const bookingBBFieldName = goodsBookingBBField?.name ?? 'booking_bb';
  const inspectorNameFieldName = goodsInspectorNameField?.name ?? 'inspector_name';
  const terminalSupervisorFieldName = goodsTerminalSupervisorField?.name ?? 'terminal_supervisor_name';
  const vesselVoyageFieldName = goodsVesselVoyageField?.name ?? 'vessel_voyage';
  const flatRacksFieldName = goodsFlatRacksField?.name ?? 'flat_racks_and_position_on_board';
  const dimensionFieldName = goodsDimensionField?.name ?? 'dimension';
  // date/time fields
  const dateOfLoadingFieldName = goodsDateOfLoadingField?.name ?? 'date_of_loading';
  const dateOfDischargeFieldName = goodsDateOfDischargeField?.name ?? 'date_of_discharge';
  const vesselArrivedFieldName = goodsVesselArrivedField?.name ?? 'vessel_arrived';
  const vesselBerthedFieldName = goodsVesselBerthedField?.name ?? 'vessel_berthed';
  const operationsCommencedFieldName = goodsOperationsCommencedField?.name ?? 'operations_commenced';
  const surveyorAtTerminalFieldName = goodsSurveyorAtTerminalField?.name ?? 'surveyor_at_terminal';
  const surveyorOnBoardFieldName = goodsSurveyorOnBoardField?.name ?? 'surveyor_on_board';
  const unlashingFieldName = goodsUnlashingField?.name ?? 'unlashing';
  const lifting1FieldName = goodsLifting1Field?.name ?? 'lifting_1';
  const lifting2FieldName = goodsLifting2Field?.name ?? 'lifting_2';
  const lifting3FieldName = goodsLifting3Field?.name ?? 'lifting_3';
  const lifting4FieldName = goodsLifting4Field?.name ?? 'lifting_4';
  const lifting5FieldName = goodsLifting5Field?.name ?? 'lifting_5';
  const dischargeCompletedFieldName = goodsDischargeCompletedField?.name ?? 'discharge_completed';
  const finalInspectionFieldName = goodsFinalInspectionField?.name ?? 'final_inspection';
  const surveyorLeftTerminalFieldName = goodsSurveyorLeftTerminalField?.name ?? 'surveyor_left_terminal';

  const defaultVals: any = { ...(item ?? {}), attachments: (item && Array.isArray(item.attachments)) ? item.attachments : [] };
  // ensure the named fields are populated: prefer existing item value, then field default_value, then null
  defaultVals[loadingPortFieldName] = item?.loading_port_id ?? (goodsVesselLoadingPortField?.default_value ?? null);
  defaultVals[dischargePortFieldName] = item?.discharge_port_id ?? (goodsVesselDischargePortField?.default_value ?? null);
  defaultVals[vesselNameFieldName] = item?.vessel_name ?? (goodsVesselNameField?.default_value ?? null);
  defaultVals[weightFieldName] = item?.weight_for_transportation ?? (goodsWeightField?.default_value ?? null);
  defaultVals[vesselTypeFieldName] = item?.vessel_type_id ?? (goodsVesselTypeField?.default_value ?? null);
  defaultVals[loadingFacilityFieldName] = item?.loading_facility_id ?? (goodsLoadingFacilityField?.default_value ?? null);
  defaultVals[dischargeFacilityFieldName] = item?.discharge_facility_id ?? (goodsDischargeFacilityField?.default_value ?? null);
  defaultVals[weatherFieldName] = item?.weather_id ?? (goodsWeatherField?.default_value ?? null);
  // text defaults
  defaultVals[imoNumberFieldName] = item?.imo_number ?? (goodsImoNumberField?.default_value ?? null);
  defaultVals[callSignFieldName] = item?.call_sign ?? (goodsCallSignField?.default_value ?? null);
  defaultVals[mmsiNumberFieldName] = item?.mmsi_number ?? (goodsMmsiNumberField?.default_value ?? null);
  defaultVals[portOfRegistryFieldName] = item?.port_of_registry ?? (goodsPortOfRegistryField?.default_value ?? null);
  defaultVals[flagStateFieldName] = item?.flag_state ?? (goodsFlagStateField?.default_value ?? null);
  defaultVals[loaFieldName] = item?.loa ?? (goodsLoaField?.default_value ?? null);
  defaultVals[breadthFieldName] = item?.breadth ?? (goodsBreadthField?.default_value ?? null);
  defaultVals[depthFieldName] = item?.depth ?? (goodsDepthField?.default_value ?? null);
  defaultVals[grossTonnageFieldName] = item?.gross_tonnage ?? (goodsGrossTonnageField?.default_value ?? null);
  defaultVals[netTonnageFieldName] = item?.net_tonnage ?? (goodsNetTonnageField?.default_value ?? null);
  defaultVals[ownerFieldName] = item?.owner ?? (goodsOwnerField?.default_value ?? null);
  defaultVals[soldToFieldName] = item?.sold_to ?? (goodsSoldToField?.default_value ?? null);
  defaultVals[cargoFieldName] = item?.cargo ?? (goodsCargoField?.default_value ?? null);
  defaultVals[bookingBBFieldName] = item?.booking_bb ?? (goodsBookingBBField?.default_value ?? null);
  defaultVals[inspectorNameFieldName] = item?.inspector_name ?? (goodsInspectorNameField?.default_value ?? null);
  defaultVals[terminalSupervisorFieldName] = item?.terminal_supervisor_name ?? (goodsTerminalSupervisorField?.default_value ?? null);
  defaultVals[vesselVoyageFieldName] = item?.vessel_voyage ?? (goodsVesselVoyageField?.default_value ?? null);
  defaultVals[flatRacksFieldName] = item?.flat_racks_and_position_on_board ?? (goodsFlatRacksField?.default_value ?? null);
  defaultVals[dimensionFieldName] = item?.dimension ?? (goodsDimensionField?.default_value ?? null);
  // date defaults
  defaultVals[dateOfLoadingFieldName] = item?.date_of_loading ?? (goodsDateOfLoadingField?.default_value ?? null);
  defaultVals[dateOfDischargeFieldName] = item?.date_of_discharge ?? (goodsDateOfDischargeField?.default_value ?? null);
  defaultVals[vesselArrivedFieldName] = item?.vessel_arrived ?? (goodsVesselArrivedField?.default_value ?? null);
  defaultVals[vesselBerthedFieldName] = item?.vessel_berthed ?? (goodsVesselBerthedField?.default_value ?? null);
  defaultVals[operationsCommencedFieldName] = item?.operations_commenced ?? (goodsOperationsCommencedField?.default_value ?? null);
  defaultVals[surveyorAtTerminalFieldName] = item?.surveyor_at_terminal ?? (goodsSurveyorAtTerminalField?.default_value ?? null);
  defaultVals[surveyorOnBoardFieldName] = item?.surveyor_on_board ?? (goodsSurveyorOnBoardField?.default_value ?? null);
  defaultVals[unlashingFieldName] = item?.unlashing ?? (goodsUnlashingField?.default_value ?? null);
  defaultVals[lifting1FieldName] = item?.lifting_1 ?? (goodsLifting1Field?.default_value ?? null);
  defaultVals[lifting2FieldName] = item?.lifting_2 ?? (goodsLifting2Field?.default_value ?? null);
  defaultVals[lifting3FieldName] = item?.lifting_3 ?? (goodsLifting3Field?.default_value ?? null);
  defaultVals[lifting4FieldName] = item?.lifting_4 ?? (goodsLifting4Field?.default_value ?? null);
  defaultVals[lifting5FieldName] = item?.lifting_5 ?? (goodsLifting5Field?.default_value ?? null);
  defaultVals[dischargeCompletedFieldName] = item?.discharge_completed ?? (goodsDischargeCompletedField?.default_value ?? null);
  defaultVals[finalInspectionFieldName] = item?.final_inspection ?? (goodsFinalInspectionField?.default_value ?? null);
  defaultVals[surveyorLeftTerminalFieldName] = item?.surveyor_left_terminal ?? (goodsSurveyorLeftTerminalField?.default_value ?? null);
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
        const lp = item && (item.loading_port || item.loading_port_id ? (item.loading_port ?? undefined) : undefined);
        const lpId = item && (item.loading_port_id ?? (lp && lp.id)) as string | undefined;
        if (lp && lpId) {
          setSiteCache((prev) => ({ ...(prev || {}), [lpId]: lp }));
          try { qc.setQueryData(['site', lpId], lp); } catch { /* ignore */ }
        }

        const dp = item && (item.discharge_port || item.discharge_port_id ? (item.discharge_port ?? undefined) : undefined);
        const dpId = item && (item.discharge_port_id ?? (dp && dp.id)) as string | undefined;
        if (dp && dpId) {
          setSiteCache((prev) => ({ ...(prev || {}), [dpId]: dp }));
          try { qc.setQueryData(['site', dpId], dp); } catch { /* ignore */ }
        }
      } catch {
        // ignore
      }
      // only run on mount per item
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        if (isNew) {
          await createMutation.mutateAsync(payload);
          toast.current?.show({ severity: 'success', summary: 'Criado', detail: `Registro criado` });
          setCreatingNew(false);
        } else if (item && item.id) {
          await updateMutation.mutateAsync({ id: item.id, payload });
          toast.current?.show({ severity: 'success', summary: 'Atualizado', detail: `Registro atualizado` });
        }
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

    const onDelete = async () => {
      if (!item || !item.id) return;
      try {
        await deleteMutation.mutateAsync(item.id);
        toast.current?.show({ severity: 'success', summary: 'Removido', detail: 'Registro removido' });
      } catch {
        toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao remover' });
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
                render={({ field }) => (
                  <AutoComplete
                    value={resolveAutoCompleteValue<any>(siteSuggestions, siteCache, field.value, qc, 'site') as any}
                    suggestions={siteSuggestions}
                    field="name"
                    completeMethod={createSiteComplete}
                    onChange={makeAutoCompleteOnChange<any>({ setCache: (updater) => setSiteCache((prev) => updater(prev)), cacheKey: 'site', qc })(field.onChange)}
                    dropdown
                    className="w-full"
                  />
                )} 
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
                render={({ field }) => (
                  <AutoComplete
                    value={resolveAutoCompleteValue<any>(siteSuggestions, siteCache, field.value, qc, 'site') as any}
                    suggestions={siteSuggestions}
                    field="name"
                    completeMethod={createSiteComplete}
                    onChange={makeAutoCompleteOnChange<any>({ setCache: (updater) => setSiteCache((prev) => updater(prev)), cacheKey: 'site', qc })(field.onChange)}
                    dropdown
                    className="w-full"
                  />
                )} 
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
                render={({ field }) => (
                  <AutoComplete
                    value={resolveAutoCompleteValue<any>(siteSuggestions, siteCache, field.value, qc, 'site') as any}
                    suggestions={siteSuggestions}
                    field="name"
                    completeMethod={createSiteComplete}
                    onChange={makeAutoCompleteOnChange<any>({ setCache: (updater) => setSiteCache((prev) => updater(prev)), cacheKey: 'site', qc })(field.onChange)}
                    dropdown
                    className="w-full"
                  />
                )} 
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
                render={({ field }) => (
                  <AutoComplete
                    value={resolveAutoCompleteValue<any>(siteSuggestions, siteCache, field.value, qc, 'site') as any}
                    suggestions={siteSuggestions}
                    field="name"
                    completeMethod={createSiteComplete}
                    onChange={makeAutoCompleteOnChange<any>({ setCache: (updater) => setSiteCache((prev) => updater(prev)), cacheKey: 'site', qc })(field.onChange)}
                    dropdown
                    className="w-full"
                  />
                )} 
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

        {/* Botões no final */}
        <div className="flex items-end justify-end gap-2 mt-6">
          <div className="flex gap-2">
            <Button label="Salvar" icon="pi pi-save" onClick={onSave} disabled={!parentEnableEditing} />
            {!isNew && (
              <Button label="Excluir" icon="pi pi-trash" className="p-button-danger" onClick={onDelete} disabled={!parentEnableEditing} />
            )}
            {isNew && (
              <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setCreatingNew(false)} />
            )}
          </div>
        </div>

        {/* Attachments Section */}
        <div className="mt-6">
          <AttachmentsSection name="attachments" path="operation/good" />
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
          <InputText placeholder="Buscar por navio" value={search} onChange={(e) => setSearch((e.target as HTMLInputElement).value)} />

          <div className="text-sm text-muted">Total: {total}</div>
        </div>

        <div className="flex items-center gap-2">
          <Button label="Novo" icon="pi pi-plus" onClick={() => { setCreatingNew(true); setActiveIndexes((prev) => {
            // open the new top panel (index 0)
            if (Array.isArray(prev)) return [0, ...prev];
            return [0];
          }); }} disabled={!parentEnableEditing} />

          <Button label="Expandir todos" onClick={expandAll} className="p-button-text" />

          <Button label="Colapsar" onClick={collapseAll} className="p-button-text" />
        </div>
      </div>

      <Accordion multiple activeIndex={activeIndexes} onTabChange={(e: any) => setActiveIndexes(e.index)}>
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