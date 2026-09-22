import { BrowserWindow } from "electron";

import type { AppCommand } from "../../shared/contracts/todo-api";

export function dispatchAppCommand(
  window: BrowserWindow | null,
  command: AppCommand,
) {
  if (!window || window.isDestroyed()) {
    return;
  }

  window.webContents.send("app:command", command);
}
