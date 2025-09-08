import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetPrompts, type PromptResponseDto } from "@/api/prompts";
import type { components } from "@/api/types.gen";
import Input from "@/shared/Input";
import Button from "@/shared/Button";

type PaginationMetaDto = components["schemas"]["PaginationMetaDto"];

export default function PromptsAdminList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const [items, setItems] = useState<PromptResponseDto[]>([]);
  const [meta, setMeta] = useState<PaginationMetaDto | undefined>(undefined);
  const [status, setStatus] = useState<"idle" | "loading" | "failed">("idle");

  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus("loading");
      try {
        const query = debouncedSearch.trim() || undefined;

        // apiGetPrompts возвращает { items, meta }
        const { items, meta } = (await apiGetPrompts({
          page,
          limit,
          search: query,
        })) as { items: PromptResponseDto[]; meta: PaginationMetaDto };

        if (!cancelled) {
          setItems(items);
          setMeta(meta);
          setStatus("idle");
        }
      } catch {
        if (!cancelled) setStatus("failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, limit, debouncedSearch]);

  const canPrev = (meta?.currentPage ?? 1) > 1;
  const canNext = !!meta && meta.currentPage < meta.totalPages;

  return (
    <div className="py-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-neutral-600">Title</label>
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // сброс страницы при новом поиске
            }}
            placeholder="Search by title or description"
          />
        </div>
        <Button
          className="sm:w-auto"
          onClick={() => navigate("/admin/prompts/new")}
        >
          + New prompt
        </Button>
      </div>

      {status === "loading" && <div>Loading…</div>}
      {status === "failed" && <div>Failed to load</div>}

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left hidden sm:table-cell">Type</th>
              <th className="p-3 text-left hidden md:table-cell">Premium</th>
              <th className="p-3 text-left hidden lg:table-cell">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr
                key={p.id}
                className="cursor-pointer hover:bg-neutral-50"
                onClick={() => navigate(`/admin/prompts/${p.id}`)}
              >
                <td className="p-3">{p.title}</td>
                <td className="p-3 hidden sm:table-cell">{p.type}</td>
                <td className="p-3 hidden md:table-cell">—</td>
                <td className="p-3 hidden lg:table-cell">
                  {new Date(p.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}

            {items.length === 0 && status === "idle" && (
              <tr>
                <td className="p-4 text-neutral-500" colSpan={4}>
                  No prompts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      <div className="mt-4 flex items-center justify-between text-sm text-neutral-600">
        <div>
          Page {meta?.currentPage ?? 1} of {meta?.totalPages ?? 1}
          {typeof meta?.totalItems === "number" && (
            <span className="ml-2 text-neutral-500">
              ({meta.totalItems} total)
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={!canPrev || status === "loading"}
            onClick={() => canPrev && setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <Button
            variant="secondary"
            disabled={!canNext || status === "loading"}
            onClick={() => canNext && setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
