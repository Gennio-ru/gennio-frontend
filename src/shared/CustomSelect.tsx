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
    <Select>
      <SelectTrigger className="w-auto min-w-36 bg-white">
        <SelectValue placeholder="Все категории" />
      </SelectTrigger>

      <SelectContent>
        {categories.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
