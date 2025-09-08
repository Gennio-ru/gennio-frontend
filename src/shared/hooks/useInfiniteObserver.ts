import { useEffect, useRef } from "react";

export function useInfiniteObserver(
  onIntersect: () => void,
  canLoad: boolean,
  rootMargin = "400px"
) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && canLoad) onIntersect();
      },
      { root: null, rootMargin, threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [onIntersect, canLoad, rootMargin]);

  return ref;
}
