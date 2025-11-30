import { useEffect, useMemo, useState } from "react";
import CustomSelect from "@/shared/ui/CustomSelect";
import { apiGetCategories, Category } from "@/api/modules/categories";

interface Props {
  value: string | null;
  onChange: (value: string) => void;
  onReset?: () => void;
  placeholder?: string;
  className?: string;
  color?: "primary" | "secondary";
}

export default function CategoriesSelect({
  value,
  onChange,
  onReset,
  placeholder = "Выберите категорию",
  className,
  color = "primary",
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiGetCategories().then((res) => setCategories(res));
  }, []);

  const selectItems = useMemo(
    () => categories.map((item) => ({ value: item.id, label: item.name })),
    [categories]
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
