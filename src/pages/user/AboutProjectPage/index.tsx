import { MailIcon } from "lucide-react";
import GlassCard from "@/shared/ui/GlassCard";
import { Link } from "react-router-dom";

export default function AboutProjectPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <GlassCard>
        {/* Заголовок */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            О&nbsp;проекте Gennio
          </h1>
          <p className="mt-3 text-sm sm:text-base text-base-content/80">
            Gennio&nbsp;— небольшой независимый проект, созданный для
            удовольствия и&nbsp;экспериментов с&nbsp;нейросетями. Хотите
            попробовать новую идею, создать арт или просто повеселиться
            с&nbsp;генерацией? Вы&nbsp;по&nbsp;адресу.
          </p>
        </header>

        {/* Активная разработка */}
        <section className="mb-6 sm:mb-8 space-y-3 text-sm sm:text-base">
          <h2 className="text-base sm:text-lg font-semibold">
            Активная разработка
          </h2>
          <p>
            Gennio сейчас находится в&nbsp;
            <span className="font-medium">активной разработке</span>. Мы
            постепенно улучшаем качество генерации, добавляем новые модели
            и&nbsp;режимы обработки, наводим порядок в&nbsp;интерфейсе
            и&nbsp;шлифуем детали&nbsp;— от&nbsp;состояний загрузки
            до&nbsp;текстов ошибок.
          </p>
          <p>
            Если вы&nbsp;заметили странное поведение, хотите предложить
            улучшение или поделиться своим сценарием использования&nbsp;— нам
            это действительно интересно и&nbsp;полезно.
          </p>
        </section>

        {/* Поддержка */}
        <section className="mb-6 sm:mb-8 space-y-3 text-sm sm:text-base">
          <h2 className="text-base sm:text-lg font-semibold">Поддержка</h2>
          <p>
            По&nbsp;вопросам работы платформы, оплат, ошибок или идей
            по&nbsp;улучшению вы&nbsp;можете написать нам на&nbsp;почту:
          </p>
          <a
            href="mailto:support@gennio.ru"
            className="inline-flex items-center gap-2 rounded-full border border-base-300/70 bg-base-100/60 px-3 py-1.5 text-sm font-medium text-base-content hover:bg-base-100 transition-colors"
          >
            <MailIcon className="h-4 w-4" />
            <span>support@gennio.ru</span>
          </a>
        </section>

        {/* Сотрудничество */}
        <section className="mb-6 sm:mb-8 space-y-3 text-sm sm:text-base">
          <h2 className="text-base sm:text-lg font-semibold">Сотрудничество</h2>
          <p>
            Мы&nbsp;открыты к&nbsp;предложениям о&nbsp;сотрудничестве. Если
            у&nbsp;вас есть идея или вы&nbsp;хотите обсудить возможный формат
            взаимодействия&nbsp;— просто напишите нам.
          </p>
          <a
            href="mailto:support@gennio.ru"
            className="inline-flex items-center gap-2 rounded-full border border-base-300/70 bg-base-100/60 px-3 py-1.5 text-sm font-medium text-base-content hover:bg-base-100 transition-colors"
          >
            <MailIcon className="h-4 w-4" />
            <span>support@gennio.ru</span>
          </a>
        </section>

        {/* Юридическая информация */}
        <section className="mt-4 border-t border-base-300/60 pt-4 text-xs sm:text-sm text-base-content/70 space-y-2">
          <div className="font-semibold">Юридическая информация</div>

          <p>
            Оказатель услуг: Нехоц&nbsp;Владимир&nbsp;Вячеславович, самозанятый,
            ИНН&nbsp;732815959070, г.&nbsp;Ульяновск.
          </p>

          <p>
            Используя сервис Gennio, вы принимаете условия следующих документов:
          </p>

          <ul className="ml-4 list-disc space-y-1">
            <li>
              <Link
                to="/legal/offer"
                className="underline decoration-dotted underline-offset-2"
              >
                Пользовательское соглашение (оферта)
              </Link>
            </li>
            <li>
              <Link
                to="/legal/privacy"
                className="underline decoration-dotted underline-offset-2"
              >
                Политика конфиденциальности
              </Link>
            </li>
          </ul>

          <p className="text-[11px] sm:text-xs text-base-content/60">
            Перед оплатой и использованием платного функционала рекомендуем
            ознакомиться с&nbsp;условиями оферты и порядком обработки
            персональных данных.
          </p>
        </section>
      </GlassCard>
    </div>
  );
}
