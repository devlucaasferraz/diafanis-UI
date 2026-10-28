import * as React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Calendar,
  Timer,
  FolderClosed,
  MessageSquare,
  Wallet,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { BrandLogo } from '@/features/ui/brand-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/ui/avatar';
import { useSidebar } from './SidebarContext';
import { cn } from '@/shared/cn';

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  badge?: string | number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Calendário', to: '/calendar', icon: Calendar, badge: 2 },
  { label: 'Motor de Prazos', to: '/deadlines', icon: Timer },
  { label: 'Central de Documentos', to: '/triage', icon: FolderClosed },
  { label: 'Notificações & Mensagens', to: '/messages', icon: MessageSquare },
  { label: 'Gestão Financeira', to: '/financial', icon: Wallet },
];

export const AppSidebar: React.FC = () => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { isCollapsed, toggleCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 hidden h-full flex-col justify-between border-r border-border/40 bg-card/80 backdrop-blur-xl z-30 lg:flex transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Top Header & Brand */}
      <div className="flex flex-col">
        <div
          className={cn(
            'flex h-16 items-center border-b border-border/30 transition-all',
            isCollapsed ? 'justify-center px-0' : 'justify-between px-6'
          )}
        >
          {isCollapsed ? (
            <button
              type="button"
              onClick={toggleCollapsed}
              title="Expandir barra lateral"
              aria-label="Expandir barra lateral"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          ) : (
            <>
              <Link to="/" title="Diafanís – Início" className="flex items-center">
                <BrandLogo size="md" />
              </Link>
              <button
                type="button"
                onClick={toggleCollapsed}
                title="Recolher barra lateral"
                aria-label="Recolher barra lateral"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Links */}
        <nav className={cn('flex flex-col gap-1 py-6 transition-all', isCollapsed ? 'px-2' : 'px-4')}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPath === item.to ||
              (item.to === '/calendar' && currentPath.startsWith('/calendar')) ||
              (item.to === '/deadlines' && currentPath.startsWith('/deadlines'));

            return (
              <Link
                key={item.to}
                to={item.to}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center rounded-xl text-xs font-semibold transition-all relative',
                  isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {item.badge !== undefined &&
                  (isCollapsed ? (
                    <span
                      title={`${item.badge} notificações`}
                      className={cn(
                        'absolute top-2 right-2 h-2 w-2 rounded-full',
                        isActive ? 'bg-primary-foreground' : 'bg-primary'
                      )}
                    />
                  ) : (
                    <span
                      className={cn(
                        'inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                        isActive
                          ? 'bg-primary-foreground text-primary'
                          : 'bg-primary/10 text-primary'
                      )}
                    >
                      {item.badge}
                    </span>
                  ))}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer: User Profile */}
      <div className={cn('border-t border-border/30 bg-muted/20 transition-all', isCollapsed ? 'p-2' : 'p-4')}>
        <button
          type="button"
          title={isCollapsed ? 'Dr. Alberto – Advogado Titular (OAB/PE)' : undefined}
          className={cn(
            'flex w-full items-center rounded-xl text-left transition-colors hover:bg-muted/80',
            isCollapsed ? 'justify-center p-2' : 'justify-between p-2'
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" />
              <AvatarFallback>DA</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="truncate text-xs font-semibold text-foreground">Dr. Alberto</span>
                <span className="truncate text-[11px] text-muted-foreground">
                  Advogado Titular – OAB/PE
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
        </button>
      </div>
    </aside>
  );
};
