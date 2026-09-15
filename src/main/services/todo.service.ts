import type {
  CreateTodoInput,
  UpdateTodoInput,
} from "../../shared/contracts/todo-api";

import type { Todo } from "../../shared/types/todo";

import { TodoRepository } from "../repositories/todo.repository";

export class TodoService {
  constructor(private readonly repository: TodoRepository) {}

  getAll(): Todo[] {
    return this.repository.getAll();
  }

  getById(id: string): Todo | null {
    return this.repository.getById(id);
  }

  create(input: CreateTodoInput): Todo {
    const title = input.title.trim();

    if (!title) {
      throw new Error("Todo title is required");
    }

    return this.repository.create({
      title,
    });
  }

  update(input: UpdateTodoInput): Todo {
    const title = input.title.trim();

    if (!title) {
      throw new Error("Todo title is required");
    }

    return this.repository.update({
      ...input,
      title,
    });
  }

  delete(id: string): void {
    this.repository.delete(id);
  }
}
