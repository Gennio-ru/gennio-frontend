import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  apiGetTokenPacks,
  TokenPack,
  TokenPackId,
} from "@/api/modules/pricing";
import Button from "@/shared/ui/Button";
import { useStartPayment } from "@/features/payments/useStartPayment";
import GlassCard from "@/shared/ui/GlassCard";
import { CircleCheck } from "lucide-react";
import { customToast } from "@/lib/customToast";
import { ymGoal } from "@/lib/metrics/yandexMetrika";

export default function PricingPage() {
  const [packs, setPacks] = useState<TokenPack[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingPayment, setCreatingPayment] = useState<TokenPackId | null>(
    null
  );

  const { startPayment } = useStartPayment();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await apiGetTokenPacks();
        if (!cancelled) {
          setPacks(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Не удалось загрузить тарифы. Попробуйте позже.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleBuy = async (packId: TokenPackId) => {
    startPayment(packId, () => {
      ymGoal("buy_tokens_on_pricing_page", { packId });
      setCreatingPayment(packId);
    })
      .catch((e) => customToast.error(e))
      .finally(() => setCreatingPayment(null));
  };

  return (
    <div className="w-full">
      {/* Заголовок */}
      <header className="mt-8 sm:mt-10 text-center">
        <h1 className="text-4xl sm:text-[44px] font-bold">
          Выберите пакет генераций
        </h1>

        <p className="mt-4 text-[18px]">
          И начните создавать то, что давно хотелось
        </p>
      </header>

      {/* Линейка тарифов */}
      <section className="space-y-4">
        {/* состояние загрузки / ошибки */}
        {isLoading && (
          <p className="text-sm text-base-content/70">
            Загружаем тарифы&hellip;
          </p>
        )}

        {error && !isLoading && <p className="text-sm text-error">{error}</p>}

        {!isLoading && !error && packs && (
          <>
            <div className="mt-10 grid gap-6 grid-cols-1 min-[860px]:grid-cols-3">
              <GlassCard
                className="px-8 pt-7 pb-8 min-[860px]:min-h-[380px] flex flex-col
                justify-between gap-6 max-w-sm w-full mx-auto min-[860px]:max-w-auto"
              >
                <div>
                  <p className="font-bold text-xl">Стартовый</p>

                  <p className="text-sm text-base-content/60">
                    Для знакомства с сервисом
                  </p>

                  <p className="mt-4 text-3xl font-bold text-nowrap">
                    {packs[1].generations} генераций
                  </p>

                  <div className="mt-4 text-base flex gap-1.5 items-start">
                    <CircleCheck
                      size={18}
                      className="min-w-[18px] relative top-[2px]"
                    />

                    <p>Включено {packs[1].tokens}&nbsp;токенов</p>
                  </div>

                  <div className="mt-2.5 text-base flex gap-1.5 items-start">
                    <CircleCheck
                      size={18}
                      className="min-w-[18px] relative top-[2px]"
                    />{" "}
                    <p>1&nbsp;генерация&nbsp;= 10&nbsp;токенов</p>
                  </div>
                </div>

                <Button
                  onClick={() => handleBuy("STARTER")}
                  className="w-full text-nowrap self-end"
                  loading={creatingPayment === "STARTER"}
                  disabled={creatingPayment === "STARTER"}
                >
                  Купить за {packs[1].priceRub} ₽
                </Button>
              </GlassCard>

              <GlassCard
                className="px-8 pt-7 pb-8 min-[860px]:min-h-[380px] flex flex-col
                justify-between gap-6 max-w-sm w-full mx-auto min-[860px]:max-w-auto"
              >
                <div>
                  <p className="font-bold text-xl">Базовый</p>

                  <p className="text-sm text-base-content/60">
                    С приятным бонусом
                  </p>

                  <p className="mt-4 text-3xl font-bold text-nowrap">
                    {packs[2].generations} генераций
                  </p>

                  <div className="mt-4 text-base flex gap-1.5 items-start">
                    <CircleCheck
                      size={18}
                      className="min-w-[18px] relative top-[2px]"
                    />{" "}
                    <p>+2 генерации в&nbsp;подарок</p>
                  </div>

                  <div className="mt-2.5 text-base flex gap-1.5 items-start">
                    <CircleCheck
                      size={18}
                      className="min-w-[18px] relative top-[2px]"
                    />{" "}
                    <p>Включено {packs[2].tokens}&nbsp;токенов</p>
                  </div>

                  <div className="mt-2.5 text-base flex gap-1.5 items-start">
                    <CircleCheck
                      size={18}
                      className="min-w-[18px] relative top-[2px]"
                    />{" "}
                    <p>1&nbsp;генерация&nbsp;= 10&nbsp;токенов</p>
                  </div>
                </div>

                <Button
                  onClick={() => handleBuy("BASIC")}
                  className="w-full text-nowrap self-end"
                  loading={creatingPayment === "BASIC"}
                  disabled={creatingPayment === "BASIC"}
                >
                  Купить за{" "}
                  <span className="line-through text-primary-content/70">
                    {packs[2].tokens}
                  </span>{" "}
                  {packs[2].priceRub} ₽
                </Button>
              </GlassCard>

              <GlassCard
                className="px-8 pt-7 pb-8 min-[860px]:min-h-[380px] flex flex-col justify-between
                gap-6 bg-base-100/70 max-w-sm w-full mx-auto min-[860px]:max-w-auto"
              >
                <div>
                  <p className="font-bold text-xl">Расширенный</p>

                  <p className="text-sm text-base-content/60">Самый выгодный</p>

                  <p className="mt-4 text-3xl font-bold text-nowrap">
                    {packs[3].generations} генераций
                  </p>

                  <div className="mt-4 text-base flex gap-1.5 items-start">
                    <CircleCheck
                      size={18}
                      className="min-w-[18px] relative top-[2px]"
                    />{" "}
                    <p>+5 генераций в&nbsp;подарок&nbsp;🔥</p>
                  </div>

                  <div className="mt-2.5 text-base flex gap-1.5 items-start">
                    <CircleCheck
                      size={18}
                      className="min-w-[18px] relative top-[2px]"
                    />{" "}
                    <p>Включено {packs[3].tokens}&nbsp;токенов</p>
                  </div>

                  <div className="mt-2.5 text-base flex gap-1.5 items-start">
                    <CircleCheck
                      size={18}
                      className="min-w-[18px] relative top-[2px]"
                    />{" "}
                    <p>1&nbsp;генерация&nbsp;= 10&nbsp;токенов</p>
                  </div>
                </div>

                <Button
                  onClick={() => handleBuy("PRO")}
                  className="w-full text-nowrap self-end"
                  loading={creatingPayment === "PRO"}
                  disabled={creatingPayment === "PRO"}
                >
                  Купить за{" "}
                  <span className="line-through text-primary-content/70">
                    {packs[3].tokens}
                  </span>{" "}
                  {packs[3].priceRub} ₽
                </Button>
              </GlassCard>
            </div>

            <div className="mt-10 font-light max-w-[800px] mb-[180px]">
              <p>
                Используйте Gennio для создания изображений в любых стилях,
                обработки ваших фото, изменения деталей и генерации новых работ
                по вашим или готовым промтам
              </p>

              <p className="mt-2">
                В Gennio применяется система токенов. Один токен примерно равен
                одному рублю, а одна генерация изображения стоит 10 токенов. Вы
                пополняете баланс токенов, а платформа автоматически списывает
                их при генерации
              </p>

              <p className="mt-2 text-sm text-base-content/70">
                Сгенерированные изображения хранятся в вашем аккаунте
                в&nbsp;течение 24&nbsp;часов, после чего автоматически
                удаляются. Успейте сохранить понравившиеся результаты себе
                на&nbsp;устройство.
              </p>
            </div>

            <footer className="pb-6 max-w-[800px]">
              <div className="space-y-1 text-xs sm:text-sm text-base-content/60">
                <p>
                  Оплачивая пакет токенов, вы подтверждаете, что ознакомились
                  и&nbsp;согласны с&nbsp;условиями{" "}
                  <Link
                    to="/legal/offer"
                    className="underline decoration-dotted underline-offset-2 text-nowrap"
                  >
                    Пользовательского соглашения
                  </Link>{" "}
                  и{" "}
                  <Link
                    to="/legal/privacy"
                    className="underline decoration-dotted underline-offset-2 text-nowrap"
                  >
                    Политики конфиденциальности
                  </Link>
                  .
                </p>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
