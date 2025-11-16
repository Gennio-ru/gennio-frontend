import { components } from "./types.gen";

export type PaginationMetaDto = components["schemas"]["PaginationMetaDto"];

export interface PaginationResult<T> {
  items: T[];
  meta: PaginationMetaDto;
}

export type ErrorResponseDto = components["schemas"]["ErrorResponseDto"];
