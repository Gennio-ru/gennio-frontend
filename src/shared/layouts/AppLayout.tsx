import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Container from "@/shared/ui/Container";
import HeaderNav from "@/shared/widgets/HeaderNav";
import { SidebarMobile } from "@/shared/layouts/Sidebar";
import { AdminButton } from "@/shared/ui/AdminButton";
import { useAuth } from "@/features/auth/useAuth";
import { primaryHeaderMenu, adminHeaderMenu } from "../config/menu";
import { useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";
import { cn } from "@/lib/utils";
import AuthModal from "../ui/AuthModal/AuthModal";

type Props = { children: ReactNode };

export default function AppLayout({ children }: Props) {
  const { user } = useAuth();
  const theme = useAppSelector(selectAppTheme);
  const location = useLocation();

  const isAdminPage =
    user?.role === "admin" && location.pathname.startsWith("/admin");
  const menuItems = isAdminPage ? adminHeaderMenu : primaryHeaderMenu;

  return (
    <div className={cn("min-h-screen flex flex-col text-base-content")}>
      {/* Header */}
      <header
        className={cn(
          "sticky flex items-center top-0 z-40 h-[60px]",
          theme === "dark" ? "glass-panel-dark" : "glass-panel-light"
        )}
      >
        <Container>
          <HeaderNav />
        </Container>
      </header>

      {/* Main content */}
      <main className="flex-1 py-6">
        <Container>
          {children}
          {user?.role === "admin" && <AdminButton />}
        </Container>
      </main>

      {/* Mobile menu */}
      <SidebarMobile items={menuItems} />

      <AuthModal />
    </div>
  );
}
