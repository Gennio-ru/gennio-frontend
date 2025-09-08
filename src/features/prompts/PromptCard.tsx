import type { Prompt } from "@/api/prompts";
import { ImgComparisonSlider } from "@img-comparison-slider/react";

const BASE = (
  import.meta.env.VITE_ASSETS_BASE_URL ??
  import.meta.env.VITE_API_URL ??
  ""
).replace(/\/$/, "");

function toUrl(p?: string | null, id?: string) {
  if (!p) return `https://picsum.photos/400/300?random=${id ?? Math.random()}`;
  if (/^https?:\/\//i.test(p)) return p;
  const path = p.startsWith("/") ? p.slice(1) : p;
  return `${BASE}/${path}`;
}

export default function PromptCard({ p }: { p: Prompt }) {
  const beforeSrc = toUrl(p.beforeImageUrl, p.id);
  const afterSrc = toUrl(p.afterImageUrl, p.id + "-b");

  return (
    <article className="group overflow-hidden rounded-2xl border...bg-white dark:bg-neutral-800 dark:border-neutral-700 shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImgComparisonSlider hover>
          <img
            slot="first"
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            src={beforeSrc}
            alt={p.title}
          />
          <img
            slot="second"
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            src={afterSrc}
            alt={p.title}
          />
        </ImgComparisonSlider>
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold">{p.title}</h3>
        {p.description && (
          <p className="mt-1 line-clamp-2 text-xs text-neutral-600 dark:text-stone-400">
            {p.description}
          </p>
        )}
      </div>
    </article>
  );
}
