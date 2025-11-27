import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  apiGetTransactionsList,
  Transaction,
  TransactionsListParams,
  TransactionReason,
} from "@/api/modules/transactions";
import type { PaginationResult } from "@/api/types";
import type { RootState } from "@/app/store";

//
// Типы фильтров
//
type Filters = {
  search: string | null;
  reason: TransactionReason | null;
  delta: number | null;
  createdFrom?: string | null;
  createdTo?: string | null;
};

type DateRange = {
  from: string | null;
  to: string | null;
};

//
// Slice state
//
type State = {
  items: Transaction[];
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
    reason: null,
    delta: null,
    createdFrom: null,
    createdTo: null,
  },
  status: "idle",
};

//
// Thunk
//
export const fetchTransactionsList = createAsyncThunk<
  PaginationResult<Transaction>,
  TransactionsListParams,
  { state: RootState }
>(
  "adminTransactions/fetchPage",
  async ({ page = 1, limit = 50 }, { getState }) => {
    const { filters } = getState().adminTransactions;

    return apiGetTransactionsList({
      page,
      limit,
      search: filters.search ?? undefined,
      reason: filters.reason ?? undefined,
      delta: filters.delta === null ? undefined : filters.delta,
      createdFrom: filters.createdFrom ?? undefined,
      createdTo: filters.createdTo ?? undefined,
    });
  }
);

//
// Slice
//
const adminTransactionsSlice = createSlice({
  name: "adminTokenTransactions",
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

    setReason(state, action: PayloadAction<TransactionReason | null>) {
      state.filters.reason = action.payload;
      state.page = 1;
    },

    setDelta(state, action: PayloadAction<number | null>) {
      state.filters.delta = action.payload;
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
      .addCase(fetchTransactionsList.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchTransactionsList.fulfilled, (state, action) => {
        const { items, meta } = action.payload;

        state.items = items;
        state.page = meta.currentPage;
        state.totalPages = meta.totalPages;
        state.totalItems = meta.totalItems ?? state.totalItems;
        state.status = "idle";
      })
      .addCase(fetchTransactionsList.rejected, (state, action) => {
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
  setReason,
  setDelta,
  setDateRange,
} = adminTransactionsSlice.actions;

export default adminTransactionsSlice.reducer;
