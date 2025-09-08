import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiLogin, apiMe, apiLogout } from "@/api/auth";

type User = { id: string; email?: string; role: string } | null;

type State = {
  user: User;
  token: string | null;
  status: "idle" | "loading" | "failed";
};
const initialState: State = {
  user: null,
  token: localStorage.getItem("accessToken"),
  status: "idle",
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) =>
    apiLogin({ email, password })
);

export const meThunk = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      return await apiMe();
    } catch (e: any) {
      return rejectWithValue({ status: e?.response?.status ?? 0 });
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () =>
  apiLogout()
);

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      if (action.payload) localStorage.setItem("accessToken", action.payload);
      else localStorage.removeItem("accessToken");
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("accessToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginThunk.fulfilled, (state, a) => {
        state.status = "idle";
        state.user = a.payload.user;
        state.token = a.payload.accessToken;
        localStorage.setItem("accessToken", a.payload.accessToken);
      })
      .addCase(loginThunk.rejected, (state) => {
        state.status = "failed";
      });

    builder
      .addCase(meThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(meThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "idle";
      })
      .addCase(meThunk.rejected, (state, action) => {
        const status = (action.payload as any)?.status;
        if (status === 401) {
          state.user = null;
          state.token = null;
          localStorage.removeItem("accessToken"); // важный момент
          state.status = "idle"; // бутстрап завершён
        } else {
          state.status = "failed";
        }
      });

    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("accessToken");
    });
  },
});

export const { setToken, logout } = slice.actions;
export default slice.reducer;
