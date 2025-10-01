import PromptsGrid from "@/pages/user/PromptsPage/PromptsGrid";
import CategoriesSelect from "@/shared/ui/CategoriesSelect";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { resetCategory, setCategory } from "@/features/prompts/promptSlice";

export default function PromptsPage() {
  const dispatch = useAppDispatch();
  const { categoryId } = useAppSelector((state) => state.prompts.filters);

  const changeValue = (value: string) => {
    dispatch(setCategory(value));
  };

  const clearCategory = () => {
    dispatch(resetCategory());
  };

  return (
    <div className="mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <span className="h2">Промпты</span>

        <CategoriesSelect
          value={categoryId || null}
          onChange={changeValue}
          onReset={clearCategory}
          className="bg-base-100"
        />
      </div>

      <PromptsGrid />
    </div>
  );
}
