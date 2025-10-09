import { Card } from 'primereact/card';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import serviceOrderService from '../../../services/serviceOrderService';
import type { FileUploadHandlerEvent } from 'primereact/fileupload';

type Attachment = {
  id: string;
  file_name?: string;
  url?: string;
  created_at?: string;
};

type Props = { parentType?: 'service_order' | 'service_operation'; parentId?: string | null };

export default function AttachmentsSection({ parentType = 'service_order', parentId }: Props) {
  const toast = useRef<Toast | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAttachments = async () => {
    if (!parentId) return;
    try {
      setLoading(true);
      const res = await serviceOrderService.get(parentId);
      // assume backend returns object with attachments array or data.attachments
      const body = res as unknown as Record<string, unknown>;
      let items: Attachment[] = [];
      if (body && typeof body === 'object') {
        const maybeAttachments = (body.attachments ?? (body.data && (body.data as Record<string, unknown>).attachments)) as unknown;
        if (Array.isArray(maybeAttachments)) items = maybeAttachments as Attachment[];
      }
      setAttachments(items ?? []);
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
        const data = new FormData();
        data.append('file', f);
        data.append('parent_type', parentType);
        data.append('parent_id', parentId);
        await serviceOrderService.uploadAttachment(data);
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
    try {
      await serviceOrderService.deleteAttachment(id);
      toast.current?.show({ severity: 'success', summary: 'Removido', detail: 'Anexo removido' });
      await fetchAttachments();
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao remover anexo' });
    }
  };

  const handleDownload = (att: Attachment) => {
    if (!att.url) {
      toast.current?.show({ severity: 'warn', summary: 'Download', detail: 'URL não disponível' });
      return;
    }
    // open in new tab
    window.open(att.url, '_blank');
  };

  return (
    <Card>
      <Toast ref={toast} />
      <div className="text-center mb-4">
        <div className="inline-block px-4 py-1 rounded-md bg-teal-50 border border-teal-100">
          <h3 className="text-lg font-semibold text-teal-700">Anexos</h3>
        </div>
      </div>

      <div className="mb-2 text-sm text-muted">Vinculado a: {parentType} {parentId ?? ''}</div>

      <FileUpload name="attachments" customUpload uploadHandler={customUpload} multiple accept="*" auto={false} />

      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Arquivos</h4>
        {loading ? (
          <div className="text-sm text-muted">Carregando...</div>
        ) : attachments.length === 0 ? (
          <div className="text-sm text-muted">Nenhum anexo</div>
        ) : (
          <ul className="space-y-2">
            {attachments.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4">
                <div className="text-sm truncate">{a.file_name ?? `Arquivo ${a.id}`}</div>
                <div className="flex items-center gap-2">
                  <Button icon="pi pi-download" className="p-button-text" onClick={() => handleDownload(a)} />
                  <Button icon="pi pi-trash" className="p-button-text p-button-danger" onClick={() => handleDelete(a.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
