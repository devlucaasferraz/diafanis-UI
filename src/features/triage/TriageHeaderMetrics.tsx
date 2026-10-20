import * as React from 'react';
import {
  Bot,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { GlassPanel } from '@/features/ui/glass-panel';
import { TriageFilterTab } from './types';
import { cn } from '@/shared/cn';

export interface TriageMetricsData {
  inCollectionCount: number;
  readyForAnalysisCount: number;
  manualInterventionCount: number;
  leadsCount: number;
  ongoingCount: number;
  totalActive: number;
  archivedCount: number;
}

export interface TriageHeaderMetricsProps {
  metrics: TriageMetricsData;
  currentTab: TriageFilterTab;
  onTabChange: (tab: TriageFilterTab) => void;
}

export const TriageHeaderMetrics: React.FC<TriageHeaderMetricsProps> = ({
  metrics,
  currentTab,
  onTabChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
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
        {/* Card 1: Em Coleta (Bot WhatsApp) */}
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
    </div>
  );
};
