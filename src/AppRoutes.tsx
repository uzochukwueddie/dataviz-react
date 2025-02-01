import { FC, Suspense } from 'react';
import { RouteObject, useRoutes } from 'react-router-dom';
import Landing from './features/landing/landing';
import Dashboard from './features/dashboard/dashboard';

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
          <Dashboard />
        </Suspense>
      )
    }
  ];

  return useRoutes(routes);
};

export default AppRouter;
