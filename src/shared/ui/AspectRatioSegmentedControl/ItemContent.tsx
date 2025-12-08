import { AspectMiniRect } from "./AspectMiniRect";

export const ItemContent = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  return (
    <div className="flex items-center gap-2 px-0.5">
      <span className="text-base">
        {width} : {height}
      </span>
      <AspectMiniRect w={width} h={height} />
    </div>
  );
};
