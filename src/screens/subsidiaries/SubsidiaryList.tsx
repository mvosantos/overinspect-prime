import { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { BreadCrumb } from 'primereact/breadcrumb';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import subsidiaryService from '../../services/subsidiaryService';
import type { Subsidiary, PaginatedResponse } from '../../models/subsidiary';
import { usePermissions } from '../../contexts/PermissionContext';
import { useTranslation } from 'react-i18next';

export default function SubsidiaryList() {
  const { t } = useTranslation(['subsidiaries', 'common']);
  const toast = useRef<Toast>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [selectedDelete, setSelectedDelete] = useState<Subsidiary | null>(null);
  const { permissions } = usePermissions();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<{ name?: string; doc_number?: string }>({});
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const canUpdate = permissions.includes('admin.subsidiary.update');
  const canDelete = permissions.includes('admin.subsidiary.destroy');

  const { data, isLoading } = useQuery<PaginatedResponse<Subsidiary> | undefined>({
    queryKey: ['subsidiaries', page, perPage, globalFilter, filters, sortField, sortOrder],
    queryFn: () => subsidiaryService.list({ page, limit: perPage, search: globalFilter, filters, sort: sortField, direction: sortOrder }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subsidiaryService.remove(id),
    onSuccess: () => {
      toast.current?.show({ severity: 'success', summary: t("common:success"), detail: t("common:record_deleted_successfully") });
      queryClient.invalidateQueries({ queryKey: ['subsidiaries'] });
      setSelectedDelete(null);
    },
    onError: () => {
      toast.current?.show({ severity: 'error', summary: t("common:error"), detail: t("common:record_deleted_error") });
    },
  });

  const actionBody = (rowData: Subsidiary) => (
    <div className="flex gap-2">
      {canUpdate && (
        <Button icon="pi pi-pencil" className="p-button-sm" onClick={() => window.open(`/management/subsidiaries/${rowData.id}/edit`, '_blank')} />
      )}
      {canDelete && (
        <Button icon="pi pi-trash" className="p-button-sm p-button-danger" onClick={() => setSelectedDelete(rowData)} />
      )}
    </div>
  );

  const header = (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <div className="mb-2">
          <BreadCrumb model={[{ label: t('management:management') }, { label: t('subsidiaries:subsidiaries'), url: '/management/subsidiaries' }]} />
        </div>
        <div className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => { setGlobalFilter((e.target as HTMLInputElement).value); setPage(1); }}
            placeholder={t("common:general_search")}
          />
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="mb-1 text-sm text-muted">{t("common:total")}: {data?.total ?? 0}</div>
        <div>
          {permissions.includes('admin.subsidiary.store') && (
            <Button label="Adicionar" icon="pi pi-plus" onClick={() => window.open('/subsidiaries/new/edit', '_blank')} />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Toast ref={toast} position="top-right" />
      <div className="card">
        <DataTable
          value={data?.data}
          lazy
          loading={isLoading}
          header={header}
          paginator
          rows={perPage}
          totalRecords={data?.total}
          first={(page - 1) * perPage}
          onPage={(e) => { setPage(Math.floor(e.first / e.rows) + 1); setPerPage(e.rows); }}
          sortField={sortField ?? undefined}
          sortOrder={sortOrder === 'asc' ? 1 : sortOrder === 'desc' ? -1 : undefined}
          onSort={(e) => {
            // e.sortField, e.sortOrder (1 or -1)
            setSortField((e.sortField as string) || null);
            setSortOrder(e.sortOrder === 1 ? 'asc' : e.sortOrder === -1 ? 'desc' : null);
            setPage(1);
          }}
        >
          <Column field="company.name" header={t("subsidiaries:company")} body={(row: Subsidiary) => row.company?.name} />
          <Column field="name" header={t("subsidiaries:name")} sortable filter filterElement={
            <InputText value={filters.name || ''} onChange={(e) => { setFilters(f => ({ ...f, name: (e.target as HTMLInputElement).value })); setPage(1); }} placeholder={t("common:search")} />
          } />
          <Column field="doc_number" header={t("subsidiaries:document")} sortable filter filterElement={
            <InputText value={filters.doc_number || ''} onChange={(e) => { setFilters(f => ({ ...f, doc_number: (e.target as HTMLInputElement).value })); setPage(1); }} placeholder={t("common:search")} />
          } />
          <Column header={t("common:actions")} body={actionBody} style={{ width: '8rem' }} />
        </DataTable>
      </div>

      <Dialog header={t("common:delete_record")} visible={!!selectedDelete} onHide={() => setSelectedDelete(null)}>
         <p>{t("common:delete_record_confirmation")}</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button label={t("common:cancelUCase")} onClick={() => setSelectedDelete(null)} />
          <Button label={t("common:delete_yesUCase")} className="p-button-danger" onClick={() => selectedDelete && deleteMutation.mutate(selectedDelete.id)} />
        </div>
      </Dialog>
    </div>
  );
}
