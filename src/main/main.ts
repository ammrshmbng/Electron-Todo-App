import { app, BrowserWindow } from "electron";
import path from "node:path";

import { initializeDatabase } from "./database/database";

import { registerTodoIPC } from "./ipc/todo.ipc";
import { registerTodoFileIPC } from "./ipc/todo-file.ipc";
import { registerWindowIPC } from "./ipc/window.ipc";

import {
  createMainWindow,
  getMainWindow,
  initializeWindowState,
  saveWindowStates,
} from "./windows/window-manager";
import { createTray, destroyTray } from "./tray";
import { registerWebContents } from "./webcontents";
import { configureSessionSecurity } from "./security";

let isQuitting = false;

registerWebContents();

async function loadRenderer(window: BrowserWindow) {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);

    return;
  }

  await window.loadFile(
    path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
  );
}

app.whenReady().then(async () => {
  configureSessionSecurity();

  await initializeWindowState();

  initializeDatabase();

  registerTodoIPC();
  registerTodoFileIPC();
  registerWindowIPC(loadRenderer);

  createMainWindow(loadRenderer);
  createTray();

  const mainWindow = getMainWindow();

  mainWindow?.on("close", (event) => {
    if (isQuitting) {
      return;
    }

    event.preventDefault();
    mainWindow.hide();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow(loadRenderer);
      return;
    }

    const window = getMainWindow();

    if (!window || window.isDestroyed()) {
      return;
    }

    if (window.isMinimized()) {
      window.restore();
    }

    window.show();
    window.focus();
  });
});

app.on("before-quit", (event) => {
  if (isQuitting) {
    return;
  }

  event.preventDefault();
  isQuitting = true;

  void saveWindowStates().finally(() => {
    app.quit();
  });
});

app.on("will-quit", () => {
  destroyTray();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
