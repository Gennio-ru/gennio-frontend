import { useEffect, useState } from "react";

export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    setIsTouch(touch);
  }, []);

  return isTouch;
}
