import { useNavigate, useLocation } from "react-router-dom";
import { aiGenerationsMenu } from "../config/menu";
import { PillSegmentedControl } from "./PillSegmentedControl";
import { cn } from "@/lib/utils";

export type NavItem = { label: string; href: string };

export interface Props {
  className?: string;
}

export function AIGenerationsMenu({ className }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const activeItem =
    aiGenerationsMenu.find(
      (item) =>
        currentPath === item.href || currentPath.startsWith(item.href + "/")
    ) ?? aiGenerationsMenu[0];

  const items = aiGenerationsMenu.map((item) => ({
    id: item.href,
    content: item.label,
  }));

  return (
    <PillSegmentedControl
      items={items}
      value={activeItem.href}
      onChange={(href) => navigate(href)}
      size="md"
      wrapperClassName={cn("pt-2 sm:pt-5 pb-7 sm:pb-10", className)}
      className="justify-center"
    />
  );
}
