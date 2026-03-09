import { createRoute, createRouter, createRootRoute } from '@tanstack/react-router';
import { Outlet } from '@tanstack/react-router';
import { Button } from '@shared/ui/button';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <div data-testid="app-root">
      <Button>Test Button</Button>
    </div>
  ),
});

export const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({ routeTree });
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
