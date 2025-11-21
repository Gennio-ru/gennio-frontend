import PaymentsList from "./PaymentsList";
import { Route, Routes } from "react-router-dom";

export default function AdminPaymentsPage() {
  return (
    <>
      <Routes>
        {/* список */}
        <Route index element={<PaymentsList />} />

        {/* модалка по ID */}
        <Route path=":paymentId" element={<PaymentsList />} />
      </Routes>
    </>
  );
}
