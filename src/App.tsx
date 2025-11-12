import { AppRoutes } from "./app/routes";
import AppLayout from "@/shared/layouts/AppLayout";
import PreloadBackgrounds from "./shared/PreloadBackgrounds";
import GennioToaster from "./shared/ui/GennioToaster";

import "@/shared/config/i18n";

export default function App() {
  return (
    <AppLayout>
      <AppRoutes />
      <GennioToaster />
      <PreloadBackgrounds />
    </AppLayout>
  );
}
