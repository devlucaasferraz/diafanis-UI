import * as React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Bot,
  Clock,
  XCircle,
  FileSearch,
  Scale,
  Sparkles,
  Archive,
} from 'lucide-react';
import { DocumentStatus, Processo, TriageStatus } from './types';
import { summarizeCnj } from './mock-data';
import { cn } from '@/shared/cn';

interface TriageStatusBadgeProps {
  status: TriageStatus;
  botPaused?: boolean;
  className?: string;
}

export const TriageStatusBadge: React.FC<TriageStatusBadgeProps> = ({
  status,
  botPaused,
  className,
}) => {
  const config: Record<
    TriageStatus,
    {
      label: string;
      icon: React.ElementType;
      classes: string;
      dotClass: string;
    }
  > = {
    'Pronto para Análise': {
      label: 'Pronto para Análise',
      icon: CheckCircle2,
      classes:
        'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
      dotClass: 'bg-emerald-500',
    },
    'Intervenção Manual': {
      label: 'Intervenção Manual',
      icon: AlertTriangle,
      classes:
        'bg-amber-500/12 text-amber-800 dark:text-amber-300 border-amber-500/30',
      dotClass: 'bg-amber-500',
    },
    'Coleta em Andamento': {
      label: 'Coleta em Andamento',
      icon: Bot,
      classes:
        'bg-primary/10 text-primary dark:text-secondary border-primary/25',
      dotClass: 'bg-primary',
    },
    Concluído: {
      label: 'Concluído',
      icon: Archive,
      classes: 'bg-muted text-muted-foreground border-border/60',
      dotClass: 'bg-muted-foreground',
    },
  };

  const current = config[status];
  const Icon = current.icon;

  return (
    <div className={cn('inline-flex flex-col items-start gap-1', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none whitespace-nowrap',
          current.classes
        )}
      >
        <Icon className="size-3.5 shrink-0" />
        <span>{current.label}</span>
      </span>
      {botPaused && status !== 'Concluído' && (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-400 pl-1">
          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
          Atendimento Humano Ativo
        </span>
      )}
    </div>
  );
};

interface DocumentChecklistTagProps {
  tipoDocumento: string;
  status: DocumentStatus;
  motivoReprovacao?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const DocumentChecklistTag: React.FC<DocumentChecklistTagProps> = ({
  tipoDocumento,
  status,
  motivoReprovacao,
  onClick,
}) => {
  const isApprovedOrReceived =
    status === 'Aprovado' || status === 'Em Análise';
  const isRejected = status === 'Reprovado/Ilegível';

  const shortLabel = React.useMemo(() => {
    const map: Record<string, string> = {
      'RG / CPF': 'RG/CPF',
      'RG / CPF do Requerente': 'RG/CPF',
      'Comprovante de Residência': 'Comprovante',
      'Comprovante de Residência Atualizado': 'Comprovante',
      'Laudo Médico / CadÚnico': 'Laudo/CadÚnico',
      'Extrato CNIS / Gov.br': 'CNIS',
      'Extrato CNIS Completo': 'CNIS',
      'Autodeclaração Rural / Bloco de Notas': 'Bloco Rural',
      'Laudo Médico Detalhado (CID)': 'Laudo Médico',
      'Termo de Rescisão (TRCT)': 'TRCT',
      'Extrato Analítico do FGTS': 'FGTS',
      'Certidão de Casamento c/ Qualificação Rural': 'Cert. Casamento',
      'Declaração Sindicato Trabalhadores Rurais': 'Decl. Sindicato',
      'Holerites / Contracheques': 'Holerites',
      'Perfil Profissiográfico Previdenciário (PPP)': 'PPP',
    };
    return map[tipoDocumento] || tipoDocumento;
  }, [tipoDocumento]);

  const statusClasses = isApprovedOrReceived
    ? status === 'Aprovado'
      ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
      : 'bg-emerald-500/8 text-emerald-700/90 dark:text-emerald-300/90 border-emerald-500/20'
    : isRejected
    ? 'bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/30'
    : 'bg-muted/80 text-muted-foreground border-border/60';

  const Icon =
    status === 'Aprovado'
      ? CheckCircle2
      : status === 'Em Análise'
      ? FileSearch
      : isRejected
      ? XCircle
      : Clock;

  const tooltipText = motivoReprovacao
    ? `${tipoDocumento}: ${status} (${motivoReprovacao})`
    : `${tipoDocumento}: ${status}`;

  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltipText}
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-all hover:brightness-95',
        statusClasses
      )}
    >
      <Icon className="size-3 shrink-0" />
      <span className="truncate max-w-[110px]">{shortLabel}</span>
    </button>
  );
};

interface DocumentStatusPillProps {
  status: DocumentStatus;
}

export const DocumentStatusPill: React.FC<DocumentStatusPillProps> = ({
  status,
}) => {
  const styles: Record<
    DocumentStatus,
    { classes: string; icon: React.ElementType }
  > = {
    Aprovado: {
      classes:
        'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      icon: CheckCircle2,
    },
    'Em Análise': {
      classes:
        'bg-primary/10 text-primary dark:text-secondary border-primary/25',
      icon: FileSearch,
    },
    'Reprovado/Ilegível': {
      classes:
        'bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/30',
      icon: XCircle,
    },
    Pendente: {
      classes: 'bg-muted text-muted-foreground border-border/60',
      icon: Clock,
    },
  };

  const current = styles[status];
  const Icon = current.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap',
        current.classes
      )}
    >
      <Icon className="size-3 shrink-0" />
      <span>{status}</span>
    </span>
  );
};

interface ProcessLinkBadgeProps {
  processo: Processo | null;
}

export const ProcessLinkBadge: React.FC<ProcessLinkBadgeProps> = ({
  processo,
}) => {
  if (!processo) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary dark:text-secondary whitespace-nowrap"
        title="Caso em fase de triagem inicial sem processo distribuído"
      >
        <Sparkles className="size-3 shrink-0" />
        <span>Pré-processual / Novo Caso</span>
      </span>
    );
  }

  return (
    <div
      className="group relative inline-flex flex-col items-start"
      title={`CNJ: ${processo.numero_cnj} — ${processo.vara}`}
    >
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/60 px-2.5 py-1 font-mono text-[11px] font-semibold text-foreground whitespace-nowrap">
        <Scale className="size-3 text-muted-foreground shrink-0" />
        <span>{summarizeCnj(processo.numero_cnj)}</span>
      </span>
      <span className="text-[10px] text-muted-foreground truncate max-w-[165px] mt-0.5 pl-0.5">
        {processo.vara}
      </span>
    </div>
  );
};
