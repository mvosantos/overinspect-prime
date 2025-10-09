import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';

type Props = { control?: Control<Record<string, unknown>> };

export default function WeighingSection({ control }: Props) {
  return (
    <Card>
      <div className="text-center mb-4">
        <div className="inline-block px-4 py-1 rounded-md bg-teal-50 border border-teal-100">
          <h3 className="text-lg font-semibold text-teal-700">Dados referente à Pesagem e Amostragem</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Peso bruto</label>
          <Controller control={control} name="gross_weight" render={({ field }) => <InputText className="w-full" value={(field.value as string) ?? ''} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />} />
        </div>
        <div>
          <label className="block mb-1">Peso líquido</label>
          <Controller control={control} name="net_weight" render={({ field }) => <InputText className="w-full" value={(field.value as string) ?? ''} onChange={(e) => field.onChange((e.target as HTMLInputElement).value)} />} />
        </div>
      </div>
    </Card>
  );
}
