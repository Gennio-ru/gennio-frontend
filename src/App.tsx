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
    <div className="min-h-screen bg-stone-200 text-neutral-900 flex flex-col">
      <header className="border-b border-neutral-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <Container>
          <HeaderNav />
        </Container>
      </header>

      <main className="flex-1">
        <Container>
          <AppRoutes />
        </Container>

        {user?.role === "admin" && <AdminButton />}
      </main>

      <footer className="border-t border-neutral-200 bg-white/70 backdrop-blur">
        <Container>
          <Footer />
        </Container>
      </footer>

      <Toaster position="top-right" />
    </div>
  );
}
