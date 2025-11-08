import PromptsGrid from "@/pages/user/PromptsPage/PromptsGrid";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setCategory } from "@/features/prompts/promptSlice";
import UserCategoriesSelect from "@/shared/ui/UserCategoriesSelect";

export default function PromptsPage() {
  const dispatch = useAppDispatch();
  const { categoryId } = useAppSelector((state) => state.prompts.filters);

  const changeValue = (value: string) => {
    dispatch(setCategory(value));
  };

  return (
    <div className="mx-auto w-full">
      <div className="flex justify-between items-center mb-10">
        <div className="flex flex-col">
          <span className="text-base">Стилизация</span>
          <UserCategoriesSelect value={categoryId} onChange={changeValue} />
        </div>
      </div>

      <PromptsGrid />
    </div>
  );
}
