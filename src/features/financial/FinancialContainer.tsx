import * as React from 'react';
import { FinancialSummary } from './FinancialSummary';
import { FinancialFilters } from './FinancialFilters';
import { FinancialTable } from './FinancialTable';
import { FinancialPagination } from './FinancialPagination';
import { NewInvoiceModal } from './NewInvoiceModal';
import { InvoiceDetailsModal } from './InvoiceDetailsModal';
import {
  listarFaturas,
  listarClientes,
  criarFatura,
  atualizarFatura,
  deletarFatura,
  obterFaturaPorId,
} from './api';
import {
  Cliente,
  FaturaPayload,
  Invoice,
  InvoiceFilterTab,
  FeeType,
  InvoiceSortField,
  SortOrder,
} from './types';
import { calculateSummary, formatFeeTypeLabel } from './utils';
import { GlassPanel } from '@/features/ui/glass-panel';
import { CheckCircle2, X, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/features/ui/button';

export const FinancialContainer: React.FC = () => {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const [currentTab, setCurrentTab] = React.useState<InvoiceFilterTab>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [feeTypeFilter, setFeeTypeFilter] = React.useState<'all' | FeeType | string>('all');
  const [sortField, setSortField] = React.useState<InvoiceSortField>('data_vencimento');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);

  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = React.useState<Invoice | null>(null);
  const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] =
    React.useState<Invoice | null>(null);

  const pageSize = 10;

  const clientesMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of clientes) {
      map[c.id] = c.nome;
    }
    return map;
  }, [clientes]);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      let fetchedClientes: Cliente[] = [];
      try {
        fetchedClientes = await listarClientes();
        setClientes(fetchedClientes);
      } catch {
        // Segue carregando faturas mesmo se a listagem de clientes falhar
      }

      const map: Record<string, string> = {};
      for (const c of fetchedClientes) {
        map[c.id] = c.nome;
      }

      const fetchedFaturas = await listarFaturas(map);
      setInvoices(fetchedFaturas);
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Não foi possível carregar as faturas da API.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter and sort invoices
  const filteredInvoices = React.useMemo(() => {
    return invoices
      .filter((inv) => {
        if (currentTab !== 'all' && inv.status !== currentTab) return false;
        if (feeTypeFilter !== 'all' && inv.tipo !== feeTypeFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchDesc = (inv.descricao || '').toLowerCase().includes(q);
          const matchClient = (inv.clienteNome || inv.cliente || '').toLowerCase().includes(q);
          const matchProcess = (inv.processo || '').toLowerCase().includes(q);
          const matchId = inv.id.toLowerCase().includes(q);
          if (!matchDesc && !matchClient && !matchProcess && !matchId) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let compare = 0;
        if (sortField === 'data_vencimento') {
          compare = a.data_vencimento.localeCompare(b.data_vencimento);
        } else if (sortField === 'valor') {
          compare = a.valor - b.valor;
        } else if (sortField === 'descricao') {
          compare = (a.descricao || '').localeCompare(b.descricao || '');
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

  const handleToggleStatus = async (id: string) => {
    const target = invoices.find((inv) => inv.id === id);
    if (!target) return;

    const newStatus = target.status === 'PAGO' ? 'PENDENTE' : 'PAGO';
    const newPaidDate =
      newStatus === 'PAGO' ? new Date().toISOString().split('T')[0] : null;

    setApiError(null);
    try {
      const updated = await atualizarFatura(
        id,
        { status: newStatus, data_pagamento: newPaidDate },
        clientesMap
      );
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
      if (selectedInvoiceForDetails?.id === id) {
        setSelectedInvoiceForDetails(updated);
      }
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Erro ao atualizar o status da fatura.'
      );
    }
  };

  const handleRegisterPayment = async (
    id: string,
    paymentData: { data_pagamento: string }
  ) => {
    setApiError(null);
    try {
      const updated = await atualizarFatura(
        id,
        { status: 'PAGO', data_pagamento: paymentData.data_pagamento },
        clientesMap
      );
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
      setSelectedInvoiceForDetails((prev) => (prev && prev.id === id ? updated : prev));
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Erro ao registrar o pagamento da fatura.'
      );
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    setApiError(null);
    try {
      await deletarFatura(id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      if (selectedInvoiceForDetails?.id === id) {
        setSelectedInvoiceForDetails(null);
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erro ao excluir a fatura.');
    }
  };

  const handleMarkSelectedAsPaid = async () => {
    const today = new Date().toISOString().split('T')[0];
    setApiError(null);
    try {
      const updatedItems = await Promise.all(
        selectedIds.map((id) =>
          atualizarFatura(id, { status: 'PAGO', data_pagamento: today }, clientesMap)
        )
      );
      const updatedById = new Map(updatedItems.map((item) => [item.id, item]));
      setInvoices((prev) => prev.map((inv) => updatedById.get(inv.id) || inv));
      setSelectedIds([]);
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Erro ao atualizar faturas selecionadas.'
      );
    }
  };

  const handleViewInvoiceDetails = async (inv: Invoice) => {
    setSelectedInvoiceForDetails(inv);
    try {
      const fresh = await obterFaturaPorId(inv.id, clientesMap);
      setInvoices((prev) => prev.map((item) => (item.id === fresh.id ? fresh : item)));
      setSelectedInvoiceForDetails((prev) => (prev && prev.id === fresh.id ? fresh : prev));
    } catch {
      // Mantém os dados locais já carregados caso a busca individual falhe
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Descrição',
      'Cliente',
      'Processo',
      'Tipo',
      'Valor',
      'Vencimento',
      'Pagamento',
      'Status',
    ];
    const rows = filteredInvoices.map((inv) => [
      inv.id,
      `"${(inv.descricao || '').replace(/"/g, '""')}"`,
      `"${(inv.clienteNome || inv.cliente || '').replace(/"/g, '""')}"`,
      inv.processo || '',
      formatFeeTypeLabel(inv.tipo),
      inv.valor.toFixed(2),
      inv.data_vencimento,
      inv.data_pagamento || '',
      inv.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `honorarios-diafanis-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveInvoice = async (payload: FaturaPayload) => {
    setApiError(null);
    if (invoiceToEdit) {
      const updated = await atualizarFatura(invoiceToEdit.id, payload, clientesMap);
      setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
      if (selectedInvoiceForDetails?.id === updated.id) {
        setSelectedInvoiceForDetails(updated);
      }
      setInvoiceToEdit(null);
    } else {
      const created = await criarFatura(payload, clientesMap);
      setInvoices((prev) => [created, ...prev]);
      setCurrentPage(1);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-headline text-foreground tracking-tight">
            Gestão Financeira
          </h1>
          <p className="text-xs text-muted-foreground">
            Acompanhamento de fluxo de caixa, honorários contratuais e sucumbenciais da banca.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={isLoading}
          className="h-8 text-xs gap-1.5 self-start sm:self-auto text-muted-foreground hover:text-foreground"
          title="Recarregar faturas da API"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </Button>
      </div>

      {/* API Error Banner */}
      {apiError && (
        <div
          role="alert"
          className="flex items-center justify-between p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{apiError}</span>
          </div>
          <button
            type="button"
            onClick={() => setApiError(null)}
            className="p-1 hover:bg-destructive/10 rounded"
            aria-label="Fechar alerta de erro"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Visão de Fluxo / RF13 */}
      <FinancialSummary summary={summary} />

      {/* Tabela de Cobranças / RF12 */}
      <GlassPanel className="p-5 md:p-6 space-y-4">
        {/* Bulk action banner when rows are selected */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs animate-in fade-in">
            <span className="font-medium text-foreground">
              {selectedIds.length}{' '}
              {selectedIds.length === 1 ? 'cobrança selecionada' : 'cobranças selecionadas'}
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
          onNewInvoice={() => {
            setInvoiceToEdit(null);
            setIsFormModalOpen(true);
          }}
          onExport={handleExportCSV}
        />

        {isLoading ? (
          <div className="h-[565px] min-h-[565px] flex flex-col items-center justify-center text-center px-4">
            <RefreshCw className="h-6 w-6 animate-spin text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Carregando faturas da API...</p>
          </div>
        ) : (
          <FinancialTable
            invoices={paginatedInvoices}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onToggleStatus={handleToggleStatus}
            onDeleteInvoice={handleDeleteInvoice}
            onViewInvoiceDetails={handleViewInvoiceDetails}
            onEditInvoice={(inv) => {
              setInvoiceToEdit(inv);
              setIsFormModalOpen(true);
            }}
          />
        )}

        <FinancialPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredInvoices.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </GlassPanel>

      {/* Modal: Cadastro / Edição de Honorário (RF12) */}
      <NewInvoiceModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setInvoiceToEdit(null);
        }}
        clientes={clientes}
        invoiceToEdit={invoiceToEdit}
        onSubmit={handleSaveInvoice}
      />

      {/* Modal: Detalhes do Honorário */}
      <InvoiceDetailsModal
        invoice={selectedInvoiceForDetails}
        isOpen={Boolean(selectedInvoiceForDetails)}
        onClose={() => setSelectedInvoiceForDetails(null)}
        onToggleStatus={handleToggleStatus}
        onRegisterPayment={handleRegisterPayment}
        onEditInvoice={(inv) => {
          setInvoiceToEdit(inv);
          setIsFormModalOpen(true);
        }}
      />
    </div>
  );
};
