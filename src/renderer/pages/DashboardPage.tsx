import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import {
  activeTodosCountState,
  completedTodosCountState,
  todosState,
} from "../store/todo";

export default function DashboardPage() {
  const [todos, setTodos] = useRecoilState(todosState);

  const completed = useRecoilValue(completedTodosCountState);

  const active = useRecoilValue(activeTodosCountState);

  useEffect(() => {
    const loadTodos = async () => {
      const result = await window.todoAPI.getAll();

      if (result.success) {
        setTodos(result.data);
      }
    };

    void loadTodos();

    const unsubscribe = window.todoAPI.onChanged(() => {
      void loadTodos();
    });

    return unsubscribe;
  }, [setTodos]);

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Total: {todos.length}</p>

      <p>Active: {active}</p>

      <p>Completed: {completed}</p>
    </div>
  );
}
