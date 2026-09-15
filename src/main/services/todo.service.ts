import type {
  CreateTodoInput,
  UpdateTodoInput,
} from "../../shared/contracts/todo-api";

import type { Todo } from "../../shared/types/todo";
import { getDatabase } from "../database/database";

import { TodoRepository } from "../repositories/todo.repository";

let todoService: TodoService | null = null;

export function getTodoService(): TodoService {
  if (!todoService) {
    const database = getDatabase();
    const repository = new TodoRepository(database);

    todoService = new TodoService(repository);
  }

  return todoService;
}

export class TodoService {
  constructor(private readonly repository: TodoRepository) {}

  getAll(): Todo[] {
    return this.repository.getAll();
  }

  getById(id: string): Todo | null {
    return this.repository.getById(id);
  }

  create(input: CreateTodoInput): Todo {
    return this.repository.create(input);
  }

  update(input: UpdateTodoInput): Todo {
    return this.repository.update(input);
  }

  delete(id: string): void | boolean {
    this.repository.delete(id);
  }
}
