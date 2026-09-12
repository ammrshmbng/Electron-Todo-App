import { atom, selector } from "recoil";
import type { Todo } from "../../shared/types/todo";

export type TodoFilter = "all" | "active" | "completed";

export const todosState = atom<Todo[]>({
  key: "todos",
  default: [
    {
      id: "1",
      title: "Belajar Electron",
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Belajar Recoil",
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Membuat Todo App",
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
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
    const query = get(searchQueryState).toLowerCase();
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

export const completedTodosCountState = selector<number>({
  key: "completedTodosCount",
  get: ({ get }) => {
    const todos = get(todosState);

    return todos.filter((todo) => todo.completed).length;
  },
});
