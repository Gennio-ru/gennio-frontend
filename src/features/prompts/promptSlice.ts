import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGetPrompts, type Prompt } from "@/api/prompts";
import { PaginationResult } from "@/api/types";
import { RootState } from "@/app/store";

type State = {
  items: Prompt[];
  status: "idle" | "loading" | "failed";
  isLoadingMore: boolean;
  page: number; // текущая загруженная страница
  limit: number; // размер страницы
  hasMore: boolean; // есть ли ещё страницы
  error?: string;
};
const initialState: State = {
  items: [],
  status: "idle",
  isLoadingMore: false,
  page: 0,
  limit: 20,
  hasMore: true,
};

export const fetchPromptsPage = createAsyncThunk<
  PaginationResult<Prompt>,
  { page?: number; search?: string | null },
  { state: RootState }
>("prompts/fetchPage", async ({ page, search }, { getState }) => {
  const { limit } = getState().prompts;
  return apiGetPrompts({ page: page ?? 1, limit, search: search ?? undefined });
});

const slice = createSlice({
  name: "prompts",
  initialState,
  reducers: {
    resetPrompts(state) {
      state.items = [];
      state.page = 0;
      state.hasMore = true;
      state.status = "idle";
      state.isLoadingMore = false;
      state.error = undefined;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchPromptsPage.pending, (s, a) => {
      const p = a.meta.arg.page ?? 1;
      if (p === 1) {
        s.status = "loading";
        s.error = undefined;
      } else {
        s.isLoadingMore = true;
      }
    });
    b.addCase(fetchPromptsPage.fulfilled, (s, a) => {
      const p = a.meta.arg.page ?? 1;
      const { items, meta } = a.payload;
      if (p === 1) {
        s.items = items;
        s.status = "idle";
      } else {
        s.items = s.items.concat(items);
        s.isLoadingMore = false;
      }
      s.page = meta.currentPage;
      s.hasMore = meta.currentPage < meta.totalPages;
    });
    b.addCase(fetchPromptsPage.rejected, (s, a) => {
      const p = a.meta.arg.page ?? 1;
      if (p === 1) s.status = "failed";
      else s.isLoadingMore = false;
      s.error = a.error.message || "Failed to load";
    });
  },
});

export const { resetPrompts } = slice.actions;
export default slice.reducer;
