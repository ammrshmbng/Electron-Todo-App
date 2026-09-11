import React from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import DashboardPage from '../pages/DashboardPage';
import TodosPage from '../pages/TodosPage';
import TodoDetailPage from '../pages/TodoDetailPage';
import SettingsPage from '../pages/SettingsPage';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'todos', element: <TodosPage /> },
      { path: 'todos/:id', element: <TodoDetailPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
