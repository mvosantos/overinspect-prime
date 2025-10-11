/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import { useFieldArray, useFormContext } from 'react-hook-form';
import AttachmentService from '../services/AttachmentService';
import { Toast } from 'primereact/toast';

type AttachmentsOrderService = {
  id?: string;
  type_id?: string | null;
  name?: string | null;
  filename?: string | null;
  path?: string | null;
  fileObject?: File | null;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
  deleted_at?: string | Date | null;
};

type Props = {
  name?: string; // form field name (default: 'attachments')
  path?: string; // path used for presign (default: 'service_order')
  allowPreview?: boolean;
};

export default function AttachmentsSection({ name = 'attachments', path = 'service_order' }: Props) {
  const ctx = useFormContext();
  const toast = React.useRef<Toast | null>(null);
  const { control, getValues } = ctx;
  const { fields, append, remove } = useFieldArray({ control: control as any, name: name as any });
  const [uploadingCount, setUploadingCount] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fileUploadRef = useRef<any>(null);

  const handleFileSelect = useCallback(async (event: any) => {
    const files: File[] = Array.from(event.files || []);
    if (!files.length) return;
    let success = 0;
    let failed = 0;
    setUploadingCount((c) => c + files.length);
    for (const f of files) {
      try {
        // request presign
        const presign = await AttachmentService.getPresign(f.name, path);
        const presignUrl = presign.presign_data?.url;
        if (!presignUrl) throw new Error('Presign URL missing');
        // upload to presigned url
        await AttachmentService.uploadToPresign(String(presignUrl), f);
        const item: AttachmentsOrderService = {
          // Do NOT set `id` here: the true attachment id comes from the
          // service_order.attachments node after the record is saved by the server.
          // For immediate preview we keep the fileObject so the user can preview
          // the local file before saving.
          filename: presign.filename,
          name: presign.filename,
          path: path,
          created_at: undefined,
          fileObject: f,
        };
        append(item as any);
        success += 1;
      } catch {
        failed += 1;
      } finally {
        setUploadingCount((c) => Math.max(0, c - 1));
      }
    }

    if (success > 0) toast.current?.show({ severity: 'success', summary: 'Upload', detail: `${success} arquivo(s) enviado(s)` });
    if (failed > 0) toast.current?.show({ severity: 'error', summary: 'Upload', detail: `${failed} falha(s)` });

    // Clear the PrimeReact FileUpload internal list (remove thumbnails / pending badges)
    try {
      if (fileUploadRef.current && typeof fileUploadRef.current.clear === 'function') {
        fileUploadRef.current.clear();
      }
    } catch {
      // ignore
    }
  }, [append, path]);

  const handleDownload = useCallback(async (file: AttachmentsOrderService, index?: number) => {
    try {
      // If this is a local-only file (has fileObject and no persisted id), just preview/download locally
      if (file?.fileObject && !(file.id)) {
        const url = URL.createObjectURL(file.fileObject as Blob);
        window.open(url, '_blank');
        return;
      }

      // Prefer resolving by index if provided (position in the attachments array)
      const attachmentsLive = getValues(name) as AttachmentsOrderService[] | undefined;
      let serverId: string | undefined;
      if (typeof index === 'number' && attachmentsLive && Array.isArray(attachmentsLive) && attachmentsLive[index]) {
        serverId = (attachmentsLive[index] as AttachmentsOrderService).id as string | undefined;
      }
      // Fallback: try to resolve by filename/name
      if (!serverId && attachmentsLive && Array.isArray(attachmentsLive)) {
        const match = attachmentsLive.find((a) => a && (a.filename === file.filename || a.name === file.name) && a.id);
        if (match && match.id) serverId = match.id;
      }

      if (serverId) {
        const url = await AttachmentService.downloadAttachment(serverId);
        window.open(url, '_blank');
        return;
      }

      // If we reach here, we couldn't find a server id for this file. If the
      // caller provided file.id and you know it's correct, consider persisting
      // the service order so that the attachments node is populated. Notify the user.
      toast.current?.show({ severity: 'warn', summary: 'Arquivo não persistido', detail: 'O arquivo ainda não tem ID no nó attachments. Salve a ordem antes de baixar.' });
    } catch (e) {
      if (typeof console !== 'undefined' && typeof console.error === 'function') console.error('download error', e);
    }
  }, [getValues, name]);

  const handlePreview = useCallback(async (file: AttachmentsOrderService, index?: number) => {
    try {
      setPreviewLoading(true);
      // If local file, preview using the local blob
      if (file?.fileObject && !(file.id)) {
        const url = URL.createObjectURL(file.fileObject as Blob);
        setPreviewUrl(url);
        setPreviewIsObjectUrl(true);
        setPreviewName(file.name ?? file.filename ?? 'file');
        setPreviewVisible(true);
        setPreviewLoading(false);
        return;
      }

      // Prefer resolving by index if provided
      const attachmentsLive = getValues(name) as AttachmentsOrderService[] | undefined;
      let serverId: string | undefined;
      if (typeof index === 'number' && attachmentsLive && Array.isArray(attachmentsLive) && attachmentsLive[index]) {
        serverId = (attachmentsLive[index] as AttachmentsOrderService).id as string | undefined;
      }
      if (!serverId && attachmentsLive && Array.isArray(attachmentsLive)) {
        const match = attachmentsLive.find((a) => a && (a.filename === file.filename || a.name === file.name) && a.id);
        if (match && match.id) serverId = match.id;
      }

      if (serverId) {
        const url = await AttachmentService.downloadAttachment(serverId);
        const name = file.name ?? file.filename ?? 'file';
        const extMatch = (name || '').toLowerCase().match(/\.([a-z0-9]+)(?:\?|$)/);
        const ext = extMatch ? extMatch[1] : (url ? (url.toLowerCase().match(/\.([a-z0-9]+)(?:\?|$)/) || [])[1] : undefined);

        // If PDF, fetch blob and create an object URL so embed will render
        if (ext === 'pdf') {
          try {
            const resp = await fetch(url);
            const blob = await resp.blob();
            const objectUrl = URL.createObjectURL(blob);
            setPreviewUrl(objectUrl);
            setPreviewIsObjectUrl(true);
            setPreviewName(name);
            setPreviewVisible(true);
            return;
          } catch {
            // fallback to opening the URL directly
            setPreviewUrl(url);
            setPreviewIsObjectUrl(false);
            setPreviewName(name);
            setPreviewVisible(true);
            return;
          }
        }

        // For Office files try Office Online viewer (may require public URL)
        if (ext === 'xlsx' || ext === 'xls' || ext === 'docx' || ext === 'pptx') {
          try {
            const officeViewer = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
            setPreviewUrl(officeViewer);
            setPreviewIsObjectUrl(false);
            setPreviewName(name);
            setPreviewVisible(true);
            return;
          } catch {
            // fallback to download
            toast.current?.show({ severity: 'info', summary: 'Preview indisponível', detail: 'Pré-visualização não disponível — iniciando download' });
            const a = document.createElement('a');
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            return;
          }
        }

        // default: open URL in modal (iframe/embed)
        setPreviewUrl(url);
        setPreviewIsObjectUrl(false);
        setPreviewName(name);
        setPreviewVisible(true);
        return;
      }

      toast.current?.show({ severity: 'warn', summary: 'Arquivo não persistido', detail: 'O arquivo ainda não tem ID no nó attachments. Salve a ordem antes de pré-visualizar.' });
    } catch (e) {
      if (typeof console !== 'undefined' && typeof console.error === 'function') console.error('preview error', e);
      toast.current?.show({ severity: 'error', summary: 'Preview', detail: 'Não foi possível gerar pré-visualização' });
    } finally {
      setPreviewLoading(false);
    }
  }, [getValues, name]);

  // Preview modal state
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewIsObjectUrl, setPreviewIsObjectUrl] = useState(false);
  const [previewName, setPreviewName] = useState<string | null>(null);

  const closePreview = useCallback(() => {
    try {
      if (previewIsObjectUrl && previewUrl) URL.revokeObjectURL(previewUrl);
    } catch {
      // ignore
    }
    setPreviewUrl(null);
    setPreviewIsObjectUrl(false);
    setPreviewName(null);
    setPreviewVisible(false);
  }, [previewIsObjectUrl, previewUrl]);

  const handleDownloadFromPreview = useCallback(() => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = previewName ?? '';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [previewUrl, previewName]);

  const handleRemove = useCallback(async (index: number) => {
    const file = getValues(name)[index] as AttachmentsOrderService;
    if (!file) return;
    try {
      if (!file.created_at) {
        // local-only, just remove from field array
        remove(index);
        return;
      }
      if (file.id) {
        await AttachmentService.deleteAttachment(file.id);
        remove(index);
      }
    } catch (e) {
      if (typeof console !== 'undefined' && typeof console.error === 'function') console.error('delete attachment error', e);
    }
  }, [getValues, name, remove]);

  return (
    <div>
      <Toast ref={toast} />
      <div className="mb-3">
        <div className="flex items-center gap-4">
          <FileUpload ref={fileUploadRef} name={`${name}_uploader`} customUpload uploadHandler={handleFileSelect} multiple accept="*" auto={false} disabled={uploadingCount > 0} />
          {uploadingCount > 0 && (
            <div className="flex items-center gap-2">
              <ProgressSpinner style={{ width: '24px', height: '24px' }} />
              <div className="text-sm">Enviando {uploadingCount} arquivo(s)...</div>
            </div>
          )}
          {previewLoading && (
            <div className="flex items-center gap-2">
              <ProgressSpinner style={{ width: '20px', height: '20px' }} />
              <div className="text-sm">Gerando pré-visualização...</div>
            </div>
          )}
        </div>
      </div>
      <div>
        {fields.length === 0 ? (
          <div className="text-sm text-muted">Nenhum anexo</div>
        ) : (
          <ul className="space-y-2">
            {fields.map((f, idx) => (
              <li key={(f as any).id} className="flex items-center justify-between gap-4">
                <div className="text-sm truncate">{(f as any).name ?? (f as any).filename ?? `Arquivo ${idx + 1}`}</div>
                <div className="flex items-center gap-2">
                  {/* badge: persisted vs local - placed next to action icons for consistent alignment */}
                  {((f as any).id && (f as any).created_at) ? (
                    <span className="p-badge p-badge-success" style={{ marginRight: '0.25rem', fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>Persistido</span>
                  ) : (
                    <span className="p-badge p-badge-warning" style={{ marginRight: '0.25rem', fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>Local</span>
                  )}
                  <Button icon="pi pi-eye" className="p-button-text" onClick={() => handlePreview(f as any, idx)} disabled={previewLoading} />
                  <Button icon="pi pi-download" className="p-button-text" onClick={() => handleDownload(f as any, idx)} />
                  <Button icon="pi pi-trash" className="p-button-text p-button-danger" onClick={() => handleRemove(idx)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog header={previewName ?? 'Preview'} visible={previewVisible} style={{ width: '80vw', height: '80vh' }} onHide={closePreview} maximizable footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' }}>
          <Button icon="pi pi-download" label="Download" onClick={handleDownloadFromPreview} className="p-button-text" />
          <Button icon="pi pi-times" label="Fechar" onClick={closePreview} className="p-button-text" />
        </div>
      }>
        <div style={{ height: 'calc(80vh - 72px)', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {previewUrl ? (
            (previewUrl.endsWith('.png') || previewUrl.endsWith('.jpg') || previewUrl.endsWith('.jpeg') || previewUrl.endsWith('.gif')) ? (
              <img src={previewUrl} alt={previewName ?? 'preview'} style={{ maxWidth: '100%', maxHeight: '100%' }} />
            ) : previewUrl.endsWith('.pdf') ? (
              <embed src={previewUrl} type="application/pdf" width="100%" height="100%" />
            ) : (
              <iframe src={previewUrl} title={previewName ?? 'preview'} style={{ width: '100%', height: '100%' }} />
            )
          ) : (
            <div>Nenhuma pré-visualização disponível</div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
