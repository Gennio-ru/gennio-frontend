import { PillSegmentedItem } from "../PillSegmentedControl";
import { ItemContent } from "./ItemContent";

export type AspectRatioValue = string;

export const OPENAI_ASPECT_ITEMS: PillSegmentedItem<AspectRatioValue>[] = [
  { id: null, content: <span className="text-base">auto</span> },
  {
    id: "1:1",
    content: <ItemContent width={1} height={1} />,
  },
  {
    id: "2:3",
    content: <ItemContent width={2} height={3} />,
  },
  {
    id: "3:2",
    content: <ItemContent width={3} height={2} />,
  },
];

export const GEMINI_ASPECT_ITEMS: PillSegmentedItem<AspectRatioValue>[] = [
  { id: null, content: <span className="text-base">auto</span> },
  { id: "1:1", content: <ItemContent width={1} height={1} /> },
  { id: "2:3", content: <ItemContent width={2} height={3} /> },
  { id: "3:2", content: <ItemContent width={3} height={2} /> },
  { id: "3:4", content: <ItemContent width={3} height={4} /> },
  { id: "4:3", content: <ItemContent width={4} height={3} /> },
  { id: "9:16", content: <ItemContent width={9} height={16} /> },
  { id: "16:9", content: <ItemContent width={16} height={9} /> },
];
