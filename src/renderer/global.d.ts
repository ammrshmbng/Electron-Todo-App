import type { TodoAPI } from "../shared/contracts/todo-api";

declare global {
  interface Window {
    todoAPI: TodoAPI;
  }
}

export {};