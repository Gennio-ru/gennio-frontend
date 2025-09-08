import { PaginationMetaDto } from "./prompts";

export interface PaginationResult<T> {
  items: T[];
  meta: PaginationMetaDto;
}
