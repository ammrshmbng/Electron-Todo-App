import { ipcMain } from "electron/main";

import type {
  CreateTodoInput,
  UpdateTodoInput,
} from "../../shared/contracts/todo-api";

import type { IPCResult } from "../../shared/contracts/result";

import type { Todo } from "../../shared/types/todo";

import {
  createTodoInputSchema,
  todoIdSchema,
  updateTodoInputSchema,
} from "../../shared/validation/todo.schema";

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
  console.error(error);

  if (error instanceof Error && error.message === "Todo not found") {
    return failure("TODO_NOT_FOUND", "Todo not found");
  }

  if (error instanceof Error && error.message === "Todo title is required") {
    return failure("INVALID_TODO", "Todo title is required");
  }

  return failure("INTERNAL_ERROR", "An unexpected error occurred");
}

function validateTodoId(value: unknown): IPCResult<string> {
  const result = todoIdSchema.safeParse(value);

  if (!result.success) {
    return failure("INVALID_TODO_ID", "Invalid todo id");
  }

  return success(result.data);
}

function validateCreateTodoInput(value: unknown): IPCResult<CreateTodoInput> {
  const result = createTodoInputSchema.safeParse(value);

  if (!result.success) {
    return failure(
      "INVALID_TODO",
      result.error.issues[0]?.message ?? "Invalid todo input",
    );
  }

  return success(result.data);
}

function validateUpdateTodoInput(value: unknown): IPCResult<UpdateTodoInput> {
  const result = updateTodoInputSchema.safeParse(value);

  if (!result.success) {
    return failure(
      "INVALID_TODO",
      result.error.issues[0]?.message ?? "Invalid todo input",
    );
  }

  return success(result.data);
}

export function registerTodoIPC(): void {
  ipcMain.handle("todo:get-all", (): IPCResult<Todo[]> => {
    try {
      return success(getTodoService().getAll());
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle(
    "todo:get-by-id",
    (_event, id: unknown): IPCResult<Todo | null> => {
      try {
        const validation = validateTodoId(id);

        if (!validation.success) {
          return validation;
        }

        return success(getTodoService().getById(validation.data));
      } catch (error) {
        return handleError(error);
      }
    },
  );

  ipcMain.handle("todo:create", (_event, input: unknown): IPCResult<Todo> => {
    try {
      const validation = validateCreateTodoInput(input);

      if (!validation.success) {
        return validation;
      }

      return success(getTodoService().create(validation.data));
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("todo:update", (_event, input: unknown): IPCResult<Todo> => {
    try {
      const validation = validateUpdateTodoInput(input);

      if (!validation.success) {
        return validation;
      }

      return success(getTodoService().update(validation.data));
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle("todo:delete", (_event, id: unknown): IPCResult<null> => {
    try {
      const validation = validateTodoId(id);

      if (!validation.success) {
        return validation;
      }

      getTodoService().delete(validation.data);

      return success(null);
    } catch (error) {
      return handleError(error);
    }
  });
}
