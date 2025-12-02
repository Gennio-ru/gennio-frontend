import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { meThunk } from "@/features/auth/authSlice";
import { setPaymentResultModalOpen } from "@/features/app/appSlice";
import { apiCreateTokensPayment } from "@/api/modules/payments";
import { TokenPackId } from "@/api/modules/pricing";
import { socket } from "@/api/socket/socket";
import { PAYMENT_EVENTS } from "@/api/socket/payment-events";
import { Payment } from "@/api/modules/payments";
import { customToast } from "@/lib/customToast";

export function useStartPayment() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const startPayment = async (packId: TokenPackId, onStart?: () => void) => {
    const returnPath = location.pathname + location.search;

    try {
      onStart?.();

      const res = await apiCreateTokensPayment({ packId, returnPath });

      socket.emit(PAYMENT_EVENTS.SUBSCRIBE, res.id);

      const handleUpdate = async (payment: Payment) => {
        if (payment.id !== res.id) return;

        const final =
          payment.status === "SUCCEEDED" ||
          payment.status === "CANCELED" ||
          payment.status === "ERROR" ||
          payment.status === "REFUNDED";

        if (!final) return;

        // При успехе → обновляем профиль
        if (payment.status === "SUCCEEDED") {
          await dispatch(meThunk()).unwrap();
        }

        // Открыть модалку результата через URL
        const params = new URLSearchParams(location.search);
        params.set("paymentId", payment.id);

        navigate(`${location.pathname}?${params.toString()}`, {
          replace: true,
        });
        dispatch(setPaymentResultModalOpen(true));

        socket.emit(PAYMENT_EVENTS.UNSUBSCRIBE, res.id);
        socket.off(PAYMENT_EVENTS.UPDATE, handleUpdate);
      };

      socket.on(PAYMENT_EVENTS.UPDATE, handleUpdate);

      // Открываем YooKassa окно
      if (res.confirmationUrl) {
        sessionStorage.setItem("lastPaymentId", res.id);
        window.open(res.confirmationUrl, "_blank");
      }
    } catch (e) {
      customToast.error(e);
    }
  };

  return { startPayment };
}
