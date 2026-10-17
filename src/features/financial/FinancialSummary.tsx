import * as React from 'react';
import { GlassPanel } from '@/features/ui/glass-panel';
import { FinancialSummaryData } from './types';
import { formatCurrency } from './utils';

interface FinancialSummaryProps {
  summary: FinancialSummaryData;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ summary }) => {
  const {
    totalBilled,
    totalEstimated,
    paidCount,
    paidAmount,
    pendingCount,
    pendingAmount,
    overdueCount,
    overdueAmount,
  } = summary;

  const paidPercent = totalEstimated > 0 ? (paidAmount / totalEstimated) * 100 : 0;
  const pendingPercent = totalEstimated > 0 ? (pendingAmount / totalEstimated) * 100 : 0;
  const overduePercent = totalEstimated > 0 ? (overdueAmount / totalEstimated) * 100 : 0;

  return (
    <GlassPanel className="p-5 md:p-6 mb-6">
      <div className="flex flex-col gap-4">
        {/* Title and High-level stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/30 pb-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base sm:text-lg font-bold font-headline text-foreground tracking-tight">
              Fluxo de Honorários
            </h2>
            <p className="text-xs text-muted-foreground">
              Total faturado:{' '}
              <span className="font-semibold text-foreground">
                {formatCurrency(totalBilled)}
              </span>{' '}
              <span className="text-[11px] text-muted-foreground/80">
                ({paidCount} {paidCount === 1 ? 'cobrança liquidada' : 'cobranças liquidadas'})
              </span>
            </p>
          </div>

          <div className="text-left sm:text-right self-start sm:self-auto">
            <span className="block text-[11px] text-muted-foreground font-medium">
              Total previsto (Mês)
            </span>
            <span className="text-base font-bold font-headline text-foreground">
              {formatCurrency(totalEstimated)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div
            className="h-3 w-full rounded-full bg-muted/80 overflow-hidden flex shadow-inner border border-border/30"
            role="progressbar"
            aria-label="Distribuição do fluxo de honorários"
            aria-valuenow={Math.round(paidPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {paidPercent > 0 && (
              <div
                style={{ width: `${paidPercent}%` }}
                title={`Recebido: ${paidPercent.toFixed(1)}%`}
                className="bg-emerald-500 h-full transition-all duration-500 ease-out"
              />
            )}
            {pendingPercent > 0 && (
              <div
                style={{ width: `${pendingPercent}%` }}
                title={`Pendente: ${pendingPercent.toFixed(1)}%`}
                className="bg-amber-400 h-full transition-all duration-500 ease-out border-l border-background/20"
              />
            )}
            {overduePercent > 0 && (
              <div
                style={{ width: `${overduePercent}%` }}
                title={`Vencido: ${overduePercent.toFixed(1)}%`}
                className="bg-rose-500 h-full transition-all duration-500 ease-out border-l border-background/20"
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground">Pago:</span>
                <span className="text-muted-foreground">
                  {paidCount} {paidCount === 1 ? 'honorário' : 'honorários'}
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(paidAmount)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0" />
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground">A vencer:</span>
                <span className="text-muted-foreground">
                  {pendingCount} {pendingCount === 1 ? 'honorário' : 'honorários'}
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {formatCurrency(pendingAmount)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground">Vencido:</span>
                <span className="text-muted-foreground">
                  {overdueCount} {overdueCount === 1 ? 'honorário' : 'honorários'}
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {formatCurrency(overdueAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
};
