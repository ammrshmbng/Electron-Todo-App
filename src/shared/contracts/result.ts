export interface IPCError {
  code: string;
  message: string;
}

export type IPCResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: IPCError;
    };

