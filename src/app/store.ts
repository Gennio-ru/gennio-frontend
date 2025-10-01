import { configureStore } from "@reduxjs/toolkit";
import appReducer from "@/features/app/appSlice";
import authReducer from "@/features/auth/authSlice";
import promptsReducer from "@/features/prompts/promptSlice";
import adminPromptsReducer from "@/features/admin-prompts/adminPromptSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    prompts: promptsReducer,
    adminPrompts: adminPromptsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
