import type { Prompt } from "@/api/prompts";
import { useNavigate } from "react-router-dom";

interface Props {
  prompt: Prompt;
}

export default function PromptCard({ prompt }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/prompt/${prompt.id}`);
  };

  return (
    <article
      onClick={handleClick}
      className="group overflow-hidden rounded-2xl bg-base-100 text-base-content cursor-pointer"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={prompt.afterImageUrl}
          alt={prompt.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-base-content">
          {prompt.title}
        </h3>
        {prompt.description && (
          <p className="mt-1 line-clamp-2 text-xs text-base-content/70">
            {prompt.description}
          </p>
        )}
      </div>
    </article>
  );
}
