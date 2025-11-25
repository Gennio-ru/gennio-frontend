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

/**
 * Склоняет слово в зависимости от числа
 * @param count - число
 * @param forms - формы слова: [одна, две, пять] => ['яблоко', 'яблока', 'яблок']
 */
export function declOfNum(
  count: number,
  forms: [string, string, string]
): string {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;

  if (n > 10 && n < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
}
