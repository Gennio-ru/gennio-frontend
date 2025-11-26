import { Lock } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import IconButton from "./IconButton";

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
    <IconButton
      icon={<Lock size={24} />}
      color="glass"
      size="lg"
      onClick={goToAdmin}
      aria-label="Прокрутить наверх"
      className="fixed bottom-5 sm:bottom-10 left-5 sm:left-10 z-50 hover:scale-105 active:scale-95"
    />
  );
}
