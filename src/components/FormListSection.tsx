import { useCallback, useEffect, useState } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

type Props = {
  title?: string;
  items: unknown[];
  total?: number;
  page: number;
  perPage: number;
  setPage: (n: number) => void;
  search: string;
  setSearch: (s: string) => void;
  creatingNew: boolean;
  setCreatingNew: (b: boolean) => void;
  activeIndexes: number[] | number | null;
  setActiveIndexes: (v: number[] | number | null) => void;
  renderItem: (opts: { item?: unknown; isNew?: boolean; index: number }) => React.ReactNode;
  titleForItem?: (item: unknown) => string;
  parentEnableEditing?: boolean;
  persistActiveIndexesKey?: string | null;
};

export default function FormListSection({ title, items, total = 0, page, perPage, setPage, search, setSearch, creatingNew, setCreatingNew, activeIndexes, setActiveIndexes, renderItem, titleForItem, parentEnableEditing = true }: Props) {
  const [localSearch, setLocalSearch] = useState(search ?? '');

  useEffect(() => { setLocalSearch(search ?? ''); }, [search]);

  const collapseAll = useCallback(() => setActiveIndexes(null), [setActiveIndexes]);
  const expandAll = useCallback(() => {
    const totalItems = (items?.length ?? 0) + (creatingNew ? 1 : 0);
    setActiveIndexes(Array.from({ length: totalItems }, (_, i) => i));
  }, [items, creatingNew, setActiveIndexes]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {title ? <div className="mr-4 font-semibold">{title}</div> : null}
          <Button label="Novo" icon="pi pi-plus" onClick={() => setCreatingNew(true)} disabled={!parentEnableEditing} className="p-button-text" />
          <Button label="Expandir todos" onClick={expandAll} className="p-button-text" />
          <Button label="Colapsar" onClick={collapseAll} className="p-button-text" />
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted">Total: {total}</div>
          <InputText placeholder="Buscar" value={localSearch} onChange={(e) => { setLocalSearch((e.target as HTMLInputElement).value); }} onBlur={() => setSearch(localSearch)} />
        </div>
      </div>

      <Accordion multiple activeIndex={activeIndexes} onTabChange={(e: { index: number | number[] | null }) => setActiveIndexes(e.index as number[] | number | null)}>
        {creatingNew && (
          <AccordionTab header={`0 - Novo registro`}>
            {renderItem({ item: undefined, isNew: true, index: 0 })}
          </AccordionTab>
        )}

        {items?.map((it: unknown, idx: number) => {
          const rec = it as Record<string, unknown> | undefined;
          const key = (rec && typeof rec.id === 'string') ? rec.id : String(idx);
          const itemTitle = typeof titleForItem === 'function' ? titleForItem(it) : (() => {
            const vesselName = (rec && typeof rec.vessel_name === 'string') ? rec.vessel_name : undefined;
            const weather = rec && (rec.weather as Record<string, unknown> | undefined);
            const weatherName = weather && typeof weather.name === 'string' ? ` (${weather.name})` : '';
            return vesselName ? `${vesselName}${weatherName}` : `—${weatherName}`;
          })();
          return (
            <AccordionTab key={key} header={`${(page - 1) * perPage + idx + 1} - ${itemTitle}`}>
              {renderItem({ item: it, index: idx })}
            </AccordionTab>
          );
        })}
      </Accordion>

      <div className="flex items-center justify-between mt-4">
        <div>Exibindo página {page} de {Math.max(1, Math.ceil((total ?? 0) / perPage))}</div>
        <div className="flex gap-2">
          <Button label="Anterior" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} />
          <Button label="Próxima" onClick={() => setPage(Math.min(Math.max(1, Math.ceil((total ?? 0) / perPage)), page + 1))} disabled={page >= Math.max(1, Math.ceil((total ?? 0) / perPage))} />
        </div>
      </div>
    </div>
  );
}
