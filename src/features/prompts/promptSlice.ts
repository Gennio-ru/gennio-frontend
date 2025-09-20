import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGetPrompts, type Prompt } from "@/api/prompts";
import { PaginationResult } from "@/api/types";
import { RootState } from "@/app/store";

type State = {
  items: Prompt[];
  page: number;
  hasMore: boolean;
  status: "idle" | "loading" | "failed";
  error?: string;
};

const initialState: State = {
  items: [],
  page: 0,
  hasMore: true,
  status: "idle",
};

export const fetchPromptsPage = createAsyncThunk<
  PaginationResult<Prompt>,
  { page?: number; search?: string },
  { state: RootState }
>("prompts/fetchPage", async ({ page = 1, search }) => {
  const limit = 20;
  return apiGetPrompts({ page, limit, search });
});

const promptsSlice = createSlice({
  name: "prompts",
  initialState,
  reducers: {
    resetPrompts: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPromptsPage.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchPromptsPage.fulfilled, (state, action) => {
        const { items, meta } = action.payload;
        const page = action.meta.arg.page ?? 1;

        state.items = page === 1 ? items : [...state.items, ...items];
        state.page = meta.currentPage;
        state.hasMore = meta.currentPage < meta.totalPages;
        state.status = "idle";
      })
      .addCase(fetchPromptsPage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load";
      });
  },
});

export const { resetPrompts } = promptsSlice.actions;
export default promptsSlice.reducer;
