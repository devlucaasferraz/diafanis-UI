import * as React from 'react';
import {
  Bot,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
  Plus,
  Archive,
  Filter,
} from 'lucide-react';
import { GlassPanel } from '@/features/ui/glass-panel';
import { Button } from '@/features/ui/button';
import { TriageFilterTab, ProcessFilterType } from './types';
import { cn } from '@/shared/cn';

interface TriageMetricsData {
  inCollectionCount: number;
  readyForAnalysisCount: number;
  manualInterventionCount: number;
  leadsCount: number;
  ongoingCount: number;
  totalActive: number;
  archivedCount: number;
}

interface TriageHeaderMetricsProps {
  metrics: TriageMetricsData;
  currentTab: TriageFilterTab;
  onTabChange: (tab: TriageFilterTab) => void;
  processFilter: ProcessFilterType;
  onProcessFilterChange: (type: ProcessFilterType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showArchived: boolean;
  onToggleShowArchived: () => void;
  onOpenNewTriageModal: () => void;
}

export const TriageHeaderMetrics: React.FC<TriageHeaderMetricsProps> = ({
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
    <div className="flex flex-col gap-4">
      {/* Page Header (sem o botão duplicado, agora na barra de filtros) */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-bold font-headline text-foreground tracking-tight">
          Central de Documentos & Triagem
        </h1>
        <p className="text-xs text-muted-foreground">
          Conferência de pacotes documentais do WhatsApp, validação de arquivos e intervenção assistida.
        </p>
      </div>

      {/* 3 Streamlined Indicator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Em Coleta (Bot WhatsApp) -> Agora filtra especificamente por 'collection' */}
        <GlassPanel
          onClick={() => onTabChange('collection')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTabChange('collection');
            }
          }}
          className={cn(
            'p-3.5 sm:p-4 cursor-pointer transition-all hover:border-primary/40 flex items-center justify-between gap-3',
            currentTab === 'collection' && 'ring-1 ring-primary/40 border-primary/40 bg-primary/[0.03]'
          )}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-muted-foreground">
              Em Coleta (Bot WhatsApp)
            </span>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span
                data-testid="metric-in-collection"
                className="text-2xl font-bold font-headline text-foreground"
              >
                {metrics.inCollectionCount}
              </span>
              <span className="text-[11px] text-muted-foreground">
                sessões ativas
              </span>
            </div>
          </div>
          <div className="size-9 rounded-xl bg-muted/80 border border-border/60 flex items-center justify-center text-muted-foreground shrink-0">
            <Bot className="size-4" />
          </div>
        </GlassPanel>

        {/* Card 2: Prontos para Análise */}
        <GlassPanel
          onClick={() => onTabChange('ready')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTabChange('ready');
            }
          }}
          className={cn(
            'p-3.5 sm:p-4 cursor-pointer transition-all hover:border-emerald-500/50 flex items-center justify-between gap-3',
            currentTab === 'ready' && 'ring-1 ring-emerald-500/40 border-emerald-500/40 bg-emerald-500/[0.03]'
          )}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Prontos para Análise
            </span>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span
                data-testid="metric-ready-analysis"
                className="text-2xl font-bold font-headline text-emerald-600 dark:text-emerald-400"
              >
                {metrics.readyForAnalysisCount}
              </span>
              <span className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                pacotes completos
              </span>
            </div>
          </div>
          <div className="size-9 rounded-xl bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="size-4" />
          </div>
        </GlassPanel>

        {/* Card 3: Intervenção Manual Necessária */}
        <GlassPanel
          onClick={() => onTabChange('manual')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTabChange('manual');
            }
          }}
          className={cn(
            'p-3.5 sm:p-4 cursor-pointer transition-all hover:border-amber-500/50 flex items-center justify-between gap-3',
            currentTab === 'manual' && 'ring-1 ring-amber-500/40 border-amber-500/40 bg-amber-500/[0.03]'
          )}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Intervenção Manual Necessária
            </span>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span
                data-testid="metric-manual-intervention"
                className="text-2xl font-bold font-headline text-amber-600 dark:text-amber-400"
              >
                {metrics.manualInterventionCount}
              </span>
              <span className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                apoio humano requerido
              </span>
            </div>
          </div>
          <div className="size-9 rounded-xl bg-amber-500/12 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="size-4" />
          </div>
        </GlassPanel>
      </div>

      {/* Filter Bar em 2 Níveis Estruturados */}
      <GlassPanel className="p-3.5 flex flex-col gap-3">
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
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all select-none whitespace-nowrap',
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
            className="gap-1.5 h-8.5 rounded-xl text-xs shadow-sm self-start sm:self-auto shrink-0"
          >
            <Plus className="size-3.5" />
            <span>Nova Sessão de Coleta</span>
          </Button>
        </div>

        {/* Nível 2: Busca Rápida (Esquerda) + Filtro de Processo & Arquivados (Direita) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Busca Rápida */}
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por cliente, CPF ou nº do processo..."
              aria-label="Buscar por nome do cliente, CPF ou número do processo"
              className="w-full h-8.5 pl-8 pr-8 rounded-xl border border-border/70 bg-background text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded"
                title="Limpar busca"
                aria-label="Limpar busca"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Controles da Direita: Filtro de Fase Processual + Arquivados */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="size-3.5 text-muted-foreground shrink-0 hidden sm:block" />
              <select
                aria-label="Filtrar por fase processual"
                value={processFilter}
                onChange={(e) =>
                  onProcessFilterChange(e.target.value as ProcessFilterType)
                }
                className="h-8.5 rounded-xl border border-border/70 bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
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
                className="gap-1.5 h-8.5 rounded-xl shrink-0 text-xs"
                title="Alternar exibição de triagens arquivadas"
              >
                <Archive className="size-3.5" />
                <span>Arquivados ({metrics.archivedCount})</span>
              </Button>
            )}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};
