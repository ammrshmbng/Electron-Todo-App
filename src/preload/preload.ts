import { contextBridge, ipcRenderer, webUtils } from "electron";
import { IPC_CHANNELS } from "../shared/ipc/channels";

contextBridge.exposeInMainWorld("todoAPI", {
  getAll: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.TODO.GET_ALL);
  },

  getById: (id: string) => {
    return ipcRenderer.invoke(IPC_CHANNELS.TODO.GET_BY_ID, id);
  },

  create: (input: { title: string }) => {
    return ipcRenderer.invoke(IPC_CHANNELS.TODO.CREATE, input);
  },

  update: (input: { id: string; title: string; completed: boolean }) => {
    return ipcRenderer.invoke(IPC_CHANNELS.TODO.UPDATE, input);
  },

  delete: (id: string) => {
    return ipcRenderer.invoke(IPC_CHANNELS.TODO.DELETE, id);
  },

  onChanged: (callback: () => void) => {
    const listener = () => {
      callback();
    };

    ipcRenderer.on(IPC_CHANNELS.TODO.EVENTS.CHANGED, listener);

    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.TODO.EVENTS.CHANGED, listener);
    };
  },

  openTodoDetail: (todoId: string) => {
    return ipcRenderer.invoke(IPC_CHANNELS.WINDOW.OPEN_TODO_DETAIL, todoId);
  },

  onTodoDetailId: (callback: (todoId: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, todoId: string) => {
      callback(todoId);
    };

    ipcRenderer.on(IPC_CHANNELS.TODO.EVENTS.DETAIL_ID, listener);

    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.TODO.EVENTS.DETAIL_ID, listener);
    };
  },

  confirm: (options: { title: string; message: string; detail?: string }) => {
    return ipcRenderer.invoke(IPC_CHANNELS.NATIVE.CONFIRM, options);
  },

  openFile: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.NATIVE.OPEN_FILE);
  },

  notify: (options: { title: string; body: string }) => {
    return ipcRenderer.invoke(IPC_CHANNELS.NATIVE.NOTIFY, options);
  },

  openDataFolder: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.NATIVE.OPEN_DATA_FOLDER);
  },

  showDatabase: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.NATIVE.SHOW_DATABASE);
  },

  openExternal: (url: string) => {
    return ipcRenderer.invoke(IPC_CHANNELS.NATIVE.OPEN_EXTERNAL, url);
  },

  getAppInfo: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.NATIVE.GET_APP_INFO);
  },

  exportFile: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.TODO.EXPORT_FILE);
  },

  importFile: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.TODO.IMPORT_FILE);
  },

  importDroppedFile: (file: unknown) => {
    try {
      const filePath = webUtils.getPathForFile(file as File);

      if (!filePath) {
        return Promise.resolve({
          success: false as const,
          error: {
            code: "FILE_PATH_UNAVAILABLE",
            message: "The dropped item is not backed by a local file",
          },
        });
      }

      return ipcRenderer.invoke(IPC_CHANNELS.TODO.IMPORT_FILE_PATH, filePath);
    } catch {
      return Promise.resolve({
        success: false as const,
        error: {
          code: "INVALID_DROPPED_FILE",
          message: "The dropped item is not a valid local file",
        },
      });
    }
  },

  showTodoContextMenu: (input: { todoId: string; completed: boolean }) => {
    return ipcRenderer.invoke(IPC_CHANNELS.TODO.SHOW_CONTEXT_MENU, input);
  },

  onTodoContextMenuAction: (
    callback: (event: {
      action:
        | "open-detail"
        | "toggle-completed"
        | "delete"
        | "copy-title"
        | "copy-json";
      todoId: string;
    }) => void,
  ) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      event: {
        action:
          | "open-detail"
          | "toggle-completed"
          | "copy-title"
          | "copy-json"
          | "delete";
        todoId: string;
      },
    ) => {
      callback(event);
    };

    ipcRenderer.on(IPC_CHANNELS.TODO.EVENTS.CONTEXT_MENU_ACTION, listener);

    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.TODO.EVENTS.CONTEXT_MENU_ACTION, listener);
    };
  },

  copyText: (text: string) => {
    return ipcRenderer.invoke(IPC_CHANNELS.NATIVE.COPY_TEXT, text);
  },

  readClipboardText: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.NATIVE.READ_CLIPBOARD);
  },

  reloadRenderer: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.WEBCONTENTS.RELOAD);
  },

  openDevTools: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.WEBCONTENTS.OPEN_DEVTOOLS);
  },

  toggleDevTools: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.WEBCONTENTS.TOGGLE_DEVTOOLS);
  },

  getWebContentsInfo: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.WEBCONTENTS.GET_INFO);
  },

  onAppCommand: (callback: (command: "new-todo" | "focus-search") => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      command: "new-todo" | "focus-search",
    ) => {
      callback(command);
    };

    ipcRenderer.on(IPC_CHANNELS.APP.EVENTS.COMMAND, listener);

    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.APP.EVENTS.COMMAND, listener);
    };
  },
});
