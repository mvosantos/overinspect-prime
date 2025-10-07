import { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { BreadCrumb } from 'primereact/breadcrumb';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listSubsidiaries, deleteSubsidiary } from '../../services/subsidiaryService';
import type { Subsidiary, PaginatedResponse } from '../../services/subsidiaryService';
import { usePermissions } from '../../contexts/PermissionContext';

export default function SubsidiaryList() {
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
    queryFn: () => listSubsidiaries({ page, limit: perPage, search: globalFilter, filters, sort: sortField, direction: sortOrder }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSubsidiary(id),
    onSuccess: () => {
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Registro excluído' });
      queryClient.invalidateQueries({ queryKey: ['subsidiaries'] });
      setSelectedDelete(null);
    },
    onError: () => {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir' });
    },
  });

  const actionBody = (rowData: Subsidiary) => (
    <div className="flex gap-2">
      {canUpdate && (
        <Button icon="pi pi-pencil" className="p-button-sm" onClick={() => window.open(`/management/subsidiaries/${rowData.id}/edit`, '_blank') } />
      )}
      {canDelete && (
        <Button icon="pi pi-trash" className="p-button-sm p-button-danger" onClick={() => setSelectedDelete(rowData)} />
      )}
    </div>
  );

  const header = (
    <div className="flex justify-between items-center">
      <div className="flex flex-col">
        <div className="mb-2">
          <BreadCrumb model={[{ label: 'Management' }, { label: 'Subsidiaries', url: '/management/subsidiaries' }]} />
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
        <div className="text-sm text-muted mb-1">Total: {data?.total ?? 0}</div>
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
          <Column field="company.name" header="Empresa" body={(row: Subsidiary) => row.company?.name} />
          <Column field="name" header="Nome" sortable filter filterElement={
            <InputText value={filters.name || ''} onChange={(e) => { setFilters(f => ({ ...f, name: (e.target as HTMLInputElement).value })); setPage(1); }} placeholder="Pesquisar Nome" />
          } />
          <Column field="doc_number" header="CPF/CNPJ" sortable filter filterElement={
            <InputText value={filters.doc_number || ''} onChange={(e) => { setFilters(f => ({ ...f, doc_number: (e.target as HTMLInputElement).value })); setPage(1); }} placeholder="Pesquisar CPF/CNPJ" />
          } />
          <Column header="Ações" body={actionBody} style={{ width: '8rem' }} />
        </DataTable>
      </div>

      <Dialog header="Confirmar exclusão" visible={!!selectedDelete} onHide={() => setSelectedDelete(null)}>
        <p>Deseja realmente excluir o registro?</p>
        <div className="mt-4 flex gap-2 justify-end">
          <Button label="Cancelar" onClick={() => setSelectedDelete(null)} />
          <Button label="Sim, excluir" className="p-button-danger" onClick={() => selectedDelete && deleteMutation.mutate(selectedDelete.id)} />
        </div>
      </Dialog>
    </div>
  );
}
