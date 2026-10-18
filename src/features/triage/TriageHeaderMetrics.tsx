import * as React from 'react';
import {
  Bot,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
  Plus,
  Archive,
} from 'lucide-react';
import { GlassPanel } from '@/features/ui/glass-panel';
import { Button } from '@/features/ui/button';
import { TriageFilterTab } from './types';
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
  searchQuery,
  onSearchChange,
  showArchived,
  onToggleShowArchived,
  onOpenNewTriageModal,
}) => {
  const tabs: { id: TriageFilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'Todos', count: metrics.totalActive },
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
    {
      id: 'leads',
      label: 'Pré-processuais (Leads)',
      count: metrics.leadsCount,
    },
    {
      id: 'ongoing',
      label: 'Em Andamento (Processos)',
      count: metrics.ongoingCount,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-headline text-foreground tracking-tight">
            Central de Documentos & Triagem
          </h1>
          <p className="text-xs text-muted-foreground">
            Conferência de pacotes documentais coletados via WhatsApp Bot, validação de arquivos e intervenção assistida.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="default"
            size="default"
            onClick={onOpenNewTriageModal}
            className="gap-2 shadow-sm"
          >
            <Plus className="size-4" />
            <span>Nova Sessão de Coleta</span>
          </Button>
        </div>
      </div>

      {/* 3 Indicator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Em Coleta (Bot WhatsApp) */}
        <GlassPanel
          onClick={() => onTabChange('all')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTabChange('all');
            }
          }}
          className="p-5 cursor-pointer transition-all hover:border-primary/40 flex items-start justify-between gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">
              Em Coleta (Bot WhatsApp)
            </span>
            <div className="flex items-baseline gap-2">
              <span
                data-testid="metric-in-collection"
                className="text-3xl font-bold font-headline text-foreground"
              >
                {metrics.inCollectionCount}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                sessões ativas no fluxo automático
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="size-2 rounded-full bg-primary/80" />
              <span className="text-[11px] text-muted-foreground">
                Aguardando envio de documentos pelos clientes
              </span>
            </div>
          </div>
          <div className="size-11 rounded-2xl bg-muted/80 border border-border/60 flex items-center justify-center text-muted-foreground shrink-0">
            <Bot className="size-5" />
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
            'p-5 cursor-pointer transition-all hover:border-emerald-500/50 flex items-start justify-between gap-4',
            currentTab === 'ready' && 'ring-1 ring-emerald-500/40 border-emerald-500/40'
          )}
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Prontos para Análise
            </span>
            <div className="flex items-baseline gap-2">
              <span
                data-testid="metric-ready-analysis"
                className="text-3xl font-bold font-headline text-emerald-600 dark:text-emerald-400"
              >
                {metrics.readyForAnalysisCount}
              </span>
              <span className="text-[11px] font-medium text-emerald-700/80 dark:text-emerald-300/80">
                pacotes completos recebidos
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-muted-foreground">
                Disponíveis para validação e aprovação
              </span>
            </div>
          </div>
          <div className="size-11 rounded-2xl bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="size-5" />
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
            'p-5 cursor-pointer transition-all hover:border-amber-500/50 flex items-start justify-between gap-4',
            currentTab === 'manual' && 'ring-1 ring-amber-500/40 border-amber-500/40'
          )}
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Intervenção Manual Necessária
            </span>
            <div className="flex items-baseline gap-2">
              <span
                data-testid="metric-manual-intervention"
                className="text-3xl font-bold font-headline text-amber-600 dark:text-amber-400"
              >
                {metrics.manualInterventionCount}
              </span>
              <span className="text-[11px] font-medium text-amber-700/80 dark:text-amber-300/80">
                clientes aguardando apoio humano
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[11px] text-muted-foreground">
                Dificuldade com Gov.br ou documento ilegível
              </span>
            </div>
          </div>
          <div className="size-11 rounded-2xl bg-amber-500/12 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="size-5" />
          </div>
        </GlassPanel>
      </div>

      {/* Filter Bar */}
      <GlassPanel className="p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div
          className="flex items-center gap-1 overflow-x-auto pb-1 xl:pb-0 scrollbar-none"
          role="tablist"
          aria-label="Filtros de triagem"
        >
          {tabs.map((tab) => {
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

        {/* Search & Archive Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-72 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por cliente, CPF ou nº do processo..."
              aria-label="Buscar por nome do cliente, CPF ou número do processo"
              className="w-full h-9 pl-8 pr-8 rounded-xl border border-border/70 bg-background text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
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

          {metrics.archivedCount > 0 && (
            <Button
              variant={showArchived ? 'secondary' : 'outline'}
              size="sm"
              onClick={onToggleShowArchived}
              className="gap-1.5 h-9 rounded-xl shrink-0"
              title="Alternar exibição de triagens arquivadas"
            >
              <Archive className="size-3.5" />
              <span>Arquivados ({metrics.archivedCount})</span>
            </Button>
          )}
        </div>
      </GlassPanel>
    </div>
  );
};
