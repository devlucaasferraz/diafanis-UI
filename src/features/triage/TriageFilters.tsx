import * as React from 'react';
import {
  Search,
  X,
  Plus,
  Archive,
  Filter,
} from 'lucide-react';
import { Button } from '@/features/ui/button';
import { TriageFilterTab, ProcessFilterType } from './types';
import { cn } from '@/shared/cn';

export interface TriageFiltersData {
  inCollectionCount: number;
  readyForAnalysisCount: number;
  manualInterventionCount: number;
  leadsCount: number;
  ongoingCount: number;
  totalActive: number;
  archivedCount: number;
}

export interface TriageFiltersProps {
  metrics: TriageFiltersData;
  currentTab: TriageFilterTab;
  onTabChange: (tab: TriageFilterTab) => void;
  processFilter: ProcessFilterType;
  onProcessFilterChange: (type: ProcessFilterType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showArchived: boolean;
  onToggleShowArchived: () => void;
  onOpenNewTriageModal: () => void;
  className?: string;
}

export const TriageFilters: React.FC<TriageFiltersProps> = ({
  metrics,
  currentTab,
  onTabChange,
  processFilter,
  onProcessFilterChange,
  searchQuery,
  onSearchChange,
  showArchived,
  onToggleShowArchived,
  onOpenNewTriageModal,
  className,
}) => {
  const statusTabs: { id: TriageFilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'Todos', count: metrics.totalActive },
    {
      id: 'collection',
      label: 'Em Coleta (Bot)',
      count: metrics.inCollectionCount,
    },
    {
      id: 'ready',
      label: 'Prontos p/ Análise',
      count: metrics.readyForAnalysisCount,
    },
    {
      id: 'manual',
      label: 'Intervenção Manual',
      count: metrics.manualInterventionCount,
    },
  ];

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Nível 1: Abas de Status da Coleta (Esquerda) + Botão Nova Sessão (Direita) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-border/40">
        <div
          className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none"
          role="tablist"
          aria-label="Filtros de status da triagem"
        >
          {statusTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
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

        <Button
          variant="default"
          size="sm"
          onClick={onOpenNewTriageModal}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm self-start sm:self-auto shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Nova Sessão de Coleta</span>
        </Button>
      </div>

      {/* Nível 2: Busca Rápida (Esquerda) + Filtro de Processo & Arquivados (Direita) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Busca Rápida */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por cliente, CPF ou nº do processo..."
            aria-label="Buscar por nome do cliente, CPF ou número do processo"
            className="w-full h-8 pl-8 pr-7 rounded-lg border border-border/70 bg-background text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded"
              title="Limpar busca"
              aria-label="Limpar busca"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Controles da Direita: Filtro de Fase Processual + Arquivados */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0 hidden sm:block" />
            <select
              aria-label="Filtrar por fase processual"
              value={processFilter}
              onChange={(e) =>
                onProcessFilterChange(e.target.value as ProcessFilterType)
              }
              className="h-8 px-2.5 rounded-lg border border-border/70 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0"
            >
              <option value="all">Todas as Fases</option>
              <option value="leads">
                Pré-processuais (Leads) ({metrics.leadsCount})
              </option>
              <option value="ongoing">
                Em Andamento (Processos) ({metrics.ongoingCount})
              </option>
            </select>
          </div>

          {metrics.archivedCount > 0 && (
            <Button
              variant={showArchived ? 'secondary' : 'outline'}
              size="sm"
              onClick={onToggleShowArchived}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg shrink-0 text-xs text-muted-foreground hover:text-foreground"
              title="Alternar exibição de triagens arquivadas"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>Arquivados ({metrics.archivedCount})</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
