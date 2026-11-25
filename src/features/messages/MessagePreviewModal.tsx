import * as React from 'react';
import { X, Edit3, Send, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/features/ui/button';
import { cn } from '@/shared/cn';
import { MessageItem } from './types';
import { renderContentWithPills } from './MessageModal';

export interface MessagePreviewModalProps {
  isOpen: boolean;
  message: MessageItem | null;
  onClose: () => void;
  onEdit: (message: MessageItem) => void;
  onSend?: (message: MessageItem) => void;
  onDelete?: (message: MessageItem) => void;
  onToggleUrgency?: (message: MessageItem, hasAlert: boolean) => void;
}

export const MessagePreviewModal: React.FC<MessagePreviewModalProps> = ({
  isOpen,
  message,
  onClose,
  onEdit,
  onSend,
  onDelete,
  onToggleUrgency,
}) => {
  if (!isOpen || !message) return null;

  const handleEdit = () => {
    onClose();
    onEdit(message);
  };

  const handleSend = () => {
    if (onSend) {
      onClose();
      onSend(message);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message);
      onClose();
    }
  };

  const handleUrgencyChange = () => {
    if (onToggleUrgency) {
      onToggleUrgency(message, !message.hasAlert);
    }
  };

  const hasLinks =
    (message.clients && message.clients.length > 0) ||
    Boolean(message.selectedLawsuit) ||
    Boolean(message.selectedFinancial) ||
    Boolean(message.selectedDate);

  return (
    <div
      data-testid="message-preview-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-preview-title"
        data-testid="message-preview-modal"
        className="bg-card border border-border/60 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-2.5 min-w-0">
            {message.hasAlert && (
              <span
                data-testid="preview-alert-indicator"
                title="Mensagem urgente"
                className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600 ring-2 ring-card" />
              </span>
            )}
            <div className="min-w-0">
              <h2
                id="message-preview-title"
                data-testid="preview-modal-title"
                className="text-base font-semibold text-foreground tracking-tight truncate"
              >
                {message.title}
              </h2>
              <p className="text-xs text-muted-foreground">Prévia da Mensagem</p>
            </div>
          </div>

          <button
            type="button"
            data-testid="close-preview-btn"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Barra de Agendamento e Status de Urgência */}
        <div className="px-6 py-3 border-b border-border/30 bg-muted/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {message.scheduledAt ? (
              <div className="flex items-center gap-1.5 text-muted-foreground bg-background/80 px-2.5 py-1 rounded-lg border border-border/40">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>Agendado:</span>
                <span className="font-medium text-foreground">
                  {new Date(message.scheduledAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground text-[11px]">Envio não agendado</span>
            )}
          </div>

          {/* Toggle de Status de Urgência no Modal de View */}
          <label
            data-testid="preview-urgency-label"
            className={cn(
              'flex items-center gap-2 px-3 py-1 rounded-lg border cursor-pointer transition-colors select-none',
              message.hasAlert
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                : 'border-border/50 bg-background/80 text-muted-foreground hover:text-foreground'
            )}
          >
            <input
              type="checkbox"
              data-testid="preview-urgency-toggle"
              checked={Boolean(message.hasAlert)}
              onChange={handleUrgencyChange}
              className="h-3.5 w-3.5 rounded border-border text-rose-600 focus:ring-rose-500"
            />
            <span className="h-2 w-2 rounded-full bg-rose-600 inline-block" />
            <span>Status de Urgência</span>
          </label>
        </div>

        {/* Corpo do Preview */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Conteúdo Formatado
            </span>
            <div
              data-testid="message-preview-content"
              className="p-4 rounded-xl border border-border/60 bg-muted/20 text-sm text-foreground leading-relaxed min-h-[140px] whitespace-pre-wrap break-words"
            >
              {message.content ? (
                renderContentWithPills(message.content)
              ) : (
                <span className="text-muted-foreground italic">Sem conteúdo na mensagem.</span>
              )}
            </div>
          </div>

          {/* Seção Vínculos: Cliente e Objetos de Referência com cores distintas */}
          {hasLinks && (
            <div data-testid="preview-links-section" className="space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Vínculos
              </span>
              <div className="flex flex-wrap gap-1.5">
                {/* Vínculo(s) de Cliente - Cor Violeta (somente bolinha e borda) */}
                {message.clients?.map((cli) => (
                  <span
                    key={cli.id}
                    data-testid="link-badge-client"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-violet-500/50 text-xs text-foreground font-medium"
                  >
                    <span className="h-2 w-2 rounded-full bg-violet-500 shrink-0" />
                    {cli.fullName}
                  </span>
                ))}

                {/* Vínculo de Processo - Cor Azul (somente bolinha e borda) */}
                {message.selectedLawsuit && (
                  <span
                    data-testid="link-badge-lawsuit"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-blue-500/50 text-xs text-foreground font-medium"
                  >
                    <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    {message.selectedLawsuit.number}
                  </span>
                )}

                {/* Vínculo Financeiro - Cor Esmeralda/Verde (somente bolinha e borda) */}
                {message.selectedFinancial && (
                  <span
                    data-testid="link-badge-financial"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-500/50 text-xs text-foreground font-medium"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    {message.selectedFinancial.code} ({message.selectedFinancial.amount})
                  </span>
                )}

                {/* Vínculo de Data / Audiência - Cor Âmbar/Laranja (somente bolinha e borda) */}
                {message.selectedDate && (
                  <span
                    data-testid="link-badge-date"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-500/50 text-xs text-foreground font-medium"
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                    {message.selectedDate.title} ({message.selectedDate.date})
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer com botões Fechar, Excluir, Enviar e Editar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/20">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs"
            >
              Fechar
            </Button>

            {onDelete && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                data-testid="preview-delete-btn"
                className="gap-1.5 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Excluir</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onSend && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSend}
                data-testid="preview-send-btn"
                className="gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/10"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Enviar</span>
              </Button>
            )}

            <Button
              type="button"
              onClick={handleEdit}
              data-testid="preview-edit-btn"
              className="gap-1.5 text-xs shadow-sm"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Editar</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
