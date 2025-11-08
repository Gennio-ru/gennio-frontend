import PromptsGrid from "@/pages/user/PromptsPage/PromptsGrid";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setCategory, setSearch } from "@/features/prompts/promptSlice";
import UserCategoriesSelect from "@/shared/ui/UserCategoriesSelect";
import { GennioSearch } from "@/shared/ui/GennioSearch";
import { AIGenerationsMenu } from "@/shared/ui/AIGenerationsMenu";

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
      <AIGenerationsMenu />

      <div className="flex justify-between items-end mb-10">
        <div className="flex flex-col">
          <span className="text-base">Стилизация</span>
          <UserCategoriesSelect value={categoryId} onChange={changeCategory} />
        </div>

        <div className="pb-2">
          <GennioSearch
            value={search}
            placeholder="Поиск по стилизациям"
            onChange={changeSearch}
          />
        </div>
      </div>

      <PromptsGrid />
    </div>
  );
}
