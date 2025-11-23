import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { PaginationResult } from "@/api/types";
import type { RootState } from "@/app/store";
import {
  apiGetModelJobsList,
  ModelJob,
  ModelJobsListParams,
  ModelJobStatus,
  ModelJobType,
} from "@/api/modules/model-job";

type Filters = {
  search: string | null;
  status: ModelJobStatus | null;
  type: ModelJobType | null;
  createdFrom?: string | null;
  createdTo?: string | null;
};

type DateRange = {
  from: string | null;
  to: string | null;
};

type State = {
  items: ModelJob[];
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
    status: null,
    type: null,
    createdFrom: null,
    createdTo: null,
  },
  status: "idle",
};

export const fetchAdminModelJobsList = createAsyncThunk<
  PaginationResult<ModelJob>,
  ModelJobsListParams,
  { state: RootState }
>(
  "adminModelJobs/fetchPage",
  async ({ page = 1, limit = 50 }, { getState }) => {
    const { filters } = getState().adminModelJobs;

    return apiGetModelJobsList({
      page,
      limit,
      search: filters.search ?? undefined,
      status: filters.status ?? undefined,
      type: filters.type ?? undefined,
      createdFrom: filters.createdFrom ?? undefined,
      createdTo: filters.createdTo ?? undefined,
    });
  }
);

const adminModelJobsSlice = createSlice({
  name: "adminModelJobs",
  initialState,
  reducers: {
    resetState: () => initialState,
    resetFilters(state) {
      state.filters = initialState.filters;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setSearch(state, action: PayloadAction<string | null>) {
      state.filters.search = action.payload;
      state.page = 1;
    },
    setStatus(state, action: PayloadAction<ModelJobStatus | null>) {
      state.filters.status = action.payload;
      state.page = 1;
    },
    setType(state, action: PayloadAction<ModelJobType | null>) {
      state.filters.type = action.payload;
      state.page = 1;
    },
    setDateRange(state, action: PayloadAction<DateRange>) {
      state.filters.createdFrom = action.payload.from;
      state.filters.createdTo = action.payload.to;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminModelJobsList.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchAdminModelJobsList.fulfilled, (state, action) => {
        const { items, meta } = action.payload;
        state.items = items;
        state.page = meta.currentPage;
        state.totalPages = meta.totalPages;
        state.totalItems = meta.totalItems ?? state.totalItems;
        state.status = "idle";
      })
      .addCase(fetchAdminModelJobsList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load";
      });
  },
});

export const {
  resetState,
  resetFilters,
  setPage,
  setSearch,
  setStatus,
  setType,
  setDateRange,
} = adminModelJobsSlice.actions;

export default adminModelJobsSlice.reducer;
