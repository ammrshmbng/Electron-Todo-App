import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";

import {
  activeTodosCountState,
  completedTodosCountState,
  todosState,
} from "../store/todo";

export default function DashboardPage() {
  const [todos] = useRecoilState(todosState);

  const completed = useRecoilValue(completedTodosCountState);

  const active = useRecoilValue(activeTodosCountState);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = window.todoAPI.onTodoDetailId((todoId) => {
      if (!todoId) {
        return;
      }

      navigate(`/todos/${todoId}`);
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Total: {todos.length}</p>

      <p>Active: {active}</p>

      <p>Completed: {completed}</p>
    </div>
  );
}
