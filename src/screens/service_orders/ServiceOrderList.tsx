import { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { BreadCrumb } from 'primereact/breadcrumb';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import serviceOrderService from '../../services/serviceOrderService';
import type { ServiceOrder, PaginatedResponse } from '../../models/serviceOrder';
import { usePermissions } from '../../contexts/PermissionContext';

export default function ServiceOrderList() {
  const toast = useRef<Toast>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [selectedDelete, setSelectedDelete] = useState<ServiceOrder | null>(null);
  const { permissions } = usePermissions();
  const queryClient = useQueryClient();

  const [filters] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const canUpdate = permissions.includes('inspection.service-order.update');
  const canDelete = permissions.includes('inspection.service-order.destroy');

  const { data, isLoading } = useQuery<PaginatedResponse<ServiceOrder> | undefined>({
    queryKey: ['service-orders', page, perPage, globalFilter, filters, sortField, sortOrder],
    queryFn: () => serviceOrderService.list({ page, per_page: perPage, search: globalFilter, filters, sort: sortField, direction: sortOrder }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => serviceOrderService.remove(id),
    onSuccess: () => {
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Registro excluído' });
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      setSelectedDelete(null);
    },
    onError: () => {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir' });
    },
  });

  const actionBody = (rowData: ServiceOrder) => (
    <div className="flex gap-2">
      {canUpdate && (
        <Button icon="pi pi-pencil" className="p-button-sm" onClick={() => window.open(`/service-orders/${rowData.id}/edit`, '_blank')} />
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
          <BreadCrumb model={[{ label: 'Service Orders' }, { label: 'List', url: '/service-orders/list' }]} />
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
        <div className="mb-1 text-sm text-muted">Total: {data?.total ?? 0}</div>
        <div>
          {permissions.includes('inspection.service-order.store') && (
            <Button label="Adicionar" icon="pi pi-plus" onClick={() => window.open('/service-orders/new/edit', '_blank')} />
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
          <Column field="number" header="Número da OS" sortable />
          <Column field="ref_number" header="Número de referência interno" />
          <Column header="Status" body={(row: ServiceOrder) => row.service_order_status?.name} />
          <Column field="created_at" header="Data de criação" sortable />
          <Column header="Ações" body={actionBody} style={{ width: '8rem' }} />
        </DataTable>
      </div>

      <Dialog header="Confirmar exclusão" visible={!!selectedDelete} onHide={() => setSelectedDelete(null)}>
        <p>Deseja realmente excluir o registro?</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button label="Cancelar" onClick={() => setSelectedDelete(null)} />
          <Button label="Sim, excluir" className="p-button-danger" onClick={() => selectedDelete && deleteMutation.mutate(selectedDelete.id)} />
        </div>
      </Dialog>
    </div>
  );
}
