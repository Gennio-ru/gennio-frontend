import PromptsGrid from "@/pages/user/ai-generations/PromptsPage/PromptsGrid";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setCategory, setSearch } from "@/features/prompts/promptSlice";
import UserCategoriesSelect from "@/shared/ui/UserCategoriesSelect";
import { GennioSearch } from "@/shared/ui/GennioSearch";
import { ScrollToTopButton } from "@/shared/ui/ScrollToTopButton";

export default function PromptsPage() {
  const dispatch = useAppDispatch();
  const { categoryId, search } = useAppSelector(
    (state) => state.prompts.filters
  );

  const changeCategory = (value: string) => {
    dispatch(setCategory(value));
  };

  const changeSearch = (value: string) => {
    dispatch(setSearch(value));
  };

  return (
    <div className="mx-auto w-full">
      <div className="flex justify-between items-end mb-10 gap-4">
        <div className="flex flex-col">
          <span className="text-base">Стилизация</span>
          <UserCategoriesSelect value={categoryId} onChange={changeCategory} />
        </div>

        <div className="sm:pb-1 md:pb-2 hidden sm:flex w-full justify-end">
          <GennioSearch
            value={search}
            placeholder="Поиск по стилизациям"
            onChange={changeSearch}
          />
        </div>
      </div>

      <PromptsGrid />

      <ScrollToTopButton />
    </div>
  );
}
