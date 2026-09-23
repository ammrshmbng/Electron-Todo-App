import { IPC_CHANNELS } from "../../shared/ipc/channels";
import { registerSecureIpcHandler } from "./register";
import { ipcFailure } from "./result";

import {
  cancelTodoScan,
  startTodoScan,
} from "../background/todo-scan";

export function registerBackgroundIPC() {
  registerSecureIpcHandler(
    IPC_CHANNELS.BACKGROUND.START_TODO_SCAN,
    async (event) => {
      try {
        const taskId = startTodoScan(event.sender);

        return {
          success: true,
          data: {
            taskId,
          },
        };
      } catch {
        return ipcFailure(
          "BACKGROUND_START_FAILED",
          "Failed to start background Todo scan",
        );
      }
    },
  );

  registerSecureIpcHandler(
    IPC_CHANNELS.BACKGROUND.CANCEL,
    async (_event, rawTaskId: unknown) => {
      if (typeof rawTaskId !== "string" || rawTaskId.length === 0) {
        return ipcFailure(
          "INVALID_TASK_ID",
          "Invalid background task id",
        );
      }

      const cancelled = cancelTodoScan(rawTaskId);

      if (!cancelled) {
        return ipcFailure(
          "TASK_NOT_FOUND",
          "Background task not found",
        );
      }

      return {
        success: true,
        data: null,
      };
    },
  );
}
