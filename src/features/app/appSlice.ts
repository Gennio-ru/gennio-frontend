import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";

type State = {
  isShownMobileSidebar: boolean;
};

const initialState: State = {
  isShownMobileSidebar: false,
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
  },
});

export const { showMobileSidebar, hideMobileSidebar } = slice.actions;
export default slice.reducer;

// ----- Селекторы -----
export const selectShowMobileSidebar = (s: RootState) =>
  s.app.isShownMobileSidebar;
