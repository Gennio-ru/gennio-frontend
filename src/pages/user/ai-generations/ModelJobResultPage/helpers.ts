export type ImageMeta = {
  widthPx?: number | null;
  heightPx?: number | null;
};

export type AspectRatio =
  | "1:1"
  | "2:3"
  | "3:2"
  | "3:4"
  | "4:3"
  | "9:16"
  | "16:9";

const ASPECT_RATIOS: AspectRatio[] = [
  "1:1",
  "2:3",
  "3:2",
  "3:4",
  "4:3",
  "9:16",
  "16:9",
];

function parseRatio(r: AspectRatio): number {
  const [w, h] = r.split(":").map(Number);
  return w / h;
}

export function getAspectRatio(meta?: ImageMeta | null): AspectRatio {
  const w = meta?.widthPx ?? 0;
  const h = meta?.heightPx ?? 0;

  // нет размеров — какой-то безопасный дефолт
  if (!w || !h) return "1:1";

  const actual = w / h;

  let best: AspectRatio = "1:1";
  let bestDiff = Number.POSITIVE_INFINITY;

  for (const o of ASPECT_RATIOS) {
    const r = parseRatio(o);
    const diff = Math.abs(actual - r);

    if (diff < bestDiff) {
      bestDiff = diff;
      best = o;
    }
  }

  return best;
}
