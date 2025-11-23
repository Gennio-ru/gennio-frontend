import PaymentsList from "./UsersList";
import { Route, Routes } from "react-router-dom";

export default function AdminUsersPage() {
  return (
    <>
      <Routes>
        {/* список */}
        <Route index element={<PaymentsList />} />

        {/* модалка по ID */}
        <Route path=":userId" element={<PaymentsList />} />
      </Routes>
    </>
  );
}
