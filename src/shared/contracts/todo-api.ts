import type { Todo } from "../types/todo";
import type { IPCResult } from "./result";

export interface CreateTodoInput {
  title: string;
}

export interface UpdateTodoInput {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoAPI {
  getAll(): Promise<IPCResult<Todo[]>>;

  getById(
    id: string,
  ): Promise<IPCResult<Todo | null>>;

  create(
    input: CreateTodoInput,
  ): Promise<IPCResult<Todo>>;

  update(
    input: UpdateTodoInput,
  ): Promise<IPCResult<Todo>>;

  delete(
    id: string,
  ): Promise<IPCResult<null>>;
}