import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiLogin, apiMe, apiLogout } from "@/api/auth";
import type { components } from "@/api/types.gen";
import type { RootState } from "@/app/store";

type User = components["schemas"]["UserDto"] | null;

type State = {
  user: User;
  status: "idle" | "loading" | "failed";
  authReady: boolean; // <- признак, что проверка сессии завершена
};

const initialState: State = {
  user: null,
  status: "idle",
  authReady: false,
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) =>
    apiLogin({ email, password })
);

// аккуратно вытаскиваем http-статус без any
function getHttpStatus(e: unknown): number {
  if (typeof e === "object" && e !== null && "response" in e) {
    const resp = (e as { response?: { status?: number } }).response;
    return resp?.status ?? 0;
  }
  return 0;
}

export const meThunk = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      return await apiMe();
    } catch (e: unknown) {
      return rejectWithValue({ status: getHttpStatus(e) });
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () =>
  apiLogout()
);

// Инициализация auth при старте приложения.
// Если refresh-кука валидна — meThunk вернёт пользователя.
// В любом случае по завершении ставим authReady = true.
export const initAuthThunk = createAsyncThunk(
  "auth/init",
  async (_, { dispatch }) => {
    try {
      await dispatch(meThunk()).unwrap();
    } catch {
      /* not logged in */
    }
    // ничего не возвращаем — факт готовности отметим редьюсером ниже
  }
);

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload.user; // accessToken хранится in-memory в api слое
        state.authReady = true; // после явного логина считаем готовыми
      })
      .addCase(loginThunk.rejected, (state) => {
        state.status = "failed";
        state.authReady = true;
      });

    // me
    builder
      .addCase(meThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(meThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "idle";
        state.authReady = true; // проверка завершена
      })
      .addCase(meThunk.rejected, (state, action) => {
        const status =
          (action.payload as { status: number } | undefined)?.status ?? 0;
        if (status === 401) {
          state.user = null;
          state.status = "idle";
        } else {
          state.status = "failed";
        }
        state.authReady = true; // в любом случае проверка завершена
      });

    // init завершился — помечаем готовность (на случай, если meThunk не выставил)
    builder
      .addCase(initAuthThunk.fulfilled, (state) => {
        state.authReady = true;
      })
      .addCase(initAuthThunk.rejected, (state) => {
        state.authReady = true;
      });

    // logout
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.status = "idle";
      state.authReady = true;
    });
  },
});

export const { setUser, logout } = slice.actions;
export default slice.reducer;

// ----- Селекторы -----
export const selectUser = (s: RootState) => s.auth.user;
export const selectIsAuthenticated = (s: RootState) => Boolean(s.auth.user);
export const selectAuthReady = (s: RootState) => s.auth.authReady;
export const selectAuthStatus = (s: RootState) => s.auth.status;
