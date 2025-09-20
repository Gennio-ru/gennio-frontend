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

  // const beforeSrc = toUrl(p.beforeImageUrl, p.id);
  // const afterSrc = toUrl(p.afterImageUrl, p.id + "-b");

  return (
    <article
      onClick={handleClick}
      className="group overflow-hidden rounded-2xl bg-white cursor-pointer"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={prompt.afterImageUrl}
          alt={prompt.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          loading="lazy"
        />

        {/* 
        <BeforeAfterSpring
          before={beforeSrc}
          after={afterSrc}
          alt={p.title}
          className="h-full w-full"
          initial={50}
          returnTo={50} // поставить null, если не нужно авто-возврат к центру
          stiffness={180} // «вязкость» следования (меньше — мягче/дольше)
          damping={24}
          mass={0.45}
        /> 
        */}
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-semibold">{prompt.title}</h3>
        {prompt.description && (
          <p className="mt-1 line-clamp-2 text-xs text-neutral-600">
            {prompt.description}
          </p>
        )}
      </div>
    </article>
  );
}
