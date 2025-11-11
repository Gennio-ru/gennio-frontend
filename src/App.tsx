import { Toaster } from "react-hot-toast";
import { AppRoutes } from "./app/routes";
import AppLayout from "@/shared/layouts/AppLayout";
import PreloadBackgrounds from "./shared/PreloadBackgrounds";

export default function App() {
  return (
    <AppLayout>
      <AppRoutes />
      <Toaster position="top-right" />
      <PreloadBackgrounds />
    </AppLayout>
  );
}
