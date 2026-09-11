import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside>
      <nav>
        <NavLink to="/dashboard">
          Dashboard
        </NavLink>

        <NavLink to="/todos">
          Todos
        </NavLink>

        <NavLink to="/settings">
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}