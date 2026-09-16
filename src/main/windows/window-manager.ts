import { BrowserWindow } from "electron";
import path from "node:path";

let mainWindow: BrowserWindow | null = null;
let detailWindow: BrowserWindow | null = null;

export function getMainWindow() {
  return mainWindow;
}

export function createMainWindow(
  loadRenderer: (window: BrowserWindow) => Promise<void>,
) {
  if (mainWindow) {
    mainWindow.focus();
    return mainWindow;
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  void loadRenderer(mainWindow);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  return mainWindow;
}

export function createDetailWindow(
  loadRenderer: (window: BrowserWindow) => Promise<void>,
) {
  if (detailWindow) {
    detailWindow.focus();
    return detailWindow;
  }

  detailWindow = new BrowserWindow({
    width: 700,
    height: 600,
    parent: mainWindow ?? undefined,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  void loadRenderer(detailWindow);

  detailWindow.on("closed", () => {
    detailWindow = null;
  });

  return detailWindow;
}

export function getDetailWindow() {
  return detailWindow;
}
