import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { AutoComplete } from 'primereact/autocomplete';
import { InputNumber } from 'primereact/inputnumber';
import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { normalizeListResponse } from '../../../utils/apiHelpers';
import { makeAutoCompleteOnChange, resolveAutoCompleteValue } from '../../../utils/formHelpers';
import { useWatch } from 'react-hook-form';
import subsidiaryService from '../../../services/subsidiaryService';
import type { Subsidiary } from '../../../models/subsidiary';
import { Controller } from 'react-hook-form';
import type { UseFormRegister, FieldErrors, Control, UseFormSetValue } from 'react-hook-form';
import type { CrudService } from '../../../models/apiTypes';
import { Calendar } from 'primereact/calendar';
import { useTranslation } from 'react-i18next';
import type { BusinessUnit } from '../../../models/businessUnit';
import businessUnitService from '../../../services/businessUnitService';
import { InputTextarea } from 'primereact/inputtextarea';
import type { Client } from '../../../models/Client';
import clientService from '../../../services/clientService';
import type { Currency } from '../../../models/Currency';
import currencyService from '../../../services/currencyService';
import type { Trader } from '../../../models/Trader';
import traderService from '../../../services/traderService';
import type { Exporter } from '../../../models/Exporter';
import exporterService from '../../../services/exporterService';
import type { Shipper } from '../../../models/Shipper';
import shipperService from '../../../services/shipperService';
import type { Product } from '../../../models/Product';
import productService from '../../../services/productService';
import type { Region } from '../../../models/Region';
import regionService from '../../../services/regionService';
import type { City } from '../../../models/City';
import cityService from '../../../services/cityService';
import type { OperationType } from '../../../models/OperationType';
import operationTypeService from '../../../services/operationTypeService';
import type { CargoType } from '../../../models/CargoType';
import cargoTypeService from '../../../services/cargoTypeService';
import type { PackingType } from '../../../models/PackingType';
import packingTypeService from '../../../services/packingTypeService';

type FieldMeta = {
  name: string;
  label?: string;
  default_value?: unknown;
  visible?: boolean;
  required?: boolean;
  field_type?: string | null;
};

type Props = {
  serviceTypeId?: string | null;
  fields?: FieldMeta[];
  register?: UseFormRegister<Record<string, unknown>>;
  control?: Control<Record<string, unknown>>;
  errors?: FieldErrors<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;

};

// explicit calendar change event type for primereact Calendar
type CalendarChangeEvent = { value?: Date | Date[] | null };

