import { app, session } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

function isTrustedFileUrl(value: string) {
  try {
    const filePath = path.resolve(fileURLToPath(new URL(value)));
    const appPath = path.resolve(app.getAppPath());
    const appRoot = `${appPath}${path.sep}`;

    return filePath === appPath || filePath.startsWith(appRoot);
  } catch {
    return false;
  }
}

export function isTrustedAppUrl(value: string) {
  try {
    const url = new URL(value);

    if (url.protocol === "file:") {
      return isTrustedFileUrl(value);
    }

    if (url.protocol === "http:" || url.protocol === "https:") {
      const devServerUrl = MAIN_WINDOW_VITE_DEV_SERVER_URL;

      if (!devServerUrl) {
        return false;
      }

      return url.origin === new URL(devServerUrl).origin;
    }

    return false;
  } catch {
    return false;
  }
}

export function isTrustedIPCEvent(event: Electron.IpcMainInvokeEvent) {
  const senderFrame = event.senderFrame;

  if (!senderFrame) {
    return false;
  }

  if (senderFrame !== event.sender.mainFrame) {
    return false;
  }

  return isTrustedAppUrl(senderFrame.url);
}

export function assertTrustedIPCEvent(event: Electron.IpcMainInvokeEvent) {
  if (!isTrustedIPCEvent(event)) {
    throw new Error("Unauthorized IPC sender");
  }
}

export function configureSessionSecurity() {
  const defaultSession = session.defaultSession;

  defaultSession.setPermissionRequestHandler(
    (_webContents, _permission, callback) => {
      callback(false);
    },
  );

  defaultSession.setPermissionCheckHandler(() => false);

  if (!app.isPackaged) {
    return;
  }

  defaultSession.webRequest.onHeadersReceived((details, callback) => {
    if (!isTrustedAppUrl(details.url)) {
      callback({ responseHeaders: details.responseHeaders });
      return;
    }

    const responseHeaders = {
      ...details.responseHeaders,
      "Content-Security-Policy": [
        "default-src 'self'; " +
          "script-src 'self'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data:; " +
          "font-src 'self' data:; " +
          "connect-src 'self'; " +
          "object-src 'none'; " +
          "base-uri 'self'; " +
          "frame-ancestors 'none'; " +
          "form-action 'self'",
      ],
    };

    callback({ responseHeaders });
  });
}
