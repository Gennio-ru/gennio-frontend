import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Container from "@/shared/ui/Container";
import HeaderNav from "@/shared/widgets/HeaderNav";
import { SidebarMobile } from "@/shared/layouts/Sidebar";
import { AdminButton } from "@/shared/ui/AdminButton";
import { useAuth } from "@/features/auth/useAuth";
import { primaryMenu, adminMenu } from "../config/menu";

type Props = { children: ReactNode };

export default function AppLayout({ children }: Props) {
  const { user } = useAuth();
  const location = useLocation();

  const isAdminPage =
    user?.role === "admin" && location.pathname.startsWith("/admin");
  const menuItems = isAdminPage ? adminMenu : primaryMenu;

  return (
    <div className="min-h-screen flex flex-col bg-base-200 text-base-content">
      {/* Header */}
      <header className="sticky flex items-center top-0 z-40 bg-base-100 h-[60px]">
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
    </div>
  );
}
