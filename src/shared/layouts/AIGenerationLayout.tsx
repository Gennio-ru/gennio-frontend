import { Outlet } from "react-router-dom";
import { AIGenerationsMenu } from "../ui/AIGenerationsMenu";

export function AIGenerationsLayout() {
  return (
    <>
      <AIGenerationsMenu />

      <Outlet />
    </>
  );
}
