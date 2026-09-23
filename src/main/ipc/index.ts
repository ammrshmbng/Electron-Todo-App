import type { BrowserWindow } from "electron";

import { registerNativeIPC } from "./native.ipc";
import { registerTodoFileIPC } from "./todo-file.ipc";
import { registerTodoIPC } from "./todo.ipc";
import { registerWindowIPC } from "./window.ipc";
import { registerBackgroundIPC } from "./background.ipc";

export function registerAllIPC(
  loadRenderer: (window: BrowserWindow) => Promise<void>,
) {
  registerNativeIPC();
  registerTodoIPC();
  registerTodoFileIPC();
  registerWindowIPC(loadRenderer);
  registerBackgroundIPC();
}
