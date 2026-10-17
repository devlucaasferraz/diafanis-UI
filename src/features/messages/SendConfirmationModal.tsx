import * as React from 'react';
import { Send, X, AlertTriangle, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/features/ui/button';
import { MessageItem } from './types';

export interface SendConfirmationModalProps {
  isOpen: boolean;
  message: MessageItem | null;
  onClose: () => void;
  onConfirm: (message: MessageItem) => void;
}

export const SendConfirmationModal: React.FC<SendConfirmationModalProps> = ({
  isOpen,
  message,
  onClose,
  onConfirm,
}) => {
  const [isSending, setIsSending] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setIsSending(false);
      setIsSent(false);
    }
  }, [isOpen]);

  if (!isOpen || !message) return null;

  const recipientCount = message.clients?.length || 0;
  const clientNamesPreview =
    message.clients && message.clients.length > 0
      ? message.clients.map((c) => c.name).join(', ')
      : 'Nenhum cliente vinculado';

  const handleConfirm = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setTimeout(() => {
        onConfirm(message);
        onClose();
      }, 900);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-confirmation-title"
        className="bg-card border border-border/60 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Send className="h-4 w-4" />
            </div>
            <h2 id="send-confirmation-title" className="text-base font-semibold text-foreground tracking-tight">
              Confirmar Disparo
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {isSent ? (
            <div className="py-6 text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Disparo Concluído!</h3>
              <p className="text-xs text-muted-foreground">
                A mensagem foi enviada aos destinatários com sucesso.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-foreground leading-relaxed">
                Você está prestes a enviar a seguinte mensagem:
              </p>

              {/* Card de Resumo */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span className="truncate pr-2">{message.title}</span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span>
                    Destinatários ({recipientCount}): <strong className="text-foreground">{clientNamesPreview}</strong>
                  </span>
                </div>

                {message.content && (
                  <div className="p-2.5 rounded-lg bg-background/80 border border-border/40 text-[11px] text-muted-foreground italic line-clamp-3">
                    "{message.content}"
                  </div>
                )}
              </div>

              {recipientCount === 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs border border-amber-500/30">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Atenção: Não há clientes vinculados a esta mensagem. Adicione clientes antes de enviar.</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isSent && (
          <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-border/30 bg-muted/10">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSending}>
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={isSending || recipientCount === 0}
              className="gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {isSending ? 'Enviando...' : 'Confirmar Envio'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
