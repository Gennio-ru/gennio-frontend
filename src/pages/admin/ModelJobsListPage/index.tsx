import PaymentsList from "./ModelJobsList";
import { Route, Routes } from "react-router-dom";

export default function AdminModelJobsPage() {
  return (
    <>
      <Routes>
        {/* список */}
        <Route index element={<PaymentsList />} />

        {/* модалка по ID */}
        <Route path=":modelJobId" element={<PaymentsList />} />
      </Routes>
    </>
  );
}
