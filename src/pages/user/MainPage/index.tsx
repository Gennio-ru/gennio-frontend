import { useNavigate } from "react-router-dom";
import Button from "@/shared/ui/Button";
import { AIGenerationTitle } from "@/shared/ui/AIGenerationTitle";
import { AppRoute } from "@/shared/config/routes";

export default function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col items-center mt-[70px] sm:mt-[120px]">
      <AIGenerationTitle
        title="Gennio — ваш идеальный инструмент для творчества"
        description="Используйте готовые шаблоны, создавайте изображения с нуля или обрабатывайте фото по&nbsp;собственным промптам. Gennio превращает ваши слова и идеи в визуальные результаты с&nbsp;помощью&nbsp;ИИ"
      />

      <Button className="px-7" onClick={() => navigate(AppRoute.PROMPTS)}>
        Начать создавать
      </Button>
    </div>
  );
}
