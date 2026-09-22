import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("todoAPI", {
  getAll: () => {
    return ipcRenderer.invoke("todo:get-all");
  },

  getById: (id: string) => {
    return ipcRenderer.invoke("todo:get-by-id", id);
  },

  create: (input: { title: string }) => {
    return ipcRenderer.invoke("todo:create", input);
  },

  update: (input: { id: string; title: string; completed: boolean }) => {
    return ipcRenderer.invoke("todo:update", input);
  },

  delete: (id: string) => {
    return ipcRenderer.invoke("todo:delete", id);
  },

  onChanged: (callback: () => void) => {
    const listener = () => {
      callback();
    };

    ipcRenderer.on("todo:changed", listener);

    return () => {
      ipcRenderer.removeListener("todo:changed", listener);
    };
  },

  openTodoDetail: (todoId: string) => {
    return ipcRenderer.invoke("window:open-todo-detail", todoId);
  },

  onTodoDetailId: (callback: (todoId: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, todoId: string) => {
      callback(todoId);
    };

    ipcRenderer.on("todo:detail-id", listener);

    return () => {
      ipcRenderer.removeListener("todo:detail-id", listener);
    };
  },

  confirm: (options: { title: string; message: string; detail?: string }) => {
    return ipcRenderer.invoke("native:confirm", options);
  },

  openFile: () => {
    return ipcRenderer.invoke("native:open-file");
  },

  notify: (options: { title: string; body: string }) => {
    return ipcRenderer.invoke("native:notify", options);
  },

  openDataFolder: () => {
    return ipcRenderer.invoke("native:open-data-folder");
  },

  showDatabase: () => {
    return ipcRenderer.invoke("native:show-database");
  },

  openExternal: (url: string) => {
    return ipcRenderer.invoke("native:open-external", url);
  },

  getAppInfo: () => {
    return ipcRenderer.invoke("native:get-app-info");
  },

  exportFile: () => {
    return ipcRenderer.invoke("todo:export-file");
  },

  importFile: () => {
    return ipcRenderer.invoke("todo:import-file");
  },

  showTodoContextMenu: (input: { todoId: string; completed: boolean }) => {
    return ipcRenderer.invoke("todo:show-context-menu", input);
  },

  onTodoContextMenuAction: (
    callback: (event: {
      action: "open-detail" | "toggle-completed" | "delete";
      todoId: string;
    }) => void,
  ) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      event: {
        action: "open-detail" | "toggle-completed" | "delete";
        todoId: string;
      },
    ) => {
      callback(event);
    };

    ipcRenderer.on("todo:context-menu-action", listener);

    return () => {
      ipcRenderer.removeListener("todo:context-menu-action", listener);
    };
  },

  onAppCommand: (
    callback: (command: "new-todo" | "focus-search") => void,
  ) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      command: "new-todo" | "focus-search",
    ) => {
      callback(command);
    };

    ipcRenderer.on("app:command", listener);

    return () => {
      ipcRenderer.removeListener("app:command", listener);
    };
  },
});
