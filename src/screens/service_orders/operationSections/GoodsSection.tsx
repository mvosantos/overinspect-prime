/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ApiPaginatedResponse } from '../../../models/apiTypes';
import type { GoodOperation } from '../../../models/service_order/goods/GoodOperation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FormListSection from '../../../components/FormListSection';
import { Toast } from 'primereact/toast';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import operationGoodService from '../../../services/operationGoodService';
import GoodsItemForm from './GoodsItemForm';

type Props = {
  currentOrderId?: string | null;
  selectedServiceTypeId?: string | null;
  fieldConfigs?: Record<string, { name: string; visible?: boolean; required?: boolean; default_value?: unknown } | undefined>;
};



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

  // fieldConfigs are passed down to the item form component; no need to expand here

  // helper to open/close all is handled by FormListSection
  
  // helper to open/close all is handled by FormListSection

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <FormListSection
        title=''
        items={items}
        total={total}
        page={page}
        perPage={perPage}
        setPage={setPage}
        search={search}
        setSearch={setSearch}
        creatingNew={creatingNew}
        setCreatingNew={(b: boolean) => {
          setCreatingNew(b);
          if (b) {
            const next = Array.isArray(activeIndexes) ? [0, ...activeIndexes] : [0];
            setActiveIndexes(next);
          }
        }}
        activeIndexes={activeIndexes}
        setActiveIndexes={setActiveIndexes}
        parentEnableEditing={parentEnableEditing}
        renderItem={({ item, isNew }) => (
          <GoodsItemForm
            item={item}
            isNew={isNew}
            fieldConfigs={fieldConfigs}
            parentStatus={parentStatus}
            createMutation={createMutation}
            updateMutation={updateMutation}
            deleteMutation={deleteMutation}
            currentOrderId={currentOrderId}
            setCreatingNew={setCreatingNew}
            toastRef={toast}
            t={t}
          />
        )}
      />
    </div>
  );
}