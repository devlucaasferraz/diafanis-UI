import * as React from 'react';
import { X, FileText, FileImage, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/features/ui/button';
import { FinancialStatusBadge, FeeTypeBadge } from './FinancialBadge';
import { isImageDocument } from './DocumentReceiptBadge';
import { Invoice } from './types';
import { formatCurrency, formatDateBR } from './utils';

interface InvoiceDetailsModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (id: string) => void;
  onRegisterPayment?: (id: string, paymentData: { paidDate: string; receiptName?: string }) => void;
  onRemoveReceipt?: (id: string) => void;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onToggleStatus,
  onRegisterPayment,
  onRemoveReceipt,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [paymentDate, setPaymentDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Reset local state when modal opens or invoice changes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleConfirmLiquidation = () => {
    if (onRegisterPayment) {
      onRegisterPayment(invoice.id, {
        paidDate: paymentDate,
        receiptName: selectedFile ? selectedFile.name : undefined,
      });
    } else {
      onToggleStatus(invoice.id);
    }
  };

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
              <span className="font-mono text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {invoice.reference}
              </span>
              <FinancialStatusBadge status={invoice.status} />
              <FeeTypeBadge feeType={invoice.feeType} />
            </div>
            <h2
              id="invoice-details-title"
              className="text-lg font-bold font-headline text-foreground tracking-tight pt-1"
            >
              {invoice.clientName}
            </h2>
            <p className="text-xs font-mono text-muted-foreground">
              Processo CNJ: {invoice.processNumber}
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
              Valor do Honorário
            </span>
            <div className="text-2xl font-bold font-headline text-foreground tracking-tight mt-0.5">
              {formatCurrency(invoice.amount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {invoice.status === 'paid' && invoice.paidDate ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Liquidado em {formatDateBR(invoice.paidDate)}
                </span>
              ) : (
                <span>Vencimento previsto para {formatDateBR(invoice.dueDate)}</span>
              )}
            </p>
          </div>

          {/* Details Specification Grid */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/30">
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">
                Advogado Responsável
              </span>
              <span className="font-semibold text-foreground text-xs block mt-0.5">
                {invoice.lawyerName}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">
                Modalidade de Honorário
              </span>
              <span className="font-semibold text-foreground text-xs block mt-0.5">
                {invoice.feeType === 'contractual'
                  ? 'Honorários Contratuais'
                  : 'Honorários Sucumbenciais'}
              </span>
            </div>

            {invoice.notes && (
              <div className="col-span-2 pt-1">
                <span className="text-[11px] text-muted-foreground block font-medium">
                  Observações
                </span>
                <p className="text-xs text-foreground mt-0.5 leading-relaxed bg-muted/20 p-2.5 rounded-lg border border-border/40">
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>

          {/* Liquidation & Receipt Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-foreground">
                Comprovante & Liquidação
              </h4>
              {invoice.status === 'paid' && (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Honorário Liquidado
                </span>
              )}
            </div>

            {invoice.status === 'paid' ? (
              <div className="space-y-3">
                {invoice.hasDocument ? (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isImageDocument(invoice.documentName) ? (
                        <FileImage className="h-5 w-5 text-sky-500 shrink-0" />
                      ) : (
                        <FileText className="h-5 w-5 text-rose-500 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-medium text-foreground block truncate">
                          {invoice.documentName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {isImageDocument(invoice.documentName)
                            ? 'Comprovante em imagem anexado'
                            : 'Comprovante em PDF anexado'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert(`Baixando comprovante ${invoice.documentName}`)}
                        className="h-7 px-2.5 text-xs gap-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>Baixar</span>
                      </Button>
                      {onRemoveReceipt && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveReceipt(invoice.id)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          title="Remover comprovante"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-border/40 bg-muted/10 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Honorário marcado como liquidado sem comprovante anexado.
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f && onRegisterPayment) {
                          onRegisterPayment(invoice.id, {
                            paidDate: invoice.paidDate || paymentDate,
                            receiptName: f.name,
                          });
                        }
                      }}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-7 text-xs gap-1 text-primary"
                    >
                      <Upload className="h-3 w-3" />
                      <span>Anexar recibo agora</span>
                    </Button>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStatus(invoice.id)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Reverter para Pendente
                  </Button>
                </div>
              </div>
            ) : (
              /* Liquidation Flow with Receipt Attachment */
              <div className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-3.5">
                <p className="text-xs text-muted-foreground">
                  Anexe o comprovante de pagamento para liquidar esta cobrança.
                </p>

                {/* File picker */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    id="receipt-file-input"
                  />

                  {selectedFile ? (
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background">
                      <div className="flex items-center gap-2 min-w-0">
                        {isImageDocument(selectedFile.name) ? (
                          <FileImage className="h-4 w-4 text-sky-500 shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 text-rose-500 shrink-0" />
                        )}
                        <span className="font-mono text-xs font-medium text-foreground truncate">
                          {selectedFile.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded"
                        title="Remover arquivo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-dashed border-border/80 hover:border-primary/50 bg-background/60 hover:bg-muted/40 transition-colors text-xs text-muted-foreground cursor-pointer"
                    >
                      <Upload className="h-4 w-4 text-primary" />
                      <span>Selecionar comprovante (PDF, PNG ou JPG)</span>
                    </button>
                  )}
                </div>

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
                      className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
                    >
                      Liquidar com Comprovante
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-border/30 bg-muted/10">
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
