import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, AlertCircle, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/features/ui/button';
import { Documento } from './types';

interface RejectDocumentModalProps {
  isOpen: boolean;
  documento: Documento | null;
  clientName: string;
  onClose: () => void;
  onConfirmReject: (
    documentId: string,
    customReason: string,
    notifyViaWhatsApp: boolean
  ) => void;
}

export const RejectDocumentModal: React.FC<RejectDocumentModalProps> = ({
  isOpen,
  documento,
  clientName,
  onClose,
  onConfirmReject,
}) => {
  const [message, setMessage] = React.useState('');
  const [notifyWhatsApp, setNotifyWhatsApp] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (isOpen && documento) {
      setMessage(
        documento.motivo_reprovacao ||
          `Olá ${clientName.split(' ')[0]}, verificamos o documento "${documento.tipo_documento}" (${documento.nome}), porém a imagem ficou ilegível/cortada. Poderia nos enviar uma nova foto em local bem iluminado?`
      );
      setNotifyWhatsApp(true);
      setError('');
    }
  }, [isOpen, documento, clientName]);

  if (!documento) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError(
        'Digite uma mensagem explicando o motivo da recusa ou instrução para reenvio.'
      );
      return;
    }
    onConfirmReject(documento.id, message.trim(), notifyWhatsApp);
    onClose();
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby="reject-doc-description"
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/60 bg-card p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-3">
              <div className="flex flex-col gap-1">
                <DialogPrimitive.Title className="text-base font-bold font-headline text-foreground">
                  Solicitar Reenvio / Recusar Documento
                </DialogPrimitive.Title>
                <DialogPrimitive.Description
                  id="reject-doc-description"
                  className="text-xs text-muted-foreground"
                >
                  Documento: <span className="font-semibold text-foreground">{documento.tipo_documento}</span> ({documento.nome})
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Fechar modal de reprovação"
                >
                  <X className="size-4" />
                </button>
              </DialogPrimitive.Close>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reject-custom-message"
                  className="text-xs font-semibold text-foreground"
                >
                  Mensagem personalizada para o cliente ({clientName})
                </label>
                <textarea
                  id="reject-custom-message"
                  rows={4}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Explique o motivo da reprovação e como o cliente deve reenviar o documento..."
                  aria-invalid={Boolean(error)}
                  className="w-full rounded-xl border border-border/70 bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
                {error && (
                  <p className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive">
                    <AlertCircle className="size-3.5" />
                    <span>{error}</span>
                  </p>
                )}
              </div>

              {/* Notify WhatsApp Toggle */}
              <label className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-muted/30 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyWhatsApp}
                  onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <MessageCircle className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Enviar solicitação de reenvio no WhatsApp do cliente</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    O status do documento será alterado para &ldquo;Reprovado/Ilegível&rdquo; e a mensagem será registrada.
                  </span>
                </div>
              </label>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
                >
                  <Send className="size-3.5" />
                  <span>Confirmar Recusa & Solicitar Reenvio</span>
                </Button>
              </div>
            </form>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
