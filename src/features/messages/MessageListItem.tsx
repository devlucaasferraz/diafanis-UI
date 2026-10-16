import * as React from 'react';
import { Send, Edit3, Play } from 'lucide-react';
import { cn } from '@/shared/cn';
import { GlassPanel } from '@/features/ui/glass-panel';
import { Button } from '@/features/ui/button';
import { MessageItem, TemplateItem } from './types';

export interface MessageListItemProps {
  item: MessageItem | TemplateItem;
  isMessage?: boolean;
  onSelect: (item: MessageItem | TemplateItem) => void;
  onUseTemplate?: (item: TemplateItem) => void;
  onEdit?: (item: MessageItem | TemplateItem) => void;
  onSend?: (item: MessageItem) => void;
  // Opcionais para compatibilidade
  onOpenClients?: (item: MessageItem | TemplateItem) => void;
  onSchedule?: (item: MessageItem | TemplateItem) => void;
  className?: string;
}

export const MessageListItem: React.FC<MessageListItemProps> = ({
  item,
  isMessage = false,
  onSelect,
  onUseTemplate,
  onEdit,
  onSend,
  className,
}) => {
  const messageItem = isMessage ? (item as MessageItem) : null;
  const hasAlert = Boolean(messageItem?.hasAlert);

  const handleSendClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSend && messageItem) {
      onSend(messageItem);
    }
  };

  const handleUseTemplateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUseTemplate) {
      onUseTemplate(item as TemplateItem);
    } else {
      onSelect(item);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(item);
    } else {
      onSelect(item);
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

        {/* A DIREITA: Em Mensagens (Envio + Edição); Em Modelos ("Usar Modelo" + Edição) */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          {/* Se for Modelo: Botão "Usar Modelo" */}
          {!isMessage && (
            <Button
              type="button"
              size="sm"
              data-testid="use-template-btn"
              onClick={handleUseTemplateClick}
              className="gap-1.5 text-xs h-8 px-3 shadow-xs"
            >
              <Play className="h-3 w-3" />
              <span>Usar Modelo</span>
            </Button>
          )}

          {/* Se for Mensagem: Símbolo de Envio (Send) */}
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

          {/* Botão de Edição */}
          <button
            type="button"
            data-testid="open-edit-btn"
            onClick={handleEditClick}
            title={isMessage ? 'Editar mensagem' : 'Editar modelo'}
            aria-label={isMessage ? 'Editar mensagem' : 'Editar modelo'}
            className="flex items-center justify-center p-2 rounded-xl border border-border/40 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </GlassPanel>
  );
};
