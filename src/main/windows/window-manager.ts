import { app, BrowserWindow, screen } from "electron";
import path from "node:path";
import { promises as fs } from "node:fs";

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  maximized: boolean;
}

interface WindowStates {
  main: WindowState;
  detail: WindowState;
}

const defaultStates: WindowStates = {
  main: {
    x: 0,
    y: 0,
    width: 1200,
    height: 800,
    maximized: false,
  },
  detail: {
    x: 0,
    y: 0,
    width: 700,
    height: 600,
    maximized: false,
  },
};

let mainWindow: BrowserWindow | null = null;
let detailWindow: BrowserWindow | null = null;
let windowStates: WindowStates = cloneDefaultStates();
let saveQueue: Promise<void> = Promise.resolve();

function cloneDefaultStates(): WindowStates {
  return JSON.parse(JSON.stringify(defaultStates)) as WindowStates;
}

function getWindowStatePath() {
  return path.join(app.getPath("userData"), "window-state.json");
}

function isValidWindowState(value: unknown): value is WindowState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const state = value as Record<string, unknown>;

  return (
    Number.isFinite(state.x) &&
    Number.isFinite(state.y) &&
    Number.isFinite(state.width) &&
    Number.isFinite(state.height) &&
    typeof state.maximized === "boolean" &&
    Number(state.width) >= 400 &&
    Number(state.height) >= 300
  );
}

function clampStateToDisplay(
  state: WindowState,
  defaultState: WindowState,
): WindowState {
  const displays = screen.getAllDisplays();

  if (displays.length === 0) {
    return {
      ...defaultState,
      width: state.width,
      height: state.height,
      maximized: state.maximized,
    };
  }

  const display = displays.find((item) => {
    const area = item.workArea;

    const right = state.x + state.width;
    const bottom = state.y + state.height;

    const overlapsHorizontally =
      right > area.x && state.x < area.x + area.width;

    const overlapsVertically =
      bottom > area.y && state.y < area.y + area.height;

    return overlapsHorizontally && overlapsVertically;
  });

  const targetDisplay = display ?? screen.getPrimaryDisplay();
  const workArea = targetDisplay.workArea;

  const maxWidth = Math.max(400, workArea.width);
  const maxHeight = Math.max(300, workArea.height);

  const width = Math.min(Math.max(400, state.width), maxWidth);

  const height = Math.min(Math.max(300, state.height), maxHeight);

  const minVisibleWidth = Math.min(120, width);
  const minVisibleHeight = Math.min(80, height);

  const minX = workArea.x - width + minVisibleWidth;
  const maxX = workArea.x + workArea.width - minVisibleWidth;

  const minY = workArea.y - height + minVisibleHeight;
  const maxY = workArea.y + workArea.height - minVisibleHeight;

  return {
    x: Math.min(Math.max(state.x, minX), maxX),
    y: Math.min(Math.max(state.y, minY), maxY),
    width,
    height,
    maximized: state.maximized,
  };
}

function getRestoredState(type: "main" | "detail") {
  const state = windowStates[type];
  const defaultState = defaultStates[type];

  return clampStateToDisplay(state, defaultState);
}

function applyWindowState(window: BrowserWindow, state: WindowState) {
  window.setBounds({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
  });

  if (state.maximized) {
    window.maximize();
  }
}

function captureWindowState(window: BrowserWindow): WindowState {
  const bounds = window.getNormalBounds();

  return {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    maximized: window.isMaximized(),
  };
}

function queueSaveWindowStates() {
  saveQueue = saveQueue
    .catch(() => undefined)
    .then(async () => {
      const directory = app.getPath("userData");

      await fs.mkdir(directory, {
        recursive: true,
      });

      await fs.writeFile(
        getWindowStatePath(),
        JSON.stringify(windowStates, null, 2),
        "utf-8",
      );
    });

  return saveQueue;
}

function captureAndSaveWindowState(
  type: "main" | "detail",
  window: BrowserWindow,
) {
  if (window.isDestroyed()) {
    return;
  }

  windowStates[type] = captureWindowState(window);

  void queueSaveWindowStates();
}

function attachStatePersistence(
  type: "main" | "detail",
  window: BrowserWindow,
) {
  const save = () => {
    captureAndSaveWindowState(type, window);
  };

  window.on("resize", save);
  window.on("move", save);
  window.on("maximize", save);
  window.on("unmaximize", save);
}

export async function initializeWindowState() {
  try {
    const content = await fs.readFile(getWindowStatePath(), "utf-8");

    const parsed: unknown = JSON.parse(content);

    if (!parsed || typeof parsed !== "object") {
      return;
    }

    const state = parsed as Record<string, unknown>;

    if (isValidWindowState(state.main)) {
      windowStates.main = state.main;
    }

    if (isValidWindowState(state.detail)) {
      windowStates.detail = state.detail;
    }
  } catch {
    windowStates = cloneDefaultStates();
  }
}

export function saveWindowStates() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    windowStates.main = captureWindowState(mainWindow);
  }

  if (detailWindow && !detailWindow.isDestroyed()) {
    windowStates.detail = captureWindowState(detailWindow);
  }

  return queueSaveWindowStates();
}

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

  const state = getRestoredState("main");

  mainWindow = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  applyWindowState(mainWindow, state);

  attachStatePersistence("main", mainWindow);

  mainWindow.once("ready-to-show", () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    mainWindow.show();

    if (mainWindow.isMaximized()) {
      mainWindow.focus();
    }
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
    detailWindow.show();
    detailWindow.focus();
    return detailWindow;
  }

  const state = getRestoredState("detail");

  detailWindow = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    show: false,
    parent: mainWindow ?? undefined,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  applyWindowState(detailWindow, state);

  attachStatePersistence("detail", detailWindow);

  detailWindow.once("ready-to-show", () => {
    if (!detailWindow || detailWindow.isDestroyed()) {
      return;
    }

    detailWindow.show();
    detailWindow.focus();
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
