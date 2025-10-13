import { useTheme } from '../hooks/useTheme';
import { useSave } from '../contexts/SaveContext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { useEffect, useState } from 'react';
import serviceOrderStatusService from '../services/serviceOrderStatusService';
import serviceOrderService from '../services/serviceOrderService';
import type { ServiceOrder } from '../models/serviceOrder';
import { Toast } from 'primereact/toast';
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

  const [statusOptions, setStatusOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [fetchedTargets, setFetchedTargets] = useState<Target[]>([]);
  const [statusMeta, setStatusMeta] = useState<{ enable_attach?: boolean | null; enable_editing?: boolean | null } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingTargets, setLoadingTargets] = useState(false);
  const queryClient = useQueryClient();

  // read meta directly from context on each render; SaveProvider updates its context
  const meta = save.getMeta();

  const handleClick = () => {
    if (onSaveClick) return onSaveClick();
    save.triggerSave();
  };

  const isDisabled = !meta.isValid || meta.isSubmitting;

  // load current status record to find possible targets
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingTargets(true);
      try {
        let statusIdToUse: string | null = currentStatusId ?? null;
        // if we don't have currentStatusId but have an order id, fetch the order to derive it
        if (!statusIdToUse && currentOrderId) {
          try {
            const order = await serviceOrderService.get(currentOrderId) as ServiceOrder | null;
            if (order && typeof order === 'object' && order.service_order_status_id) statusIdToUse = order.service_order_status_id as string;
          } catch {
            // ignore
          }
        }
        if (!statusIdToUse) {
          setFetchedTargets([]);
          setStatusOptions([]);
          return;
        }
        const data = await serviceOrderStatusService.get(statusIdToUse);
  if (!mounted) return;
  const fetched = Array.isArray((data as unknown as Record<string, unknown>)?.service_order_status_targets) ? (data as unknown as Record<string, unknown>).service_order_status_targets as Target[] : [];
        // extract top-level status meta (enable_attach / enable_editing) if present
        try {
          const dm = data as Record<string, unknown> | null;
          const enableAttach = dm && 'enable_attach' in dm ? (dm?.enable_attach as boolean | undefined) : undefined;
          const enableEditing = dm && 'enable_editing' in dm ? (dm?.enable_editing as boolean | undefined) : undefined;
          const metaObj = { enable_attach: enableAttach ?? null, enable_editing: enableEditing ?? null } as { enable_attach?: boolean | null; enable_editing?: boolean | null };
          // only update state/callback when values actually change to avoid
          // causing repeated re-renders/remounts elsewhere (TabView/carendar issues)
          const prev = statusMeta;
          const changed = !prev || prev.enable_attach !== metaObj.enable_attach || prev.enable_editing !== metaObj.enable_editing;
          if (changed) {
            setStatusMeta(metaObj);
            if (typeof onStatusMetaChange === 'function') onStatusMetaChange(metaObj);
          }
        } catch {
          if (statusMeta !== null) {
            setStatusMeta(null);
            if (typeof onStatusMetaChange === 'function') onStatusMetaChange(null);
          }
        }
  setFetchedTargets(fetched);
        const opts = fetched.map((t) => {
          const ts = (t as Record<string, unknown>).target_status as Record<string, unknown> | undefined;
          return { label: (ts?.name as string) ?? '—', value: (ts?.id as string) ?? '' };
        });
        setStatusOptions(opts.filter((o: { label: string; value: string }) => Boolean(o.value)));
      } catch {
        setFetchedTargets([]);
        setStatusOptions([]);
        setStatusMeta(null);
      } finally {
        if (mounted) setLoadingTargets(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [currentStatusId, currentOrderId, onStatusMetaChange, statusMeta]);

  // when user selects a status, open modal asking for comment
  useEffect(() => {
    if (selectedStatus) {
      setModalVisible(true);
    }
  }, [selectedStatus]);

  const requiresComment = (() => {
    if (!selectedStatus) return false;
    const found = fetchedTargets.find((t) => ((t.target_status as Record<string, unknown>)?.id as string) === selectedStatus || (t.target_status as Record<string, unknown>)?.id === selectedStatus);
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
    onSuccess: () => {
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Status alterado' });
      if (currentOrderId) {
        void queryClient.invalidateQueries({ queryKey: ['service-order', currentOrderId] });
        void queryClient.invalidateQueries({ queryKey: ['service-orders'] });
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

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <div className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between p-3 border-t ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2">
          {showStatusDropdown && (
            <Dropdown value={selectedStatus} options={statusOptions} onChange={(e) => setSelectedStatus(e.value)} placeholder="Mudar status" className="w-48" disabled={loadingTargets || meta.isSubmitting} />
          )}
        </div>
        <div>
          {showSaveButton && (
            <button type="button" className={`p-button p-component p-button-primary ${meta.isSubmitting ? 'p-disabled' : ''}`} onClick={handleClick} disabled={isDisabled}>
              {meta.isSubmitting ? <i className="pi pi-spin pi-spinner" /> : <i className="pi pi-save" />}
              <span className="ml-2">{label}</span>
            </button>
          )}
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
