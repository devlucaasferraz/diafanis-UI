import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { LandingPage } from '@/features/landing/LandingPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});
