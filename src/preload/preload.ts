import {
  contextBridge,
  ipcRenderer,
} from "electron";

import type {
  CreateTodoInput,
  TodoAPI,
  UpdateTodoInput,
} from "../shared/contracts/todo-api";

const todoAPI: TodoAPI = {
  getAll: () => {
    return ipcRenderer.invoke("todo:get-all");
  },

  getById: (id: string) => {
    return ipcRenderer.invoke(
      "todo:get-by-id",
      id,
    );
  },

  create: (input: CreateTodoInput) => {
    return ipcRenderer.invoke(
      "todo:create",
      input,
    );
  },

  update: (input: UpdateTodoInput) => {
    return ipcRenderer.invoke(
      "todo:update",
      input,
    );
  },

  delete: (id: string) => {
    return ipcRenderer.invoke(
      "todo:delete",
      id,
    );
  },
};

contextBridge.exposeInMainWorld(
  "todoAPI",
  todoAPI,
);