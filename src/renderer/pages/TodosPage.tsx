import { useRecoilState, useRecoilValue } from "recoil";
import {
  filteredTodosState,
  searchQueryState,
  todoFilterState,
} from "../store/todo";

export default function TodosPage() {
  const todos = useRecoilValue(filteredTodosState);

  const [searchQuery, setSearchQuery] =
    useRecoilState(searchQueryState);

  const [filter, setFilter] =
    useRecoilState(todoFilterState);

  return (
    <div>
      <h1>Todos</h1>

      <input
        value={searchQuery}
        onChange={(event) => {
          setSearchQuery(event.target.value);
        }}
        placeholder="Search..."
      />

      <select
        value={filter}
        onChange={(event) => {
          setFilter(
            event.target.value as "all" | "active" | "completed",
          );
        }}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>

      {todos.length === 0 ? (
        <p>No todos</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              {todo.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}