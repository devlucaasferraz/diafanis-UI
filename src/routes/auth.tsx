import { createRoute, Navigate } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { PasswordRecovery } from '@/features/auth/PasswordRecovery';
import { AuthPage } from '@/features/auth/AuthPage';

export const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: () => <AuthPage key="login" mode="login" /> });
export const signupRoute = createRoute({ getParentRoute: () => rootRoute, path: '/cadastro', component: () => <AuthPage key="signup" mode="signup" /> });
export const recoveryRoute = createRoute({ getParentRoute: () => rootRoute, path: '/esqueci-senha', component: () => <PasswordRecovery /> });
export const resetRoute = createRoute({ getParentRoute: () => rootRoute, path: '/redefinir-senha', component: () => <Navigate to="/esqueci-senha" replace /> });
