import { AspectMiniRect } from "./AspectMiniRect";

export const ItemContent = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  return (
    <div className="flex items-center gap-1.5 px-0.5">
      <span className="text-base">
        {width}&#8239;:&#8239;{height}
      </span>
      <AspectMiniRect w={width} h={height} />
    </div>
  );
};
