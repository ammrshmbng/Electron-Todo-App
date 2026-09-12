import type {
  CreateTodoInput,
  UpdateTodoInput,
} from "../../shared/contracts/todo-api";

import type { Todo } from "../../shared/types/todo";

import { TodoRepository } from "../repositories/todo.repository";

export class TodoService {
  constructor(
    private readonly repository: TodoRepository,
  ) {}

  getAll(): Todo[] {
    return this.repository.getAll();
  }

  getById(id: string): Todo | null {
    return this.repository.getById(id);
  }

  create(input: CreateTodoInput): Todo {
    if (!input.title.trim()) {
      throw new Error("Todo title is required");
    }

    return this.repository.create({
      title: input.title.trim(),
    });
  }

  update(input: UpdateTodoInput): Todo {
    if (!input.title.trim()) {
      throw new Error("Todo title is required");
    }

    return this.repository.update({
      ...input,
      title: input.title.trim(),
    });
  }

  delete(id: string): void {
    return this.repository.delete(id);
  }
}