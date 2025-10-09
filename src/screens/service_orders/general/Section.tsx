import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from 'primereact/button';

type Props = {
  title: string;
  children?: ReactNode;
  right?: ReactNode;
  defaultOpen?: boolean;
};

export default function Section({ title, children, right, defaultOpen = true }: Props) {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-center mb-3">
        <div className="inline-flex items-center gap-3 px-4 py-1 rounded-md bg-teal-50 border border-teal-100">
          <h3 className="text-lg font-semibold text-teal-700 m-0">{title}</h3>
          <div className="ml-2">
            <Button icon={open ? 'pi pi-chevron-up' : 'pi pi-chevron-down'} className="p-button-text p-button-plain" onClick={() => setOpen((s) => !s)} aria-label={open ? 'Recolher seção' : 'Expandir seção'} />
          </div>
        </div>
        {right ? <div className="ml-4">{right}</div> : null}
      </div>

      <div className="mx-auto max-w-full">
        <div className={`transition-all duration-200 ${open ? 'block' : 'hidden'}`}>{children}</div>
      </div>

      <div className="mt-4 border-t border-gray-100" />
    </div>
  );
}
