import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AlertTriangle, Archive, X } from 'lucide-react';
import { Button } from '@/features/ui/button';
import { Documento } from './types';
import { DocumentStatusPill } from './TriageBadges';

interface CompleteTriageAlertModalProps {
  isOpen: boolean;
  clientName: string;
  nonApprovedDocuments: Documento[];
  onClose: () => void;
  onForceComplete: () => void;
}

export const CompleteTriageAlertModal: React.FC<CompleteTriageAlertModalProps> = ({
  isOpen,
  clientName,
  nonApprovedDocuments,
  onClose,
  onForceComplete,
}) => {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <DialogPrimitive.Content
          aria-describedby="complete-triage-alert-desc"
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-amber-500/40 bg-card p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <AlertTriangle className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <DialogPrimitive.Title className="text-base font-bold font-headline text-foreground">
                    Existem documentos pendentes ou reprovados
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description
                    id="complete-triage-alert-desc"
                    className="text-xs text-muted-foreground"
                  >
                    A triagem de <span className="font-semibold text-foreground">{clientName}</span> ainda possui{' '}
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {nonApprovedDocuments.length}{' '}
                      {nonApprovedDocuments.length === 1 ? 'documento não aprovado' : 'documentos não aprovados'}
                    </span>
                    .
                  </DialogPrimitive.Description>
                </div>
              </div>
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Fechar"
                >
                  <X className="size-4" />
                </button>
              </DialogPrimitive.Close>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/40 p-3 flex flex-col gap-2 max-h-44 overflow-y-auto">
              {nonApprovedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="font-medium text-foreground truncate">
                    {doc.tipo_documento}
                  </span>
                  <DocumentStatusPill status={doc.status} />
                </div>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground">
              Deseja aguardar a regularização pelo cliente ou forçar a conclusão e arquivar a triagem mesmo assim?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Aguardar Regularização
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => {
                  onForceComplete();
                  onClose();
                }}
                className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Archive className="size-3.5" />
                <span>Forçar Conclusão e Arquivar</span>
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
