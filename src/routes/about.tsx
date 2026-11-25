import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { AboutPage } from '@/features/about/AboutPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sobre-nos',
  component: AboutPage,
});
