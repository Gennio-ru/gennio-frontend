import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  hideMobileSidebar,
  selectShowMobileSidebar,
  showMobileSidebar,
} from "@/features/app/appSlice";
import { Menu, XIcon } from "lucide-react";

type NavItem = { label: string; href: string; external?: boolean };

type SidebarProps = {
  items: NavItem[];
  className?: string;
};

export function MenuItem({ item }: { item: NavItem }) {
  return item.external ? (
    <a
      key={item.label}
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block py-1 text-base-content hover:text-primary transition-colors"
    >
      {item.label}
    </a>
  ) : (
    <NavLink
      key={item.label}
      to={item.href}
      className={({ isActive }) =>
        cn(
          "block transition-colors text-base py-1.5",
          isActive ? "text-primary" : "text-base-content hover:text-primary"
        )
      }
    >
      {item.label}
    </NavLink>
  );
}

export function SidebarToggleButton({
  className,
  label = "Открыть меню",
}: {
  className?: string;
  label?: string;
}) {
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => dispatch(showMobileSidebar())}
      className={cn("md:hidden cursor-pointer", className)}
    >
      <Menu size={28} />
    </button>
  );
}

export function SidebarMobile({ items }: SidebarProps) {
  const dispatch = useAppDispatch();
  const isShownMobileSidebar = useAppSelector(selectShowMobileSidebar);

  useEffect(() => {
    if (!isShownMobileSidebar) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch(hideMobileSidebar());
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isShownMobileSidebar, dispatch]);

  return (
    <div
      aria-hidden={!isShownMobileSidebar}
      className={cn(
        "[@media(min-width:1440px)]:hidden fixed inset-0 z-50 transition",
        isShownMobileSidebar ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      {/* overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-300",
          isShownMobileSidebar ? "opacity-100" : "opacity-0"
        )}
        onClick={() => dispatch(hideMobileSidebar())}
      />

      {/* glass panel */}
      <aside
        className={cn(
          "absolute left-2 top-2 h-[calc(100%-1rem)] w-[82%] max-w-[240px]",
          "rounded-field backdrop-blur-md bg-base-100/60 border border-white/10 shadow-lg",
          "px-6 py-3 transition-transform duration-300 ease-in-out",
          isShownMobileSidebar
            ? "translate-x-0"
            : "-translate-x-[calc(100%+1rem)]"
        )}
        role="dialog"
        aria-label="Мобильное меню"
      >
        {/* header */}
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={() => dispatch(hideMobileSidebar())}
            className="p-2 cursor-pointer relative left-3"
          >
            <XIcon size={24} />
          </button>
        </div>

        {/* nav */}
        <nav className="space-y-1">
          {items.map((item) => (
            <MenuItem key={item.label} item={item} />
          ))}
        </nav>
      </aside>
    </div>
  );
}
