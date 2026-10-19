import { AlertTriangle } from "lucide-react";

interface HolidayNoticeProps {
  courtLabel: string;
  className?: string;
}

/**
 * Não presume que uma lista embutida de feriados esteja completa.
 * Em produção, conecte este aviso a uma fonte oficial e versionada do tribunal.
 */
export default function HolidayNotice({ courtLabel, className }: HolidayNoticeProps) {
  return (
    <aside
      className={`deadline-notice rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200 transition-all ${className || ""}`}
      role="note"
      aria-live="polite"
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <strong className="font-semibold text-xs text-amber-950 dark:text-amber-100">
            Confira o calendário forense
          </strong>
          <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
            A simulação exclui sábados e domingos na contagem de dias úteis, mas não
            consulta automaticamente feriados locais, suspensões de expediente ou
            indisponibilidades do sistema eletrônico de <strong>{courtLabel}</strong>. Valide o
            calendário oficial antes de utilizar a data em um processo real.
          </p>
        </div>
      </div>
    </aside>
  );
}

