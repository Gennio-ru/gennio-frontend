import { createSlice } from "@reduxjs/toolkit";
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
  theme: "dark" | "light";
};

const initialState: State = {
  isShownMobileSidebar: false,
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
  },
});

export const { showMobileSidebar, hideMobileSidebar, setAppTheme } =
  slice.actions;
export default slice.reducer;

// ----- Селекторы -----
export const selectShowMobileSidebar = (s: RootState) =>
  s.app.isShownMobileSidebar;
export const selectAppTheme = (s: RootState) => s.app.theme;