export default function GeneralDataSection({ serviceTypeId, fields = [], register, control, errors = {} }: Props) {
  const { t } = useTranslation('new_service_order');
  const [subsSuggestions, setSubsSuggestions] = useState<Subsidiary[]>([]);
  const [businessUnitSuggestions, setBusinessUnitSuggestions] = useState<BusinessUnit[]>([]);
  const [clientSuggestions, setClientSuggestions] = useState<Client[]>([]);
  const [currencySuggestions, setCurrencySuggestions] = useState<Currency[]>([]);
  const [traderSuggestions, setTraderSuggestions] = useState<Trader[]>([]);
  const [exporterSuggestions, setExporterSuggestions] = useState<Exporter[]>([]);
  const [shipperSuggestions, setShipperSuggestions] = useState<Shipper[]>([]);
  const [productSuggestions, setProductSuggestions] = useState<Product[]>([]);
  const [regionSuggestions, setRegionSuggestions] = useState<Region[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [operationTypeSuggestions, setOperationTypeSuggestions] = useState<OperationType[]>([]);
  const [cargoTypeSuggestions, setCargoTypeSuggestions] = useState<CargoType[]>([]);
  const [packingTypeSuggestions, setPackingTypeSuggestions] = useState<PackingType[]>([]);

  const [subsCache, setSubsCache] = useState<Record<string, Subsidiary>>({});
  const [businessUnitCache, setBusinessUnitCache] = useState<Record<string, BusinessUnit>>({});
  const [clientCache, setClientCache] = useState<Record<string, Client>>({});
  const [currencyCache, setCurrencyCache] = useState<Record<string, Currency>>({});
  const [traderCache, setTraderCache] = useState<Record<string, Trader>>({});
  const [exporterCache, setExporterCache] = useState<Record<string, Exporter>>({});
  const [shipperCache, setShipperCache] = useState<Record<string, Shipper>>({});
  const [productCache, setProductCache] = useState<Record<string, Product>>({});
  const [regionCache, setRegionCache] = useState<Record<string, Region>>({});
  const [cityCache, setCityCache] = useState<Record<string, City>>({});
  const [operationTypeCache, setOperationTypeCache] = useState<Record<string, OperationType>>({});
  const [cargoTypeCache, setCargoTypeCache] = useState<Record<string, CargoType>>({});
  const [packingTypeCache, setPackingTypeCache] = useState<Record<string, PackingType>>({});

  const qc = useQueryClient();
  
  // form control is expected to be provided by the parent form (we rely on that convention)
  const watchedSubsId = useWatch({ control, name: 'subsidiary_id' }) as string | undefined;
  const watchedBUsId = useWatch({ control, name: 'business_unit_id' }) as string | undefined;
  const watchedClientId = useWatch({ control, name: 'client_id' }) as string | undefined;
  const watchedCurrencyId = useWatch({ control, name: 'currency_id' }) as string | undefined;
  const watchedTraderId = useWatch({ control, name: 'trader_id' }) as string | undefined;
  const watchedExporterId = useWatch({ control, name: 'exporter_id' }) as string | undefined;
  const watchedShipperId = useWatch({ control, name: 'shipper_id' }) as string | undefined;
  const watchedProductId = useWatch({ control, name: 'product_id' }) as string | undefined;
  const watchedRegionId = useWatch({ control, name: 'region_id' }) as string | undefined;
  const watchedCityId = useWatch({ control, name: 'city_id' }) as string | undefined;
  const watchedOperationTypeId = useWatch({ control, name: 'operation_type_id' }) as string | undefined;
  const watchedCargoId = useWatch({ control, name: 'cargo_id' }) as string | undefined;
  const watchedPackingTypeId = useWatch({ control, name: 'packing_type_id' }) as string | undefined;

  const { data: selectedSubs } = useQuery({ 
    queryKey: ['subsidiary', watchedSubsId], 
    queryFn: () => subsidiaryService.get(watchedSubsId as string), 
    enabled: !!watchedSubsId, 
    staleTime: 1000 * 60 * 5 
  });

  const { data: selectedBusinessUnit } = useQuery({ 
    queryKey: ['businessUnit', watchedBUsId], 
    queryFn: () => businessUnitService.get(watchedBUsId as string), 
    enabled: !!watchedBUsId, 
    staleTime: 1000 * 60 * 5 
  });

  const { data: selectedClient } = useQuery({ 
    queryKey: ['client', watchedClientId], 
    queryFn: () => clientService.get(watchedClientId as string), 
    enabled: !!watchedClientId, 
    staleTime: 1000 * 60 * 5 
  });

  const { data: selectedCurrency } = useQuery({ 
    queryKey: ['currency', watchedCurrencyId], 
    queryFn: () => currencyService.get(watchedCurrencyId as string), 
    enabled: !!watchedCurrencyId, 
    staleTime: 1000 * 60 * 5 
  });

  const { data: selectedTrader } = useQuery({ 
    queryKey: ['trader', watchedTraderId], 
    queryFn: () => traderService.get(watchedTraderId as string), 
    enabled: !!watchedTraderId, 
    staleTime: 1000 * 60 * 5 
  });

  const { data: selectedExporter } = useQuery({ 
    queryKey: ['exporter', watchedExporterId], 
    queryFn: () => exporterService.get(watchedExporterId as string), 
    enabled: !!watchedExporterId, 
    staleTime: 1000 * 60 * 5 
  });

  const { data: selectedShipper } = useQuery({ 
    queryKey: ['shipper', watchedShipperId], 
    queryFn: () => shipperService.get(watchedShipperId as string), 
    enabled: !!watchedShipperId, 
    staleTime: 1000 * 60 * 5 
  });

  const { data: selectedProduct } = useQuery({ 
    queryKey: ['product', watchedProductId], 
    queryFn: () => productService.get(watchedProductId as string), 
    enabled: !!watchedProductId, 
    staleTime: 1000 * 60 * 5 
  });

  const { data: selectedRegion } = useQuery({ 
    queryKey: ['region', watchedRegionId], 
    queryFn: () => regionService.get(watchedRegionId as string), 
    enabled: !!watchedRegionId, 
    staleTime: 1000 * 60 * 5 
  });

  const { data: selectedCity } = useQuery({ 
    queryKey: ['city', watchedCityId], 
    queryFn: () => cityService.get(watchedCityId as string), 
    enabled: !!watchedCityId, 
    staleTime: 1000 * 60 * 5 
  });

  const { data: selectedOperationType } = useQuery({ 
    queryKey: ['operationType', watchedOperationTypeId], 
    queryFn: () => operationTypeService.get(watchedOperationTypeId as string), 
    enabled: !!watchedOperationTypeId, 
    staleTime: 1000 * 60 * 5 
  });

  const { data: selectedCargoType } = useQuery({ 
    queryKey: ['cargoType', watchedCargoId], 
    queryFn: () => cargoTypeService.get(watchedCargoId as string), 
    enabled: !!watchedCargoId, 
    staleTime: 1000 * 60 * 5 
  });

  const { data: selectedPackingType } = useQuery({ 
    queryKey: ['packingType', watchedPackingTypeId], 
    queryFn: () => packingTypeService.get(watchedPackingTypeId as string), 
    enabled: !!watchedPackingTypeId, 
    staleTime: 1000 * 60 * 5 
  });

  // AutoComplete methods for each entity (typed)
  function createAutoCompleteHandler<T extends { id?: string }>(
    service: CrudService<T>,
    setSuggestions: Dispatch<SetStateAction<T[]>>,
    setCache: Dispatch<SetStateAction<Record<string, T>>>,
    cacheKey: string,
  ) {
    return async (event: { query: string }) => {
      const q = event.query;
      try {
  const res = await service.list({ per_page: 20, filters: { name: q } });
        const items = normalizeListResponse<T>(res);
        setSuggestions(items ?? []);
        const map: Record<string, T> = {};
        (items ?? []).forEach((it) => {
          if (it?.id) {
            map[it.id as string] = it as T;
            qc.setQueryData([cacheKey, it.id], it);
          }
        });
        setCache((prev) => ({ ...prev, ...map }));
      } catch {
        setSuggestions([]);
      }
    };
  }

  // using shared normalizeListResponse imported from utils

  const onSubsComplete = createAutoCompleteHandler(subsidiaryService, setSubsSuggestions, setSubsCache, 'subsidiary');
  // business unit uses the generic createAutoCompleteHandler
  const onClientComplete = createAutoCompleteHandler(clientService, setClientSuggestions, setClientCache, 'client');
  const onCurrencyComplete = createAutoCompleteHandler(currencyService, setCurrencySuggestions, setCurrencyCache, 'currency');
  const onTraderComplete = createAutoCompleteHandler(traderService, setTraderSuggestions, setTraderCache, 'trader');
  const onExporterComplete = createAutoCompleteHandler(exporterService, setExporterSuggestions, setExporterCache, 'exporter');
  const onShipperComplete = createAutoCompleteHandler(shipperService, setShipperSuggestions, setShipperCache, 'shipper');
  const onProductComplete = createAutoCompleteHandler(productService, setProductSuggestions, setProductCache, 'product');
  const onRegionComplete = createAutoCompleteHandler(regionService, setRegionSuggestions, setRegionCache, 'region');
  const onOperationTypeComplete = createAutoCompleteHandler(operationTypeService, setOperationTypeSuggestions, setOperationTypeCache, 'operationType');
  const onCargoTypeComplete = createAutoCompleteHandler(cargoTypeService, setCargoTypeSuggestions, setCargoTypeCache, 'cargoType');
  const onPackingTypeComplete = createAutoCompleteHandler(packingTypeService, setPackingTypeSuggestions, setPackingTypeCache, 'packingType');

  // Special handler for cities with region dependency
  const onCityComplete = async (event: { query: string }) => {
    const q = event.query;
    const regionId = watchedRegionId;
    try {
      const filters: Record<string, string | number | undefined> = { name: q };
      if (regionId) filters.region_id = regionId;
  const res = await cityService.list({ per_page: 20, filters });
      const items = normalizeListResponse<City>(res);
      setCitySuggestions(items ?? []);
      const map: Record<string, City> = {};
      (items ?? []).forEach((it) => { 
        if (it?.id) { 
          map[it.id] = it; 
          qc.setQueryData(['city', it.id], it); 
        } 
      });
      setCityCache((prev) => ({ ...prev, ...map }));
    } catch {
      setCitySuggestions([]);
    }
  };

  const onBusinessUnitComplete = createAutoCompleteHandler(businessUnitService, setBusinessUnitSuggestions, setBusinessUnitCache, 'businessUnit');

  const metaFor = (name: string) => fields.find((f) => f.name === name) as FieldMeta | undefined;
  const showIfVisible = (name: string) => !!(metaFor(name) && metaFor(name)?.visible === true);
  const isRequired = (name: string) => !!(metaFor(name) && metaFor(name)?.required === true);

  // Helper: preserve precedence for an explicitly selected item, then delegate to shared resolver
  const getAutoCompleteValue = <T extends { id?: string }>(selectedData: T | undefined | null, suggestions: T[], cache: Record<string, T> | undefined, fieldValue: unknown) => {
    if (selectedData) return selectedData as T;
    return resolveAutoCompleteValue<T>(suggestions, cache, fieldValue) as T | undefined;
  };

  // Adapter to convert React setState setter into the SetCacheFn expected by makeAutoCompleteOnChange
  const wrapSetCache = <T extends { id?: string }>(setter?: React.Dispatch<React.SetStateAction<Record<string, T>>> | undefined) =>
    setter ? ((updater: (prev: Record<string, T>) => Record<string, T>) => setter((prev) => updater(prev))) : undefined;

  // Factory to quickly create onChange handlers for AutoComplete fields using the shared helper
  const makeOnChange = <T extends { id?: string }>(setter: React.Dispatch<React.SetStateAction<Record<string, T>>> | undefined, cacheKey: string, objectFieldKey?: string) =>
    makeAutoCompleteOnChange<T>({ setCache: wrapSetCache(setter), cacheKey, qc, objectFieldKey, setFormValue: undefined });

  return (
    <Card>
      <div className="mb-4 text-center">
        <div className="inline-block w-full px-4 py-1 border border-teal-100 rounded-md bg-teal-50">
          <h3 className="text-lg font-semibold text-teal-700">Dados Gerais</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        
        {/* Campos existentes mantidos */}
        {/* ID */}
        {showIfVisible('id') && (
          <div>
            <label className="block mb-1">ID {isRequired('id') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="id"
                render={({ field }) => (
                  <InputText
                    className="w-full"
                    disabled
                    value={(field.value as unknown as string) ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                  />
                )}
              />
            ) : (
              <InputText className="w-full" disabled {...(register ? register('id') : {})} />
            )}
            {errors && errors['id'] && <small className="p-error">{getErrorMessage(errors, 'id')}</small>}
          </div>
        )}

        {/* Nomination date */}
        {showIfVisible('nomination_date') && (
          <div>
            <label className="block mb-1">{t("new_service_order:nomination_date")}</label>
            <Controller
              control={control}
              name="nomination_date"
              render={({ field }) => (
                <Calendar
                  className="w-full"
                  value={field.value as Date | undefined}
                  onChange={(e: CalendarChangeEvent) => field.onChange(e?.value ?? null)}
                />
              )}
            />
          </div>
        )}

        {/* Subsidiary ID */}
        {showIfVisible('subsidiary_id') && (
          <div>
            <label className="block mb-1">Subsidiária {isRequired('subsidiary_id') ? '*' : ''}</label>
            <Controller
              control={control}
              name="subsidiary_id"
              render={({ field }) => (
                <AutoComplete
                  value={getAutoCompleteValue(selectedSubs, subsSuggestions, subsCache, field.value)}
                  suggestions={subsSuggestions}
                  field="name"
                  completeMethod={onSubsComplete}
                  onChange={makeOnChange<Subsidiary>(setSubsCache, 'subsidiary')(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {errors && errors['subsidiary_id'] && <small className="p-error">{getErrorMessage(errors, 'subsidiary_id')}</small>}
          </div>
        )}

        {/* Business Unit ID */}
        {showIfVisible('business_unit_id') && (
          <div>
            <label className="block mb-1">{t("new_service_order:business_unit")} {isRequired('business_unit_id') ? '*' : ''}</label>
            <Controller
              control={control}
              name="business_unit_id"
              render={({ field }) => (
                <AutoComplete
                  value={getAutoCompleteValue(selectedBusinessUnit, businessUnitSuggestions, businessUnitCache, field.value)}
                  suggestions={businessUnitSuggestions}
                  field="name"
                  completeMethod={onBusinessUnitComplete}
                  minLength={1}
                  delay={250}
                  onChange={makeOnChange<BusinessUnit>(setBusinessUnitCache, 'businessUnit')(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {errors && errors['business_unit_id'] && <small className="p-error">{getErrorMessage(errors, 'business_unit_id')}</small>}
          </div>
        )}

        {/* NOVOS CAMPOS ADICIONADOS */}

        {/* Client ID */}
        {showIfVisible('client_id') && (
          <div>
            <label className="block mb-1">{t("new_service_order:client")} {isRequired('client_id') ? '*' : ''}</label>
            <Controller
              control={control}
              name="client_id"
              render={({ field }) => (
                <AutoComplete
                  value={getAutoCompleteValue(selectedClient, clientSuggestions, clientCache, field.value)}
                  suggestions={clientSuggestions}
                  field="name"
                  completeMethod={onClientComplete}
                  onChange={makeOnChange<Client>(setClientCache, 'client')(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {errors && errors['client_id'] && <small className="p-error">{getErrorMessage(errors, 'client_id')}</small>}
          </div>
        )}

        {/* Order Identifier */}
        {showIfVisible('order_identifier') && (
          <div>
            <label className="block mb-1">{t("new_service_order:order_identifier")} {isRequired('order_identifier') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="order_identifier"
                render={({ field }) => (
                  <InputText
                    className="w-full"
                    value={(field.value as unknown as string) ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                  />
                )}
              />
            ) : (
              <InputText className="w-full" {...(register ? register('order_identifier') : {})} />
            )}
            {errors && errors['order_identifier'] && <small className="p-error">{getErrorMessage(errors, 'order_identifier')}</small>}
          </div>
        )}

        {/* Currency ID */}
        {showIfVisible('currency_id') && (
          <div>
            <label className="block mb-1">{t("new_service_order:currency")} {isRequired('currency_id') ? '*' : ''}</label>
            <Controller
              control={control}
              name="currency_id"
              render={({ field }) => (
                <AutoComplete
                  value={getAutoCompleteValue(selectedCurrency, currencySuggestions, currencyCache, field.value)}
                  suggestions={currencySuggestions}
                  field="name"
                  completeMethod={onCurrencyComplete}
                  onChange={makeOnChange<Currency>(setCurrencyCache, 'currency')(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {errors && errors['currency_id'] && <small className="p-error">{getErrorMessage(errors, 'currency_id')}</small>}
          </div>
        )}

        {/* OS Number */}
        {showIfVisible('number') && (
          <div>
            <label className="block mb-1">{t("new_service_order:os_number")} {isRequired('number') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="number"
                render={({ field }) => (
                  <InputText
                    className="w-full"
                    disabled
                    value={(field.value as unknown as string) ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                  />
                )}
              />
            ) : (
              <InputText className="w-full" disabled {...(register ? register('number') : {})} />
            )}
            {errors && errors['number'] && <small className="p-error">{getErrorMessage(errors, 'number')}</small>}
          </div>
        )}

        {/* Reference Number */}
        {showIfVisible('ref_number') && (
          <div>
            <label className="block mb-1">{t("new_service_order:ref_number")} {isRequired('ref_number') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="ref_number"
                render={({ field }) => (
                  <InputText
                    className="w-full"
                    value={(field.value as unknown as string) ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                  />
                )}
              />
            ) : (
              <InputText className="w-full" {...(register ? register('ref_number') : {})} />
            )}
            {errors && errors['ref_number'] && <small className="p-error">{getErrorMessage(errors, 'ref_number')}</small>}
          </div>
        )}

        {/* Client Reference Number */}
        {showIfVisible('client_ref_number') && (
          <div>
            <label className="block mb-1">{t("new_service_order:client_ref_number")} {isRequired('client_ref_number') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="client_ref_number"
                render={({ field }) => (
                  <InputText
                    className="w-full"
                    value={(field.value as unknown as string) ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                  />
                )}
              />
            ) : (
              <InputText className="w-full" {...(register ? register('client_ref_number') : {})} />
            )}
            {errors && errors['client_ref_number'] && <small className="p-error">{getErrorMessage(errors, 'client_ref_number')}</small>}
          </div>
        )}

        {/* Invoice Number */}
        {showIfVisible('invoice_number') && (
          <div>
            <label className="block mb-1">{t("new_service_order:invoice_number")} {isRequired('invoice_number') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="invoice_number"
                render={({ field }) => (
                  <InputText
                    className="w-full"
                    value={(field.value as unknown as string) ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                  />
                )}
              />
            ) : (
              <InputText className="w-full" {...(register ? register('invoice_number') : {})} />
            )}
            {errors && errors['invoice_number'] && <small className="p-error">{getErrorMessage(errors, 'invoice_number')}</small>}
          </div>
        )}

        {/* Invoice Value */}
        {showIfVisible('invoice_value') && (
          <div>
            <label className="block mb-1">{t("new_service_order:invoice_value")} {isRequired('invoice_value') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="invoice_value"
                render={({ field }) => (
                  <InputNumber
                    className="w-full"
                    value={field.value as number | undefined}
                    onValueChange={(e) => field.onChange(e.value as number)}
                    mode="decimal"
                    minFractionDigits={2}
                    maxFractionDigits={2}
                  />
                )}
              />
            ) : null}
            {errors && errors['invoice_value'] && <small className="p-error">{getErrorMessage(errors, 'invoice_value')}</small>}
          </div>
        )}

        {/* Client Invoice Number */}
        {showIfVisible('client_invoice_number') && (
          <div>
            <label className="block mb-1">{t("new_service_order:client_invoice_number")} {isRequired('client_invoice_number') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="client_invoice_number"
                render={({ field }) => (
                  <InputText
                    className="w-full"
                    value={(field.value as unknown as string) ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                  />
                )}
              />
            ) : (
              <InputText className="w-full" {...(register ? register('client_invoice_number') : {})} />
            )}
            {errors && errors['client_invoice_number'] && <small className="p-error">{getErrorMessage(errors, 'client_invoice_number')}</small>}
          </div>
        )}

        {/* Product ID */}
        {showIfVisible('product_id') && (
          <div>
            <label className="block mb-1">{t("new_service_order:product")} {isRequired('product_id') ? '*' : ''}</label>
            <Controller
              control={control}
              name="product_id"
              render={({ field }) => (
                <AutoComplete
                  value={getAutoCompleteValue(selectedProduct, productSuggestions, productCache, field.value)}
                  suggestions={productSuggestions}
                  field="name"
                  completeMethod={onProductComplete}
                  onChange={makeOnChange<Product>(setProductCache, 'product')(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {errors && errors['product_id'] && <small className="p-error">{getErrorMessage(errors, 'product_id')}</small>}
          </div>
        )}

        {/* Quantity Products */}
        {showIfVisible('qtd_products') && (
          <div>
            <label className="block mb-1">{t("new_service_order:qtd_products")} {isRequired('qtd_products') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="qtd_products"
                render={({ field }) => (
                  <InputNumber
                    className="w-full"
                    value={field.value as number | undefined}
                    onValueChange={(e) => field.onChange(e.value as number)}
                    showButtons
                    mode="decimal"
                    min={0}
                  />
                )}
              />
            ) : null}
            {errors && errors['qtd_products'] && <small className="p-error">{getErrorMessage(errors, 'qtd_products')}</small>}
          </div>
        )}

        {/* Trader ID */}
        {showIfVisible('trader_id') && (
          <div>
            <label className="block mb-1">{t("new_service_order:trader")} {isRequired('trader_id') ? '*' : ''}</label>
            <Controller
              control={control}
              name="trader_id"
              render={({ field }) => (
                <AutoComplete
                  value={getAutoCompleteValue(selectedTrader, traderSuggestions, traderCache, field.value)}
                  suggestions={traderSuggestions}
                  field="name"
                  completeMethod={onTraderComplete}
                  onChange={makeOnChange<Trader>(setTraderCache, 'trader')(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {errors && errors['trader_id'] && <small className="p-error">{getErrorMessage(errors, 'trader_id')}</small>}
          </div>
        )}

        {/* Exporter ID */}
        {showIfVisible('exporter_id') && (
          <div>
            <label className="block mb-1">{t("new_service_order:exporter")} {isRequired('exporter_id') ? '*' : ''}</label>
            <Controller
              control={control}
              name="exporter_id"
              render={({ field }) => (
                <AutoComplete
                  value={getAutoCompleteValue(selectedExporter, exporterSuggestions, exporterCache, field.value)}
                  suggestions={exporterSuggestions}
                  field="name"
                  completeMethod={onExporterComplete}
                  onChange={makeOnChange<Exporter>(setExporterCache, 'exporter')(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {errors && errors['exporter_id'] && <small className="p-error">{getErrorMessage(errors, 'exporter_id')}</small>}
          </div>
        )}

        {/* Shipper ID */}
        {showIfVisible('shipper_id') && (
          <div>
            <label className="block mb-1">{t("new_service_order:shipper")} {isRequired('shipper_id') ? '*' : ''}</label>
            <Controller
              control={control}
              name="shipper_id"
              render={({ field }) => (
                <AutoComplete
                  value={getAutoCompleteValue(selectedShipper, shipperSuggestions, shipperCache, field.value)}
                  suggestions={shipperSuggestions}
                  field="name"
                  completeMethod={onShipperComplete}
                  onChange={makeOnChange<Shipper>(setShipperCache, 'shipper')(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {errors && errors['shipper_id'] && <small className="p-error">{getErrorMessage(errors, 'shipper_id')}</small>}
          </div>
        )}

        {/* Vessel Name */}
        {showIfVisible('vessel_name') && (
          <div>
            <label className="block mb-1">{t("new_service_order:vessel_name")} {isRequired('vessel_name') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="vessel_name"
                render={({ field }) => (
                  <InputText
                    className="w-full"
                    value={(field.value as unknown as string) ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                  />
                )}
              />
            ) : (
              <InputText className="w-full" {...(register ? register('vessel_name') : {})} />
            )}
            {errors && errors['vessel_name'] && <small className="p-error">{getErrorMessage(errors, 'vessel_name')}</small>}
          </div>
        )}

        {/* Container Number */}
        {showIfVisible('container_number') && (
          <div>
            <label className="block mb-1">{t("new_service_order:container_number")} {isRequired('container_number') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="container_number"
                render={({ field }) => (
                  <InputText
                    className="w-full"
                    value={(field.value as unknown as string) ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                  />
                )}
              />
            ) : (
              <InputText className="w-full" {...(register ? register('container_number') : {})} />
            )}
            {errors && errors['container_number'] && <small className="p-error">{getErrorMessage(errors, 'container_number')}</small>}
          </div>
        )}

        {/* Booking Number */}
        {showIfVisible('booking_number') && (
          <div>
            <label className="block mb-1">{t("new_service_order:booking_number")} {isRequired('booking_number') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="booking_number"
                render={({ field }) => (
                  <InputText
                    className="w-full"
                    value={(field.value as unknown as string) ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                  />
                )}
              />
            ) : (
              <InputText className="w-full" {...(register ? register('booking_number') : {})} />
            )}
            {errors && errors['booking_number'] && <small className="p-error">{getErrorMessage(errors, 'booking_number')}</small>}
          </div>
        )}

        {/* Contract Number */}
        {showIfVisible('contract_number') && (
          <div>
            <label className="block mb-1">{t("new_service_order:contract_number")} {isRequired('contract_number') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="contract_number"
                render={({ field }) => (
                  <InputText
                    className="w-full"
                    value={(field.value as unknown as string) ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                  />
                )}
              />
            ) : (
              <InputText className="w-full" {...(register ? register('contract_number') : {})} />
            )}
            {errors && errors['contract_number'] && <small className="p-error">{getErrorMessage(errors, 'contract_number')}</small>}
          </div>
        )}

        {/* Harvest */}
        {showIfVisible('harvest') && (
          <div>
            <label className="block mb-1">{t("new_service_order:harvest")} {isRequired('harvest') ? '*' : ''}</label>
            {control ? (
              <Controller
                control={control}
                name="harvest"
                render={({ field }) => (
                  <InputText
                    className="w-full"
                    value={(field.value as unknown as string) ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                  />
                )}
              />
            ) : (
              <InputText className="w-full" {...(register ? register('harvest') : {})} />
            )}
            {errors && errors['harvest'] && <small className="p-error">{getErrorMessage(errors, 'harvest')}</small>}
          </div>
        )}

        {/* Region ID */}
        {showIfVisible('region_id') && (
          <div>
            <label className="block mb-1">{t("new_service_order:region")} {isRequired('region_id') ? '*' : ''}</label>
            <Controller
              control={control}
              name="region_id"
              render={({ field }) => (
                <AutoComplete
                  value={getAutoCompleteValue(selectedRegion, regionSuggestions, regionCache, field.value)}
                  suggestions={regionSuggestions}
                  field="name"
                  completeMethod={onRegionComplete}
                  onChange={makeOnChange<Region>(setRegionCache, 'region')(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {errors && errors['region_id'] && <small className="p-error">{getErrorMessage(errors, 'region_id')}</small>}
          </div>
        )}

        {/* City ID */}
        {showIfVisible('city_id') && (
          <div>
            <label className="block mb-1">{t("new_service_order:city")} {isRequired('city_id') ? '*' : ''}</label>
            <Controller
              control={control}
              name="city_id"
              render={({ field }) => (
                <AutoComplete
                  value={getAutoCompleteValue(selectedCity, citySuggestions, cityCache, field.value)}
                  suggestions={citySuggestions}
                  field="name"
                  completeMethod={onCityComplete}
                  onChange={makeOnChange<City>(setCityCache, 'city')(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {errors && errors['city_id'] && <small className="p-error">{getErrorMessage(errors, 'city_id')}</small>}
          </div>
        )}

        {/* Operation Type ID */}
        {showIfVisible('operation_type_id') && (
          <div>
            <label className="block mb-1">{t("new_service_order:operation_type")} {isRequired('operation_type_id') ? '*' : ''}</label>
            <Controller
              control={control}
              name="operation_type_id"
              render={({ field }) => (
                <AutoComplete
                  value={getAutoCompleteValue(selectedOperationType, operationTypeSuggestions, operationTypeCache, field.value)}
                  suggestions={operationTypeSuggestions}
                  field="name"
                  completeMethod={onOperationTypeComplete}
                  onChange={makeOnChange<OperationType>(setOperationTypeCache, 'operationType')(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {errors && errors['operation_type_id'] && <small className="p-error">{getErrorMessage(errors, 'operation_type_id')}</small>}
          </div>
        )}

        {/* Cargo Type ID */}
        {showIfVisible('cargo_id') && (
          <div>
            <label className="block mb-1">{t("new_service_order:cargo_type")} {isRequired('cargo_id') ? '*' : ''}</label>
            <Controller
              control={control}
              name="cargo_id"
              render={({ field }) => (
                <AutoComplete
                  value={getAutoCompleteValue(selectedCargoType, cargoTypeSuggestions, cargoTypeCache, field.value)}
                  suggestions={cargoTypeSuggestions}
                  field="name"
                  completeMethod={onCargoTypeComplete}
                  onChange={makeOnChange<CargoType>(setCargoTypeCache, 'cargoType')(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {errors && errors['cargo_id'] && <small className="p-error">{getErrorMessage(errors, 'cargo_id')}</small>}
          </div>
        )}

        {/* Packing Type ID */}
        {showIfVisible('packing_type_id') && (
          <div>
            <label className="block mb-1">{t("new_service_order:packing_type")} {isRequired('packing_type_id') ? '*' : ''}</label>
            <Controller
              control={control}
              name="packing_type_id"
              render={({ field }) => (
                <AutoComplete
                  value={getAutoCompleteValue(selectedPackingType, packingTypeSuggestions, packingTypeCache, field.value)}
                  suggestions={packingTypeSuggestions}
                  field="name"
                  completeMethod={onPackingTypeComplete}
                  onChange={makeOnChange<PackingType>(setPackingTypeCache, 'packingType')(field.onChange)}
                  dropdown
                  className="w-full"
                />
              )}
            />
            {errors && errors['packing_type_id'] && <small className="p-error">{getErrorMessage(errors, 'packing_type_id')}</small>}
          </div>
        )}

      </div>

      {/* Comments Field */}
      {showIfVisible('comments') && (
        <div className="mt-6">
          <label className="block mb-1">{t("new_service_order:comments")} {isRequired('comments') ? '*' : ''}</label>
          {control ? (
            <Controller
              control={control}
              name="comments"
              render={({ field }) => (
                <InputTextarea
                  className="w-full h-[150px]"
                  value={(field.value as unknown as string) ?? ''}
                  onChange={(e) => field.onChange((e.target as HTMLTextAreaElement).value)}
                  placeholder="Ex: Container/Caminhão, observações..."
                />
              )}
            />
          ) : (
            <InputTextarea 
              className="w-full h-[150px]" 
              {...(register ? register('comments') : {})} 
              placeholder="Ex: Container/Caminhão, observações..."
            />
          )}
          {errors && errors['comments'] && <small className="p-error">{getErrorMessage(errors, 'comments')}</small>}
        </div>
      )}

      <div className="invisible mt-4 text-sm text-muted">Tipo de serviço: {serviceTypeId ?? '—'}</div>
    </Card>
  );
}

function getErrorMessage(errors: Record<string, unknown> | undefined, name: string) {
  if (!errors) return '';
  const e = errors[name] as unknown;
  if (e && typeof e === 'object' && 'message' in (e as Record<string, unknown>)) {
    const m = (e as Record<string, unknown>).message;
    return typeof m === 'string' ? m : '';
  }
  return '';
}