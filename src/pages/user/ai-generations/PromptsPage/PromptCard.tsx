import type { Prompt } from "@/api/modules/prompts";
import { useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";
import { cn } from "@/lib/utils";
import { route } from "@/shared/config/routes";
import { useNavigate } from "react-router-dom";

interface Props {
  prompt: Prompt;
}

export default function PromptCard({ prompt }: Props) {
  const theme = useAppSelector(selectAppTheme);
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(route.editImageByPlatformPrompt(prompt.id))}
      className={cn(
        "group overflow-hidden rounded-2xl text-base-content cursor-pointer",
        theme === "dark" ? "glass-panel-dark" : "glass-panel-light"
      )}
    >
      <div className="relative aspect-[1/1] overflow-hidden">
        <img
          src={prompt.afterPreviewImageUrl}
          alt={prompt.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-base-content">
          {prompt.title}
        </h3>
      </div>
    </article>
  );
}
