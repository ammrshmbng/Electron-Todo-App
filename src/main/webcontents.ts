import { app, BrowserWindow, ipcMain, shell } from "electron";

function isAllowedExternalUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isInternalAppUrl(value: string) {
  try {
    const url = new URL(value);

    if (url.protocol === "file:") {
      return true;
    }

    if (!MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      return false;
    }

    const devServerOrigin = new URL(MAIN_WINDOW_VITE_DEV_SERVER_URL).origin;

    return url.origin === devServerOrigin;
  } catch {
    return false;
  }
}

function openSafeExternalUrl(value: string) {
  if (!isAllowedExternalUrl(value)) {
    return;
  }

  setImmediate(() => {
    void shell.openExternal(value);
  });
}

function configureWebContentsSecurity(contents: Electron.WebContents) {
  contents.on("will-navigate", (event, navigationUrl) => {
    if (isInternalAppUrl(navigationUrl)) {
      return;
    }

    event.preventDefault();
    openSafeExternalUrl(navigationUrl);
  });

  contents.setWindowOpenHandler(({ url }) => {
    openSafeExternalUrl(url);

    return {
      action: "deny",
    };
  });

  contents.on("did-start-loading", () => {
    console.log(
      `[webContents:${contents.id}] did-start-loading`,
      contents.getURL(),
    );
  });

  contents.on("dom-ready", () => {
    console.log(`[webContents:${contents.id}] dom-ready`, contents.getURL());
  });

  contents.on("did-finish-load", () => {
    console.log(
      `[webContents:${contents.id}] did-finish-load`,
      contents.getURL(),
    );
  });

  contents.on("did-stop-loading", () => {
    console.log(
      `[webContents:${contents.id}] did-stop-loading`,
      contents.getURL(),
    );
  });

  contents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (!isMainFrame) {
        return;
      }

      console.error(`[webContents:${contents.id}] did-fail-load`, {
        errorCode,
        errorDescription,
        validatedURL,
      });
    },
  );
}

export function registerWebContents() {
  appOnWebContentsCreated();

  ipcMain.handle("webcontents:reload", (event) => {
    event.sender.reload();
  });

  ipcMain.handle("webcontents:open-devtools", (event) => {
    event.sender.openDevTools();
  });

  ipcMain.handle("webcontents:toggle-devtools", (event) => {
    if (event.sender.isDevToolsOpened()) {
      event.sender.closeDevTools();

      return;
    }

    event.sender.openDevTools();
  });

  ipcMain.handle("webcontents:get-info", (event) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender);

    return {
      id: event.sender.id,
      url: event.sender.getURL(),
      title: event.sender.getTitle(),
      isLoading: event.sender.isLoading(),
      isDevToolsOpened: event.sender.isDevToolsOpened(),
      windowId: browserWindow?.id ?? null,
    };
  });
}

function appOnWebContentsCreated() {
  app.on("web-contents-created", (_event, contents) => {
    configureWebContentsSecurity(contents);
  });
}
