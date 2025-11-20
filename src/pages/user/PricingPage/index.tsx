import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GlassCard from "@/shared/ui/GlassCard";
import {
  apiGetTokenPacks,
  TokenPack,
  TokenPackId,
} from "@/api/modules/pricing";
import Button from "@/shared/ui/Button";
import { useStartPayment } from "@/features/payments/useStartPayment";

export default function PricingPage() {
  const [packs, setPacks] = useState<TokenPack[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingPayment, setCreatingPayment] = useState<string | null>(null);

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
      } catch (e) {
        console.error(e);
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
      setCreatingPayment(packId);
    }).finally(() => setCreatingPayment(null));
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <GlassCard>
        {/* Заголовок */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Тарифы и&nbsp;токены Gennio
          </h1>
          <p className="mt-3 text-sm sm:text-base text-base-content/80">
            В&nbsp;Gennio используется система токенов. Один токен равен одному
            рублю, а&nbsp;одна генерация изображения стоит ровно 5&nbsp;токенов.
            Вы&nbsp;пополняете баланс токенов, а&nbsp;платформа автоматически
            списывает их при генерации.
          </p>
        </header>

        {/* Общее объяснение */}
        <section className="mb-6 sm:mb-8 space-y-3 text-sm sm:text-base">
          <p>
            Ниже&nbsp;— пакеты токенов для генерации изображений. Маленькие
            пакеты подходят, чтобы просто попробовать сервис, а&nbsp;большие
            дают небольшую скидку.
          </p>
          <p className="text-xs sm:text-sm text-base-content/70">
            Все операции сейчас списывают фиксированные 5&nbsp;токенов
            за&nbsp;одну успешную генерацию изображения.
          </p>
        </section>

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
              <div className="grid gap-4 sm:grid-cols-2">
                {packs.map((pack) => {
                  const { tokens, discountPercent, generations, priceRub } =
                    pack;
                  const disabled = creatingPayment === pack.id;

                  return (
                    <div
                      key={pack.id}
                      className={[
                        "flex flex-col rounded-2xl border border-base-300/70 bg-base-100/60 p-4 sm:p-5",
                        pack.highlight
                          ? "ring-2 ring-primary/40 shadow-lg/40"
                          : "shadow-sm",
                      ].join(" ")}
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex w-full justify-between items-center gap-2">
                          <h2 className="text-base sm:text-lg font-semibold">
                            {pack.name}
                          </h2>

                          <Button
                            onClick={() => handleBuy(pack.id)}
                            disabled={disabled}
                            size="sm"
                            className="text-nowrap"
                          >
                            {disabled
                              ? "Создание платежа…"
                              : `Купить за ${pack.priceRub} ₽`}
                          </Button>
                        </div>

                        {discountPercent > 0 && (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            −{discountPercent}%&nbsp;от стоимости
                          </span>
                        )}
                      </div>

                      <div className="mb-3 space-y-1 text-sm sm:text-base">
                        <p>
                          <span className="font-medium">
                            {tokens}&nbsp;токенов
                          </span>{" "}
                          — {generations}&nbsp;
                          {generations === 1
                            ? "генерация изображения"
                            : "генераций изображения"}
                        </p>

                        <p className="text-xs sm:text-sm text-base-content/80">
                          Цена пакета:&nbsp;
                          <span className="font-medium">{priceRub}&nbsp;₽</span>
                        </p>

                        {discountPercent > 0 && (
                          <p className="text-[11px] sm:text-xs text-base-content/60">
                            Без скидки было бы {tokens}&nbsp;₽
                          </p>
                        )}

                        <p className="text-xs sm:text-sm text-base-content/70">
                          Списывается 5&nbsp;токенов за&nbsp;одну генерацию.
                        </p>
                      </div>

                      <div className="mt-auto pt-2 text-xs sm:text-sm text-base-content/60">
                        <p>
                          Токены можно использовать в&nbsp;любое время, пока
                          баланс не&nbsp;закончится.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1 text-xs sm:text-sm text-base-content/60">
                <p>
                  Точные цены пакетов указываются при оплате. В&nbsp;дальнейшем
                  тарифы могут корректироваться по&nbsp;мере развития платформы.
                </p>
                <p>
                  Оплачивая пакет токенов, вы подтверждаете, что ознакомились
                  и&nbsp;согласны с&nbsp;условиями{" "}
                  <Link
                    to="/legal/offer"
                    className="underline decoration-dotted underline-offset-2"
                  >
                    Пользовательского соглашения
                  </Link>{" "}
                  и{" "}
                  <Link
                    to="/legal/privacy"
                    className="underline decoration-dotted underline-offset-2"
                  >
                    Политики конфиденциальности
                  </Link>
                  .
                </p>
              </div>
            </>
          )}
        </section>
      </GlassCard>
    </div>
  );
}
