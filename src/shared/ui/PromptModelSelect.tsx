import { ModelType } from "@/api/modules/model-job";
import CustomSelect from "@/shared/ui/CustomSelect";

const MODEL_TYPE_LABELS: Record<ModelType, string> = {
  [ModelType.OPENAI]: "OpenAI",
  [ModelType.GEMINI]: "Google Gemini",
};

interface ModelTypeOption {
  value: ModelType;
  label: string;
}

interface Props {
  value: string | null;
  onChange: (value: string) => void;
  onReset?: () => void;
  placeholder?: string;
  className?: string;
  color?: "primary" | "secondary";
}

export default function PromptModelSelect({
  value,
  onChange,
  onReset,
  placeholder = "Выберите модель генерации",
  className,
  color = "primary",
}: Props) {
  const selectItems: ModelTypeOption[] = Object.values(ModelType).map(
    (value) => ({
      value,
      label: MODEL_TYPE_LABELS[value],
    })
  );

  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      onReset={onReset}
      items={selectItems}
      placeholder={placeholder}
      className={className}
      color={color}
    />
  );
}
