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
import { customToast } from "@/lib/customToast";
import { ymGoal } from "@/lib/metrics/yandexMetrika";
import { declOfNum } from "@/lib/helpers";
import { cn } from "@/lib/utils";

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
          Выберите пакет токенов
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
            <div className="mt-10 grid gap-6 grid-cols-1 min-[1024px]:grid-cols-4">
              {packs.map((pack, index) => (
                <GlassCard
                  key={pack.id}
                  className={cn(
                    "px-4 pt-5 pb-4 rounded-selector min-[1024px]:min-h-[300px] text-center flex flex-col justify-between",
                    "gap-9 max-w-sm w-full mx-auto min-[1024px]:max-w-auto relative"
                  )}
                >
                  {pack.highlight && (
                    <div className="absolute top-0 left-0 h-full w-full pointer-events-none rounded-selector shadow-[0_0_10px_rgba(129,11,219,0.35)]" />
                  )}

                  <div>
                    <p className="font-bold text-xl">{pack.name}</p>

                    <p className="text-sm text-base-content/60">
                      {pack.subtitle}
                    </p>

                    <div className="text-nowrap mt-8 flex flex-col">
                      <span className="text-2xl">
                        {/* <img
                          src={
                            theme === "dark" ? tokenDarkLogo : tokenLightLogo
                          }
                          className="h-[24px] w-[24px] inline relative top-[-1.5px]"
                          alt="token-logo"
                        />
                        &nbsp; */}
                        {pack.tokens}
                      </span>
                      <span className="text-base text-base-content/60">
                        {declOfNum(pack.tokens, ["токен", "токена", "токенов"])}
                      </span>
                    </div>

                    {pack.bonusTokens && (
                      <div className="mt-6 mb-2 text-base flex flex-col">
                        <span>
                          +{pack.bonusTokens}{" "}
                          {declOfNum(pack.bonusTokens, [
                            "токен",
                            "токена",
                            "токенов",
                          ])}{" "}
                          в&nbsp;подарок&nbsp;
                          {packs.length - 1 === index && "🔥"}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleBuy("PRO")}
                    className="w-full text-nowrap self-end"
                    loading={creatingPayment === "PRO"}
                    disabled={creatingPayment === "PRO"}
                  >
                    Купить за {pack.priceRub} ₽
                  </Button>
                </GlassCard>
              ))}
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
