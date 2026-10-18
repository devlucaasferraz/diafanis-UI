import * as React from 'react';
import { X, Edit3, Send, Users, Scale, Clock } from 'lucide-react';
import { Button } from '@/features/ui/button';
import { MessageItem } from './types';
import { renderContentWithPills } from './MessageModal';

export interface MessagePreviewModalProps {
  isOpen: boolean;
  message: MessageItem | null;
  onClose: () => void;
  onEdit: (message: MessageItem) => void;
  onSend?: (message: MessageItem) => void;
}

export const MessagePreviewModal: React.FC<MessagePreviewModalProps> = ({
  isOpen,
  message,
  onClose,
  onEdit,
  onSend,
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

  const recipientCount = message.clients?.length || 0;

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

        {/* Informações de Destinatários e Agendamento */}
        <div className="px-6 py-3 border-b border-border/30 bg-muted/10 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground bg-background/80 px-2.5 py-1 rounded-lg border border-border/40">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-foreground">
              {recipientCount} {recipientCount === 1 ? 'destinatário' : 'destinatários'}
            </span>
          </div>

          {message.scheduledAt && (
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
          )}

          {message.selectedLawsuit && (
            <div className="flex items-center gap-1.5 text-muted-foreground bg-background/80 px-2.5 py-1 rounded-lg border border-border/40">
              <Scale className="h-3.5 w-3.5 text-blue-500" />
              <span className="truncate max-w-[150px] font-medium text-foreground">
                {message.selectedLawsuit.number}
              </span>
            </div>
          )}
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

          {/* Lista de Destinatários Resumida */}
          {message.clients && message.clients.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Destinatários Vinculados
              </span>
              <div className="flex flex-wrap gap-1.5">
                {message.clients.map((cli) => (
                  <span
                    key={cli.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border border-border/50 text-xs text-foreground font-medium"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                    {cli.fullName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer com botão Editar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs"
          >
            Fechar
          </Button>

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
