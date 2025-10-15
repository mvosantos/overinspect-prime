import { useTheme } from '../hooks/useTheme';
import { useSave } from '../contexts/SaveContext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import serviceOrderStatusService from '../services/serviceOrderStatusService';
import serviceOrderService from '../services/serviceOrderService';
import type { ServiceOrder } from '../models/serviceOrder';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type Target = { target_status?: { id?: string; name?: string; comment_required?: boolean } };

type Props = {
  onSaveClick?: () => void;
  label?: string;
  currentOrderId?: string | null;
  currentStatusId?: string | null;
  onStatusMetaChange?: (meta: { enable_attach?: boolean | null; enable_editing?: boolean | null } | null) => void;
};

export default function PageFooter({ onSaveClick, label = 'Salvar', currentOrderId = null, currentStatusId = null, onStatusMetaChange }: Props) {
  const { theme } = useTheme();
  const save = useSave();
  const toast = useRef<Toast | null>(null);

  // derive options directly from query results (no local state)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  // we'll derive loading from react-query
  const queryClient = useQueryClient();

  // read meta directly from context on each render; SaveProvider updates its context
  const meta = save.getMeta();

  const handleClick = () => {
    if (onSaveClick) return onSaveClick();
    save.triggerSave();
  };

  const isDisabled = !meta.isValid || meta.isSubmitting;


  // Derive the statusId to fetch targets for. Enrich the order with service_order_status
  // when the order lacks it by fetching the status metadata inside the order query.
  const orderQuery = useQuery({ queryKey: ['service-order', currentOrderId], queryFn: async () => {
    if (!currentOrderId) return null;
    const ord = await serviceOrderService.get(currentOrderId) as ServiceOrder | null;
    try {
      if (ord && typeof ord === 'object' && !ord.service_order_status && ord.service_order_status_id) {
        const statusMeta = await serviceOrderStatusService.get(ord.service_order_status_id as string);
        const sm = statusMeta as unknown;
        if (sm && typeof sm === 'object') {
          const smRec = sm as Record<string, unknown>;
          const sid = typeof smRec.id === 'string' ? smRec.id : undefined;
          const sname = typeof smRec.name === 'string' ? smRec.name : undefined;
          if (sid) {
            ord.service_order_status = { id: sid, name: sname ?? '' } as import('../models/serviceOrder').ServiceOrderStatus;
          }
        }
      }
    } catch {
      // ignore fetch errors — we still return the order even if enrichment fails
    }
    return ord;
  }, enabled: Boolean(currentOrderId) });

  const statusIdToFetch = currentStatusId ?? (orderQuery.data as ServiceOrder | null)?.service_order_status_id ?? null;

  const currentStatusName = (orderQuery.data as ServiceOrder | null)?.service_order_status?.name ?? 'Mudar status';

  const canEdit = ((orderQuery.data as ServiceOrder | null)?.service_order_status?.enable_editing ?? true) === true;

  // Query the targets for the given status id
  const targetsQuery = useQuery({ queryKey: ['service-order-status-targets', statusIdToFetch], queryFn: async () => {
    if (!statusIdToFetch) return [] as Target[];
    const data = await serviceOrderStatusService.get(statusIdToFetch);
    const fetched = Array.isArray((data as unknown as Record<string, unknown>)?.service_order_status_targets) ? (data as unknown as Record<string, unknown>).service_order_status_targets as Target[] : [];
    return fetched;
  }, enabled: Boolean(statusIdToFetch) });

  // derive targets and options directly from the query
  const targets = (targetsQuery.data ?? []) as Target[];
  const statusOptions = targets.map((t) => {
    const ts = (t as Record<string, unknown>).target_status as Record<string, unknown> | undefined;
    return { label: (ts?.name as string) ?? '—', value: (ts?.id as string) ?? '' };
  }).filter((o) => Boolean(o.value));

  // when user selects a status, open modal asking for comment
  useEffect(() => {
    if (selectedStatus) setModalVisible(true);
  }, [selectedStatus]);

  const requiresComment = (() => {
    if (!selectedStatus) return false;
    const found = targets.find((t) => ((t.target_status as Record<string, unknown>)?.id as string) === selectedStatus || (t.target_status as Record<string, unknown>)?.id === selectedStatus);
    return Boolean(found && ((found.target_status as Record<string, unknown>)?.comment_required ?? false));
  })();

  const handleCancel = () => {
    setSelectedStatus(null);
    setComment('');
    setModalVisible(false);
  };

  const mutation = useMutation({
    mutationFn: async ({ orderId, statusId, commentText }: { orderId: string; statusId: string; commentText?: string }) => {
      // fetch the order to include its service_type_id in the payload
      let serviceTypeId: string | undefined;
      try {
        const order = await serviceOrderService.get(orderId) as ServiceOrder | null;
        if (order && typeof order === 'object' && (order as ServiceOrder).service_type_id) serviceTypeId = (order as ServiceOrder).service_type_id as string;
      } catch {
        // if fetching fails, proceed without service_type_id
      }
      const payload: Record<string, unknown> = { service_order_id: orderId, service_order_status_id: statusId, service_order_status_comment: commentText };
      if (serviceTypeId) payload.service_type_id = serviceTypeId;
      return serviceOrderService.update(orderId, payload);
    },
    onSuccess: async () => {
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Status alterado' });
      if (currentOrderId) {
        void queryClient.invalidateQueries({ queryKey: ['service-order', currentOrderId] });
        void queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      }
      // After changing status, invalidate the targets query for the newly applied status
      try {
        if (selectedStatus) {
          void queryClient.invalidateQueries({ queryKey: ['service-order-status-targets', selectedStatus] });
        } else {
          void queryClient.invalidateQueries({ queryKey: ['service-order-status-targets'] });
        }
      } catch {
        // ignore
      }
      setModalVisible(false);
      setSelectedStatus(null);
      setComment('');
    },
    onError: () => {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível alterar o status' });
    },
  });

  const handleSaveStatus = async () => {
    if (!currentOrderId || !selectedStatus) return;
    // If comment is required for the selected target, enforce it and notify the user
    if (requiresComment && comment.trim().length === 0) {
      toast.current?.show({ severity: 'warn', summary: 'Comentário obrigatório', detail: 'Este status exige um comentário. Por favor, adicione um comentário antes de salvar.' });
      return;
    }
    await mutation.mutateAsync({ orderId: currentOrderId, statusId: selectedStatus, commentText: comment });
  };

  const showStatusDropdown = Boolean(currentOrderId && statusOptions.length > 0);
  // Show save button only when top-level enable_editing is explicitly true
  const showSaveButton = statusMeta?.enable_editing === true;

  const saveTooltip = !canEdit ? 'A solicitação de crédito não pode ser modificada' : (!meta.isValid ? 'O formulário contém erros' : undefined);

  return (
    <>
      <Toast ref={toast} position="top-right" />
      {/* Tooltip attached to the Save button; only shows when there's a message */}
      <Tooltip target=".pf-save-btn" position="left" appendTo={() => document.body} />
      <div className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between p-3 border-t ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2">
          {showStatusDropdown && (
            <Dropdown value={selectedStatus} options={statusOptions} onChange={(e) => setSelectedStatus(e.value)} placeholder={currentStatusName} className="w-48" disabled={targetsQuery.isLoading || meta.isSubmitting} />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <button type="button" data-pr-tooltip={saveTooltip} title={saveTooltip} aria-label={saveTooltip ?? 'Salvar'} className={`pf-save-btn p-button p-component p-button-primary ${meta.isSubmitting || !canEdit ? 'p-disabled' : ''}`} onClick={handleClick} disabled={isDisabled || !canEdit}>
              {meta.isSubmitting ? <i className="pi pi-spin pi-spinner" /> : <i className="pi pi-save" />}
              <span className="ml-2">{label}</span>
            </button>
            {/* tooltip via native title attribute; no inline text */}
          </div>
        </div>
      </div>

      <Dialog header="Mudar o status da Ordem de serviço" visible={modalVisible} style={{ width: '600px' }} onHide={handleCancel} breakpoints={{ '960px': '75vw', '640px': '100vw' }}>
        <div className="mb-4">
          <p className="mb-2">Deseja realmente mudar o status da ordem de serviço para <strong>{statusOptions.find(s => s.value === selectedStatus)?.label}</strong>?</p>
          <label className="block mb-2">Comentário sobre a mudança de status</label>
          <InputTextarea value={comment} onChange={(e) => setComment((e.target as HTMLTextAreaElement).value)} rows={6} className="w-full" />
        </div>
        <div className="flex justify-end gap-2">
          <Button label="Cancelar" className="p-button-secondary" onClick={handleCancel} disabled={mutation.status === 'pending'} />
          <Button label="Salvar" className="p-button-primary" onClick={handleSaveStatus} disabled={mutation.status === 'pending' || (requiresComment && comment.trim().length === 0)}>
            {mutation.status === 'pending' ? <i className="pi pi-spin pi-spinner" /> : null}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
