import { PaymentFull } from "@/api/modules/payments";

type Props = {
  payment: PaymentFull;
};

export function AdminPaymentUserCard({ payment }: Props) {
  const userEmail = payment.user?.email ?? null;
  const userId = payment.userId ?? null;
  const userTokens = payment.user?.tokens ?? null;

  return (
    <div className="rounded-box bg-base-200/60 p-3 text-sm space-y-2">
      <div className="font-medium mb-1">Пользователь</div>

      <div className="flex justify-between gap-3">
        <span className="text-base-content/60">Email</span>
        <span>{userEmail ?? "—"}</span>
      </div>

      <div className="flex justify-between gap-3">
        <span className="text-base-content/60">User ID</span>
        <span className="break-all">{userId ?? "—"}</span>
      </div>

      <div className="flex justify-between gap-3">
        <span className="text-base-content/60">Баланс токенов</span>
        <span>{userTokens != null ? userTokens : "—"}</span>
      </div>
    </div>
  );
}
