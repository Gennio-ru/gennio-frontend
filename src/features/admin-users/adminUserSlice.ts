import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { PaginationResult } from "@/api/types";
import type { RootState } from "@/app/store";
import {
  apiGetUsersList,
  UserRole,
  UsersListParams,
} from "@/api/modules/users";
import { User } from "@/api/modules/auth";

type Filters = {
  search: string | null;
  role: UserRole | null;
  tokensMin?: number | null;
  tokensMax?: number | null;
};

type State = {
  items: User[];
  page: number;
  totalPages: number;
  totalItems: number;
  filters: Filters;
  status: "idle" | "loading" | "failed";
  error?: string;
};

const initialState: State = {
  items: [],
  page: 1,
  totalPages: 1,
  totalItems: 0,
  filters: {
    search: null,
    role: null,
    tokensMin: null,
    tokensMax: null,
  },
  status: "idle",
};

export const fetchAdminUsersList = createAsyncThunk<
  PaginationResult<User>,
  UsersListParams,
  { state: RootState }
>(
  "adminUsersList/fetchPage",
  async ({ page = 1, limit = 50 }, { getState }) => {
    const { filters } = getState().adminUsers;

    return apiGetUsersList({
      page,
      limit,
      search: filters.search ?? undefined,
      role: filters.role ?? undefined,
      tokensMin: filters.tokensMin ?? undefined,
      tokensMax: filters.tokensMax ?? undefined,
    });
  }
);

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    resetState: () => initialState,
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setSearch(state, action: PayloadAction<string | null>) {
      state.filters.search = action.payload;
      state.page = 1;
    },
    setRole(state, action: PayloadAction<UserRole | null>) {
      state.filters.role = action.payload;
      state.page = 1;
    },
    setTokensMin(state, action: PayloadAction<number | null>) {
      state.filters.tokensMin = action.payload;
      state.page = 1;
    },
    setTokensMax(state, action: PayloadAction<number | null>) {
      state.filters.tokensMax = action.payload;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsersList.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchAdminUsersList.fulfilled, (state, action) => {
        const { items, meta } = action.payload;
        state.items = items;
        state.page = meta.currentPage;
        state.totalPages = meta.totalPages;
        state.totalItems = meta.totalItems ?? state.totalItems;
        state.status = "idle";
      })
      .addCase(fetchAdminUsersList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load";
      });
  },
});

export const {
  resetState,
  setPage,
  setSearch,
  setRole,
  setTokensMin,
  setTokensMax,
} = adminUsersSlice.actions;

export default adminUsersSlice.reducer;
