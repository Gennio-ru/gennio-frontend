import { apiGetCategories, Category } from "@/api/categories";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { resetCategory, setCategory } from "@/features/prompts/promptSlice";
import { useEffect, useMemo, useState } from "react";
import CustomSelect from "../../../shared/ui/CustomSelect";

export default function CategoriesSelect() {
  const dispatch = useAppDispatch();
  const { categoryId } = useAppSelector((state) => state.prompts.filters);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiGetCategories().then((res) => setCategories(res));
  }, []);

  const handleChangeValue = (value: string) => {
    dispatch(setCategory(value));
  };

  const handleClearCategory = () => {
    dispatch(resetCategory());
  };

  const selectItems = useMemo(
    () => categories.map((item) => ({ value: item.id, label: item.name })),
    [categories]
  );

  return (
    <CustomSelect
      value={categoryId}
      onChange={handleChangeValue}
      onReset={handleClearCategory}
      items={selectItems}
    />
  );
}
