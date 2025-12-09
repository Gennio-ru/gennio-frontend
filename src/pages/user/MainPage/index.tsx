import { useNavigate } from "react-router-dom";
import Button from "@/shared/ui/Button";
import { AIGenerationTitle } from "@/shared/ui/AIGenerationTitle";
import { AppRoute } from "@/shared/config/routes";
import GlassCard from "@/shared/ui/GlassCard";
import ImageWithLoader from "@/shared/ui/ImageWithLoader";

export default function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col items-center mt-[40px] sm:mt-[75px]">
      <AIGenerationTitle
        title="Gennio — ваш идеальный инструмент для творчества"
        description="Используйте готовые шаблоны, создавайте изображения с нуля или обрабатывайте фото по&nbsp;собственным промптам. Gennio превращает ваши слова и идеи в визуальные результаты с&nbsp;помощью&nbsp;ИИ"
      />

      <Button className="px-7" onClick={() => navigate(AppRoute.EDIT_IMAGE)}>
        Начать создавать
      </Button>

      <GlassCard className="max-w-lg lg:max-w-full mx-auto w-full mt-[95px] sm:p-8 relative">
        <div
          className="max-w-[380px] w-full px-2 lg:px-0 relative lg:absolute left-1/2 -top-25
        -translate-x-1/2 lg:right-8 lg:left-auto lg:-top-2 lg:translate-x-0"
        >
          <ImageWithLoader
            src="main-reference-1.webp"
            className="object-contain"
          />
        </div>

        <div className="max-w-[500px] max-[400px]:mt-[-130px] mt-[-150px] lg:mt-0">
          <div className="px-2 py-0.5 bg-primary/30 text-base-content text-xs w-fit rounded-full">
            Обработка фото
          </div>

          <h1 className="mt-2.5 font-semibold text-[22px] leading-7 min-[400px]:text-[28px] min-[400px]:leading-9 max-w-[420px]">
            Меняйте изображения, сохраняя портретное сходство
          </h1>

          <p className="mt-3">
            Изменяйте своё изображение по&nbsp;собственным текстовым запросам —
            от&nbsp;лёгкой корректировки до&nbsp;полной трансформации:
          </p>

          <ul className="mt-3.5 list-disc pl-5 space-y-1">
            <li className="pl-1">
              Меняйте стиль, атмосферу и&nbsp;детали по&nbsp;вашему промпту
            </li>
            <li className="pl-1">Делайте студийную обработку</li>
            <li className="pl-1">Убирайте или&nbsp;заменяйте фон</li>
            <li className="pl-1">
              Перемещайте объект в&nbsp;любое пространство
            </li>
          </ul>

          <Button
            onClick={() => navigate(AppRoute.EDIT_IMAGE)}
            className="w-full min-[480px]:w-auto mt-6 px-8 border-2 hover:bg-base-content/10"
            color="ghost"
            bordered
          >
            Попробовать
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="mt-20 lg:mt-10 max-w-lg lg:max-w-full mx-auto w-full sm:p-8 relative">
        <div
          className="max-w-[380px] w-full px-2 lg:px-0 relative lg:absolute left-1/2 -top-25
        -translate-x-1/2 lg:left-8 lg:right-auto lg:-top-2 lg:translate-x-0"
        >
          <ImageWithLoader
            src="main-reference-2.webp"
            className="object-contain"
          />
        </div>

        <div className="max-w-[500px] max-[400px]:mt-[-130px] mt-[-150px] lg:mt-0 lg:ml-auto">
          <div className="px-2 py-0.5 bg-primary/30 text-base-content text-xs w-fit rounded-full">
            Готовые шаблоны
          </div>

          <h1 className="font-semibold mt-2.5 text-[28px] leading-9 max-w-[420px]">
            Используйте готовые шаблоны
          </h1>

          <p className="mt-3">
            Готовые стили уже настроены — вам остаётся лишь загрузить
            изображение и&nbsp;нажать на&nbsp;кнопку
          </p>

          <p className="mt-3">
            При&nbsp;желании вы можете добавить свои детали: изменить позу,
            сделать портрет во&nbsp;весь рост, поменять цвет волос
            или&nbsp;уточнить любые мелкие особенности
          </p>

          <Button
            onClick={() => navigate(AppRoute.PROMPTS)}
            className="w-full min-[480px]:w-auto mt-6 px-8 border-2 hover:bg-base-content/10"
            color="ghost"
            bordered
          >
            Попробовать
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="mt-20 lg:mt-10 max-w-lg lg:max-w-full mx-auto w-full sm:p-8 relative">
        <div
          className="max-w-[380px] w-full px-2 lg:px-0 relative lg:absolute left-1/2 -top-25
        -translate-x-1/2 lg:right-8 lg:left-auto lg:-top-2 lg:translate-x-0"
        >
          <ImageWithLoader
            src="main-reference-3.webp"
            className="object-contain"
          />
        </div>

        <div className="max-w-[500px] max-[400px]:mt-[-130px] mt-[-150px] lg:mt-0">
          <div className="px-2 py-0.5 bg-primary/30 text-base-content text-xs w-fit rounded-full">
            Создание с&nbsp;нуля
          </div>

          <h1 className="mt-2.5 font-semibold text-[28px] leading-9 max-w-[420px]">
            Создавайте уникальные изображения
          </h1>

          <p className="mt-3">
            Задавайте свои текстовые запросы — и&nbsp;получайте изображение,
            созданное полностью с&nbsp;нуля
          </p>

          <p className="mt-3">
            Придумывайте сюжет, стиль, детали и&nbsp;задавайте любой образ своим
            будущим изображениям
          </p>

          <Button
            onClick={() => navigate(AppRoute.GENERATE_IMAGE)}
            className="w-full min-[480px]:w-auto mt-6 px-8 border-2 hover:bg-base-content/10"
            color="ghost"
            bordered
          >
            Попробовать
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
