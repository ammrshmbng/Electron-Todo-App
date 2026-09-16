import { ipcMain } from "electron";
import { createDetailWindow } from "../windows/window-manager";

export function registerWindowIPC(
  loadRenderer: (window: Electron.BrowserWindow) => Promise<void>,
) {
  ipcMain.handle("window:open-todo-detail", async (_event, todoId: string) => {
    const window = createDetailWindow(loadRenderer);

    window.webContents.once("did-finish-load", () => {
      window.webContents.send("todo:detail-id", todoId);
    });

    return;
  });
}
