import { useMemo } from "react";
import { CheckCircle, InfoIcon, XCircle } from "lucide-react";
import { PaymentFull } from "@/api/modules/payments";

type Props = {
  payment: PaymentFull;
};

export function AdminPaymentHeader({ payment }: Props) {
  const { icon, pill } = useMemo(() => {
    const hasError = Boolean(payment.errorCode || payment.errorMessage);

    let pillClass =
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";

    if (payment.status === "SUCCEEDED") {
      pillClass += " bg-success/10 text-success";
    } else if (payment.status === "CANCELED") {
      pillClass += " bg-error/10 text-error";
    } else if (payment.status === "REFUNDED") {
      pillClass += " bg-warning/10 text-warning";
    } else if (hasError) {
      pillClass += " bg-error/10 text-error";
    } else {
      pillClass += " bg-base-200 text-base-content/80";
    }

    const pillNode = <span className={pillClass}>{payment.status}</span>;

    const statusIcon =
      payment.status === "SUCCEEDED" ? (
        <CheckCircle className="text-green-500" size={32} />
      ) : hasError || payment.status === "CANCELED" ? (
        <XCircle className="text-red-500" size={32} />
      ) : (
        <InfoIcon className="text-base-content/70" size={32} />
      );

    return { pill: pillNode, icon: statusIcon };
  }, [payment]);

  return (
    <div className="flex items-center gap-3">
      {icon}

      <div className="flex flex-col gap-1">
        <div className="text-base font-medium break-all">
          Платёж #{payment.id}
        </div>
        <div>{pill}</div>
      </div>
    </div>
  );
}
