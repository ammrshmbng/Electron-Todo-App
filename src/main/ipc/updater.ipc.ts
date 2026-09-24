import { IPC_CHANNELS } from "../../shared/ipc/channels";

import {
  checkForUpdates,
  getUpdateState,
  installUpdate,
} from "../updater";

import { registerSecureIpcHandler } from "./register";

export function registerUpdaterIPC() {
  registerSecureIpcHandler(
    IPC_CHANNELS.UPDATER.GET_STATE,
    async () => {
      return getUpdateState();
    },
  );

  registerSecureIpcHandler(
    IPC_CHANNELS.UPDATER.CHECK,
    async () => {
      return checkForUpdates();
    },
  );

  registerSecureIpcHandler(
    IPC_CHANNELS.UPDATER.INSTALL,
    async () => {
      return installUpdate();
    },
  );
}
