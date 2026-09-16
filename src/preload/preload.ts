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
});
