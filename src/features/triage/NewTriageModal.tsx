import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  X,
  Plus,
  Trash2,
  MessageCircle,
  UserPlus,
  Users,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { Button } from '@/features/ui/button';
import {
  Cliente,
  Processo,
  LegalPackageId,
} from './types';
import {
  registeredClients,
  availableProcesses,
  legalPackages,
  formatPhoneBR,
} from './mock-data';
import { cn } from '@/shared/cn';

export interface NewTriageSessionPayload {
  cliente: Cliente;
  processo: Processo | null;
  area_motivo: string;
  documentosSolicitados: string[];
  dispararWhatsAppImediatamente: boolean;
}

interface NewTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (payload: NewTriageSessionPayload) => void;
}

export const NewTriageModal: React.FC<NewTriageModalProps> = ({
  isOpen,
  onClose,
  onCreateSession,
}) => {
  const [clientMode, setClientMode] = React.useState<'existing' | 'new'>('existing');
  const [clientSearch, setClientSearch] = React.useState('');
  const [selectedClientId, setSelectedClientId] = React.useState<string>(
    registeredClients[6]?.id || registeredClients[0].id
  );

  // New client fields
  const [newClientName, setNewClientName] = React.useState('');
  const [newClientPhone, setNewClientPhone] = React.useState('');
  const [newClientCpf, setNewClientCpf] = React.useState('');

  // Process link (optional)
  const [selectedProcessId, setSelectedProcessId] = React.useState<string>('none');

  // Legal Package
  const [selectedPackageId, setSelectedPackageId] =
    React.useState<LegalPackageId>('aposentadoria');
  const [checklistItems, setChecklistItems] = React.useState<string[]>(
    legalPackages[0].documentos_padrao
  );
  const [newDocItemInput, setNewDocItemInput] = React.useState('');

  // Dispatch WhatsApp immediately
  const [dispatchWhatsApp, setDispatchWhatsApp] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setClientMode('existing');
      setClientSearch('');
      setSelectedClientId(registeredClients[6]?.id || registeredClients[0].id);
      setNewClientName('');
      setNewClientPhone('');
      setNewClientCpf('');
      setSelectedProcessId('none');
      setSelectedPackageId('aposentadoria');
      setChecklistItems([...legalPackages[0].documentos_padrao]);
      setNewDocItemInput('');
      setDispatchWhatsApp(true);
      setError('');
    }
  }, [isOpen]);

  const handlePackageChange = (pkgId: LegalPackageId) => {
    setSelectedPackageId(pkgId);
    const pkg = legalPackages.find((p) => p.id === pkgId);
    if (pkg) {
      setChecklistItems([...pkg.documentos_padrao]);
    }
  };

  const handleAddChecklistItem = () => {
    const trimmed = newDocItemInput.trim();
    if (!trimmed) return;
    if (!checklistItems.includes(trimmed)) {
      setChecklistItems((prev) => [...prev, trimmed]);
    }
    setNewDocItemInput('');
  };

  const handleRemoveChecklistItem = (itemToRemove: string) => {
    setChecklistItems((prev) => prev.filter((item) => item !== itemToRemove));
  };

  const filteredClients = React.useMemo(() => {
    if (!clientSearch.trim()) return registeredClients;
    const q = clientSearch.toLowerCase().trim();
    return registeredClients.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        c.cpf.toLowerCase().includes(q) ||
        c.telefone.includes(q)
    );
  }, [clientSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let finalClient: Cliente;
    if (clientMode === 'existing') {
      const found = registeredClients.find((c) => c.id === selectedClientId);
      if (!found) {
        setError('Selecione um cliente válido na lista.');
        return;
      }
      finalClient = found;
    } else {
      if (!newClientName.trim() || !newClientPhone.trim()) {
        setError('Informe o nome e o telefone WhatsApp do cliente.');
        return;
      }
      finalClient = {
        id: `cli-new-${Date.now()}`,
        nome: newClientName.trim(),
        telefone: newClientPhone.trim(),
        cpf: newClientCpf.trim() || '000.000.000-00',
      };
    }

    if (checklistItems.length === 0) {
      setError('Adicione pelo menos um documento ao pacote de coleta.');
      return;
    }

    const selectedPkg =
      legalPackages.find((p) => p.id === selectedPackageId) || legalPackages[0];
    const linkedProcess =
      selectedProcessId === 'none'
        ? null
        : availableProcesses.find((p) => p.id === selectedProcessId) || null;

    onCreateSession({
      cliente: finalClient,
      processo: linkedProcess,
      area_motivo: selectedPkg.area_motivo,
      documentosSolicitados: checklistItems,
      dispararWhatsAppImediatamente: dispatchWhatsApp,
    });

    onClose();
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <DialogPrimitive.Content
          aria-describedby="new-triage-modal-desc"
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/60 bg-card shadow-2xl max-h-[90vh] flex flex-col overflow-hidden duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-border/40 bg-muted/20">
            <div className="flex flex-col gap-0.5">
              <DialogPrimitive.Title className="text-base font-bold font-headline text-foreground">
                Nova Sessão de Coleta (Triagem WhatsApp)
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="new-triage-modal-desc"
                className="text-xs text-muted-foreground"
              >
                Configure o pacote jurídico e dispare a solicitação automática de documentos para o cliente.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Fechar"
              >
                <X className="size-4" />
              </button>
            </DialogPrimitive.Close>
          </div>

          {/* Form Body */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 flex flex-col gap-4"
          >
            {/* 1. Seleção / Busca de Cliente */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  1. Cliente da Triagem
                </label>
                <div className="inline-flex rounded-lg bg-muted p-0.5 border border-border/50">
                  <button
                    type="button"
                    onClick={() => setClientMode('existing')}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all',
                      clientMode === 'existing'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Users className="size-3" />
                    <span>Cliente da Base</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientMode('new')}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all',
                      clientMode === 'new'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <UserPlus className="size-3" />
                    <span>Novo Contato</span>
                  </button>
                </div>
              </div>

              {clientMode === 'existing' ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Filtrar cliente por nome, CPF ou telefone..."
                    aria-label="Filtrar cliente"
                    className="h-8 rounded-xl border border-border/70 bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <select
                    aria-label="Selecionar cliente"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="h-9 rounded-xl border border-border/70 bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {filteredClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome} — CPF: {c.cpf} ({formatPhoneBR(c.telefone)})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Nome completo do cliente"
                    aria-label="Nome completo do cliente"
                    className="sm:col-span-1 h-9 rounded-xl border border-border/70 bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    type="text"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="WhatsApp (ex: 51999887766)"
                    aria-label="Telefone WhatsApp"
                    className="sm:col-span-1 h-9 rounded-xl border border-border/70 bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    type="text"
                    value={newClientCpf}
                    onChange={(e) => setNewClientCpf(e.target.value)}
                    placeholder="CPF (opcional)"
                    aria-label="CPF do cliente"
                    className="sm:col-span-1 h-9 rounded-xl border border-border/70 bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}
            </div>

            {/* 2. Vínculo de Processo (Opcional) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="triage-process-select"
                className="text-xs font-bold text-foreground"
              >
                2. Vínculo de Processo (Opcional)
              </label>
              <select
                id="triage-process-select"
                value={selectedProcessId}
                onChange={(e) => setSelectedProcessId(e.target.value)}
                className="h-9 rounded-xl border border-border/70 bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="none">
                  Pré-processual / Novo Caso (Sem processo vinculado)
                </option>
                {availableProcesses.map((proc) => (
                  <option key={proc.id} value={proc.id}>
                    {proc.numero_cnj} — {proc.vara}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Seleção do Pacote Jurídico */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="triage-package-select"
                className="text-xs font-bold text-foreground"
              >
                3. Seleção do Pacote Jurídico
              </label>
              <select
                id="triage-package-select"
                value={selectedPackageId}
                onChange={(e) =>
                  handlePackageChange(e.target.value as LegalPackageId)
                }
                className="h-9 rounded-xl border border-border/70 bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {legalPackages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Checklist de Documentos Editável */}
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <FileCheck2 className="size-3.5 text-primary" />
                  <span>Checklist de Documentos Solicitados ({checklistItems.length})</span>
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Personalizável antes do envio
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {checklistItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title={`Remover ${item}`}
                      aria-label={`Remover ${item}`}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newDocItemInput}
                  onChange={(e) => setNewDocItemInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                  placeholder="Adicionar documento extra (ex: Procuração Assinada, PPP...)"
                  aria-label="Adicionar documento extra ao pacote"
                  className="flex-1 h-8 rounded-xl border border-border/70 bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddChecklistItem}
                  className="gap-1 h-8"
                >
                  <Plus className="size-3.5" />
                  <span>Adicionar Item</span>
                </Button>
              </div>
            </div>

            {/* 5. Checkbox Disparar WhatsApp imediatamente */}
            <label className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 cursor-pointer">
              <input
                type="checkbox"
                checked={dispatchWhatsApp}
                onChange={(e) => setDispatchWhatsApp(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
              <div className="flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <MessageCircle className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Disparar WhatsApp imediatamente</span>
                </span>
                <span className="text-[11px] text-muted-foreground">
                  O bot iniciará o contato no WhatsApp do cliente solicitando os documentos listados acima.
                </span>
              </div>
            </label>

            {error && (
              <div className="flex items-center gap-1.5 rounded-xl bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
              <Button type="button" variant="outline" size="default" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="default" size="default" className="gap-1.5">
                <Plus className="size-4" />
                <span>Iniciar Sessão de Coleta</span>
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
