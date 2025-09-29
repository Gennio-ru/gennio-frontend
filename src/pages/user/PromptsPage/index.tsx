import PromptsGrid from "@/pages/user/PromptsPage/PromptsGrid";
import CategoriesSelect from "@/pages/user/PromptsPage/CategoriesSelect";

export default function PromptsPage() {
  return (
    <div className="mx-auto w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <span className="h2">Промпты</span>

        <CategoriesSelect />
      </div>

      <PromptsGrid />
    </div>
  );
}
