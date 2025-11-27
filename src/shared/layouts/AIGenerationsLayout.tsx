import { Outlet } from "react-router-dom";
import { AIGenerationsMenu } from "../ui/AIGenerationsMenu";
import { SegmentedAIGenerationsMenu } from "../ui/SegmentedAiGenerationsMenu";

export default function AIGenerationsLayout() {
  return (
    <>
      <SegmentedAIGenerationsMenu className="hidden sm:flex" />

      <AIGenerationsMenu className="flex sm:hidden" />

      <Outlet />
    </>
  );
}
