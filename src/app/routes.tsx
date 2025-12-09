import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AdminRoute from "@/shared/routes/AdminRoute";
import AIGenerationsLayout from "@/shared/layouts/AIGenerationsLayout";
import Loader from "@/shared/ui/Loader";

const MainPage = lazy(() => import("@/pages/user/MainPage"));
const AboutProjectPage = lazy(() => import("@/pages/user/AboutProjectPage"));
const PricingPage = lazy(() => import("@/pages/user/PricingPage"));
const LegalOfferPage = lazy(() => import("@/pages/user/LegalOfferPage"));
const PrivacyPolicyPage = lazy(() => import("@/pages/user/PrivacyPolicyPage"));
const MyGenerations = lazy(() => import("@/pages/user/MyGenerations"));

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

const ModelJobWaitingResultPage = lazy(
  () => import("@/pages/user/ai-generations/ModelJobWaitingResultPage")
);
const ModelJobResultPage = lazy(
  () => import("@/pages/user/ai-generations/ModelJobResultPage")
);

// admin
const PromptsAdminPage = lazy(() => import("@/pages/admin/PromptsListPage"));
const PaymentsAdminPage = lazy(() => import("@/pages/admin/PaymentsListPage"));
const UsersAdminPage = lazy(() => import("@/pages/admin/UsersListPage"));
const ModelJobsAdminPage = lazy(
  () => import("@/pages/admin/ModelJobsListPage")
);
const CategoriesAdminPage = lazy(
  () => import("@/pages/admin/CategoriesListPage")
);
const TransactionsAdminPage = lazy(
  () => import("@/pages/admin/TransactionsListPage")
);
const AdminAIGeneratePage = lazy(
  () => import("@/pages/admin/AdminAIGeneratePage")
);

export function AppRoutes() {
  return (
    <Routes>
      {/* Публичные */}
      <Route
        path="/"
        element={
          <Suspense fallback={<Loader />}>
            <MainPage />
          </Suspense>
        }
      />
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
        path="/my-generations"
        element={
          <Suspense fallback={<Loader />}>
            <MyGenerations />
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

      {/* --- AI GENERATION ROOT --- */}
      <Route element={<AIGenerationsLayout />}>
        {/* Готовые шаблоны */}
        <Route
          path="/ai-generation/prompts"
          element={
            <Suspense fallback={<Loader />}>
              <PromptsPage />
            </Suspense>
          }
        />

        {/* Обработка фото по платформенному шаблону */}
        <Route
          path="/ai-generation/prompts/:promptId/edit-image"
          element={
            <Suspense fallback={<Loader />}>
              <EditImageByPlatformPromptPage />
            </Suspense>
          }
        />

        {/* Генерация изображения */}
        <Route
          path="/ai-generation/generate-image"
          element={
            <Suspense fallback={<Loader />}>
              <GenerateImagePage />
            </Suspense>
          }
        />

        {/* Обработка пользовательского фото */}
        <Route
          path="/ai-generation/edit-image"
          element={
            <Suspense fallback={<Loader />}>
              <EditImageByCustomPromptPage />
            </Suspense>
          }
        />

        {/* --- РЕЗУЛЬТАТЫ (включая особый promptId кейс) --- */}

        {/* Особый случай: platform prompt */}
        <Route
          path="/ai-generation/prompts/:promptId/edit-image/result/:modelJobId"
          element={
            <Suspense fallback={<Loader />}>
              <ModelJobResultPage />
            </Suspense>
          }
        />
        <Route
          path="/ai-generation/prompts/:promptId/edit-image/result/:modelJobId/wait"
          element={
            <Suspense fallback={<Loader />}>
              <ModelJobWaitingResultPage />
            </Suspense>
          }
        />

        {/* Генерация изображения */}
        <Route
          path="/ai-generation/generate-image/result/:modelJobId"
          element={
            <Suspense fallback={<Loader />}>
              <ModelJobResultPage />
            </Suspense>
          }
        />
        <Route
          path="/ai-generation/generate-image/result/:modelJobId/wait"
          element={
            <Suspense fallback={<Loader />}>
              <ModelJobWaitingResultPage />
            </Suspense>
          }
        />

        {/* Обработка фото */}
        <Route
          path="/ai-generation/edit-image/result/:modelJobId"
          element={
            <Suspense fallback={<Loader />}>
              <ModelJobResultPage />
            </Suspense>
          }
        />
        <Route
          path="/ai-generation/edit-image/result/:modelJobId/wait"
          element={
            <Suspense fallback={<Loader />}>
              <ModelJobWaitingResultPage />
            </Suspense>
          }
        />
      </Route>

      {/* --- ADMIN --- */}
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
        <Route
          path="transactions"
          element={
            <Suspense fallback={<Loader />}>
              <TransactionsAdminPage />
            </Suspense>
          }
        />
        <Route
          path="ai-generation"
          element={
            <Suspense fallback={<Loader />}>
              <AdminAIGeneratePage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
