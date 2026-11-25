import * as React from 'react';
import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router';
import { FeatureInProgress } from '@/features/ui/feature-in-progress';
import { AppSidebar } from '@/layout/AppSidebar';
import { AppHeader } from '@/layout/AppHeader';
import { MobileNavDrawer } from '@/layout/MobileNavDrawer';
import { SidebarProvider, useSidebar } from '@/layout/SidebarContext';
import { cn } from '@/shared/cn';

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <FeatureInProgress />,
});

function RootContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar />
      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <AppHeader onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300 ease-in-out',
          isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}

function RootComponent() {
  const pathname = useRouterState({ select: state => state.location.pathname });
  if (['/', '/login', '/cadastro', '/esqueci-senha', '/redefinir-senha'].includes(pathname)) return <Outlet />;
  return (
    <SidebarProvider>
      <RootContent />
    </SidebarProvider>
  );
}
