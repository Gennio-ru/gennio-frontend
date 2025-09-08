// auth.bootstrap.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { meThunk } from "./authSlice";
import type { RootState } from "@/app/store";

export const bootstrapAuth = createAsyncThunk(
  "auth/bootstrap",
  async (_, { dispatch, getState }) => {
    const { token, user, status } = (getState() as RootState).auth;
    if (!token) return;
    if (user) return;
    if (status === "loading") return; // уже идёт запрос
    try {
      await dispatch(meThunk()).unwrap();
    } catch {
      // тихо игнорим — редирект сделает Guard
    }
  }
);
