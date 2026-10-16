import * as React from 'react';
import { User, DollarSign, Scale, Calendar } from 'lucide-react';
import { cn } from '@/shared/cn';
import { ReferenceCounts } from './types';

export interface ReferenceIconsProps {
  references: ReferenceCounts;
  className?: string;
  size?: 'sm' | 'md';
}

interface RefConfig {
  key: keyof ReferenceCounts;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const REFERENCE_CONFIGS: RefConfig[] = [
  { key: 'client', label: 'Cliente', icon: User },
  { key: 'financial', label: 'Financeiro / Fatura', icon: DollarSign },
  { key: 'lawsuit', label: 'Processo', icon: Scale },
  { key: 'date', label: 'Data / Prazo', icon: Calendar },
];

/**
 * Retorna as classes visuais para as 3 cores de estado:
 * - count === 0: Cinza (Não definido)
 * - count === 1: Azul (Somente uma referência)
 * - count > 1: Amarelo (Mais de uma referência)
 */
export function getReferenceStatus(count: number) {
  if (count <= 0) {
    return {
      status: 'undefined',
      label: 'Não definido',
      colorClass:
        'bg-muted/40 text-muted-foreground/40 border-border/40 dark:bg-muted/20 dark:text-muted-foreground/30',
      badgeClass: 'text-muted-foreground/40',
    };
  }
  if (count === 1) {
    return {
      status: 'single',
      label: '1 referência',
      colorClass:
        'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-700/50',
      badgeClass: 'text-blue-600 dark:text-blue-400',
    };
  }
  return {
    status: 'multiple',
    label: `${count} referências`,
    colorClass:
      'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-700/50',
    badgeClass: 'text-amber-600 dark:text-amber-400',
  };
}

export const ReferenceIcons: React.FC<ReferenceIconsProps> = ({
  references,
  className,
  size = 'md',
}) => {
  const iconSizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const containerSizeClass = size === 'sm' ? 'p-1.5' : 'p-2';

  return (
    <div
      className={cn('inline-flex items-center gap-1.5', className)}
      aria-label="Referências usadas na mensagem"
    >
      {REFERENCE_CONFIGS.map((ref) => {
        const count = references[ref.key] || 0;
        const { status, label, colorClass } = getReferenceStatus(count);
        const Icon = ref.icon;

        return (
          <div
            key={ref.key}
            data-testid={`ref-icon-${ref.key}`}
            data-ref-status={status}
            data-ref-count={count}
            title={`${ref.label}: ${label}`}
            className={cn(
              'relative flex items-center justify-center rounded-lg border transition-all duration-150',
              containerSizeClass,
              colorClass
            )}
          >
            <Icon className={iconSizeClass} />
            {count > 1 && (
              <span className="absolute -bottom-1 -right-1 flex h-3.5 min-w-[0.875rem] px-0.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white shadow-xs">
                {count}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
