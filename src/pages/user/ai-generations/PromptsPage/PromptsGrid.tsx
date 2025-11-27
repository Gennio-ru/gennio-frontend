import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchPromptsPage } from "@/features/prompts/promptSlice";
import PromptCard from "./PromptCard";
import { useInfiniteObserver } from "@/shared/hooks/useInfiniteObserver";
import NotFound from "@/shared/ui/NotFound";
import Loader from "@/shared/ui/Loader";

export default function PromptsGrid() {
  const dispatch = useAppDispatch();
  const {
    items,
    status,
    page,
    hasMore,
    filters: { categoryId, search },
  } = useAppSelector((s) => s.prompts);

  const isLoading = status === "loading" && items.length === 0;
  const isLoadingMore = status === "loading" && items.length > 0;

  useEffect(() => {
    dispatch(
      fetchPromptsPage({ page: 1, categoryId: categoryId || undefined, search })
    );
  }, [dispatch, categoryId, search]);

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
    return <Loader />;
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

      {isLoadingMore && <Loader />}

      <div ref={sentinelRef} className="h-1" />

      {!hasMore && items.length > 0 && (
        <div className="py-10 grid place-items-center text-base-content/60">
          Больше ничего не нашлось
        </div>
      )}

      {items.length === 0 && <NotFound />}
    </>
  );
}
