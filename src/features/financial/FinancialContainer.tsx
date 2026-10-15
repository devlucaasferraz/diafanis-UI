import * as React from 'react';
import { FinancialSummary } from './FinancialSummary';
import { FinancialFilters } from './FinancialFilters';
import { FinancialTable } from './FinancialTable';
import { FinancialPagination } from './FinancialPagination';
import { NewInvoiceModal } from './NewInvoiceModal';
import { InvoiceDetailsModal } from './InvoiceDetailsModal';
import { initialInvoices, calculateSummary } from './mock-data';
import {
  Invoice,
  InvoiceFilterTab,
  FeeType,
  InvoiceSortField,
  SortOrder,
} from './types';
import { GlassPanel } from '@/features/ui/glass-panel';
import { CheckCircle2, X } from 'lucide-react';
import { Button } from '@/features/ui/button';

export const FinancialContainer: React.FC = () => {
  const [invoices, setInvoices] = React.useState<Invoice[]>(initialInvoices);
  const [currentTab, setCurrentTab] = React.useState<InvoiceFilterTab>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [feeTypeFilter, setFeeTypeFilter] = React.useState<'all' | FeeType>('all');
  const [sortField, setSortField] = React.useState<InvoiceSortField>('dueDate');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);
  const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = React.useState<Invoice | null>(null);

  const pageSize = 6;

  // Filter and sort invoices
  const filteredInvoices = React.useMemo(() => {
    return invoices
      .filter((inv) => {
        // Tab filter
        if (currentTab !== 'all' && inv.status !== currentTab) return false;

        // Fee type filter
        if (feeTypeFilter !== 'all' && inv.feeType !== feeTypeFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchClient = inv.clientName.toLowerCase().includes(q);
          const matchProcess = inv.processNumber.toLowerCase().includes(q);
          const matchRef = inv.reference.toLowerCase().includes(q);
          const matchLawyer = inv.lawyerName.toLowerCase().includes(q);
          if (!matchClient && !matchProcess && !matchRef && !matchLawyer) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let compare = 0;
        if (sortField === 'dueDate') {
          compare = a.dueDate.localeCompare(b.dueDate);
        } else if (sortField === 'amount') {
          compare = a.amount - b.amount;
        } else if (sortField === 'clientName') {
          compare = a.clientName.localeCompare(b.clientName);
        } else if (sortField === 'reference') {
          compare = a.reference.localeCompare(b.reference);
        }
        return sortOrder === 'desc' ? -compare : compare;
      });
  }, [invoices, currentTab, feeTypeFilter, searchQuery, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const paginatedInvoices = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  const summary = React.useMemo(() => calculateSummary(invoices), [invoices]);

  const counts = React.useMemo(
    () => ({
      all: invoices.length,
      paid: summary.paidCount,
      pending: summary.pendingCount,
      overdue: summary.overdueCount,
    }),
    [invoices, summary]
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = paginatedInvoices.map((inv) => inv.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(paginatedInvoices.map((inv) => inv.id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
    }
  };

  const handleToggleStatus = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        const newStatus = inv.status === 'paid' ? 'pending' : 'paid';
        return {
          ...inv,
          status: newStatus,
          paidDate: newStatus === 'paid' ? '2026-10-15' : undefined,
        };
      })
    );
    if (selectedInvoiceForDetails && selectedInvoiceForDetails.id === id) {
      setSelectedInvoiceForDetails((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === 'paid' ? 'pending' : 'paid',
              paidDate: prev.status !== 'paid' ? '2026-10-15' : undefined,
            }
          : null
      );
    }
  };

  const handleRegisterPayment = (
    id: string,
    paymentData: { paidDate: string; receiptName?: string }
  ) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        return {
          ...inv,
          status: 'paid',
          paidDate: paymentData.paidDate,
          hasDocument: Boolean(paymentData.receiptName || inv.hasDocument),
          documentName: paymentData.receiptName || inv.documentName,
        };
      })
    );
    setSelectedInvoiceForDetails((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            status: 'paid',
            paidDate: paymentData.paidDate,
            hasDocument: Boolean(paymentData.receiptName || prev.hasDocument),
            documentName: paymentData.receiptName || prev.documentName,
          }
        : null
    );
  };

  const handleRemoveReceipt = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, hasDocument: false, documentName: undefined } : inv
      )
    );
    setSelectedInvoiceForDetails((prev) =>
      prev && prev.id === id
        ? { ...prev, hasDocument: false, documentName: undefined }
        : null
    );
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleMarkSelectedAsPaid = () => {
    setInvoices((prev) =>
      prev.map((inv) =>
        selectedIds.includes(inv.id)
          ? { ...inv, status: 'paid', paidDate: '2026-10-15' }
          : inv
      )
    );
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const headers = ['Código', 'Cliente', 'Processo CNJ', 'Tipo', 'Advogado', 'Valor', 'Vencimento', 'Status'];
    const rows = filteredInvoices.map((inv) => [
      inv.reference,
      `"${inv.clientName.replace(/"/g, '""')}"`,
      inv.processNumber,
      inv.feeType === 'contractual' ? 'Contratual' : 'Sucumbencial',
      `"${inv.lawyerName}"`,
      inv.amount.toFixed(2),
      inv.dueDate,
      inv.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `honorarios-diafanis-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddNewInvoice = (newFee: Omit<Invoice, 'id' | 'reference'>) => {
    const newInvoice: Invoice = {
      ...newFee,
      id: `inv-${Date.now()}`,
      reference: `HON-2026-${String(invoices.length + 1).padStart(3, '0')}`,
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    setCurrentPage(1);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-headline text-foreground tracking-tight">
          Gestão Financeira
        </h1>
        <p className="text-xs text-muted-foreground">
          Acompanhamento de fluxo de caixa, honorários contratuais e sucumbenciais da banca.
        </p>
      </div>

      {/* Visão de Fluxo / RF13 */}
      <FinancialSummary summary={summary} />

      {/* Tabela de Cobranças / RF12 */}
      <GlassPanel className="p-5 md:p-6 space-y-4">
        {/* Bulk action banner when rows are selected */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs animate-in fade-in">
            <span className="font-medium text-foreground">
              {selectedIds.length} {selectedIds.length === 1 ? 'cobrança selecionada' : 'cobranças selecionadas'}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkSelectedAsPaid}
                className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Marcar selecionadas como pagas</span>
              </Button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="p-1 text-muted-foreground hover:text-foreground rounded"
                title="Limpar seleção"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <FinancialFilters
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            setCurrentPage(1);
          }}
          counts={counts}
          searchQuery={searchQuery}
          onSearchChange={(query) => {
            setSearchQuery(query);
            setCurrentPage(1);
          }}
          feeTypeFilter={feeTypeFilter}
          onFeeTypeChange={(type) => {
            setFeeTypeFilter(type);
            setCurrentPage(1);
          }}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={(field, order) => {
            setSortField(field);
            setSortOrder(order);
          }}
          onNewInvoice={() => setIsNewModalOpen(true)}
          onExport={handleExportCSV}
        />

        <FinancialTable
          invoices={paginatedInvoices}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onToggleStatus={handleToggleStatus}
          onDeleteInvoice={handleDeleteInvoice}
          onViewInvoiceDetails={(inv) => setSelectedInvoiceForDetails(inv)}
        />

        <FinancialPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredInvoices.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </GlassPanel>

      {/* Modal: Cadastro de Novo Honorário (RF12) */}
      <NewInvoiceModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        nextReferenceCode={`HON-2026-${String(invoices.length + 1).padStart(3, '0')}`}
        onSubmit={handleAddNewInvoice}
      />

      {/* Modal: Detalhes do Honorário */}
      <InvoiceDetailsModal
        invoice={selectedInvoiceForDetails}
        isOpen={Boolean(selectedInvoiceForDetails)}
        onClose={() => setSelectedInvoiceForDetails(null)}
        onToggleStatus={handleToggleStatus}
        onRegisterPayment={handleRegisterPayment}
        onRemoveReceipt={handleRemoveReceipt}
      />
    </div>
  );
};
