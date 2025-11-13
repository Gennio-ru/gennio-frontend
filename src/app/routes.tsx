import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminRoute from "@/shared/routes/AdminRoute";
import Loader from "@/shared/ui/Loader";
import AIGenerationsLayout from "@/shared/layouts/AIGenerationsLayout";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegistrationPage = lazy(() => import("@/pages/RegistrationPage"));
const PromptsPage = lazy(() => import("@/pages/user/PromptsPage"));
const EditImageByPlatformPromptPage = lazy(
  () => import("@/pages/user/EditImageByPlatformPromptPage")
);
const EditImageByCustomPromptPage = lazy(
  () => import("@/pages/user/EditImageByCustomPromptPage")
);
const GenerateImagePage = lazy(() => import("@/pages/user/GenerateImagePage"));
// const GenerateTextPage = lazy(() => import("@/pages/user/GenerateTextPage"));
const ModelJobResultPage = lazy(
  () => import("@/pages/user/ModelJobResultPage")
);

// админские
const PromptsAdminList = lazy(
  () => import("@/pages/admin/PromptsListPage/PromptsList")
);
const PromptAdminEdit = lazy(
  () => import("@/pages/admin/PromptEditPage/PromptEditForm")
);
const CategoriesAdminList = lazy(
  () => import("@/pages/admin/CategoriesListPage/CategoriesList")
);

export function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* публичные */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />

        <Route element={<AIGenerationsLayout />}>
          <Route path="/" element={<Navigate to="/prompts" replace />} />
          <Route path="/prompts" element={<PromptsPage />} />
          {/* Обработка изображения по промпту платформы */}
          <Route
            path="/prompt/:promptId/edit-image"
            element={<EditImageByPlatformPromptPage />}
          />
          {/* Обработка изображения по промпту пользователя */}
          <Route path="/edit-image" element={<EditImageByCustomPromptPage />} />
          {/* Генерация изображения по промпту пользователя */}
          <Route path="/generate-image" element={<GenerateImagePage />} />
          {/* Генерация текста по промпту пользователя */}
          {/* <Route path="/generate-text" element={<GenerateTextPage />} /> */}
          {/* Результат генерации */}
          <Route
            path="/model-job/:modelJobId"
            element={<ModelJobResultPage />}
          />
        </Route>

        {/* админка */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route path="prompts" element={<PromptsAdminList />} />
          <Route path="prompts/:id" element={<PromptAdminEdit />} />
          <Route path="prompts/new" element={<PromptAdminEdit />} />
          <Route path="categories" element={<CategoriesAdminList />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
