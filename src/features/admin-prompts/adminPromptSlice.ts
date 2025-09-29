import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Prompt } from "@/api/prompts";
import { fetchPromptsPage } from "../prompts/promptSlice";

type State = {
  items: Prompt[];
  page: number;
  hasMore: boolean;
  filters: {
    categoryId: string | null;
    search: string | null;
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
    search: null,
  },
  status: "idle",
};

const adminPromptsSlice = createSlice({
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
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
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

export const { resetPrompts, setCategory, resetCategory, setSearch } =
  adminPromptsSlice.actions;
export default adminPromptsSlice.reducer;
