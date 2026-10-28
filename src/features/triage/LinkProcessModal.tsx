import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, Scale, Check, Plus } from 'lucide-react';
import { Button } from '@/features/ui/button';
import { Processo } from './types';
import { availableProcesses } from './mock-data';
import { cn } from '@/shared/cn';

interface LinkProcessModalProps {
  isOpen: boolean;
  clientName: string;
  onClose: () => void;
  onLinkProcess: (processo: Processo) => void;
}

export const LinkProcessModal: React.FC<LinkProcessModalProps> = ({
  isOpen,
  clientName,
  onClose,
  onLinkProcess,
}) => {
  const [selectedProcessId, setSelectedProcessId] = React.useState<string>(
    availableProcesses[0]?.id || ''
  );
  const [customMode, setCustomMode] = React.useState(false);
  const [customCnj, setCustomCnj] = React.useState('');
  const [customVara, setCustomVara] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setSelectedProcessId(availableProcesses[0]?.id || '');
      setCustomMode(false);
      setCustomCnj('');
      setCustomVara('');
    }
  }, [isOpen]);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (customMode) {
      if (!customCnj.trim() || !customVara.trim()) return;
      onLinkProcess({
        id: `proc-custom-${Date.now()}`,
        numero_cnj: customCnj.trim(),
        vara: customVara.trim(),
      });
      onClose();
      return;
    }

    const found = availableProcesses.find((p) => p.id === selectedProcessId);
    if (found) {
      onLinkProcess(found);
      onClose();
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <DialogPrimitive.Content
          aria-describedby="link-process-desc"
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/60 bg-card p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out"
        >
          <form onSubmit={handleConfirm} className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-3">
              <div className="flex flex-col gap-1">
                <DialogPrimitive.Title className="text-base font-bold font-headline text-foreground">
                  Vincular a Processo Existente
                </DialogPrimitive.Title>
                <DialogPrimitive.Description
                  id="link-process-desc"
                  className="text-xs text-muted-foreground"
                >
                  Vincule o atendimento de <span className="font-semibold text-foreground">{clientName}</span> a um processo judicial em andamento.
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Fechar"
                >
                  <X className="size-4" />
                </button>
              </DialogPrimitive.Close>
            </div>

            {!customMode ? (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                {availableProcesses.map((proc) => {
                  const isSelected = proc.id === selectedProcessId;
                  return (
                    <button
                      key={proc.id}
                      type="button"
                      onClick={() => setSelectedProcessId(proc.id)}
                      className={cn(
                        'flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all',
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                          : 'border-border/60 bg-background hover:bg-muted/40'
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <Scale className="size-4 text-primary shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {proc.numero_cnj}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {proc.vara} {proc.comarca ? `• ${proc.comarca}` : ''}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="size-4 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="custom-cnj-input"
                    className="text-xs font-semibold text-foreground"
                  >
                    Número do Processo (Padrão CNJ)
                  </label>
                  <input
                    id="custom-cnj-input"
                    type="text"
                    value={customCnj}
                    onChange={(e) => setCustomCnj(e.target.value)}
                    placeholder="0000000-00.2026.4.04.7100"
                    className="h-9 rounded-xl border border-border/70 bg-background px-3 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="custom-vara-input"
                    className="text-xs font-semibold text-foreground"
                  >
                    Vara / Juízo / Comarca
                  </label>
                  <input
                    id="custom-vara-input"
                    type="text"
                    value={customVara}
                    onChange={(e) => setCustomVara(e.target.value)}
                    placeholder="Ex: 1ª Vara Federal de Porto Alegre"
                    className="h-9 rounded-xl border border-border/70 bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <button
                type="button"
                onClick={() => setCustomMode((prev) => !prev)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <Plus className="size-3.5" />
                <span>
                  {customMode
                    ? 'Selecionar da lista existente'
                    : 'Informar outro número CNJ'}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" variant="default" size="sm">
                  Vincular Processo
                </Button>
              </div>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
