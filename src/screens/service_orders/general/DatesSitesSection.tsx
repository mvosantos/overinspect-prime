import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';

type Props = { control?: Control<Record<string, unknown>> };

export default function DatesSitesSection({ control }: Props) {
  return (
    <Card>
      <div className="text-center mb-4">
        <div className="inline-block px-4 py-1 rounded-md bg-teal-50 border border-teal-100">
          <h3 className="text-lg font-semibold text-teal-700">Datas, Locais e Previsões</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1">Data de criação</label>
          <Controller
            control={control}
            name="created_at"
            render={({ field }) => <Calendar className="w-full" value={field.value as Date | undefined} disabled />}
          />
        </div>
        <div>
          <label className="block mb-1">Data prevista</label>
          <Controller
            control={control}
            name="operation_starts_at"
            render={({ field }) => (
              <Calendar
                className="w-full"
                value={field.value as Date | undefined}
                onChange={((e: any) => field.onChange((e as any)?.value ?? null)) as any} // eslint-disable-line @typescript-eslint/no-explicit-any
              />
            )}
          />
        </div>
      </div>
    </Card>
  );
}
