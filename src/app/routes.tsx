import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminRoute from "@/shared/routes/AdminRoute";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegistrationPage = lazy(() => import("@/pages/RegistrationPage"));
const PromptsPage = lazy(() => import("@/pages/user/PromptsPage"));
const ModelJobPage = lazy(() => import("@/pages/user/ModelJobPage"));
const ModelJobResultPage = lazy(
  () => import("@/pages/user/ModelJobPage/ResultPage")
);

// админские
const PromptsAdminList = lazy(
  () => import("@/pages/admin/PromptsListPage/PromptsList")
);
const PromptAdminEdit = lazy(
  () => import("@/pages/admin/PromptEditPage/PromptEditForm")
);

export function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[40vh] items-center justify-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
      }
    >
      <Routes>
        {/* публичные */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/" element={<Navigate to="/prompts" replace />} />
        <Route path="/prompts" element={<PromptsPage />} />
        <Route path="/prompt/:promptId" element={<ModelJobPage />} />
        <Route
          path="/prompt/:promptId/model-job/:modelJobId"
          element={<ModelJobResultPage />}
        />

        {/* админка */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route path="prompts" element={<PromptsAdminList />} />
          <Route path="prompts/:id" element={<PromptAdminEdit />} />
          <Route path="prompts/new" element={<PromptAdminEdit />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
