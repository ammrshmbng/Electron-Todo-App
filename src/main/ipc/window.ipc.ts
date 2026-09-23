
import { createDetailWindow } from "../windows/window-manager";
import { IPC_CHANNELS } from "../../shared/ipc/channels";
import { registerSecureIpcHandler } from "./register";

export function registerWindowIPC(
  loadRenderer: (window: Electron.BrowserWindow) => Promise<void>,
) {
  registerSecureIpcHandler(IPC_CHANNELS.WINDOW.OPEN_TODO_DETAIL, async (event, todoId: string) => {
    const window = createDetailWindow(loadRenderer);

    window.webContents.once("did-finish-load", () => {
      window.webContents.send(IPC_CHANNELS.TODO.EVENTS.DETAIL_ID, todoId);
    });

    return;
  });
}
