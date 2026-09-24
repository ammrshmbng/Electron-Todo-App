import {
  BrowserWindow,
  app,
  autoUpdater,
} from "electron";

import {
  IPC_CHANNELS,
} from "../shared/ipc/channels";

import type {
  AppUpdateState,
} from "../shared/contracts/todo-api";

let initialized = false;
let checking = false;
let updateInterval: NodeJS.Timeout | null = null;

const feedUrl =
  process.env.ELECTRON_UPDATE_FEED_URL?.trim() ||
  null;

let updateState: AppUpdateState = {
  status: "idle",
  version: null,
  message: "Update checker is idle.",
};

function isSupportedPlatform() {
  return (
    process.platform === "win32" ||
    process.platform === "darwin"
  );
}

function setUpdateState(
  nextState: AppUpdateState,
) {
  updateState = nextState;

  for (const window of BrowserWindow.getAllWindows()) {
    if (window.isDestroyed()) {
      continue;
    }

    window.webContents.send(
      IPC_CHANNELS.UPDATER.EVENTS.STATE,
      updateState,
    );
  }
}

export function getUpdateState() {
  return updateState;
}

function setupUpdaterEvents() {
  autoUpdater.on(
    "checking-for-update",
    () => {
      checking = true;

      setUpdateState({
        status: "checking",
        version: null,
        message: "Checking for updates...",
      });
    },
  );

  autoUpdater.on(
    "update-available",
    (_event, updateInfo) => {
      setUpdateState({
        status: "available",
        version:
          updateInfo.version ?? null,
        message:
          "A new version is available. Downloading in the background...",
      });
    },
  );

  autoUpdater.on(
    "update-not-available",
    () => {
      checking = false;

      setUpdateState({
        status: "not-available",
        version: null,
        message: "You are using the latest version.",
      });
    },
  );

  autoUpdater.on(
    "update-downloaded",
    (_event, _releaseNotes, releaseName) => {
      checking = false;

      setUpdateState({
        status: "downloaded",
        version: releaseName || null,
        message:
          "Update downloaded. Restart the app to install it.",
      });
    },
  );

  autoUpdater.on(
    "error",
    (error) => {
      checking = false;

      setUpdateState({
        status: "error",
        version: null,
        message:
          error instanceof Error
            ? error.message
            : String(error),
      });
    },
  );
}

export function initializeUpdater() {
  if (initialized) {
    return;
  }

  initialized = true;

  if (!app.isPackaged) {
    setUpdateState({
      status: "not-configured",
      version: null,
      message:
        "Automatic updates are disabled during development.",
    });

    return;
  }

  if (!isSupportedPlatform()) {
    setUpdateState({
      status: "unsupported",
      version: null,
      message:
        "Built-in automatic updates are supported on Windows and macOS only.",
    });

    return;
  }

  if (!feedUrl) {
    setUpdateState({
      status: "not-configured",
      version: null,
      message:
        "No update feed is configured for this build.",
    });

    return;
  }

  setupUpdaterEvents();

  autoUpdater.setFeedURL({
    url: feedUrl,
  });

  void checkForUpdates();

  updateInterval = setInterval(
    () => {
      void checkForUpdates();
    },
    10 * 60 * 1000,
  );
}

export async function checkForUpdates() {
  if (!app.isPackaged) {
    return getUpdateState();
  }

  if (!isSupportedPlatform()) {
    return getUpdateState();
  }

  if (!feedUrl) {
    return getUpdateState();
  }

  if (!initialized) {
    initializeUpdater();
  }

  if (checking) {
    return getUpdateState();
  }

  try {
    checking = true;

    setUpdateState({
      status: "checking",
      version: null,
      message: "Checking for updates...",
    });

    await autoUpdater.checkForUpdates();
  } catch (error) {
    checking = false;

    setUpdateState({
      status: "error",
      version: null,
      message:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }

  return getUpdateState();
}

export function installUpdate() {
  if (updateState.status !== "downloaded") {
    return getUpdateState();
  }

  autoUpdater.quitAndInstall();

  return getUpdateState();
}

export function disposeUpdater() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}
