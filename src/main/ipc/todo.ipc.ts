import { BrowserWindow } from "electron";

import { getTodoService } from "../services/todo.service";
import { IPC_CHANNELS } from "../../shared/ipc/channels";
import { registerSecureIpcHandler } from "./register";
import { ipcFailure } from "./result";

import {
  createTodoInputSchema,
  todoIdSchema,
  updateTodoInputSchema,
} from "../../shared/validation/todo.schema";


function notifyTodoChanged() {
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send(IPC_CHANNELS.TODO.EVENTS.CHANGED);
  }
}

export function registerTodoIPC() {
  const todoService = getTodoService();

  registerSecureIpcHandler(IPC_CHANNELS.TODO.GET_ALL, async (event) => {
    try {
      const todos = todoService.getAll();

      return {
        success: true,
        data: todos,
      };
    } catch {
      return ipcFailure("INTERNAL_ERROR", "Failed to get todos");
    }
  });

  registerSecureIpcHandler(IPC_CHANNELS.TODO.GET_BY_ID, async (event, rawId: unknown) => {
    const validation = todoIdSchema.safeParse(rawId);

    if (!validation.success) {
      return ipcFailure("INVALID_TODO_ID", "Invalid todo id");
    }

    try {
      const todo = todoService.getById(validation.data);

      return {
        success: true,
        data: todo,
      };
    } catch {
      return ipcFailure("INTERNAL_ERROR", "Failed to get todo");
    }
  });

  registerSecureIpcHandler(IPC_CHANNELS.TODO.CREATE, async (event, rawInput: unknown) => {
    const validation = createTodoInputSchema.safeParse(rawInput);

    if (!validation.success) {
      return ipcFailure(
        "INVALID_TODO",
        validation.error.issues[0]?.message ?? "Invalid todo",
      );
    }

    try {
      const todo = todoService.create(validation.data);

      notifyTodoChanged();

      return {
        success: true,
        data: todo,
      };
    } catch {
      return ipcFailure("INTERNAL_ERROR", "Failed to create todo");
    }
  });

  registerSecureIpcHandler(IPC_CHANNELS.TODO.UPDATE, async (event, rawInput: unknown) => {
    const validation = updateTodoInputSchema.safeParse(rawInput);

    if (!validation.success) {
      return ipcFailure(
        "INVALID_TODO",
        validation.error.issues[0]?.message ?? "Invalid todo",
      );
    }

    try {
      const todo = todoService.update(validation.data);

      if (!todo) {
        return ipcFailure("TODO_NOT_FOUND", "Todo not found");
      }

      notifyTodoChanged();

      return {
        success: true,
        data: todo,
      };
    } catch {
      return ipcFailure("INTERNAL_ERROR", "Failed to update todo");
    }
  });

  registerSecureIpcHandler(IPC_CHANNELS.TODO.DELETE, async (event, rawId: unknown) => {
    const validation = todoIdSchema.safeParse(rawId);

    if (!validation.success) {
      return ipcFailure("INVALID_TODO_ID", "Invalid todo id");
    }

    try {
      todoService.delete(validation.data);

      notifyTodoChanged();

      return {
        success: true,
        data: null,
      };
    } catch {
      return ipcFailure("INTERNAL_ERROR", "Failed to delete todo");
    }
  });
}
