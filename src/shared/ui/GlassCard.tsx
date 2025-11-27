import { useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({ children, className }: Props) {
  const theme = useAppSelector(selectAppTheme);

  return (
    <div
      className={cn(
        "p-6 rounded-box",
        className,
        theme === "dark" ? "glass-panel-dark" : "glass-panel-light"
      )}
    >
      {children}
    </div>
  );
}
