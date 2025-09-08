import PromptsGrid from "@/features/prompts/PromptsGrid";

export default function PromptsPage() {
  return (
    <div className="mx-auto w-full p-6">
      <h1 className="mb-4 text-xl font-semibold">Prompts</h1>
      <PromptsGrid />
    </div>
  );
}
