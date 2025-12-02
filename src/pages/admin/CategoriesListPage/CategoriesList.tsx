import { useEffect, useMemo, useState, useCallback } from "react";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import { apiDeleteCategory } from "@/api/modules/categories";
import EditCategoryModal from "./EditCategoryModal";
import { Edit as EditIcon, Trash2 as TrashIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchCategories,
  selectCategories,
  selectCategoriesLoading,
} from "@/features/app/appSlice";

export default function CategoriesAdminList() {
  const dispatch = useAppDispatch();

  const categories = useAppSelector(selectCategories);
  const isLoading = useAppSelector(selectCategoriesLoading);

  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [searchLocal, setSearchLocal] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const loadCategories = useCallback(() => {
    void dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchValue(searchLocal);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchLocal]);

  const filtered = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) =>
      [c.name, c.description ?? ""].some((v) => v.toLowerCase().includes(q))
    );
  }, [categories, searchValue]);

  const handleCreate = () => {
    setEditingId(null);
    setEditOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    const target = categories.find((i) => i.id === id);
    const name = target?.name ?? "category";
    if (!confirm(`Удалить «${name}»? Это действие нельзя отменить.`)) return;

    try {
      await apiDeleteCategory(id);
      toast.success("Удалено");
      loadCategories();
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
            className="bg-base-100"
          />
        </div>

        <Button className="sm:w-auto" onClick={handleCreate}>
          + New category
        </Button>
      </div>

      <div className="overflow-hidden rounded-box bg-base-100">
        <table className="w-full text-sm">
          <thead className="border-b border-base-300 bg-base-100 text-base-content/70">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="hidden p-3 text-left sm:table-cell">
                Description
              </th>
              <th className="w-[88px] p-3 text-left" />
            </tr>
          </thead>

          <tbody>
            {!isLoading &&
              filtered.map((category, index) => (
                <tr
                  key={category.id}
                  className={cn(index % 2 === 0 && "bg-base-200/40")}
                >
                  <td className="p-3">{category.name}</td>
                  <td className="hidden p-3 sm:table-cell">
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
                    <div className="h-4 w-32 rounded bg-base-200" />
                  </td>
                  <td className="hidden p-3 sm:table-cell">
                    <div className="h-4 w-56 rounded bg-base-200" />
                  </td>
                  <td className="p-3">
                    <div className="h-8 w-[88px] rounded bg-base-200" />
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
        onSaved={loadCategories}
      />
    </div>
  );
}
