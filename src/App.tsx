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
import ModelJobPage from "./pages/ModelJobPage";
import ModelJobResult from "./pages/ModelJobPage/ModelJobResult";
import RegistrationPage from "./pages/RegistrationPage";

export default function App() {
  return (
    <div className="min-h-screen bg-stone-200 text-neutral-900 flex flex-col">
      <header className="border-b border-neutral-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <Container>
          <HeaderNav />
        </Container>
      </header>

      <main className="flex-1">
        <Container>
          <Routes>
            {/* публичные */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="*" element={<PromptsPage />} />
            <Route path="/prompt/:promptId" element={<ModelJobPage />} />
            <Route
              path="/prompt/:promptId/model-job/:modelJobId"
              element={<ModelJobResult />}
            />

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

      <footer className="border-t border-neutral-200 bg-white/70 backdrop-blur">
        <Container>
          <div className="py-3 text-xs text-neutral-500">
            © {new Date().getFullYear()} gennio — All rights reserved
          </div>
        </Container>
      </footer>

      <Toaster position="top-right" />
    </div>
  );
}
