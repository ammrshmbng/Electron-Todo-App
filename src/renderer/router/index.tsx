import React from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import Dashboard from '../pages/Dashboard';
import Todos from '../pages/Todos';
import TodoDetail from '../pages/TodoDetail';
import Settings from '../pages/Settings';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'todos',
        element: <Todos />,
      },
      {
        path: 'todos/:id',
        element: <TodoDetail />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
