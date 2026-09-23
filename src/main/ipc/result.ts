import type { IPCError, IPCResult } from "../../shared/contracts/result";

export function ipcFailure<T>(
  code: string,
  message: string,
): IPCResult<T> {
  const error: IPCError = {
    code,
    message,
  };

  return {
    success: false,
    error,
  };
}
