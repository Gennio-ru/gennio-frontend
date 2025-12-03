declare global {
  interface Window {
    ym?: (...args) => void;
  }
}

const YM_ID = Number(import.meta.env.VITE_YM_ID ?? 0);
const YM_ENABLED = Boolean(YM_ID) && import.meta.env.VITE_YM_ENABLED === "true";

function callYm(...args) {
  if (!YM_ENABLED) return;
  if (typeof window === "undefined") return;
  if (typeof window.ym !== "function") return;

  window.ym(...args);
}

/**
 * Отправка хита (просмотр страницы) для SPA.
 * Вызываем при смене роутера.
 */
export function ymHit(url: string) {
  if (!YM_ENABLED) return;
  if (!YM_ID) return;

  callYm(YM_ID, "hit", url);
}

/**
 * Отправка цели (reachGoal)
 * goalName — имя цели в Метрике
 */
export function ymGoal(goalName: string, params?: Record<string, unknown>) {
  if (!YM_ENABLED) return;
  if (!YM_ID) return;

  callYm(YM_ID, "reachGoal", goalName, params);
}
