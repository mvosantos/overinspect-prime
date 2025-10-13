// Attachments UI for service orders — tightened typings
import { Card } from 'primereact/card';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Control, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import type { ServiceOrderSubmission, AttachmentsOrderService, ServiceOrder } from '../../../models/serviceOrder';
import serviceOrderService from '../../../services/serviceOrderService';
import AttachmentService from '../../../services/AttachmentService';
import type { FileUploadHandlerEvent } from 'primereact/fileupload';

type Props = { parentId?: string | null; control?: Control<ServiceOrderSubmission>; setValue?: UseFormSetValue<ServiceOrderSubmission>; getValues?: UseFormGetValues<ServiceOrderSubmission>; selectedServiceTypeId?: string | null; allowModify?: boolean };

export default function AttachmentsSection({ parentId, control: pControl, setValue: pSetValue, getValues: pGetValues, selectedServiceTypeId, allowModify = true }: Props) {
  const { t } = useTranslation();
  const toast = useRef<Toast | null>(null);
  const [attachments, setAttachments] = useState<AttachmentsOrderService[]>([]);
  const [loading, setLoading] = useState(false);
  const ctx = useFormContext<ServiceOrderSubmission>();
  const control = pControl ?? ctx.control;
  const setVal = pSetValue ?? ctx.setValue;
  const getVal = pGetValues ?? ctx.getValues;
  const watchedServiceTypeId = useWatch({ control, name: 'service_type_id' }) as string | undefined;
  const serviceTypeId = selectedServiceTypeId ?? watchedServiceTypeId;

  // Ensure 'attachments' is registered in the parent form and has a default empty array
  useEffect(() => {
      try {
        // ensure the attachments field exists in the form
        if (typeof ctx.register === 'function') {
          // register has a typed signature via useFormContext<ServiceOrderSubmission>() so call it directly
          ctx.register('attachments');
        }
      const cur = getVal ? getVal('attachments') : undefined;
      if (cur === undefined && setVal) {
        setVal('attachments', [], { shouldDirty: false });
      }
    } catch {
      // ignore
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAttachments = async () => {
    if (!parentId) return;
    try {
      setLoading(true);
      const res = await serviceOrderService.get<ServiceOrder | null>(parentId);
      if (res && typeof res === 'object' && Array.isArray(res.attachments)) {
        setAttachments(res.attachments ?? []);
      } else {
        setAttachments([]);
      }
    } catch {
      // ignore silently but keep attachments empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId]);

  const customUpload = async (event: FileUploadHandlerEvent) => {
    if (!parentId) return;
    const files = event.files ?? [];
    let success = 0;
    let failed = 0;
    for (const f of files) {
      try {
          // presign
          const presign = await AttachmentService.getPresign((f as File).name, 'service_order');
          const presignUrl = presign.presign_data?.url;
          if (!presignUrl) throw new Error('Presign URL missing');
          await AttachmentService.uploadToPresign(String(presignUrl), f as File);
          // After successful upload, add the presigned attachment entry into the form values
          // so create/update will include this attachment in the payload.
          try {
            const current = (getVal && typeof getVal === 'function') ? (getVal('attachments') as AttachmentsOrderService[] ?? []) : [];
            const toAdd: AttachmentsOrderService = {
              id: String(presign.id),
              filename: presign.filename,
              name: presign.filename,
              path: 'service_order',
            } as AttachmentsOrderService;
            if (setVal && typeof setVal === 'function') {
              setVal('attachments', [...current, toAdd], { shouldDirty: true, shouldValidate: true });
            }
          } catch (e) {
            // ignore form set errors but continue
            if (typeof console !== 'undefined' && typeof console.error === 'function') console.error('[AttachmentsSection] setValue attachments error', e);
          }
        success += 1;
      } catch {
        failed += 1;
      }
    }

    if (success > 0) toast.current?.show({ severity: 'success', summary: 'Upload', detail: `${success} arquivo(s) enviado(s)` });
    if (failed > 0) toast.current?.show({ severity: 'error', summary: 'Upload', detail: `${failed} falha(s)` });

    // refresh list
    await fetchAttachments();
  };

  const handleDelete = async (id: string) => {
    if (!allowModify) {
      toast.current?.show({ severity: 'warn', summary: 'Ação proibida', detail: 'Exclusão de anexos não está permitida neste status.' });
      return;
    }
    try {
      await serviceOrderService.deleteAttachment(id);
      toast.current?.show({ severity: 'success', summary: 'Removido', detail: 'Anexo removido' });
      await fetchAttachments();
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao remover anexo' });
    }
  };

  const handleDownload = (att: AttachmentsOrderService) => {
    const url = (att as unknown as Record<string, unknown>).url as string | undefined;
    if (!url) {
      toast.current?.show({ severity: 'warn', summary: 'Download', detail: 'URL não disponível' });
      return;
    }
    // open in new tab
    window.open(url, '_blank');
  };

  return (
    <Card>
      <Toast ref={toast} />
      <div className="mb-4 text-center">
        <div className="inline-block w-full px-4 py-1 border border-teal-100 rounded-md bg-teal-50">
          <h3 className="text-lg font-semibold text-teal-700">Anexos</h3>
        </div>
      </div>


      {serviceTypeId ? (
  (allowModify ? <FileUpload name="attachments" customUpload uploadHandler={customUpload} multiple accept="*" auto={true} chooseLabel={t('new_service_order:add_new_attachment')} /> : <div className="text-sm text-muted">Uploads desabilitados para o status atual.</div>)
      ) : (
        <div className="text-sm text-muted">Escolha o tipo de serviço para habilitar o upload de anexos.</div>
      )}

      <div className="mt-4">
        <h4 className="mb-2 text-sm font-semibold">Arquivos</h4>
        {loading ? (
          <div className="text-sm text-muted">Carregando...</div>
        ) : attachments.length === 0 ? (
          <div className="text-sm text-muted">Nenhum anexo</div>
        ) : (
          <ul className="space-y-2">
            {attachments.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4">
                <div className="text-sm truncate">{a.filename ?? a.name ?? `Arquivo ${a.id}`}</div>
                <div className="flex items-center gap-2">
                  <Button icon="pi pi-download" className="p-button-text" onClick={() => handleDownload(a)} />
                  {allowModify ? <Button icon="pi pi-trash" className="p-button-text p-button-danger" onClick={() => handleDelete(a.id)} /> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
