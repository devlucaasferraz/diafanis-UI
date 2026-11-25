import * as React from 'react';
import { Check, Clock, Scale, User } from 'lucide-react';
import { cn } from '@/shared/cn';
import { GlassPanel } from '@/features/ui/glass-panel';
import { StatusBadge } from '@/features/ui/status-badge';
import { NotificationItem } from './types';

export interface NotificationListItemProps {
  item: NotificationItem;
  onSelect?: (item: NotificationItem) => void;
  onToggleRead?: (item: NotificationItem) => void;
  className?: string;
}

export const NotificationListItem: React.FC<NotificationListItemProps> = ({
  item,
  onSelect,
  onToggleRead,
  className,
}) => {
  const handleToggleReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleRead) {
      onToggleRead(item);
    }
  };

  return (
    <GlassPanel
      data-testid="notification-list-item"
      onClick={() => onSelect && onSelect(item)}
      className={cn(
        'group p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:bg-card/90',
        onSelect && 'cursor-pointer active:scale-[0.995]',
        item.isRead && 'opacity-70',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Esquerda: Indicador de não lida, Título, Descrição e Metadados */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Indicador de não lida com largura reservada para manter alinhamento */}
          <div className="pt-1 shrink-0">
            {!item.isRead ? (
              <span
                data-testid="notification-unread-dot"
                title="Notificação não lida"
                className="relative flex h-2.5 w-2.5 items-center justify-center"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600 ring-2 ring-background" />
              </span>
            ) : (
              <span className="inline-block w-2.5 h-2.5" />
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <h3
              data-testid="notification-item-title"
              className="text-sm font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors truncate"
              title={item.title}
            >
              {item.title}
            </h3>

            <p className="text-xs text-muted-foreground line-clamp-1">
              {item.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] text-muted-foreground">
              {item.processNumber && (
                <span className="inline-flex items-center gap-1.5 text-foreground/80">
                  <Scale className="h-3 w-3 text-primary shrink-0 -translate-y-[1px]" />
                  <span className="font-mono">{item.processNumber}</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1.5">
                <User className="h-3 w-3 text-muted-foreground/80 shrink-0" />
                <span>{item.assignedLawyer}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
                <Clock className="h-3 w-3 text-amber-500 shrink-0" />
                <span>{item.deadline}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Direita: Badge opcional de Prazo Fatal e Ação de Marcar como Lida */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
          {item.isFatal && (
            <StatusBadge
              status="fatal"
              label="Prazo Fatal"
              size="sm"
            />
          )}

          {onToggleRead && (
            <button
              type="button"
              data-testid="toggle-read-btn"
              onClick={handleToggleReadClick}
              title={item.isRead ? 'Marcar como não lida' : 'Marcar como lida'}
              aria-label={item.isRead ? 'Marcar como não lida' : 'Marcar como lida'}
              className={cn(
                'flex items-center justify-center p-2 rounded-xl border transition-all duration-150',
                item.isRead
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border/40 bg-muted/30 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30'
              )}
            >
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </GlassPanel>
  );
};
