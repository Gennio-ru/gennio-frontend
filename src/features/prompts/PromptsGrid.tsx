import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchPromptsPage } from "./promptSlice";
import PromptCard from "./PromptCard";
import { useInfiniteObserver } from "@/shared/hooks/useInfiniteObserver";

export default function PromptsGrid() {
  const dispatch = useAppDispatch();
  const { items, status, isLoadingMore, page, hasMore } = useAppSelector(
    (s) => s.prompts
  );

  useEffect(() => {
    dispatch(fetchPromptsPage({ page: 1 }));
  }, [dispatch]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || status === "loading") return;
    dispatch(fetchPromptsPage({ page: page + 1 }));
  }, [dispatch, hasMore, isLoadingMore, status, page]);

  const sentinelRef = useInfiniteObserver(
    loadMore,
    hasMore && !isLoadingMore && status !== "loading",
    "500px"
  );

  if (status === "loading" && items.length === 0) {
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
        <div className="py-6 grid place-items-center text-sm text-neutral-500">
          Загрузка…
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />

      {!hasMore && items.length > 0 && (
        <div className="py-6 grid place-items-center text-xs text-neutral-400">
          Больше ничего нет
        </div>
      )}
    </>
  );
}
