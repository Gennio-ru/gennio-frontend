import { Route, Routes } from "react-router-dom";
import PromptsList from "./PromptsList";

export default function AdminPromptsPage() {
  return (
    <>
      <Routes>
        {/* список */}
        <Route index element={<PromptsList />} />

        {/* модалка по ID */}
        <Route path=":promptId" element={<PromptsList />} />

        {/* модалка - новый промпт */}
        <Route path="new" element={<PromptsList />} />
      </Routes>
    </>
  );
}
