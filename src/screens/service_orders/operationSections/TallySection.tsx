/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ApiPaginatedResponse } from '../../../models/apiTypes';
import type { TallyOperation } from '../../../models/tallies/TallyOperation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FormListSection from '../../../components/FormListSection';
import { Toast } from 'primereact/toast';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import operationTallyService from '../../../services/operationTallyService';
import TallyItemForm from './TallyItemForm';

type Props = {
  currentOrderId?: string | null;
  selectedServiceTypeId?: string | null;
  fieldConfigs?: Record<string, { name: string; visible?: boolean; required?: boolean; default_value?: unknown } | undefined>;
};

export default function TallySection({ currentOrderId, fieldConfigs }: Props) {
  const qc = useQueryClient();
  const toast = useRef<Toast | null>(null);
  const { t } = useTranslation(['new_service_order', 'service_orders']);

  const parentForm = useFormContext();
  const parentStatus = (parentForm && typeof parentForm.getValues === 'function') ? (parentForm.getValues('service_order_status') as Record<string, unknown> | undefined) : undefined;
  const parentEnableEditing = parentStatus ? Boolean(parentStatus?.enable_editing ?? true) : true;

  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const storageSearchKey = (() => `tally_section:search:${currentOrderId ?? 'global'}`)();
  const [search, setSearchState] = useState<string>(() => {
    try { const raw = sessionStorage.getItem(storageSearchKey); if (raw != null) return String(JSON.parse(raw)); } catch { /* ignore */ }
    return '';
  });
  const setSearch = (s: string) => {
    try { sessionStorage.setItem(storageSearchKey, JSON.stringify(s)); } catch { /* ignore */ }
    setSearchState(s);
  };
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);
  const storageKey = (() => `tally_section:active_indexes:${currentOrderId ?? 'global'}`)();
  const [activeIndexes, setActiveIndexesState] = useState<number[] | number | null>(() => {
    try { const raw = sessionStorage.getItem(storageKey); if (!raw) return null; const parsed = JSON.parse(raw); return parsed ?? null; } catch { return null; }
  });
  const setActiveIndexes = useCallback((v: number[] | number | null) => {
    try { if (v == null) sessionStorage.removeItem(storageKey); else sessionStorage.setItem(storageKey, JSON.stringify(v)); } catch { /* ignore */ }
    setActiveIndexesState(v);
  }, [storageKey]);

  useEffect(() => { const id = setTimeout(() => setDebouncedSearch(search), 350); return () => clearTimeout(id); }, [search]);

  const queryKey = useMemo(() => ['operation-tallies', currentOrderId, page, perPage, debouncedSearch], [currentOrderId, page, perPage, debouncedSearch]);

  const { data, refetch } = useQuery<ApiPaginatedResponse<TallyOperation>, Error>({
    queryKey,
    queryFn: () => operationTallyService.list({ page, per_page: perPage, service_order_id: currentOrderId ?? undefined, plate_number: debouncedSearch } as any),
    enabled: Boolean(currentOrderId),
  // prevent implicit refetch on window focus/reconnect/mount which may happen before our debounced search is applied
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
  });

  const createMutation = useMutation<TallyOperation, Error, any>({ mutationFn: (payload: any) => operationTallyService.create(payload), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['operation-tallies', currentOrderId] } as any); void refetch(); } });
  const updateMutation = useMutation<TallyOperation, Error, { id: string; payload: any }>({ mutationFn: ({ id, payload }) => operationTallyService.update(id, payload), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['operation-tallies', currentOrderId] } as any); void refetch(); } });
  const deleteMutation = useMutation<void, Error, string>({ mutationFn: (id: string) => operationTallyService.remove(id), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['operation-tallies', currentOrderId] } as any); void refetch(); } });
  const deleteReadingMutation = useMutation<void, Error, string>({ mutationFn: (id: string) => operationTallyService.removeReading(id), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['operation-tallies', currentOrderId] } as any); void refetch(); } });

  const items = useMemo(() => ((data && Array.isArray((data as any).data)) ? (data as any).data : []), [data]);
  const total = useMemo(() => ((data && typeof (data as any).total === 'number') ? (data as any).total : 0), [data]);

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
          if (b) { const next = Array.isArray(activeIndexes) ? [0, ...activeIndexes] : [0]; setActiveIndexes(next); }
        }}
        activeIndexes={activeIndexes}
        setActiveIndexes={setActiveIndexes}
        parentEnableEditing={parentEnableEditing}
        titleForItem={(it) => {
          try {
            const rec = it as Record<string, any> | undefined;
            const plate = rec?.plate_number ?? rec?.plate ?? rec?.plateNumber;
            const dateRaw = rec?.date;
            let dateStr = '';
            if (dateRaw) {
              const d = (dateRaw instanceof Date) ? dateRaw : new Date(String(dateRaw));
              if (!Number.isNaN(d.getTime())) dateStr = ` — ${d.toLocaleString()}`;
            }
            return `${plate ?? '—'}${dateStr}`;
          } catch {
            return '—';
          }
        }}
        renderItem={({ item, isNew }) => (
          <TallyItemForm
            item={item}
            isNew={isNew}
            fieldConfigs={fieldConfigs}
            parentStatus={parentStatus}
            createMutation={createMutation}
            updateMutation={updateMutation}
            deleteMutation={deleteMutation}
            deleteReadingMutation={deleteReadingMutation}
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
