import Database from "better-sqlite3";
import path from "node:path";
import { app } from "electron/main";

let database: Database.Database | null = null;

export function initializeDatabase(): Database.Database {
  if (database) {
    return database;
  }

  const databasePath = path.join(
    app.getPath("userData"),
    "todos.db",
  );

  database = new Database(databasePath);

  database.pragma("journal_mode = WAL");

  database.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  return database;
}

export function getDatabase(): Database.Database {
  if (!database) {
    throw new Error(
      "Database has not been initialized",
    );
  }

  return database;
}