import { FC, Suspense } from "react";
import { RouteObject, useRoutes } from "react-router-dom";
import Landing from "./features/landing/landing";

const AppRouter: FC = () => {
    const routes: RouteObject[] = [
        {
            path: '/',
            element: (
                <Suspense><Landing /></Suspense>
            )
        }
    ];

    return useRoutes(routes);
};

export default AppRouter;