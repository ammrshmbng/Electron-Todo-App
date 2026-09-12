import type {
  CreateTodoInput,
  UpdateTodoInput,
} from "../../shared/contracts/todo-api";
import type { Todo } from "../../shared/types/todo";

export class TodoService {
  private todos: Todo[] = [
    {
      id: crypto.randomUUID(),
      title: "Belajar Electron",
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "Belajar IPC",
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  getAll(): Todo[] {
    return this.todos;
  }

  getById(id: string): Todo | null {
    return this.todos.find((todo) => todo.id === id) ?? null;
  }

  create(input: CreateTodoInput): Todo {
    if (!input.title.trim()) {
      throw new Error("Todo title is required");
    }

    const now = new Date().toISOString();

    const todo: Todo = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    this.todos.push(todo);

    return todo;
  }

  update(input: UpdateTodoInput): Todo {
    const todo = this.todos.find(
      (todo) => todo.id === input.id,
    );

    if (!todo) {
      throw new Error("Todo not found");
    }

    if (!input.title.trim()) {
      throw new Error("Todo title is required");
    }

    todo.title = input.title.trim();
    todo.completed = input.completed;
    todo.updatedAt = new Date().toISOString();

    return todo;
  }

  delete(id: string): void {
    const index = this.todos.findIndex(
      (todo) => todo.id === id,
    );

    if (index === -1) {
      throw new Error("Todo not found");
    }

    this.todos.splice(index, 1);
  }
}