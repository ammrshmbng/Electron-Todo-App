import { app, BrowserWindow } from "electron";
import path from "node:path";

import { initializeDatabase } from "./database/database";
import { registerTodoIPC } from "./ipc/todo.ipc";
import { registerWindowIPC } from "./ipc/window.ipc";
import { createMainWindow } from "./windows/window-manager";

async function loadRenderer(window: BrowserWindow) {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    return;
  }

  await window.loadFile(
    path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
  );
}

app.whenReady().then(() => {
  initializeDatabase();
  registerTodoIPC();
  registerWindowIPC(loadRenderer);
  createMainWindow(loadRenderer);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow(loadRenderer);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
