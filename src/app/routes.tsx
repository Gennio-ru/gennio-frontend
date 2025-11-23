import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminRoute from "@/shared/routes/AdminRoute";
import AIGenerationsLayout from "@/shared/layouts/AIGenerationsLayout";
import Loader from "@/shared/ui/Loader";

const AboutProjectPage = lazy(() => import("@/pages/user/AboutProjectPage"));
const PricingPage = lazy(() => import("@/pages/user/PricingPage"));
const LegalOfferPage = lazy(() => import("@/pages/user/LegalOfferPage"));
const PrivacyPolicyPage = lazy(() => import("@/pages/user/PrivacyPolicyPage"));
const PromptsPage = lazy(
  () => import("@/pages/user/ai-generations/PromptsPage")
);
const EditImageByPlatformPromptPage = lazy(
  () => import("@/pages/user/ai-generations/EditImageByPlatformPromptPage")
);
const EditImageByCustomPromptPage = lazy(
  () => import("@/pages/user/ai-generations/EditImageByCustomPromptPage")
);
const GenerateImagePage = lazy(
  () => import("@/pages/user/ai-generations/GenerateImagePage")
);
// const GenerateTextPage = lazy(() => import("@/pages/user/GenerateTextPage"));
const ModelJobResultPage = lazy(
  () => import("@/pages/user/ai-generations/ModelJobResultPage")
);

// админские
const PromptsAdminPage = lazy(() => import("@/pages/admin/PromptsListPage"));
const PaymentsAdminPage = lazy(() => import("@/pages/admin/PaymentsListPage"));
const UsersAdminPage = lazy(() => import("@/pages/admin/UsersListPage"));
const ModelJobsAdminPage = lazy(
  () => import("@/pages/admin/ModelJobsListPage")
);
const CategoriesAdminPage = lazy(
  () => import("@/pages/admin/CategoriesListPage")
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
      <Route
        path="/legal/offer"
        element={
          <Suspense fallback={<Loader />}>
            <LegalOfferPage />
          </Suspense>
        }
      />
      <Route
        path="/legal/privacy"
        element={
          <Suspense fallback={<Loader />}>
            <PrivacyPolicyPage />
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
          path="prompts/*"
          element={
            <Suspense fallback={<Loader />}>
              <PromptsAdminPage />
            </Suspense>
          }
        />
        <Route
          path="categories"
          element={
            <Suspense fallback={<Loader />}>
              <CategoriesAdminPage />
            </Suspense>
          }
        />
        <Route
          path="payments/*"
          element={
            <Suspense fallback={<Loader />}>
              <PaymentsAdminPage />
            </Suspense>
          }
        />
        <Route
          path="users/*"
          element={
            <Suspense fallback={<Loader />}>
              <UsersAdminPage />
            </Suspense>
          }
        />
        <Route
          path="model-jobs/*"
          element={
            <Suspense fallback={<Loader />}>
              <ModelJobsAdminPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
