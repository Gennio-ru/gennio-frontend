import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";

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
  theme: "dark" | "light";
};

const initialState: State = {
  isShownMobileSidebar: false,
  paymentModalOpen: false,
  paymentResultModalOpen: false,
  theme: getInitialTheme(),
};

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
    setAppTheme(state, action) {
      state.theme = action.payload;
    },
    setPaymentModalOpen(state, action: PayloadAction<boolean>) {
      state.paymentModalOpen = action.payload;
    },
    setPaymentResultModalOpen(state, action: PayloadAction<boolean>) {
      state.paymentResultModalOpen = action.payload;
    },
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
