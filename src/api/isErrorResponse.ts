import { ErrorResponseDto } from "./types";

export function isErrorResponseDto(value: unknown): value is ErrorResponseDto {
  if (!value || typeof value !== "object") return false;

  const data = value as {
    success?: unknown;
    statusCode?: unknown;
    path?: unknown;
    timestamp?: unknown;
    error?: unknown;
  };

  if (
    typeof data.success !== "boolean" ||
    typeof data.statusCode !== "number" ||
    typeof data.path !== "string" ||
    typeof data.timestamp !== "string" ||
    !data.error ||
    typeof data.error !== "object"
  ) {
    return false;
  }

  const err = data.error as { code?: unknown };

  return typeof err.code === "string";
}
