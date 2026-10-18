import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { FinancialContainer } from '@/features/financial/FinancialContainer';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/financial',
  component: FinancialContainer,
});
