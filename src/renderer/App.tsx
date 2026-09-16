import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { todosState } from "./store/todo";

export default function App() {
  const [_, setTodos] = useRecoilState(todosState);

  useEffect(() => {
    const loadTodo = async () => {
      const result = await window.todoAPI.getAll();
      if (!result.success) {
        return;
      }

      setTodos(result.data);
    };
    loadTodo();
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
