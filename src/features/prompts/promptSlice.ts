import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiGetPrompts, PromptsListParams, type Prompt } from "@/api/prompts";
import { PaginationResult } from "@/api/types";
import { RootState } from "@/app/store";

type State = {
  items: Prompt[];
  page: number;
  hasMore: boolean;
  filters: {
    categoryId: string | null;
  };
  status: "idle" | "loading" | "failed";
  error?: string;
};

const initialState: State = {
  items: [],
  page: 0,
  hasMore: true,
  filters: {
    categoryId: null,
  },
  status: "idle",
};

export const fetchPromptsPage = createAsyncThunk<
  PaginationResult<Prompt>,
  PromptsListParams,
  { state: RootState }
>("prompts/fetchPage", async ({ page = 1, search, categoryId }) => {
  const limit = 20;
  return apiGetPrompts({ page, limit, search, categoryId });
});

const promptsSlice = createSlice({
  name: "prompts",
  initialState,
  reducers: {
    resetPrompts: () => initialState,
    setCategory(state, action: PayloadAction<string>) {
      state.filters.categoryId = action.payload;
    },
    resetCategory(state) {
      state.filters.categoryId = null;
    },
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

export const { resetPrompts, setCategory, resetCategory } =
  promptsSlice.actions;
export default promptsSlice.reducer;
