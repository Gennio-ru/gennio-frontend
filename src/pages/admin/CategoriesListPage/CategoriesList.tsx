import { useCallback, useEffect, useMemo, useState } from "react";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import {
  apiGetCategories,
  apiDeleteCategory,
  type Category,
} from "@/api/categories";
import EditCategoryModal from "./EditCategoryModal";
import { Edit as EditIcon, Trash2 as TrashIcon } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CategoriesAdminList() {
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [searchLocal, setSearchLocal] = useState("");
  const [searchValue, setSearchValue] = useState(""); // 🔸 значение после дебаунса
  const [items, setItems] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiGetCategories();
      setItems(res);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(`Failed to load categories. ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 🕓 debounce — применяем введённый текст только спустя 300 мс после остановки ввода
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchValue(searchLocal);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchLocal]);

  const filtered = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) =>
      [c.name, c.description ?? ""].some((v) => v.toLowerCase().includes(q))
    );
  }, [items, searchValue]);

  const handleCreate = () => {
    setEditingId(null);
    setEditOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    const target = items.find((i) => i.id === id);
    const name = target?.name ?? "category";
    if (!confirm(`Удалить «${name}»? Это действие нельзя отменить.`)) return;

    try {
      await apiDeleteCategory(id);
      toast.success("Удалено");
      fetchCategories();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(`Не удалось удалить. ${msg}`);
    }
  };

  return (
    <div className="py-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            value={searchLocal}
            onChange={(e) => setSearchLocal(e.target.value)}
            placeholder="Search by name or description"
            className="bg-base-100!"
          />
        </div>

        <Button className="sm:w-auto" onClick={handleCreate}>
          + New category
        </Button>
      </div>

      <div className="overflow-hidden rounded-box bg-base-100">
        <table className="w-full text-sm">
          <thead className="bg-base-100 text-base-content/70 border-b border-base-300">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left hidden sm:table-cell">
                Description
              </th>
              <th className="p-3 w-[88px] text-left"></th>
            </tr>
          </thead>

          <tbody>
            {!isLoading &&
              filtered.map((category) => (
                <tr key={category.id}>
                  <td className="p-3">{category.name}</td>
                  <td className="p-3 hidden sm:table-cell">
                    {category.description || "-"}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        title="Edit"
                        onClick={() => handleEdit(category.id)}
                      >
                        <EditIcon size={16} />
                      </Button>

                      <Button
                        size="sm"
                        title="Delete"
                        onClick={() => void handleDelete(category.id)}
                      >
                        <TrashIcon size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

            {!isLoading && filtered.length === 0 && (
              <tr>
                <td className="p-4 text-base-content/50" colSpan={3}>
                  Не найдено
                </td>
              </tr>
            )}

            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-3">
                    <div className="h-4 w-32 bg-base-200 rounded" />
                  </td>
                  <td className="p-3 hidden sm:table-cell">
                    <div className="h-4 w-56 bg-base-200 rounded" />
                  </td>
                  <td className="p-3">
                    <div className="h-8 w-[88px] bg-base-200 rounded" />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <EditCategoryModal
        open={editOpen}
        onOpenChange={setEditOpen}
        categoryId={editingId ?? undefined}
        onSaved={fetchCategories}
      />
    </div>
  );
}
