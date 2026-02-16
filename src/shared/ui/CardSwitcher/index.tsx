import AlfaCard1 from "@/assets/alfa-card-1.png";
import AlfaCard2 from "@/assets/alfa-card-2.png";
import AlfaCard3 from "@/assets/alfa-card-3.png";
import AlfaCard4 from "@/assets/alfa-card-4.png";
import AlfaCard5 from "@/assets/alfa-card-5.png";
import AlfaCard6 from "@/assets/alfa-card-6.png";
import AlfaCard7 from "@/assets/alfa-card-7.png";
import RayImage from "@/assets/ray.png";
import SparksImage from "@/assets/sparks.png";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";

import "./index.css";

type CardItem = {
  id: number;
  image: string;
  hitX: number;
  hitY: number;
};

type CardSwitcherProps = {
  blur?: boolean;
  brightest?: boolean;
  className?: string;
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export default function CardSwitcher({
  blur = false,
  brightest = false,
  className,
}: CardSwitcherProps) {
  const CARD_TRANSITION_MS = 1400;
  const RAY_EARLY_MS = 1120;
  const RAY_EXPAND_MS = 50;
  const cards = useMemo<CardItem[]>(
    () => [
      { id: 1, image: AlfaCard1, hitX: 70, hitY: 70 },
      { id: 2, image: AlfaCard2, hitX: 34, hitY: 54 },
      { id: 3, image: AlfaCard3, hitX: 70, hitY: 75 },
      { id: 4, image: AlfaCard4, hitX: 64, hitY: 66 },
      { id: 5, image: AlfaCard5, hitX: 68, hitY: 62 },
      { id: 6, image: AlfaCard6, hitX: 58, hitY: 70 },
      { id: 7, image: AlfaCard7, hitX: 58, hitY: 92 },
    ],
    [],
  );
  const [activeIndex, setActiveIndex] = useState(3);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [rayActiveIndex, setRayActiveIndex] = useState<number | null>(null);
  const [sparksActiveIndex, setSparksActiveIndex] = useState<number | null>(
    null,
  );
  const rayTimerRef = useRef<number | null>(null);
  const sparksTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const percentX = event.clientX / window.innerWidth - 0.5;
      const percentY = event.clientY / window.innerHeight - 0.5;
      const tiltX = percentY * -10;
      const tiltY = percentX * 10;
      setTilt({ x: tiltX, y: tiltY });
    };

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  useEffect(() => {
    if (rayTimerRef.current !== null) {
      window.clearTimeout(rayTimerRef.current);
      rayTimerRef.current = null;
    }
    if (sparksTimerRef.current !== null) {
      window.clearTimeout(sparksTimerRef.current);
      sparksTimerRef.current = null;
    }
    setRayActiveIndex(null);
    setSparksActiveIndex(null);

    const delay = Math.max(0, CARD_TRANSITION_MS - RAY_EARLY_MS);
    rayTimerRef.current = window.setTimeout(() => {
      setRayActiveIndex(activeIndex);
      rayTimerRef.current = null;
      sparksTimerRef.current = window.setTimeout(() => {
        setSparksActiveIndex(activeIndex);
        sparksTimerRef.current = null;
      }, RAY_EXPAND_MS);
    }, delay);

    return () => {
      if (rayTimerRef.current !== null) {
        window.clearTimeout(rayTimerRef.current);
        rayTimerRef.current = null;
      }
      if (sparksTimerRef.current !== null) {
        window.clearTimeout(sparksTimerRef.current);
        sparksTimerRef.current = null;
      }
    };
  }, [activeIndex]);

  return (
    <div
      className={cn(
        "card-switcher",
        !blur && "card-switcher--no-blur",
        brightest && "card-switcher--brightest",
        className,
      )}
    >
      <div className="card-switcher__track" aria-live="polite">
        {cards.map((card, index) => {
          const offset = index - activeIndex;
          const distance = Math.abs(offset);
          if (distance > 6) {
            return null;
          }
          const isActive = index === activeIndex;
          const baseGap = 130;
          const activePush = 40;
          const translateX =
            offset * baseGap +
            (offset !== 0 ? Math.sign(offset) * activePush : 0);
          const translateZ = isActive ? 200 : 0;
          const rotateY = isActive ? 30 : 0;
          const scale = isActive ? 1.6 : 1;
          const opacity = 1;
          const hitX = clampPercent(card.hitX);
          const hitY = clampPercent(card.hitY);
          return (
            <button
              key={card.id}
              type="button"
              className={cn("card-switcher__card", isActive && "is-active")}
              onClick={() => setActiveIndex(index)}
              style={{
                transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex: 50 - distance,
              }}
              aria-pressed={isActive}
            >
              <div
                className="card-switcher__tilt"
                style={{
                  transform: `rotateX(${isActive ? tilt.x.toFixed(2) : "0"}deg) rotateY(${isActive ? tilt.y.toFixed(2) : "0"}deg)`,
                }}
              >
                <span className="card-switcher__image-stack" aria-hidden="true">
                  <img
                    src={card.image}
                    alt=""
                    className="card-switcher__image card-switcher__image--depth1"
                  />
                  <img
                    src={card.image}
                    alt=""
                    className="card-switcher__image card-switcher__image--front"
                  />
                </span>
                <span
                  className="card-switcher__fx-anchor"
                  style={{
                    left: `${hitX}%`,
                    top: `${hitY}%`,
                  }}
                >
                  <span
                    className={cn(
                      "card-switcher__ray",
                      rayActiveIndex === index && "is-visible",
                    )}
                    aria-hidden="true"
                  >
                    <img src={RayImage} alt="" />
                  </span>
                  <span
                    className={cn(
                      "card-switcher__sparks",
                      sparksActiveIndex === index && "is-visible",
                    )}
                    aria-hidden="true"
                  >
                    <img src={SparksImage} alt="" />
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
