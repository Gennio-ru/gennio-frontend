import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  apiGetPayments,
  PaymentFull,
  PaymentsListParams,
  PaymentStatus,
} from "@/api/modules/payments";
import type { PaginationResult } from "@/api/types";
import type { RootState } from "@/app/store";

type Filters = {
  search: string | null;
  status: PaymentStatus | null;
  createdFrom?: string | null;
  createdTo?: string | null;
};

type DateRange = {
  from: string | null;
  to: string | null;
};

type State = {
  items: PaymentFull[];
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
    createdFrom: null,
    createdTo: null,
  },
  status: "idle",
};

export const fetchAdminPayments = createAsyncThunk<
  PaginationResult<PaymentFull>,
  PaymentsListParams,
  { state: RootState }
>("adminPayments/fetchPage", async ({ page = 1, limit = 50 }, { getState }) => {
  const { filters } = getState().adminPayments;

  return apiGetPayments({
    page,
    limit,
    search: filters.search ?? undefined,
    status: filters.status ?? undefined,
    createdFrom: filters.createdFrom ?? undefined,
    createdTo: filters.createdTo ?? undefined,
  });
});

const adminPaymentsSlice = createSlice({
  name: "adminPayments",
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
    setStatus(state, action: PayloadAction<PaymentStatus | null>) {
      state.filters.status = action.payload;
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
      .addCase(fetchAdminPayments.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchAdminPayments.fulfilled, (state, action) => {
        const { items, meta } = action.payload;
        state.items = items;
        state.page = meta.currentPage;
        state.totalPages = meta.totalPages;
        state.totalItems = meta.totalItems ?? state.totalItems;
        state.status = "idle";
      })
      .addCase(fetchAdminPayments.rejected, (state, action) => {
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
  setDateRange,
} = adminPaymentsSlice.actions;

export default adminPaymentsSlice.reducer;
