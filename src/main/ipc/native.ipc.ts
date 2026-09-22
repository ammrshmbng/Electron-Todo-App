import {
  BrowserWindow,
  Menu,
  Notification,
  dialog,
  ipcMain,
  shell,
  app,
  clipboard,
} from "electron";

import { todoContextMenuInputSchema } from "../../shared/validation/todo.schema";
import { dispatchAppCommand } from "../commands/app-command";

const todoFileDialogOptions: Electron.OpenDialogOptions = {
  title: "Open Todo File",
  properties: ["openFile"],
  filters: [
    {
      name: "Todo Files",
      extensions: ["json"],
    },
    {
      name: "All Files",
      extensions: ["*"],
    },
  ],
};

function getWindowFromEvent(event: Electron.IpcMainInvokeEvent) {
  return BrowserWindow.fromWebContents(event.sender);
}

function sendTodoContextMenuAction(
  sender: Electron.WebContents,
  action:
    | "open-detail"
    | "toggle-completed"
    | "copy-title"
    | "copy-json"
    | "delete",
  todoId: string,
) {
  if (sender.isDestroyed()) {
    return;
  }

  sender.send("todo:context-menu-action", {
    action,
    todoId,
  });
}

function getBrowserWindow(window: Electron.BaseWindow | null) {
  return window instanceof BrowserWindow ? window : null;
}

export function registerNativeIPC() {
  ipcMain.handle(
    "native:confirm",
    async (
      event,
      options: {
        title: string;
        message: string;
        detail?: string;
      },
    ) => {
      const window = getWindowFromEvent(event);

      const messageBoxOptions = {
        type: "question" as const,
        title: options.title,
        message: options.message,
        detail: options.detail,
        buttons: ["Cancel", "Confirm"],
        defaultId: 1,
        cancelId: 0,
      };

      const result = window
        ? await dialog.showMessageBox(window, messageBoxOptions)
        : await dialog.showMessageBox(messageBoxOptions);

      return result.response === 1;
    },
  );

  ipcMain.handle("native:open-file", async (event) => {
    const window = getWindowFromEvent(event);

    const result = window
      ? await dialog.showOpenDialog(window, todoFileDialogOptions)
      : await dialog.showOpenDialog(todoFileDialogOptions);

    if (result.canceled) {
      return null;
    }

    return result.filePaths[0] ?? null;
  });

  ipcMain.handle(
    "native:notify",
    async (
      _event,
      options: {
        title: string;
        body: string;
      },
    ) => {
      if (!Notification.isSupported()) {
        return false;
      }

      new Notification({
        title: options.title,
        body: options.body,
      }).show();

      return true;
    },
  );

  ipcMain.handle("native:open-data-folder", async () => {
    const dataPath = app.getPath("userData");

    const error = await shell.openPath(dataPath);

    return {
      success: error.length === 0,
      path: dataPath,
      error: error || null,
    };
  });

  ipcMain.handle("native:show-database", async () => {
    const databasePath = app.getPath("userData");

    const databaseFilePath = `${databasePath}/todos.db`;

    shell.showItemInFolder(databaseFilePath);

    return databaseFilePath;
  });

  ipcMain.handle("native:open-external", async (_event, url: string) => {
    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        return false;
      }

      await shell.openExternal(parsedUrl.toString());

      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle("native:get-app-info", async () => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      platform: process.platform,
      architecture: process.arch,
      isPackaged: app.isPackaged,
      appPath: app.getAppPath(),

      paths: {
        userData: app.getPath("userData"),
        appData: app.getPath("appData"),
        documents: app.getPath("documents"),
        downloads: app.getPath("downloads"),
        desktop: app.getPath("desktop"),
        temp: app.getPath("temp"),
        logs: app.getPath("logs"),
      },
    };
  });

  ipcMain.handle("native:copy-text", async (_event, text: string) => {
    clipboard.writeText(text);

    return true;
  });

  ipcMain.handle("native:read-clipboard", async () => {
    return clipboard.readText();
  });

  ipcMain.handle("todo:show-context-menu", async (event, rawInput: unknown) => {
    const validation = todoContextMenuInputSchema.safeParse(rawInput);

    if (!validation.success) {
      return;
    }

    const { todoId, completed } = validation.data;

    const window = getWindowFromEvent(event);

    if (!window || window.isDestroyed()) {
      return;
    }

    const sender = event.sender;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Open Details",
        click: () => {
          sendTodoContextMenuAction(sender, "open-detail", todoId);
        },
      },

      {
        label: completed ? "Mark as Active" : "Mark as Completed",
        click: () => {
          sendTodoContextMenuAction(sender, "toggle-completed", todoId);
        },
      },

      {
        type: "separator",
      },

      {
        label: "Copy Title",
        click: () => {
          sendTodoContextMenuAction(sender, "copy-title", todoId);
        },
      },

      {
        label: "Copy as JSON",
        click: () => {
          sendTodoContextMenuAction(sender, "copy-json", todoId);
        },
      },

      {
        type: "separator",
      },

      {
        label: "Delete",
        click: () => {
          sendTodoContextMenuAction(sender, "delete", todoId);
        },
      },
    ]);

    contextMenu.popup({
      window,
    });
  });

  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Open Todo File",
          click: (_menuItem, window) => {
            if (!window) {
              return;
            }

            void dialog.showOpenDialog(window, todoFileDialogOptions);
          },
        },

        {
          type: "separator",
        },

        {
          role: "quit",
        },
      ],
    },

    {
      label: "Todo",
      submenu: [
        {
          label: "New Todo",
          accelerator: "CommandOrControl+N",
          click: (_menuItem, window) => {
            const targetWindow = getBrowserWindow(
              window ?? BrowserWindow.getFocusedWindow(),
            );

            dispatchAppCommand(targetWindow, "new-todo");
          },
        },

        {
          label: "Focus Search",
          accelerator: "CommandOrControl+F",
          click: (_menuItem, window) => {
            const targetWindow = getBrowserWindow(
              window ?? BrowserWindow.getFocusedWindow(),
            );

            dispatchAppCommand(targetWindow, "focus-search");
          },
        },
      ],
    },

    {
      label: "View",
      submenu: [
        {
          role: "reload",
        },
        {
          role: "toggleDevTools",
        },
        {
          role: "togglefullscreen",
        },
      ],
    },

    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click: async (_menuItem, window) => {
            const aboutOptions = {
              type: "info" as const,
              title: "About Todo Electron",
              message: "Todo Electron",
              detail:
                "A practical Electron application built with React, TypeScript and SQLite.",
              buttons: ["OK"],
            };

            if (window) {
              await dialog.showMessageBox(window, aboutOptions);

              return;
            }

            await dialog.showMessageBox(aboutOptions);
          },
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);
}
