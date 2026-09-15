import { ipcMain } from "electron/main";

import type {
  CreateTodoInput,
  UpdateTodoInput,
} from "../../shared/contracts/todo-api";

import type { IPCResult } from "../../shared/contracts/result";

import type { Todo } from "../../shared/types/todo";

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

function success<T>(data: T): IPCResult<T> {
  return {
    success: true,
    data,
  };
}

function failure<T>(code: string, message: string): IPCResult<T> {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}

function handleError<T>(error: unknown): IPCResult<T> {
  if (error instanceof Error && error.message === "Todo not found") {
    return failure("TODO_NOT_FOUND", "Todo not found");
  }

  if (error instanceof Error && error.message === "Todo title is required") {
    return failure("INVALID_TODO", "Todo title is required");
  }

  console.error(error);

  return failure("INTERNAL_ERROR", "An unexpected error occurred");
}

export function registerTodoIPC(): void {
  ipcMain.handle("todo:get-all", (): IPCResult<Todo[]> => {
    try {
      return success(getTodoService().getAll());
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("todo:get-by-id", (_, id: string): IPCResult<Todo | null> => {
    try {
      return success(getTodoService().getById(id));
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle(
    "todo:create",
    (_, input: CreateTodoInput): IPCResult<Todo> => {
      try {
        return success(getTodoService().create(input));
      } catch (error) {
        return handleError(error);
      }
    },
  );

  ipcMain.handle(
    "todo:update",
    (_, input: UpdateTodoInput): IPCResult<Todo> => {
      try {
        return success(getTodoService().update(input));
      } catch (error) {
        return handleError(error);
      }
    },
  );

  ipcMain.handle("todo:delete", (_, id: string): IPCResult<null> => {
    try {
      getTodoService().delete(id);

      return success(null);
    } catch (error) {
      return handleError(error);
    }
  });
}
