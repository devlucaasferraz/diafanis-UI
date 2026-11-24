import { createRouter, RouterProvider } from '@tanstack/react-router';
import { Route as rootRoute } from '@/routes/__root';
import { Route as indexRoute } from '@/routes/index';
import { Route as dashboardRoute } from '@/routes/dashboard';
import { Route as calendarRoute } from '@/routes/calendar';
import { Route as deadlinesRoute } from '@/routes/deadlines';
import { Route as triageRoute } from '@/routes/triage';
import { Route as messagesRoute } from '@/routes/messages';
import { Route as financialRoute } from '@/routes/financial';
import { FeatureInProgress } from '@/features/ui/feature-in-progress';

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  calendarRoute,
  deadlinesRoute,
  triageRoute,
  messagesRoute,
  financialRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultNotFoundComponent: () => <FeatureInProgress />,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return <RouterProvider router={router} />;
}
