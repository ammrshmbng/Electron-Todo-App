import { atom, selector } from "recoil";

import type { Todo } from "../../shared/types/todo";

export type TodoFilter = "all" | "active" | "completed";

export const todosState = atom<Todo[]>({
  key: "todos",
  default: [],
});

export const selectedTodoIdState = atom<string | null>({
  key: "selectedTodoId",
  default: null,
});

export const searchQueryState = atom<string>({
  key: "searchQuery",
  default: "",
});

export const todoFilterState = atom<TodoFilter>({
  key: "todoFilter",
  default: "all",
});

export const filteredTodosState = selector<Todo[]>({
  key: "filteredTodos",

  get: ({ get }) => {
    const todos = get(todosState);
    const query = get(searchQueryState).trim().toLowerCase();

    const filter = get(todoFilterState);

    return todos.filter((todo) => {
      const matchesQuery = todo.title.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !todo.completed) ||
        (filter === "completed" && todo.completed);

      return matchesQuery && matchesFilter;
    });
  },
});

export const selectedTodoState = selector<Todo | null>({
  key: "selectedTodo",

  get: ({ get }) => {
    const todos = get(todosState);
    const selectedId = get(selectedTodoIdState);

    if (!selectedId) {
      return null;
    }

    return todos.find((todo) => todo.id === selectedId) ?? null;
  },
});

export const completedTodosCountState = selector<number>({
  key: "completedTodosCount",

  get: ({ get }) => {
    const todos = get(todosState);

    return todos.filter((todo) => todo.completed).length;
  },
});

export const activeTodosCountState = selector<number>({
  key: "activeTodosCount",

  get: ({ get }) => {
    const todos = get(todosState);

    return todos.filter((todo) => !todo.completed).length;
  },
});
