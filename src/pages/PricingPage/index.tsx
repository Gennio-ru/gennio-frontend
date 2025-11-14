import GlassCard from "@/shared/ui/GlassCard";

type Pack = {
  id: string;
  name: string;
  tokens: number;
  generations: number;
  discountPercent: number; // 0, 5, 10
  highlight?: boolean;
};

const PACKS: Pack[] = [
  {
    id: "starter",
    name: "5 генераций",
    tokens: 25,
    generations: 5,
    discountPercent: 0,
  },
  {
    id: "basic",
    name: "10 генераций",
    tokens: 50,
    generations: 10,
    discountPercent: 0,
  },
  {
    id: "pro",
    name: "20 генераций",
    tokens: 100,
    generations: 20,
    discountPercent: 10,
    highlight: true,
  },
  {
    id: "max",
    name: "50 генераций",
    tokens: 250,
    generations: 50,
    discountPercent: 15,
  },
];

export default function PricingPage() {
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
          <div className="grid gap-4 sm:grid-cols-2">
            {PACKS.map((pack) => {
              const { tokens, discountPercent, generations } = pack;

              // Цена пакета с учётом скидки
              const price = Math.ceil(tokens * (1 - discountPercent / 100));

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
                    <h2 className="text-base sm:text-lg font-semibold">
                      {pack.name}
                    </h2>

                    {discountPercent > 0 && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        −{discountPercent}%&nbsp;от стоимости
                      </span>
                    )}
                  </div>

                  <div className="mb-3 space-y-1 text-sm sm:text-base">
                    <p>
                      <span className="font-medium">{tokens}&nbsp;токенов</span>{" "}
                      — {generations}&nbsp;
                      {generations === 1
                        ? "генерация изображения"
                        : "генераций изображения"}
                    </p>

                    <p className="text-xs sm:text-sm text-base-content/80">
                      Цена пакета:&nbsp;
                      <span className="font-medium">{price}&nbsp;₽</span>
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
                      Токены можно использовать в&nbsp;любое время, пока баланс
                      не&nbsp;закончится.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs sm:text-sm text-base-content/60">
            Точные цены пакетов указываются при оплате. В&nbsp;дальнейшем тарифы
            могут корректироваться по&nbsp;мере развития платформы.
          </p>
        </section>
      </GlassCard>
    </div>
  );
}
