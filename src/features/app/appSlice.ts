import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { Category, apiGetCategories } from "@/api/modules/categories";

const getInitialTheme = (): "dark" | "light" => {
  const saved = localStorage.getItem("theme");
  if (saved) return saved as "dark" | "light";

  const htmlTheme = document.documentElement.getAttribute("data-theme");
  if (htmlTheme) return htmlTheme as "dark" | "light";

  return "light";
};

type State = {
  isShownMobileSidebar: boolean;
  paymentModalOpen: boolean;
  paymentResultModalOpen: boolean;

  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string | null;

  theme: "dark" | "light";
};

const initialState: State = {
  isShownMobileSidebar: false,
  paymentModalOpen: false,
  paymentResultModalOpen: false,

  categories: [],
  categoriesLoading: false,
  categoriesError: null,

  theme: getInitialTheme(),
};

export const fetchCategories = createAsyncThunk<Category[]>(
  "app/fetchCategories",
  async () => {
    const data = await apiGetCategories();
    return data;
  }
);

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    showMobileSidebar(state) {
      state.isShownMobileSidebar = true;
    },
    hideMobileSidebar(state) {
      state.isShownMobileSidebar = false;
    },
    setAppTheme(state, action: PayloadAction<"dark" | "light">) {
      state.theme = action.payload;
    },
    setPaymentModalOpen(state, action: PayloadAction<boolean>) {
      state.paymentModalOpen = action.payload;
    },
    setPaymentResultModalOpen(state, action: PayloadAction<boolean>) {
      state.paymentResultModalOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(
        fetchCategories.fulfilled,
        (state, action: PayloadAction<Category[]>) => {
          state.categoriesLoading = false;
          state.categories = action.payload;
        }
      )
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError =
          action.error.message ?? "Не удалось загрузить категории";
      });
  },
});

export const {
  showMobileSidebar,
  hideMobileSidebar,
  setAppTheme,
  setPaymentModalOpen,
  setPaymentResultModalOpen,
} = slice.actions;

export default slice.reducer;

// ----- Селекторы -----
export const selectShowMobileSidebar = (s: RootState) =>
  s.app.isShownMobileSidebar;
export const selectAppTheme = (s: RootState) => s.app.theme;
export const selectPaymentModalOpen = (s: RootState) => s.app.paymentModalOpen;
export const selectResultPaymentModalOpen = (s: RootState) =>
  s.app.paymentResultModalOpen;

export const selectCategories = (s: RootState) => s.app.categories;
export const selectCategoriesLoading = (s: RootState) =>
  s.app.categoriesLoading;
export const selectCategoriesError = (s: RootState) => s.app.categoriesError;
