import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminRoute from "@/shared/routes/AdminRoute";
import AIGenerationsLayout from "@/shared/layouts/AIGenerationsLayout";
import Loader from "@/shared/ui/Loader";

const AboutProjectPage = lazy(() => import("@/pages/AboutProjectPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
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
    <Routes>
      <Route
        path="/about"
        element={
          <Suspense fallback={<Loader />}>
            <AboutProjectPage />
          </Suspense>
        }
      />
      <Route
        path="/pricing"
        element={
          <Suspense fallback={<Loader />}>
            <PricingPage />
          </Suspense>
        }
      />

      <Route element={<AIGenerationsLayout />}>
        <Route path="/" element={<Navigate to="/prompts" replace />} />
        <Route
          path="/prompts"
          element={
            <Suspense fallback={<Loader />}>
              <PromptsPage />
            </Suspense>
          }
        />
        {/* Обработка изображения по промпту платформы */}
        <Route
          path="/prompts/:promptId/edit-image"
          element={
            <Suspense fallback={<Loader />}>
              <EditImageByPlatformPromptPage />
            </Suspense>
          }
        />
        {/* Обработка изображения по промпту пользователя */}
        <Route
          path="/edit-image"
          element={
            <Suspense fallback={<Loader />}>
              <EditImageByCustomPromptPage />
            </Suspense>
          }
        />
        {/* Генерация изображения по промпту пользователя */}
        <Route
          path="/generate-image"
          element={
            <Suspense fallback={<Loader />}>
              <GenerateImagePage />
            </Suspense>
          }
        />
        {/* Генерация текста по промпту пользователя */}
        {/* <Route path="/generate-text" element={<GenerateTextPage />} /> */}
        {/* Результат генерации */}
        <Route
          path="/model-job/:modelJobId"
          element={
            <Suspense fallback={<Loader />}>
              <ModelJobResultPage />
            </Suspense>
          }
        />
      </Route>

      {/* админка */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route
          path="prompts"
          element={
            <Suspense fallback={<Loader />}>
              <PromptsAdminList />
            </Suspense>
          }
        />
        <Route
          path="prompts/:id"
          element={
            <Suspense fallback={<Loader />}>
              <PromptAdminEdit />
            </Suspense>
          }
        />
        <Route
          path="prompts/new"
          element={
            <Suspense fallback={<Loader />}>
              <PromptAdminEdit />
            </Suspense>
          }
        />
        <Route
          path="categories"
          element={
            <Suspense fallback={<Loader />}>
              <CategoriesAdminList />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
