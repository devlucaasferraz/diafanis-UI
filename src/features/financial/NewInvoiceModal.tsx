import * as React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/features/ui/button';
import { FeeType, Invoice, InvoiceStatus } from './types';

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoice: Omit<Invoice, 'id' | 'reference'>) => void;
  nextReferenceCode?: string;
}

const firmLawyers = [
  { id: 'me', name: 'Dr. Alberto Queiroz' },
  { id: 'pa', name: 'Dra. Patrícia Ávila' },
  { id: 'hr', name: 'Dr. Himmad Rocha' },
  { id: 'bv', name: 'Dr. Benson Varghese' },
];

export const NewInvoiceModal: React.FC<NewInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  nextReferenceCode = 'HON-2026-013',
}) => {
  const [clientName, setClientName] = React.useState('');
  const [processNumber, setProcessNumber] = React.useState('');
  const [feeType, setFeeType] = React.useState<FeeType>('contractual');
  const [lawyerId, setLawyerId] = React.useState('me');
  const [amount, setAmount] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [status, setStatus] = React.useState<InvoiceStatus>('pending');
  const [notes, setNotes] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset form on open
  React.useEffect(() => {
    if (isOpen) {
      setClientName('');
      setProcessNumber('');
      setFeeType('contractual');
      setLawyerId('me');
      setAmount('');
      setDueDate(new Date().toISOString().split('T')[0]);
      setStatus('pending');
      setNotes('');
      setErrors({});
    }
  }, [isOpen]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!clientName.trim()) errs.clientName = 'Nome do cliente é obrigatório.';
    if (!processNumber.trim()) errs.processNumber = 'Número do processo CNJ é obrigatório.';
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      errs.amount = 'Informe um valor válido maior que zero.';
    }
    if (!dueDate) errs.dueDate = 'Data de vencimento é obrigatória.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedLawyer = firmLawyers.find((l) => l.id === lawyerId);

    onSubmit({
      clientName: clientName.trim(),
      processNumber: processNumber.trim(),
      feeType,
      lawyerName: selectedLawyer?.name || 'Dr. Alberto Queiroz',
      lawyerId,
      amount: Number(amount),
      dueDate,
      paidDate: status === 'paid' ? dueDate : undefined,
      status,
      hasDocument: false,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className="bg-card border border-border/50 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-invoice-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/10">
          <div className="flex flex-col gap-0.5">
            <h2 id="new-invoice-title" className="text-base font-bold font-headline text-foreground">
              Cadastrar Honorário
            </h2>
            <p className="text-xs text-muted-foreground">
              Referência gerada: <span className="font-mono font-semibold text-foreground">{nextReferenceCode}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Cliente */}
          <div className="space-y-1.5">
            <label htmlFor="client-name" className="font-semibold text-foreground">
              Cliente ou Requerente *
            </label>
            <input
              id="client-name"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: Cooperativa Agrícola de Petrolina"
              className="w-full h-9 px-3 rounded-lg border border-border/70 bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            {errors.clientName && (
              <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{errors.clientName}</span>
              </p>
            )}
          </div>

          {/* Processo CNJ e Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="process-number" className="font-semibold text-foreground">
                Processo CNJ *
              </label>
              <input
                id="process-number"
                type="text"
                value={processNumber}
                onChange={(e) => setProcessNumber(e.target.value)}
                placeholder="0000000-00.0000.8.00.0000"
                className="w-full h-9 px-3 rounded-lg border border-border/70 bg-background font-mono text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              {errors.processNumber && (
                <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.processNumber}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="fee-type" className="font-semibold text-foreground">
                Tipo de Honorário *
              </label>
              <select
                id="fee-type"
                value={feeType}
                onChange={(e) => setFeeType(e.target.value as FeeType)}
                className="w-full h-9 px-3 rounded-lg border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="contractual">Honorários Contratuais</option>
                <option value="succumbential">Honorários Sucumbenciais</option>
              </select>
            </div>
          </div>

          {/* Advogado Responsável */}
          <div className="space-y-1.5">
            <label htmlFor="lawyer" className="font-semibold text-foreground">
              Advogado Responsável *
            </label>
            <select
              id="lawyer"
              value={lawyerId}
              onChange={(e) => setLawyerId(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {firmLawyers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Valor (R$) e Data de Vencimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="amount" className="font-semibold text-foreground">
                Valor (R$) *
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 5000.00"
                className="w-full h-9 px-3 rounded-lg border border-border/70 bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              {errors.amount && (
                <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.amount}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="due-date" className="font-semibold text-foreground">
                Data de Vencimento *
              </label>
              <input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              />
              {errors.dueDate && (
                <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.dueDate}</span>
                </p>
              )}
            </div>
          </div>

          {/* Status Inicial */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground block">
              Status Inicial da Cobrança *
            </label>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="pending"
                  checked={status === 'pending'}
                  onChange={() => setStatus('pending')}
                  className="accent-primary"
                />
                <span className="text-foreground">Pendente (A receber)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="paid"
                  checked={status === 'paid'}
                  onChange={() => setStatus('paid')}
                  className="accent-primary"
                />
                <span className="text-foreground">Já liquidado (Pago)</span>
              </label>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <label htmlFor="notes" className="font-semibold text-foreground">
              Observações ou Detalhes (Opcional)
            </label>
            <textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Parcela referente à sentença em 1ª instância."
              className="w-full p-2.5 rounded-lg border border-border/70 bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="px-4 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="px-4 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
            >
              Cadastrar Honorário
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
