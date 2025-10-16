import { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { BreadCrumb } from 'primereact/breadcrumb';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import siteService from '../../services/siteService';
import type { Site } from '../../models/Site';
import type { ApiPaginatedResponse } from '../../models/apiTypes';
import { usePermissions } from '../../contexts/PermissionContext';
import { useTranslation } from 'react-i18next';

export default function SiteList() {
  const { t } = useTranslation(['sites', 'common']);
  const toast = useRef<Toast>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [page, setPage] = useState(1);  
  const [perPage, setPerPage] = useState(20);
  const [selectedDelete, setSelectedDelete] = useState<Site | null>(null);
  const { permissions } = usePermissions();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<{ name?: string }>({});
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const canUpdate = permissions.includes('inspection.site.update');
  const canDelete = permissions.includes('inspection.site.destroy');

  const { data, isLoading } = useQuery<ApiPaginatedResponse<Site> | undefined>({
    queryKey: ['sites', page, perPage, globalFilter, filters, sortField, sortOrder],
    queryFn: () => siteService.list({ page, limit: perPage, search: globalFilter, filters, sort: sortField, direction: sortOrder }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => siteService.remove(id),
    onSuccess: () => {
      toast.current?.show({ severity: 'success', summary: t('common:success'), detail: t('common:record_deleted_successfully') });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setSelectedDelete(null);
    },
    onError: () => toast.current?.show({ severity: 'error', summary: t('common:error'), detail: t('common:record_deleted_error') }),
  });

  const actionBody = (rowData: Site) => (
    <div className="flex gap-2">
      {canUpdate && (
        <Button icon="pi pi-pencil" className="p-button-sm" onClick={() => window.open(`/records/sites/${rowData.id}/edit`, '_blank')} />
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
          <BreadCrumb model={[{ label: t('records:records') }, { label: t('sites:sites'), url: '/records/sites' }]} />
        </div>
        <div className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => { setGlobalFilter((e.target as HTMLInputElement).value); setPage(1); }}
            placeholder={t('common:general_search')}
          />
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="mb-1 text-sm text-muted">{t('common:total')}: {data?.total ?? 0}</div>
        <div>
          {permissions.includes('inspection.site.store') && (
            <Button label="Adicionar" icon="pi pi-plus" onClick={() => window.open('/records/sites/new/edit', '_blank')} />
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
            setSortField((e.sortField as string) || null);
            setSortOrder(e.sortOrder === 1 ? 'asc' : e.sortOrder === -1 ? 'desc' : null);
            setPage(1);
          }}
        >
          <Column field="company.name" header={t('sites:company')} body={(row: Site) => row?.company?.name} />
          <Column field="inspection_site.name" header={t('sites:inspection_site')} body={(row: Site) => {
            const ins = (row as Site).inspection_site;
            if (ins && typeof ins === 'object' && 'name' in ins) return String((ins as Record<string, unknown>).name ?? '');
            return '';
          }} />
          <Column field="name" header={t('sites:name')} sortable filter filterElement={
            <InputText value={filters.name || ''} onChange={(e) => { setFilters(f => ({ ...f, name: (e.target as HTMLInputElement).value })); setPage(1); }} placeholder={t('common:search')} />
          } />
          <Column field="internal_code" header={t('common:internal_code')} />
          <Column header={t('common:actions')} body={actionBody} style={{ width: '8rem' }} />
        </DataTable>
      </div>

      <Dialog header={t('common:delete_record')} visible={!!selectedDelete} onHide={() => setSelectedDelete(null)}>
         <p>{t('common:delete_record_confirmation')}</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button label={t('common:cancelUCase')} onClick={() => setSelectedDelete(null)} />
          <Button label={t('common:delete_yesUCase')} className="p-button-danger" onClick={() => selectedDelete && deleteMutation.mutate(selectedDelete.id)} />
        </div>
      </Dialog>
    </div>
  );
}
