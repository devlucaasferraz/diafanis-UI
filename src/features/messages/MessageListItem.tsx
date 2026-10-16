import * as React from 'react';
import { User, Send, Calendar, Edit3, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/shared/cn';
import { GlassPanel } from '@/features/ui/glass-panel';
import { MessageItem, TemplateItem } from './types';

export interface MessageListItemProps {
  item: MessageItem | TemplateItem;
  isMessage?: boolean;
  onSelect: (item: MessageItem | TemplateItem) => void;
  onOpenClients?: (item: MessageItem | TemplateItem) => void;
  onSend?: (item: MessageItem) => void;
  onSchedule?: (item: MessageItem | TemplateItem) => void;
  className?: string;
}

export const MessageListItem: React.FC<MessageListItemProps> = ({
  item,
  isMessage = false,
  onSelect,
  onOpenClients,
  onSend,
  onSchedule,
  className,
}) => {
  const messageItem = isMessage ? (item as MessageItem) : null;
  const hasAlert = Boolean(messageItem?.hasAlert);
  const clientCount = item.clients?.length || 0;
  const hasScheduledDate = Boolean(item.scheduleConfig || item.scheduledAt);

  // Formatação amigável do agendamento se houver
  let scheduledTooltip = 'Agendar data e hora de envio';
  if (item.scheduleConfig) {
    if (item.scheduleConfig.scope === 'all' && item.scheduleConfig.globalScheduledAt) {
      const [d, t] = item.scheduleConfig.globalScheduledAt.split('T');
      scheduledTooltip = `Envio agendado (todos) para: ${d.split('-').reverse().join('/')} às ${t?.slice(0, 5)}`;
    } else if (item.scheduleConfig.scope === 'individual') {
      const count = Object.keys(item.scheduleConfig.clientSchedules || {}).length;
      scheduledTooltip = `Envio individual configurado para ${count} cliente(s)`;
    }
  } else if (item.scheduledAt) {
    scheduledTooltip = `Envio programado para: ${item.scheduledAt.split('T')[0].split('-').reverse().join('/')} às ${item.scheduledAt.split('T')[1]?.slice(0, 5)}`;
  }

  const handleClientsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenClients) {
      onOpenClients(item);
    }
  };

  const handleScheduleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSchedule) {
      onSchedule(item);
    }
  };

  const handleSendClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSend && messageItem) {
      onSend(messageItem);
    }
  };

  return (
    <GlassPanel
      data-testid="message-list-item"
      onClick={() => onSelect(item)}
      className={cn(
        'group cursor-pointer p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:bg-card/90 active:scale-[0.995]',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* A ESQUERDA: Bolinha de Alerta (só em mensagens) e Título da Mensagem */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isMessage && hasAlert && (
            <span
              data-testid="message-alert-dot"
              title="Mensagem com pendência urgente"
              className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600 ring-2 ring-background" />
            </span>
          )}

          <h3
            data-testid="message-item-title"
            className="text-sm font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors truncate"
            title={item.title}
          >
            {item.title}
          </h3>
        </div>

        {/* A DIREITA: Ícone de User, Ícone de Calendar (Agendamento) e Ícone de Envio */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          {/* Símbolo de User: abre carrossel de clientes vinculados */}
          <button
            type="button"
            data-testid="open-clients-btn"
            onClick={handleClientsClick}
            title={
              clientCount === 0
                ? 'Nenhum cliente vinculado (clique para gerenciar)'
                : `${clientCount} cliente(s) vinculado(s) (clique para gerenciar)`
            }
            aria-label="Gerenciar clientes vinculados"
            className={cn(
              'relative flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all duration-150',
              clientCount > 0
                ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                : 'bg-muted/40 text-muted-foreground/60 border-border/40 hover:bg-muted hover:text-foreground'
            )}
          >
            <User className="h-4 w-4" />
            {clientCount > 0 && (
              <span className="text-[11px] font-bold tracking-tight">{clientCount}</span>
            )}
          </button>

          {/* Símbolo de Calendar: escolher data e hora do envio */}
          <button
            type="button"
            data-testid="open-schedule-btn"
            onClick={handleScheduleClick}
            title={scheduledTooltip}
            aria-label={scheduledTooltip}
            className={cn(
              'relative flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all duration-150',
              hasScheduledDate
                ? 'bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20 dark:bg-blue-950/40 dark:text-blue-400'
                : 'bg-muted/40 text-muted-foreground/60 border-border/40 hover:bg-muted hover:text-foreground'
            )}
          >
            <Calendar className="h-4 w-4" />
            {hasScheduledDate && (
              <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400 -ml-0.5" />
            )}
          </button>

          {/* Símbolo de Envio (Send): abre modal de confirmação */}
          {isMessage && (
            <button
              type="button"
              data-testid="open-send-btn"
              onClick={handleSendClick}
              title="Enviar mensagem agora"
              aria-label="Enviar mensagem"
              className="flex items-center justify-center p-2 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-150 shadow-xs"
            >
              <Send className="h-4 w-4" />
            </button>
          )}

          {/* Indicador de Edição */}
          <div className="flex items-center gap-1 pl-1 text-muted-foreground group-hover:text-foreground">
            <div className="p-1.5 rounded-lg group-hover:bg-muted transition-colors">
              <Edit3 className="h-4 w-4 hidden sm:block opacity-60 group-hover:opacity-100" />
              <ChevronRight className="h-4 w-4 sm:hidden" />
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
};
