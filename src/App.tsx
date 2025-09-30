import Container from "@/shared/ui/Container";
import HeaderNav from "./shared/widgets/HeaderNav";
import { AdminButton } from "./shared/ui/AdminButton";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./features/auth/useAuth";
import { AppRoutes } from "./app/routes";
import Footer from "./shared/widgets/Footer";

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-base-200 text-base-content">
      {/* HEADER */}
      <header className="border-b border-base-300 bg-base-200">
        <Container>
          <HeaderNav />
        </Container>
      </header>

      {/* MAIN */}
      <main className="flex-1 py-6">
        <Container>
          <AppRoutes />
        </Container>

        {user?.role === "admin" && <AdminButton />}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-base-300 bg-base-100">
        <Container>
          <Footer />
        </Container>
      </footer>

      {/* TOASTER */}
      <Toaster position="top-right" />
    </div>
  );
}
