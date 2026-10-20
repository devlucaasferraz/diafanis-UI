import * as React from 'react';
import { Search, X, Plus, Download } from 'lucide-react';
import { Button } from '@/features/ui/button';
import { InvoiceFilterTab, InvoiceSortField, SortOrder, FeeType } from './types';
import { cn } from '@/shared/cn';

interface FinancialFiltersProps {
  currentTab: InvoiceFilterTab;
  onTabChange: (tab: InvoiceFilterTab) => void;
  counts: {
    all: number;
    paid: number;
    pending: number;
    overdue: number;
  };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  feeTypeFilter: 'all' | FeeType | string;
  onFeeTypeChange: (type: 'all' | FeeType | string) => void;
  sortField: InvoiceSortField;
  sortOrder: SortOrder;
  onSortChange: (field: InvoiceSortField, order: SortOrder) => void;
  onNewInvoice: () => void;
  onExport: () => void;
}

export const FinancialFilters: React.FC<FinancialFiltersProps> = ({
  currentTab,
  onTabChange,
  counts,
  searchQuery,
  onSearchChange,
  feeTypeFilter,
  onFeeTypeChange,
  sortField,
  sortOrder,
  onSortChange,
  onNewInvoice,
  onExport,
}) => {
  const tabs: { id: InvoiceFilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'Todos', count: counts.all },
    { id: 'PAGO', label: 'Pagos', count: counts.paid },
    { id: 'PENDENTE', label: 'Pendentes', count: counts.pending },
    { id: 'VENCIDO', label: 'Vencidos', count: counts.overdue },
  ];

  return (
    <div className="space-y-4">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold font-headline text-foreground">
              Cobranças e Honorários
            </h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
              {counts.all} {counts.all === 1 ? 'registro' : 'registros'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Exportar listagem em planilha CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Exportar</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onNewInvoice}
            className="flex items-center gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Honorário</span>
          </Button>
        </div>
      </div>

      {/* Tabs and Search / Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border/40 pb-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none shrink-0">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all select-none whitespace-nowrap',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-48 lg:w-52 min-w-[170px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar descrição ou cliente..."
              className="w-full h-8 pl-7 pr-7 rounded-lg border border-border/70 bg-background text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded"
                title="Limpar busca"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Fee Type Filter */}
          <select
            aria-label="Filtrar por tipo de honorário"
            value={feeTypeFilter}
            onChange={(e) => onFeeTypeChange(e.target.value as 'all' | FeeType)}
            className="h-8 px-2 rounded-lg border border-border/70 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0"
          >
            <option value="all">Tipos</option>
            <option value="CONTRATUAL">Contratual</option>
            <option value="SUCUMBENCIAL">Sucumbencial</option>
            <option value="RECEITA">Receita</option>
            <option value="DESPESA">Despesa</option>
          </select>

          {/* Sort selector */}
          <select
            aria-label="Ordenar cobranças"
            value={`${sortField}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-') as [InvoiceSortField, SortOrder];
              onSortChange(field, order);
            }}
            className="h-8 px-2 rounded-lg border border-border/70 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0"
          >
            <option value="data_vencimento-desc">Mais recentes</option>
            <option value="data_vencimento-asc">Mais antigos</option>
            <option value="valor-desc">Maior valor</option>
            <option value="valor-asc">Menor valor</option>
            <option value="descricao-asc">Descrição (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
