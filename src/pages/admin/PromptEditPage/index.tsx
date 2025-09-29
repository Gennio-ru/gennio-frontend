import PromptEditForm from "@/pages/admin/PromptEditPage/PromptEditForm";

export default function PromptEditPage() {
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold">Редактирование промпта</h1>
      <PromptEditForm />;
    </div>
  );
}
