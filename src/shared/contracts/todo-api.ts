import type { Todo } from "../types/todo";

export interface CreateTodoInput {
  title: string;
}

export interface UpdateTodoInput {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoAPI {
  getAll(): Promise<Todo[]>;
  getById(id: string): Promise<Todo | null>;
  create(input: CreateTodoInput): Promise<Todo>;
  update(input: UpdateTodoInput): Promise<Todo>;
  delete(id: string): Promise<void>;
}