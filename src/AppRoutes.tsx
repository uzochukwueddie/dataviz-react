import { FC, Suspense } from 'react';
import { RouteObject, useRoutes } from 'react-router-dom';
import Landing from './features/landing/landing';
import Dashboard from './features/dashboard/dashboard';
import ProtectedRoute from './shared/components/protectedRoute';
import Datasource from './features/datasources/datasources';

const AppRouter: FC = () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: (
        <Suspense>
          <Landing />
        </Suspense>
      )
    },
    {
      path: '/dashboard',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/datasources',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Datasource />
          </ProtectedRoute>
        </Suspense>
      )
    }
  ];

  return useRoutes(routes);
};

export default AppRouter;
