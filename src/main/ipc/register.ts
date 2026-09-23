import { ipcMain } from "electron";

import { assertTrustedIPCEvent } from "../security";

import type { IPCInvokeChannel } from "../../shared/ipc/channels";

type IPCHandler = (
  event: Electron.IpcMainInvokeEvent,
  ...args: any[]
) => unknown | Promise<unknown>;

const registeredChannels = new Set<string>();

export function registerSecureIpcHandler(
  channel: IPCInvokeChannel,
  handler: IPCHandler,
) {
  if (registeredChannels.has(channel)) {
    return;
  }

  ipcMain.handle(channel, async (event, ...args) => {
    assertTrustedIPCEvent(event);

    return handler(event, ...args);
  });

  registeredChannels.add(channel);
}

export function unregisterIpcHandler(
  channel: IPCInvokeChannel,
) {
  if (!registeredChannels.has(channel)) {
    return;
  }

  ipcMain.removeHandler(channel);
  registeredChannels.delete(channel);
}
