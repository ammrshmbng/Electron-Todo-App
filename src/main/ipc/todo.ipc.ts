import { ipcMain } from "electron/main";

import type {
  CreateTodoInput,
  UpdateTodoInput,
} from "../../shared/contracts/todo-api";

import { TodoService } from "../services/todo.service";

const todoService = new TodoService();

export function registerTodoIPC(): void {
  ipcMain.handle("todo:get-all", () => {
    return todoService.getAll();
  });

  ipcMain.handle(
    "todo:get-by-id",
    (_, id: string) => {
      return todoService.getById(id);
    },
  );

  ipcMain.handle(
    "todo:create",
    (_, input: CreateTodoInput) => {
      return todoService.create(input);
    },
  );

  ipcMain.handle(
    "todo:update",
    (_, input: UpdateTodoInput) => {
      return todoService.update(input);
    },
  );

  ipcMain.handle(
    "todo:delete",
    (_, id: string) => {
      return todoService.delete(id);
    },
  );
}