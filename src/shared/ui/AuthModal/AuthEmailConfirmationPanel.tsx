import { useEffect, useState } from "react";
import Button from "@/shared/ui/Button";
import { resendConfirmLink } from "@/api/auth";

type Props = {
  email: string;
  // если true — блокируем кнопку на минуту при первом показе (после регистрации)
  lockResendInitially: boolean;
  // вернуться на таб логина (например, когда юзер уже подтвердил email)
  onBackToLogin?: () => void;
};

// заглушка под API — заменишь на реальный вызов
async function resendConfirmationEmail(email: string): Promise<void> {
  await resendConfirmLink({ email });
}

export function AuthEmailConfirmationPanel({
  email,
  lockResendInitially,
}: Props) {
  const [cooldown, setCooldown] = useState<number>(
    lockResendInitially ? 60 : 0
  );
  const [isSending, setIsSending] = useState(false);

  // тикер обратного отсчёта
  useEffect(() => {
    if (cooldown <= 0) return;

    const id = window.setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || isSending) return;

    try {
      setIsSending(true);
      await resendConfirmationEmail(email);
      setCooldown(60);
    } finally {
      setIsSending(false);
    }
  };

  const formatCooldown = (sec: number) => {
    if (sec <= 0) return "";
    const seconds = sec % 60;
    const padded = seconds.toString().padStart(2, "0");
    return `Можно отправить повторно через 0:${padded}`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-lg font-semibold text-base-content">
          Подтвердите почту
        </h2>
        <p className="text-sm text-base-content/80">
          Мы отправили ссылку для подтверждения на{" "}
          <span className="font-medium text-nowrap">{email}</span>. Перейдите по
          ссылке из письма, чтобы активировать аккаунт.
        </p>
      </div>

      <div className="space-y-2">
        <Button
          className="w-full"
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isSending}
        >
          {isSending
            ? "Отправляем…"
            : cooldown > 0
            ? "Отправить ещё раз"
            : "Отправить письмо ещё раз"}
        </Button>
        {cooldown > 0 && (
          <p className="text-center text-xs text-base-content/70">
            {formatCooldown(cooldown)}
          </p>
        )}
      </div>

      <div className="divider my-4"></div>

      <div className="space-y-2 text-center text-xs text-base-content/70">
        <p>
          Если письмо не приходит больше нескольких минут, проверьте папку
          <span className="font-medium"> «Спам»</span>
        </p>
      </div>
    </div>
  );
}
