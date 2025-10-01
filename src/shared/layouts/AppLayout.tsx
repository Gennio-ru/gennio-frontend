import { ReactNode } from "react";
import Container from "@/shared/ui/Container";
import HeaderNav from "@/shared/widgets/HeaderNav";
import Footer from "@/shared/widgets/Footer";
import { SidebarDesktop, SidebarMobile } from "@/shared/layouts/Sidebar";
import { AdminButton } from "@/shared/ui/AdminButton";
import { useAuth } from "@/features/auth/useAuth";
import { primaryMenu } from "../config/menu";

type Props = { children: ReactNode };

export default function AppLayout({ children }: Props) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-base-200 text-base-content">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-base-300 bg-base-100 px-4">
        <div className="flex-1">
          <Container>
            <HeaderNav />
          </Container>
        </div>
      </header>

      <div className="flex flex-1">
        <SidebarDesktop items={primaryMenu} />

        <main className="flex-1 py-6 [@media(min-width:1440px)]:mr-52">
          <Container>
            {children}
            {user?.role === "admin" && <AdminButton />}
          </Container>
        </main>
      </div>

      <footer className="border-t border-base-300 bg-base-100">
        <Container>
          <Footer />
        </Container>
      </footer>

      <SidebarMobile items={primaryMenu} />
    </div>
  );
}
