import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import promptsReducer from "@/features/prompts/promptSlice";
import adminPromptsReducer from "@/features/admin-prompts/adminPromptSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    prompts: promptsReducer,
    adminPrompts: adminPromptsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
