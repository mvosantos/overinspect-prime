import { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { BreadCrumb } from 'primereact/breadcrumb';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import companyService from '../../services/companyService';
import type { Company } from '../../models/company';
import type { ApiPaginatedResponse as PaginatedResponse } from '../../models/apiTypes';

export default function CompanyList() {
  const toast = useRef<Toast>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [selectedDelete, setSelectedDelete] = useState<Company | null>(null);
  const queryClient = useQueryClient();

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<Company> | undefined>({
  queryKey: ['companies', page, perPage, globalFilter, sortField, sortOrder],
  queryFn: () => companyService.list({ page, limit: perPage, search: globalFilter, sort: sortField, direction: sortOrder }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => companyService.remove(id),
    onSuccess: () => {
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Registro excluído' });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setSelectedDelete(null);
    },
    onError: () => {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir' });
    },
  });

  const actionBody = (rowData: Company) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" className="p-button-sm" onClick={() => window.open(`/management/companies/${rowData.id}/edit`, '_blank') } />
      <Button icon="pi pi-trash" className="p-button-sm p-button-danger" onClick={() => setSelectedDelete(rowData)} />
    </div>
  );

  const header = (
    <div className="flex justify-between items-center">
      <div className="flex flex-col">
        <div className="mb-2">
          <BreadCrumb model={[{ label: 'Management' }, { label: 'Companies', url: '/management/companies' }]} />
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
          <Button label="Adicionar" icon="pi pi-plus" onClick={() => window.open('/companies/new/edit', '_blank')} />
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
          <Column field="name" header="Nome" sortable />
          <Column field="doc_number" header="CPF/CNPJ" sortable />
          <Column field="url_address" header="Website" />
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
