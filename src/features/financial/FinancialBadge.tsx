import * as React from 'react';
import { cn } from '@/shared/cn';
import { InvoiceStatus, FeeType } from './types';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface FinancialStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const statusConfig: Record<
  InvoiceStatus,
  { label: string; bg: string; text: string; border: string; iconColor: string; icon: React.ElementType }
> = {
  paid: {
    label: 'Pago',
    bg: 'bg-emerald-500/[0.08] dark:bg-emerald-400/[0.12]',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/20 dark:border-emerald-400/25',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pendente',
    bg: 'bg-amber-500/[0.08] dark:bg-amber-400/[0.12]',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-500/20 dark:border-amber-400/25',
    iconColor: 'text-amber-600 dark:text-amber-400',
    icon: Clock,
  },
  overdue: {
    label: 'Vencido',
    bg: 'bg-rose-500/[0.08] dark:bg-rose-400/[0.12]',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-500/20 dark:border-rose-400/25',
    iconColor: 'text-rose-600 dark:text-rose-400',
    icon: AlertCircle,
  },
};

export const FinancialStatusBadge: React.FC<FinancialStatusBadgeProps> = ({
  status,
  className,
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none transition-colors backdrop-blur-xs',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <Icon className={cn('h-3 w-3 shrink-0', config.iconColor)} />
      <span>{config.label}</span>
    </span>
  );
};

interface FeeTypeBadgeProps {
  feeType: FeeType;
  className?: string;
}

export const FeeTypeBadge: React.FC<FeeTypeBadgeProps> = ({ feeType, className }) => {
  const isContractual = feeType === 'contractual';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border border-border/60 bg-muted/40 text-muted-foreground select-none',
        className
      )}
    >
      {isContractual ? 'Contratual' : 'Sucumbencial'}
    </span>
  );
};
