import { Toaster } from "react-hot-toast";
import { AppRoutes } from "./app/routes";
import AppLayout from "@/shared/layouts/AppLayout";

export default function App() {
  return (
    <AppLayout>
      <AppRoutes />
      <Toaster position="top-right" />
    </AppLayout>
  );
}
