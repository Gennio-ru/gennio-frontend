import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppRoutes } from "./app/routes";
import AppLayout from "@/shared/layouts/AppLayout";
import GennioToaster from "./shared/ui/GennioToaster";

import "@/shared/config/i18n";

export default function App() {
  const { pathname } = useLocation();
  const isAlphaStandalone = pathname.startsWith("/alfa-example");

  useEffect(() => {
    document.body.classList.toggle("no-site-bg", isAlphaStandalone);

    return () => {
      document.body.classList.remove("no-site-bg");
    };
  }, [isAlphaStandalone]);

  if (isAlphaStandalone) {
    return <AppRoutes />;
  }

  return (
    <AppLayout>
      <AppRoutes />
      <GennioToaster />
    </AppLayout>
  );
}
