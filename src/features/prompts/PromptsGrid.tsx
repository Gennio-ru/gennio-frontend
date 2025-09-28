import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchPromptsPage } from "./promptSlice";
import PromptCard from "./PromptCard";
import { useInfiniteObserver } from "@/shared/hooks/useInfiniteObserver";

export default function PromptsGrid() {
  const dispatch = useAppDispatch();
  const {
    items,
    status,
    page,
    hasMore,
    filters: { categoryId },
  } = useAppSelector((s) => s.prompts);

  const isLoading = status === "loading" && items.length === 0;
  const isLoadingMore = status === "loading" && items.length > 0;

  useEffect(() => {
    dispatch(
      fetchPromptsPage({ page: 1, categoryId: categoryId || undefined })
    );
  }, [dispatch, categoryId]);

  const loadMore = useCallback(() => {
    if (!hasMore || status === "loading") return;
    dispatch(fetchPromptsPage({ page: page + 1 }));
  }, [dispatch, hasMore, status, page]);

  const sentinelRef = useInfiniteObserver(
    loadMore,
    hasMore && status !== "loading",
    "500px"
  );

  if (isLoading) {
    return <div className="p-4 text-neutral-600">Loading…</div>;
  }
  if (status === "failed" && items.length === 0) {
    return <div className="p-4 text-red-600">Failed to load</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>

      {isLoadingMore && (
        <div className="flex justify-center py-6">
          <span className="loading loading-spinner loading-md text-neutral-500" />
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />

      {!hasMore && items.length > 0 && (
        <div className="py-10 grid place-items-center text-neutral-400">
          Больше ничего нет
        </div>
      )}

      {items.length === 0 && (
        <div className="py-10 grid place-items-center text-neutral-400">
          Ничего не найдено
        </div>
      )}
    </>
  );
}
