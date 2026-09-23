import { BrowserWindow } from "electron";

import type { AppCommand } from "../../shared/contracts/todo-api";
import { IPC_CHANNELS } from "../../shared/ipc/channels";

export function dispatchAppCommand(
  window: BrowserWindow | null,
  command: AppCommand,
) {
  if (!window || window.isDestroyed()) {
    return;
  }

  window.webContents.send(IPC_CHANNELS.APP.EVENTS.COMMAND, command);
}
