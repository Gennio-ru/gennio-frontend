import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "@/app/store";
import { AuthGate } from "@/app/providers/AuthGate";
import { RouteAnalytics } from "@/shared/routes/RouteAnalytics";
import { ScrollToTop } from "../router/ScrollToTop";

interface Props {
  children: React.ReactNode;
}

export function AppProviders({ children }: Props) {
  return (
    <Provider store={store}>
      <AuthGate>
        <BrowserRouter>
          <ScrollToTop />

          {/* Аналитика роутов */}
          <RouteAnalytics />

          {children}
        </BrowserRouter>
      </AuthGate>
    </Provider>
  );
}
