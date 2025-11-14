import { Outlet } from "react-router-dom";
import { AIGenerationsMenu } from "../ui/AIGenerationsMenu";
import { SegmentedAIGenerationsMenu } from "../ui/SegmentedAiGenerationsMenu";
import { Suspense } from "react";
import Loader from "../ui/Loader";

export default function AIGenerationsLayout() {
  return (
    <>
      <SegmentedAIGenerationsMenu className="hidden sm:flex" />

      <AIGenerationsMenu className="flex sm:hidden" />

      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </>
  );
}
