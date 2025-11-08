import { useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function GlassCard({ children }: Props) {
  const theme = useAppSelector(selectAppTheme);

  return (
    <div
      className={cn(
        "w-full h-full p-6 rounded-box",
        theme === "dark" ? "glass-panel-dark" : "glass-panel-light"
      )}
    >
      {children}
    </div>
  );
}
