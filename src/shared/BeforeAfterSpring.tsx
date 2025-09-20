import { useRef, useMemo, useCallback } from "react";
import { motion, useSpring, useMotionTemplate } from "framer-motion";

type Props = {
  before: string;
  after: string;
  alt?: string;
  className?: string;
  initial?: number; // 0..100
  returnTo?: number | null; // null — не возвращаться
  keyStep?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
  onChange?: (value: number) => void;
};

export default function BeforeAfterSpring({
  before,
  after,
  alt = "comparison",
  className = "",
  initial = 50,
  returnTo = 50,
  keyStep = 2,
  stiffness = 200,
  damping = 22,
  mass = 0.4,
  onChange,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pct = useSpring(initial, { stiffness, damping, mass });

  // Двигаем именно линию отсечения (clip-path), а не ширину контейнера
  const clip = useMotionTemplate`polygon(0% 0%, ${pct}% 0%, ${pct}% 100%, 0% 100%)`;
  const left = useMotionTemplate`${pct}%`; // для ручки

  useMemo(() => {
    const unsub = pct.on("change", (v) => onChange?.(v));
    return () => unsub();
  }, [pct, onChange]);

  const clamp = (n: number) => (n < 0 ? 0 : n > 100 ? 100 : n);

  const posFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return null;
    const x = e.clientX - r.left;
    return clamp((x / r.width) * 100);
  };

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const p = posFromEvent(e);
      if (p != null) pct.set(p);
    },
    [pct]
  );

  const handleLeave = useCallback(() => {
    if (returnTo != null) pct.set(clamp(returnTo));
  }, [pct, returnTo]);

  const handleDrag = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const r = wrapRef.current?.getBoundingClientRect();
      if (!r) return;
      const x = e.clientX - r.left;
      pct.set(clamp((x / r.width) * 100));
    },
    [pct]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const delta = (e.shiftKey ? 5 : 1) * keyStep;
    if (e.key === "ArrowLeft") pct.set((v) => clamp(v - delta));
    else if (e.key === "ArrowRight") pct.set((v) => clamp(v + delta));
    else if (e.key === "Home") pct.set(0);
    else if (e.key === "End") pct.set(100);
  };

  return (
    <div
      ref={wrapRef}
      className={`relative select-none overflow-hidden ${className}`}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      role="slider"
      aria-label="Before/After slider"
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={onKeyDown}
      style={{ touchAction: "none" }}
    >
      {/* Оба изображения зафиксированы абсолютно — никакого ресайза при движении */}
      <img
        src={after}
        alt={`${alt} — after`}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        draggable={false}
      />

      {/* Верхнее (before) не меняет размер, оно просто клипится */}
      <motion.div
        className="absolute inset-0 overflow-hidden will-change-[clip-path]"
        style={{ clipPath: clip }}
      >
        <img
          src={before}
          alt={`${alt} — before`}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          draggable={false}
        />
      </motion.div>

      {/* Разделитель и ручка — позиционируем по проценту */}
      <motion.div
        className="absolute inset-y-0 w-px bg-white/80 mix-blend-difference pointer-events-none"
        style={{ left }}
      />
      <motion.button
        type="button"
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border border-white/70 bg-black/40 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm outline-none focus:ring-2 focus:ring-white/70"
        style={{ left }}
        onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
        onPointerMove={handleDrag}
        onPointerUp={(e) => e.currentTarget.releasePointerCapture(e.pointerId)}
        aria-hidden={true}
      >
        ⇆
      </motion.button>
    </div>
  );
}
