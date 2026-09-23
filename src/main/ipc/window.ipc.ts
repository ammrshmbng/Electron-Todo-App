import { ipcMain } from "electron";
import { createDetailWindow } from "../windows/window-manager";
import { assertTrustedIPCEvent } from "../security";

export function registerWindowIPC(
  loadRenderer: (window: Electron.BrowserWindow) => Promise<void>,
) {
  ipcMain.handle("window:open-todo-detail", async (event, todoId: string) => {
    assertTrustedIPCEvent(event);

    const window = createDetailWindow(loadRenderer);

    window.webContents.once("did-finish-load", () => {
      window.webContents.send("todo:detail-id", todoId);
    });

    return;
  });
}
