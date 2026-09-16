import { BrowserWindow, Menu, Notification, dialog, ipcMain } from "electron";

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
      const window = BrowserWindow.fromWebContents(event.sender);

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
    const window = BrowserWindow.fromWebContents(event.sender);

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

  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Open Todo File",
          click: (menuItem, window) => {
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
