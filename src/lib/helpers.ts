import axios from "axios";
import { ErrorCode, ErrorResponseDto } from "@/api/types";

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

export const checkApiResponseErrorCode = (
  error: unknown,
  errorCode: ErrorCode
): boolean => {
  if (!axios.isAxiosError(error)) return false;

  const data = error.response?.data;

  if (isErrorResponseDto(data) && data.error?.code === errorCode) {
    return true;
  }

  return false;
};
