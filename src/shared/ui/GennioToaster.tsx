import { useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";

export default function GennioToaster() {
  const theme = useAppSelector(selectAppTheme);

  return (
    <Toaster
      position="top-right"
      containerStyle={{ marginTop: "48px" }}
      toastOptions={{
        success: {
          className: cn(
            "text-base-content/80!",
            theme === "dark"
              ? "glass-panel-dark-important"
              : "glass-panel-light-important"
          ),
        },
        error: {
          className: cn(
            "text-base-content/80!",
            theme === "dark"
              ? "glass-panel-dark-important"
              : "glass-panel-light-important"
          ),
        },
      }}
    />
  );
}
