import PromptsGrid from "@/features/prompts/PromptsGrid";
import CustomSelect from "@/shared/CustomSelect";

export default function PromptsPage() {
  return (
    <div className="mx-auto w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h1>Prompts</h1>

        <CustomSelect />
      </div>

      <PromptsGrid />
    </div>
  );
}
