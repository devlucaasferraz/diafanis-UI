import * as React from 'react';
import { motion } from 'framer-motion';
import { Bell, MessageSquare, FileText } from 'lucide-react';
import { cn } from '@/shared/cn';
import { MessageTabId, TabOption } from './types';

export interface FloatingTabNavProps {
  activeTab: MessageTabId;
  onTabChange: (tabId: MessageTabId) => void;
  urgencyMap?: Partial<Record<MessageTabId, boolean>>;
  className?: string;
}

const DEFAULT_TABS: Omit<TabOption, 'hasUrgency'>[] = [
  {
    id: 'notifications',
    label: 'Notificações',
    icon: Bell,
    description: 'Prazos críticos e avisos internos',
  },
  {
    id: 'messages',
    label: 'Mensagens',
    icon: MessageSquare,
    description: 'Interações com clientes e aniversários',
  },
  {
    id: 'templates',
    label: 'Modelos',
    icon: FileText,
    description: 'Modelos de felicitação e audiência',
  },
];

export const FloatingTabNav: React.FC<FloatingTabNavProps> = ({
  activeTab,
  onTabChange,
  urgencyMap = {},
  className,
}) => {
  return (
    <div
      className={cn(
        'sticky top-20 z-20 flex justify-center w-full px-4 pointer-events-none transition-all duration-300',
        className
      )}
      aria-label="Navegação secundária de notificações e mensagens"
    >
      <nav
        role="tablist"
        aria-label="Abas da central de notificações e mensagens"
        className="pointer-events-auto inline-flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full border border-border/70 bg-card/85 dark:bg-card/90 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/25 transition-all"
      >
        {DEFAULT_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const hasUrgency = Boolean(urgencyMap[tab.id]);
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold rounded-full select-none transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isActive
                  ? 'text-primary dark:text-foreground font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {/* Active Tab Background Pill with Framer Motion */}
              {isActive && (
                <motion.div
                  layoutId="active-messages-tab-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-full bg-background border border-border/50 shadow-sm"
                />
              )}

              {/* Icon */}
              {Icon && (
                <span className="relative z-10 transition-transform duration-200 group-hover:scale-105">
                  <Icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                </span>
              )}

              {/* Label */}
              <span className="relative z-10 tracking-tight">{tab.label}</span>

              {/* Bolinha vermelha de urgência */}
              {hasUrgency && (
                <span
                  data-testid={`urgency-dot-${tab.id}`}
                  className="relative z-10 flex h-2.5 w-2.5 items-center justify-center"
                  title="Há pendências urgentes nesta aba"
                  aria-label="Alerta de urgência"
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600 ring-2 ring-card" />
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
