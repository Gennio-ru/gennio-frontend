import { Lock } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export function AdminButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToAdmin = () => {
    navigate("/admin/prompts");
  };

  if (location.pathname.includes("/admin")) {
    return null;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Редактировать промпты"
      title="Редактировать промпты"
      className="fixed bottom-12 right-4 h-16 w-16 z-50 flex items-center justify-center rounded-full cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
      onClick={goToAdmin}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") goToAdmin();
      }}
    >
      <Lock size={40} className="text-base-content/60" />
    </div>
  );
}
