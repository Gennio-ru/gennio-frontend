import GlassCard from "@/shared/ui/GlassCard";

export default function RequisitesBlock() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <GlassCard>
        <h1 className="mb-4 text-2xl sm:text-3xl font-semibold tracking-tight">
          Реквизиты сервиса Gennio
        </h1>
        <div className="space-y-2 text-sm sm:text-base">
          <p>
            <span className="font-semibold">Оказатель услуг:</span> Нехоц
            Владимир Вячеславович
          </p>
          <p>
            <span className="font-semibold">Статус:</span> самозанятый
          </p>
          <p>
            <span className="font-semibold">ИНН:</span> 732815959070
          </p>
          <p>
            <span className="font-semibold">Город:</span> Ульяновск
          </p>
          <p>
            <span className="font-semibold">Электронная почта:</span>{" "}
            <a
              href="mailto:support@gennio.ru"
              className="underline decoration-dotted"
            >
              support@gennio.ru
            </a>
          </p>
        </div>

        <p className="mt-4 text-xs sm:text-sm text-base-content/70">
          Указанные реквизиты используются для оформления договорных отношений и
          проведения оплат через платёжный сервис (агрегатор) ЮKassa.
        </p>
      </GlassCard>
    </div>
  );
}
