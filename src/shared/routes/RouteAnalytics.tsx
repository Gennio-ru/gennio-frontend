// src/app/RouteAnalytics.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ymHit } from "@/lib/metrics/yandexMetrika";

export function RouteAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const url = location.pathname + location.search + location.hash;
    ymHit(url);
  }, [location]);

  return null;
}
