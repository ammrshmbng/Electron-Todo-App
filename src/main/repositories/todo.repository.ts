import type Database from "better-sqlite3";

import type {
  CreateTodoInput,
  UpdateTodoInput,
} from "../../shared/contracts/todo-api";

import type { Todo } from "../../shared/types/todo";

interface TodoRow {
  id: string;
  title: string;
  completed: number;
  created_at: string;
  updated_at: string;
}

export class TodoRepository {
  constructor(
    private readonly db: Database.Database,
  ) {}

  getAll(): Todo[] {
    const rows = this.db
      .prepare(`
        SELECT
          id,
          title,
          completed,
          created_at,
          updated_at
        FROM todos
        ORDER BY created_at DESC
      `)
      .all() as TodoRow[];

    return rows.map(mapTodoRow);
  }

  getById(id: string): Todo | null {
    const row = this.db
      .prepare(`
        SELECT
          id,
          title,
          completed,
          created_at,
          updated_at
        FROM todos
        WHERE id = ?
      `)
      .get(id) as TodoRow | undefined;

    return row ? mapTodoRow(row) : null;
  }

  create(input: CreateTodoInput): Todo {
    const now = new Date().toISOString();

    const todo: Todo = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    this.db
      .prepare(`
        INSERT INTO todos (
          id,
          title,
          completed,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(
        todo.id,
        todo.title,
        todo.completed ? 1 : 0,
        todo.createdAt,
        todo.updatedAt,
      );

    return todo;
  }

  update(input: UpdateTodoInput): Todo {
    const existing = this.getById(input.id);

    if (!existing) {
      throw new Error("Todo not found");
    }

    const updatedAt = new Date().toISOString();

    this.db
      .prepare(`
        UPDATE todos
        SET
          title = ?,
          completed = ?,
          updated_at = ?
        WHERE id = ?
      `)
      .run(
        input.title.trim(),
        input.completed ? 1 : 0,
        updatedAt,
        input.id,
      );

    return {
      ...existing,
      title: input.title.trim(),
      completed: input.completed,
      updatedAt,
    };
  }

  delete(id: string): void {
    const result = this.db
      .prepare(`
        DELETE FROM todos
        WHERE id = ?
      `)
      .run(id);

    if (result.changes === 0) {
      throw new Error("Todo not found");
    }
  }
}

function mapTodoRow(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}