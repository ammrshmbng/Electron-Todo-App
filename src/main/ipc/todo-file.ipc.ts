import { BrowserWindow, app, dialog, ipcMain } from "electron";

import { promises as fs } from "node:fs";
import path from "node:path";

import { getTodoService } from "../services/todo.service";

import { todoFileSchema } from "../../shared/validation/todo.schema";

import type { Todo } from "../../shared/types/todo";
import type { IPCResult } from "../../shared/contracts/result";
import { assertTrustedIPCEvent } from "../security";

function notifyTodoChanged() {
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send("todo:changed");
  }
}

function getWindowFromEvent(event: Electron.IpcMainInvokeEvent) {
  return BrowserWindow.fromWebContents(event.sender);
}

async function importTodoFileFromPath(
  filePath: string,
  todoService: ReturnType<typeof getTodoService>,
): Promise<IPCResult<{ count: number }>> {
  try {
    if (path.extname(filePath).toLowerCase() !== ".json") {
      return {
        success: false,
        error: {
          code: "INVALID_FILE_TYPE",
          message: "Only JSON files can be imported",
        },
      };
    }

    const content = await fs.readFile(filePath, "utf-8");

    let rawData: unknown;

    try {
      rawData = JSON.parse(content);
    } catch {
      return {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Selected file is not valid JSON",
        },
      };
    }

    const validation = todoFileSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        error: {
          code: "INVALID_TODO_FILE",
          message: "Selected file does not contain valid Todo data",
        },
      };
    }

    const todos: Todo[] = validation.data;

    todoService.replaceAll(todos);

    notifyTodoChanged();

    return {
      success: true,
      data: {
        count: todos.length,
      },
    };
  } catch {
    return {
      success: false,
      error: {
        code: "FILE_READ_ERROR",
        message: "Failed to import todos",
      },
    };
  }
}

export function registerTodoFileIPC() {
  const todoService = getTodoService();

  ipcMain.handle(
    "todo:export-file",
    async (
      event,
    ): Promise<
      IPCResult<{
        path: string;
        count: number;
      }>
    > => {
      assertTrustedIPCEvent(event);
      try {
        const todos = todoService.getAll();

        const window = getWindowFromEvent(event);

        const defaultPath = path.join(app.getPath("downloads"), "todos.json");

        const dialogOptions: Electron.SaveDialogOptions = {
          title: "Export Todos",
          defaultPath,
          filters: [
            {
              name: "Todo JSON",
              extensions: ["json"],
            },
          ],
        };

        const result = window
          ? await dialog.showSaveDialog(window, dialogOptions)
          : await dialog.showSaveDialog(dialogOptions);

        if (result.canceled || !result.filePath) {
          return {
            success: true,
            data: {
              path: "",
              count: 0,
            },
          };
        }

        const content = JSON.stringify(todos, null, 2);

        await fs.writeFile(result.filePath, content, "utf-8");

        return {
          success: true,
          data: {
            path: result.filePath,
            count: todos.length,
          },
        };
      } catch {
        return {
          success: false,
          error: {
            code: "FILE_WRITE_ERROR",
            message: "Failed to export todos",
          },
        };
      }
    },
  );

  ipcMain.handle(
    "todo:import-file",
    async (
      event,
    ): Promise<
      IPCResult<{
        count: number;
      }>
    > => {
      const window = getWindowFromEvent(event);

      const dialogOptions: Electron.OpenDialogOptions = {
        title: "Import Todos",
        properties: ["openFile"],
        filters: [
          {
            name: "Todo JSON",
            extensions: ["json"],
          },
        ],
      };

      const result = window
        ? await dialog.showOpenDialog(window, dialogOptions)
        : await dialog.showOpenDialog(dialogOptions);

      if (result.canceled) {
        return {
          success: true,
          data: {
            count: 0,
          },
        };
      }

      const filePath = result.filePaths[0];

      if (!filePath) {
        return {
          success: false,
          error: {
            code: "FILE_NOT_FOUND",
            message: "No file was selected",
          },
        };
      }

      return importTodoFileFromPath(filePath, todoService);
    },
  );

  ipcMain.handle(
    "todo:import-file-path",
    async (event, filePath: string): Promise<IPCResult<{ count: number }>> => {
      assertTrustedIPCEvent(event);
      if (!filePath) {
        return {
          success: false,
          error: {
            code: "FILE_NOT_FOUND",
            message: "No file path was provided",
          },
        };
      }

      return importTodoFileFromPath(filePath, todoService);
    },
  );
}
