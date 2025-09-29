import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiGetPrompts, type Prompt } from "@/api/prompts";
import type { PaginationResult } from "@/api/types";
import type { RootState } from "@/app/store";

type Filters = {
  categoryId: string | null;
  search: string | null;
};

type State = {
  items: Prompt[];
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
    categoryId: null,
    search: null,
  },
  status: "idle",
};

export const fetchAdminPrompts = createAsyncThunk<
  PaginationResult<Prompt>,
  { page?: number; limit?: number },
  { state: RootState }
>("adminPrompts/fetchPage", async ({ page = 1, limit = 50 }, { getState }) => {
  const { filters } = getState().adminPrompts;
  return apiGetPrompts({
    page,
    limit,
    search: filters.search ?? undefined,
    categoryId: filters.categoryId ?? undefined,
  });
});

const adminPromptsSlice = createSlice({
  name: "adminPrompts",
  initialState,
  reducers: {
    resetState: () => initialState,
    setCategory(state, action: PayloadAction<string | null>) {
      state.filters.categoryId = action.payload;
      state.page = 1;
    },
    resetCategory(state) {
      state.filters.categoryId = null;
    },
    setSearch(state, action: PayloadAction<string | null>) {
      state.filters.search = action.payload;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminPrompts.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchAdminPrompts.fulfilled, (state, action) => {
        const { items, meta } = action.payload;
        state.items = items;
        state.page = meta.currentPage;
        state.totalPages = meta.totalPages;
        state.totalItems = meta.totalItems ?? state.totalItems;
        state.status = "idle";
      })
      .addCase(fetchAdminPrompts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load";
      });
  },
});

export const { resetState, setCategory, resetCategory, setSearch, setPage } =
  adminPromptsSlice.actions;

export default adminPromptsSlice.reducer;
