import { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { BreadCrumb } from 'primereact/breadcrumb';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiPaginatedResponse as PaginatedResponse } from '../../models/apiTypes';
import type { BusinessUnit } from '../../models/businessUnit';
import businessUnitService from '../../services/businessUnitService';
import { useTranslation } from 'react-i18next';


export default function BusinessUnitList() {
  const { t } = useTranslation(['business_units', 'common']);
  const toast = useRef<Toast>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [selectedDelete, setSelectedDelete] = useState<BusinessUnit | null>(null);
  const queryClient = useQueryClient();

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<BusinessUnit> | undefined>({
  queryKey: ['business_uits', page, perPage, globalFilter, sortField, sortOrder],
  queryFn: () => businessUnitService.list({ page, limit: perPage, search: globalFilter, sort: sortField, direction: sortOrder }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => businessUnitService.remove(id),
    onSuccess: () => {
      toast.current?.show({ severity: 'success', summary: t("common:success"), detail: t("common:record_deleted_successfuly") });
      queryClient.invalidateQueries({ queryKey: ['business_units'] });
      setSelectedDelete(null);
    },
    onError: () => {
      toast.current?.show({ severity: 'error', summary: t("common:error"), detail: t("common:record_deleted_error") });
    },
  });

  const actionBody = (rowData: BusinessUnit) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" className="p-button-sm" onClick={() => window.open(`/management/business-units/${rowData.id}/edit`, '_blank') } />
      <Button icon="pi pi-trash" className="p-button-sm p-button-danger" onClick={() => setSelectedDelete(rowData)} />
    </div>
  );

  const header = (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <div className="mb-2">
          <BreadCrumb model={[{ label: t("management:management") }, { label: t("business_units"), url: '/management/business-units' }]} />
        </div>
        <div className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => { setGlobalFilter((e.target as HTMLInputElement).value); setPage(1); }}
            placeholder="Pesquisar geral..."
          />
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="mb-1 text-sm text-muted">{t("common:total")}: {data?.total ?? 0}</div>
        <div>
          <Button label={t("common:new_record")} icon="pi pi-plus" onClick={() => window.open('/business-units/new/edit', '_blank')} />
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
          <Column field="name" header={t("name")} sortable />
          <Column field="internal_code" header={t("internal_code")} sortable />
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
