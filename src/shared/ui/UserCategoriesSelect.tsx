import { apiGetCategories, Category } from "@/api/categories";
import { useEffect, useMemo, useState } from "react";
import { GennioSelect } from "./GennioSelect";

interface Props {
  value: string | null;
  onChange: (value: string) => void;
}

export default function UserCategoriesSelect({ value, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiGetCategories().then((res) => setCategories(res));
  }, []);

  const selectItems = useMemo(
    () => [
      { value: null, label: "Все стили" },
      ...categories.map((item) => ({ value: item.id, label: item.name })),
    ],
    [categories]
  );

  return (
    <GennioSelect value={value} onChange={onChange} options={selectItems} />
  );
}
