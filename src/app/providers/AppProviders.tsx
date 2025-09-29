import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "@/app/store";
import { AuthGate } from "@/app/providers/AuthGate";

interface Props {
  children: React.ReactNode;
}

export function AppProviders({ children }: Props) {
  return (
    <Provider store={store}>
      <AuthGate>
        <BrowserRouter>{children}</BrowserRouter>
      </AuthGate>
    </Provider>
  );
}
