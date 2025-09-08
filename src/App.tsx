import { Routes, Route } from "react-router-dom";
import Container from "@/shared/Container";
import HeaderNav from "@/shared/HeaderNav";
import LoginPage from "@/pages/LoginPage";
import PromptsPage from "@/pages/PromptsPage";
import AdminRoute from "./features/auth/AdminRoute";
import PromptsAdminList from "./features/admin/PromptsAdminList";
import PromptAdminEdit from "./features/admin/PromptAdminEdit";
import { AdminButton } from "./shared/AdminButton";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200 flex flex-col">
      <header className="border-b border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-stone-900 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <Container>
          <HeaderNav />
        </Container>
      </header>

      <main className="flex-1">
        <Container>
          <Routes>
            {/* публичные */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<PromptsPage />} />

            {/* админка */}
            <Route
              path="/admin/prompts"
              element={
                <AdminRoute>
                  <PromptsAdminList />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/prompts/:id"
              element={
                <AdminRoute>
                  <PromptAdminEdit />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/prompts/new"
              element={
                <AdminRoute>
                  <PromptAdminEdit />
                </AdminRoute>
              }
            />
          </Routes>
        </Container>

        <AdminButton />
      </main>

      <footer className="border-t border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-stone-900 backdrop-blur">
        <Container>
          <div className="py-3 text-xs text-neutral-500 dark:text-neutral-200">
            © {new Date().getFullYear()} gennie — All rights reserved
          </div>
        </Container>
      </footer>

      <Toaster position="top-right" />
    </div>
  );
}
