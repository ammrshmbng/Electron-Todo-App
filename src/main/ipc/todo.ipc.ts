import { ipcMain } from "electron/main";

import type {
  CreateTodoInput,
  UpdateTodoInput,
} from "../../shared/contracts/todo-api";

import { getDatabase } from "../database/database";
import { TodoRepository } from "../repositories/todo.repository";
import { TodoService } from "../services/todo.service";

let todoService: TodoService | null = null;

function getTodoService(): TodoService {
  if (!todoService) {
    const database = getDatabase();
    const repository = new TodoRepository(database);

    todoService = new TodoService(repository);
  }

  return todoService;
}

export function registerTodoIPC(): void {
  ipcMain.handle("todo:get-all", () => {
    return getTodoService().getAll();
  });

  ipcMain.handle(
    "todo:get-by-id",
    (_, id: string) => {
      return getTodoService().getById(id);
    },
  );

  ipcMain.handle(
    "todo:create",
    (_, input: CreateTodoInput) => {
      return getTodoService().create(input);
    },
  );

  ipcMain.handle(
    "todo:update",
    (_, input: UpdateTodoInput) => {
      return getTodoService().update(input);
    },
  );

  ipcMain.handle(
    "todo:delete",
    (_, id: string) => {
      return getTodoService().delete(id);
    },
  );
}