import { ModelJob, ModelJobType } from "@/api/modules/model-job";

export enum AppRoute {
  // User
  PROMPTS = "/ai-generation/prompts",
  GENERATE_IMAGE = "/ai-generation/generate-image",
  EDIT_IMAGE = "/ai-generation/edit-image",

  MAIN = "/",
  PRICING = "/pricing",
  ABOUT = "/about",
  MY_GENERATIONS = "/my-generations",

  // Admin
  ADMIN_PROMPTS = "/admin/prompts",
  ADMIN_CATEGORIES = "/admin/categories",
  ADMIN_PAYMENTS = "/admin/payments",
  ADMIN_USERS = "/admin/users",
  ADMIN_JOBS = "/admin/model-jobs",
  ADMIN_TRANSACTIONS = "/admin/transactions",
  ADMIN_AI_GENERATION = "/admin/ai-generation",
}

//
// Мапа типа задачи → базовый путь
//
export const jobTypeBasePath: Record<ModelJobType, string> = {
  "image-edit-by-prompt-id": AppRoute.PROMPTS,
  "image-edit-by-prompt-text": AppRoute.EDIT_IMAGE,
  "image-generate-by-prompt-text": AppRoute.GENERATE_IMAGE,
};

//
// Универсальный генератор пути результата
//
export const route = {
  jobResult: (job: ModelJob) => {
    const id = job.id;
    const type = job.type;

    // -- Особый кейс: edit-image по шаблону с promptId --
    if (type === "image-edit-by-prompt-id" && job.promptId) {
      return `/ai-generation/prompts/${job.promptId}/edit-image/result/${id}`;
    }

    // -- Обычные кейсы --
    return `${jobTypeBasePath[type]}/result/${id}`;
  },

  jobWait: (job: ModelJob) => {
    const id = job.id;
    const type = job.type;

    if (type === "image-edit-by-prompt-id" && job.promptId) {
      return `/ai-generation/prompts/${job.promptId}/edit-image/result/${id}/wait`;
    }

    return `${jobTypeBasePath[type]}/result/${id}/wait`;
  },

  adminJob: (id: string) => `${AppRoute.ADMIN_JOBS}/${id}`,
  adminPayment: (id: string) => `${AppRoute.ADMIN_PAYMENTS}/${id}`,
  adminPrompt: (id: string) => `${AppRoute.ADMIN_PROMPTS}/${id}`,
  adminUser: (id: string) => `${AppRoute.ADMIN_USERS}/${id}`,

  aiGenerate: (type: ModelJobType, promptId?: string) => {
    if (type === "image-edit-by-prompt-id") {
      return route.editImageByPlatformPrompt(promptId);
    }
    return jobTypeBasePath[type];
  },
  editImageByPlatformPrompt: (promptId: string) =>
    `/ai-generation/prompts/${promptId}/edit-image`,
};
