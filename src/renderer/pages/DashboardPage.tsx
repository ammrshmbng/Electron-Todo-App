import { useRecoilValue } from "recoil";

import {
  activeTodosCountState,
  completedTodosCountState,
  todosState,
} from "../store/todo";

export default function DashboardPage() {
  const todos = useRecoilValue(todosState);

  const completed = useRecoilValue(completedTodosCountState);

  const active = useRecoilValue(activeTodosCountState);

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Total: {todos.length}</p>

      <p>Active: {active}</p>

      <p>Completed: {completed}</p>
    </div>
  );
}
