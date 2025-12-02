import { useEffect, useMemo } from "react";
import CustomSelect from "@/shared/ui/CustomSelect";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchCategories,
  selectCategories,
  selectCategoriesLoading,
} from "@/features/app/appSlice";

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
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const loading = useAppSelector(selectCategoriesLoading);

  useEffect(() => {
    if (!categories.length) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

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
      placeholder={loading ? "Загрузка категорий…" : placeholder}
      className={className}
      color={color}
    />
  );
}
