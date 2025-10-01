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
  secondary?: NavItem[];
  socials?: NavItem[];
  className?: string;
};

export function SidebarDesktop({
  items,
  secondary,
  socials,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden [@media(min-width:1440px)]:flex sticky top-16 h-min w-52 shrink-0 flex-col overflow-auto",
        "px-4",
        className
      )}
      aria-label="Боковое меню"
    >
      <nav className="space-y-1">
        {items.map((it) =>
          it.external ? (
            <a
              key={it.label}
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-field px-3 py-2 text-base-content/80 hover:text-base-content hover:bg-base-200 transition-colors"
            >
              {it.label}
            </a>
          ) : (
            <NavLink
              key={it.label}
              to={it.href}
              className={({ isActive }) =>
                cn(
                  "block rounded-field px-3 py-2 transition-colors text-base",
                  isActive
                    ? "bg-primary text-primary-content"
                    : "text-base-content/80 hover:text-primary-content hover:bg-primary/70"
                )
              }
            >
              <b>{it.label}</b>
            </NavLink>
          )
        )}
      </nav>

      {socials?.length ? (
        <div className="mt-6">
          <div className="mb-2 text-xs uppercase tracking-wide text-base-content/50">
            соцсети
          </div>
          <nav className="space-y-1">
            {socials.map((it) => (
              <a
                key={it.label}
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-field px-3 py-2 text-base-content/70 hover:text-base-content hover:bg-base-200 transition-colors"
              >
                {it.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}

      {secondary?.length ? (
        <div className="mt-6">
          <div className="mb-2 text-xs uppercase tracking-wide text-base-content/50">
            сервис
          </div>
          <nav className="space-y-1">
            {secondary.map((it) =>
              it.external ? (
                <a
                  key={it.label}
                  href={it.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-field px-3 py-2 text-base-content/70 hover:text-base-content hover:bg-base-200 transition-colors"
                >
                  {it.label}
                </a>
              ) : (
                <NavLink
                  key={it.label}
                  to={it.href}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-field px-3 py-2 transition-colors",
                      isActive
                        ? "bg-base-100 text-base-content font-small ring-1 ring-base-300"
                        : "text-base-content/70 hover:text-base-content hover:bg-base-200"
                    )
                  }
                >
                  {it.label}
                </NavLink>
              )
            )}
          </nav>
        </div>
      ) : null}
    </aside>
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
      className={cn(
        "[@media(min-width:1440px)]:hidden cursor-pointer",
        className
      )}
    >
      <Menu size={24} />
    </button>
  );
}

export function SidebarMobile({ items, socials, secondary }: SidebarProps) {
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
      {/* panel */}
      <aside
        className={cn(
          "absolute left-0 top-0 h-full w-[82%] max-w-[240px]",
          "bg-base-100 px-4 py-2",
          "transition-transform duration-300 ease-in-out",
          isShownMobileSidebar ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-label="Мобильное меню"
      >
        <div className="flex justify-end mb-2">
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={() => dispatch(hideMobileSidebar())}
            className="p-2 cursor-pointer"
          >
            <XIcon size={24} />
          </button>
        </div>

        <nav className="space-y-1">
          {items.map((it) =>
            it.external ? (
              <a
                key={it.label}
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => dispatch(hideMobileSidebar())}
                className="block rounded-field px-3 py-2 text-base-content/80 hover:text-base-content hover:bg-base-200 transition-colors"
              >
                {it.label}
              </a>
            ) : (
              <NavLink
                key={it.label}
                to={it.href}
                onClick={() => dispatch(hideMobileSidebar())}
                className={({ isActive }) =>
                  cn(
                    "block rounded-field px-3 py-2 transition-colors",
                    isActive
                      ? "bg-base-100 text-primary-content text-base bg-primary"
                      : "text-base-content/80 hover:text-primary-content hover:bg-primary/70"
                  )
                }
              >
                {it.label}
              </NavLink>
            )
          )}
        </nav>

        {socials?.length ? (
          <div className="mt-6">
            <div className="mb-2 text-xs uppercase tracking-wide text-base-content/50">
              соцсети
            </div>
            <nav className="space-y-1">
              {socials.map((it) => (
                <a
                  key={it.label}
                  href={it.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => dispatch(hideMobileSidebar())}
                  className="block rounded-field px-3 py-2 text-base-content/70 hover:text-base-content hover:bg-base-200 transition-colors"
                >
                  {it.label}
                </a>
              ))}
            </nav>
          </div>
        ) : null}

        {secondary?.length ? (
          <div className="mt-6">
            <div className="mb-2 text-xs uppercase tracking-wide text-base-content/50">
              сервис
            </div>
            <nav className="space-y-1">
              {secondary.map((it) =>
                it.external ? (
                  <a
                    key={it.label}
                    href={it.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => dispatch(hideMobileSidebar())}
                    className="block rounded-field px-3 py-2 text-base-content/70 hover:text-base-content hover:bg-base-200 transition-colors"
                  >
                    {it.label}
                  </a>
                ) : (
                  <NavLink
                    key={it.label}
                    to={it.href}
                    onClick={() => dispatch(hideMobileSidebar())}
                    className={({ isActive }) =>
                      cn(
                        "block rounded-field px-3 py-2 transition-colors",
                        isActive
                          ? "bg-base-100 text-base-content font-small"
                          : "text-base-content/70 hover:text-base-content hover:bg-base-200"
                      )
                    }
                  >
                    {it.label}
                  </NavLink>
                )
              )}
            </nav>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
