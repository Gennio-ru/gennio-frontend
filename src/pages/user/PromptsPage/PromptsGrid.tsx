import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchPromptsPage } from "@/features/prompts/promptSlice";
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
    return <div className="p-4 text-base-content/70">Loading…</div>;
  }
  if (status === "failed" && items.length === 0) {
    return <div className="p-4 text-error">Failed to load</div>;
  }

  return (
    <>
      <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
        {items.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>

      {isLoadingMore && (
        <div className="flex justify-center py-6">
          <span className="loading loading-spinner loading-md text-base-content/50" />
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />

      {!hasMore && items.length > 0 && (
        <div className="py-10 grid place-items-center text-base-content/60">
          Больше ничего нет
        </div>
      )}

      {items.length === 0 && (
        <div className="py-10 grid place-items-center text-base-content/60">
          Ничего не найдено
        </div>
      )}
    </>
  );
}
