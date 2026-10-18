import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { TriageContainer } from '@/features/triage/TriageContainer';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/triage',
  component: TriageContainer,
});

