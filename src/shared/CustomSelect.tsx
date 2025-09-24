import { apiGetCategories, Category } from "@/api/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

export default function CustomSelect() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiGetCategories().then((res) => setCategories(res));
  }, []);

  return (
    <Select defaultValue="apple">
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Выберите категорию" />
      </SelectTrigger>

      <SelectContent>
        {categories.map((item) => (
          <SelectItem value={item.id}>{item.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
