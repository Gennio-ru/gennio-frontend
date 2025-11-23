import { configureStore } from "@reduxjs/toolkit";
import appReducer from "@/features/app/appSlice";
import authReducer from "@/features/auth/authSlice";
import promptsReducer from "@/features/prompts/promptSlice";
import adminPromptsReducer from "@/features/admin-prompts/adminPromptSlice";
import adminPaymentsReducer from "@/features/admin-payments/adminPaymentSlice";
import adminUsersReducer from "@/features/admin-users/adminUserSlice";
import adminModelJobsReducer from "@/features/admin-model-jobs/adminModelJobSlice";
import adminTransactionsReducer from "@/features/admin-transactions/adminTransactionSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    prompts: promptsReducer,
    adminPrompts: adminPromptsReducer,
    adminPayments: adminPaymentsReducer,
    adminUsers: adminUsersReducer,
    adminModelJobs: adminModelJobsReducer,
    adminTransactions: adminTransactionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
