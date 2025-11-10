import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import IconButton from "./IconButton";

const SCROLL_THRESHOLD = 500;

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    handleScroll(); // на случай, если уже проскроллили
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <IconButton
      icon={<ArrowUp size={24} />}
      color="glass"
      size="lg"
      onClick={handleClick}
      aria-label="Прокрутить наверх"
      className="fixed bottom-5 sm:bottom-10 left-5 sm:left-10 z-50 hover:scale-105 active:scale-95"
    />
  );
}
