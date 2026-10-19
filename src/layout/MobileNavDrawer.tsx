import * as React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Calendar,
  Timer,
  FolderClosed,
  MessageSquare,
  Wallet,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/features/ui/sheet';
import { BrandLogo } from '@/features/ui/brand-logo';
import { cn } from '@/shared/cn';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Calendário', to: '/calendar', icon: Calendar, badge: 2 },
  { label: 'Motor de Prazos', to: '/deadlines', icon: Timer },
  { label: 'Central de Documentos', to: '/triage', icon: FolderClosed },
  { label: 'Notificações & Mensagens', to: '/messages', icon: MessageSquare },
  { label: 'Gestão Financeira', to: '/financial', icon: Wallet },
];

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose }) => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border/30 p-6">
          <SheetTitle className="text-left">
            <BrandLogo size="md" />
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 p-4">
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
                onClick={onClose}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
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
                )}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
