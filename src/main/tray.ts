import { app, BrowserWindow, Menu, nativeImage, Tray } from "electron";

import { getMainWindow } from "./windows/window-manager";
import { dispatchAppCommand } from "./commands/app-command";

let tray: Tray | null = null;

const trayIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <rect x="1.5" y="1.5" width="13" height="13" rx="3" fill="#111827"/>
  <path d="M4.5 8.3l2.1 2.1 4.9-4.9" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

function createTrayIcon() {
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(trayIconSvg).toString("base64")}`;

  return nativeImage
    .createFromDataURL(dataUrl)
    .resize({ width: 16, height: 16 });
}

function showMainWindow() {
  const window = getMainWindow();

  if (!window || window.isDestroyed()) {
    return;
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.show();
  window.focus();
}

function hideAllWindows() {
  for (const window of BrowserWindow.getAllWindows()) {
    if (!window.isDestroyed()) {
      window.hide();
    }
  }
}

function sendNewTodoCommand() {
  const window = getMainWindow();

  if (!window || window.isDestroyed()) {
    return;
  }

  showMainWindow();

  dispatchAppCommand(window, "new-todo");
}

export function createTray() {
  if (tray) {
    return tray;
  }

  tray = new Tray(createTrayIcon());

  tray.setToolTip("Todo Electron");

  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Show App",
        click: () => {
          showMainWindow();
        },
      },
      {
        label: "Hide App",
        click: () => {
          hideAllWindows();
        },
      },
      {
        type: "separator",
      },
      {
        label: "New Todo",
        click: () => {
          sendNewTodoCommand();
        },
      },
      {
        type: "separator",
      },
      {
        label: "Quit",
        click: () => {
          app.quit();
        },
      },
    ]),
  );

  tray.on("click", () => {
    const window = getMainWindow();

    if (!window || window.isDestroyed()) {
      return;
    }

    if (window.isVisible()) {
      hideAllWindows();
      return;
    }

    showMainWindow();
  });

  return tray;
}

export function destroyTray() {
  if (!tray) {
    return;
  }

  tray.destroy();
  tray = null;
}
