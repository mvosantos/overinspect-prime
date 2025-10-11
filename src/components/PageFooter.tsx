import { useTheme } from '../hooks/useTheme';
import { useSave } from '../contexts/SaveContext';

type Props = {
  onSaveClick?: () => void;
  label?: string;
};

export default function PageFooter({ onSaveClick, label = 'Salvar' }: Props) {
  const { theme } = useTheme();
  const save = useSave();

  // read meta directly from context on each render; SaveProvider updates its context
  // value (metaVersion) when registration or getters change which causes consumers
  // to re-render — calling getMeta() here returns the latest truth.
  const meta = save.getMeta();

  const handleClick = () => {
    if (onSaveClick) return onSaveClick();
    save.triggerSave();
  };

  const isDisabled = !meta.isValid || meta.isSubmitting;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 flex justify-end p-3 border-t ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
      <button type="button" className={`p-button p-component p-button-primary ${meta.isSubmitting ? 'p-disabled' : ''}`} onClick={handleClick} disabled={isDisabled}>
        {meta.isSubmitting ? <i className="pi pi-spin pi-spinner" /> : <i className="pi pi-save" />}
        <span className="ml-2">{label}</span>
      </button>
    </div>
  );
}
