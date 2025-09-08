import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import promptsReducer from "@/features/prompts/promptSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    prompts: promptsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
