import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { DeadlinesContainer } from '@/features/deadlines/DeadlinesContainer';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/deadlines',
  component: DeadlinesContainer,
});

