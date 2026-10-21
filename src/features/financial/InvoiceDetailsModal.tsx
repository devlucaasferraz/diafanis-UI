import * as React from 'react';
import { X, Pencil, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/features/ui/button';
import { FinancialStatusBadge, FeeTypeBadge } from './FinancialBadge';
import { Invoice } from './types';
import { formatCurrency, formatDateBR, formatFeeTypeLabel, formatShortId } from './utils';

interface InvoiceDetailsModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (id: string) => void;
  onRegisterPayment?: (id: string, paymentData: { data_pagamento: string }) => void;
  onEditInvoice?: (invoice: Invoice) => void;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onToggleStatus,
  onRegisterPayment,
  onEditInvoice,
}) => {
  const [paymentDate, setPaymentDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Reset local state when modal opens or invoice changes
  React.useEffect(() => {
    if (isOpen) {
      setPaymentDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, invoice]);

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

  if (!isOpen || !invoice) return null;

  const handleConfirmLiquidation = () => {
    if (onRegisterPayment) {
      onRegisterPayment(invoice.id, {
        data_pagamento: paymentDate,
      });
    } else {
      onToggleStatus(invoice.id);
    }
  };

  const shortId = formatShortId(invoice.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className="bg-card border border-border/50 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-details-title"
      >
        {/* Clean Typographic Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded"
                title={invoice.id}
              >
                {shortId}
              </span>
              <FinancialStatusBadge status={invoice.status} />
              <FeeTypeBadge feeType={invoice.tipo} />
            </div>
            <h2
              id="invoice-details-title"
              className="text-lg font-bold font-headline text-foreground tracking-tight pt-1"
            >
              {invoice.descricao || 'Sem descrição'}
            </h2>
            <p className="text-xs font-mono text-muted-foreground">
              ID: {invoice.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Fechar"
            aria-label="Fechar detalhes"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Main Financial Metric */}
          <div className="pb-4 border-b border-border/30">
            <span className="text-[11px] font-medium text-muted-foreground block uppercase tracking-wider">
              Valor da Fatura
            </span>
            <div className="text-2xl font-bold font-headline text-foreground tracking-tight mt-0.5">
              {formatCurrency(invoice.valor)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {invoice.status === 'PAGO' && invoice.data_pagamento ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Liquidado em {formatDateBR(invoice.data_pagamento)}
                </span>
              ) : (
                <span>Vencimento previsto para {formatDateBR(invoice.data_vencimento)}</span>
              )}
            </p>
          </div>

          {/* Details Specification Grid */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/30">
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">
                Cliente Vinculado
              </span>
              <span className="font-semibold text-foreground text-xs block mt-0.5 break-all">
                {invoice.clienteNome || invoice.cliente || 'Não vinculado'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">
                Processo Vinculado
              </span>
              <span className="font-semibold font-mono text-foreground text-xs block mt-0.5 break-all">
                {invoice.processo || 'Não vinculado'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">
                Tipo
              </span>
              <span className="font-semibold text-foreground text-xs block mt-0.5">
                {formatFeeTypeLabel(invoice.tipo)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">
                Data de Vencimento
              </span>
              <span className="font-semibold text-foreground text-xs block mt-0.5">
                {formatDateBR(invoice.data_vencimento)}
              </span>
            </div>

            {invoice.created_at && (
              <div>
                <span className="text-[11px] text-muted-foreground block font-medium">
                  Criado em
                </span>
                <span className="text-foreground text-xs block mt-0.5">
                  {formatDateBR(invoice.created_at)}
                </span>
              </div>
            )}

            {invoice.updated_at && (
              <div>
                <span className="text-[11px] text-muted-foreground block font-medium">
                  Atualizado em
                </span>
                <span className="text-foreground text-xs block mt-0.5">
                  {formatDateBR(invoice.updated_at)}
                </span>
              </div>
            )}
          </div>

          {/* Liquidation Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-foreground">
                Status & Liquidação
              </h4>
              {invoice.status === 'PAGO' && (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Fatura Liquidada
                </span>
              )}
            </div>

            {invoice.status === 'PAGO' ? (
              <div className="p-3.5 rounded-xl border border-border/50 bg-muted/10 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-foreground">
                    Pagamento registrado em {formatDateBR(invoice.data_pagamento)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Deseja reabrir esta cobrança como pendente?
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleStatus(invoice.id)}
                  className="text-xs gap-1.5 text-muted-foreground hover:text-foreground shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reverter para Pendente</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-3.5">
                <p className="text-xs text-muted-foreground">
                  Informe a data de pagamento para liquidar esta fatura na API.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <label htmlFor="liquidation-date" className="text-[11px] whitespace-nowrap">
                      Data do pagamento:
                    </label>
                    <input
                      id="liquidation-date"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="h-7 px-2 rounded border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={handleConfirmLiquidation}
                      className="h-8 px-3 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Registrar Pagamento</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-border/30 bg-muted/10">
          {onEditInvoice ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const target = invoice;
                onClose();
                onEditInvoice(target);
              }}
              className="px-3 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Editar Fatura</span>
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="px-4 text-xs text-muted-foreground hover:text-foreground"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};
