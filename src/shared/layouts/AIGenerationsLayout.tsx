import { Outlet } from "react-router-dom";
import { AIGenerationsMenu } from "../ui/AIGenerationsMenu";

export default function AIGenerationsLayout() {
  return (
    <>
      <AIGenerationsMenu />

      <Outlet />
    </>
  );
}
