import { BrowserWindow, ipcMain } from "electron";
import { getTodoService } from "../services/todo.service";
import {
  createTodoInputSchema,
  todoIdSchema,
  updateTodoInputSchema,
} from "../../shared/validation/todo.schema";

function notifyTodoChanged() {
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send("todo:changed");
  }
}

export function registerTodoIPC() {
  const todoService = getTodoService();

  ipcMain.handle("todo:get-all", async () => {
    try {
      const todos = todoService.getAll();

      return {
        success: true,
        data: todos,
      };
    } catch {
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get todos",
        },
      };
    }
  });

  ipcMain.handle("todo:get-by-id", async (_event, rawId: unknown) => {
    const validation = todoIdSchema.safeParse(rawId);

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: "INVALID_TODO_ID",
          message: "Invalid todo id",
        },
      };
    }

    try {
      const todo = todoService.getById(validation.data);

      return {
        success: true,
        data: todo,
      };
    } catch {
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get todo",
        },
      };
    }
  });

  ipcMain.handle("todo:create", async (_event, rawInput: unknown) => {
    const validation = createTodoInputSchema.safeParse(rawInput);

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: "INVALID_TODO",
          message: validation.error.issues[0]?.message ?? "Invalid todo",
        },
      };
    }

    try {
      const todo = todoService.create(validation.data);

      notifyTodoChanged();

      return {
        success: true,
        data: todo,
      };
    } catch {
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create todo",
        },
      };
    }
  });

  ipcMain.handle("todo:update", async (_event, rawInput: unknown) => {
    const validation = updateTodoInputSchema.safeParse(rawInput);

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: "INVALID_TODO",
          message: validation.error.issues[0]?.message ?? "Invalid todo",
        },
      };
    }

    try {
      const todo = todoService.update(validation.data);

      if (!todo) {
        return {
          success: false,
          error: {
            code: "TODO_NOT_FOUND",
            message: "Todo not found",
          },
        };
      }

      notifyTodoChanged();

      return {
        success: true,
        data: todo,
      };
    } catch {
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update todo",
        },
      };
    }
  });

  ipcMain.handle("todo:delete", async (_event, rawId: unknown) => {
    const validation = todoIdSchema.safeParse(rawId);

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: "INVALID_TODO_ID",
          message: "Invalid todo id",
        },
      };
    }

    try {
      const deleted = todoService.delete(validation.data);

      if (!deleted) {
        return {
          success: false,
          error: {
            code: "TODO_NOT_FOUND",
            message: "Todo not found",
          },
        };
      }

      notifyTodoChanged();

      return {
        success: true,
        data: null,
      };
    } catch {
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete todo",
        },
      };
    }
  });
}