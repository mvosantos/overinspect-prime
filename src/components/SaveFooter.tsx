import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';

type Props = {
  loading?: boolean;
  onSave: () => void;
  onCancel?: () => void;
  saveLabel?: string;
};

export default function SaveFooter({ loading = false, onSave, onCancel, saveLabel }: Props) {
  const { t } = useTranslation(['common']);
  const label = loading ? (t('common:saving') || 'Salvando...') : ((saveLabel ?? t('common:saveUCase')) || 'Salvar');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-inner dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-start justify-start max-w-6xl gap-2 p-4">
        <Button
          label={label}
          onClick={onSave}
          icon={loading ? 'pi pi-spin pi-spinner' : undefined}
          disabled={loading}
          className="p-button-primary"
        />
      </div>
    </div>
  );
}
