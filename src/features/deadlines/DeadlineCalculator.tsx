import { useMemo, useState, type FormEvent } from "react";
import CourtSelector from "./CourtSelector";
import HolidayNotice from "./HolidayNotice";
import { Button } from "@/features/ui/button";
import { GlassPanel } from "@/features/ui/glass-panel";
import { StatusBadge } from "@/features/ui/status-badge";
import {
  Calendar,
  CalendarPlus,
  Clock,
  Calculator,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  CheckCircle2,
  CalendarClock,
} from "lucide-react";
import {
  type CourtId,
  type DayCountType,
  type DeadlineResult,
  type DeadlineInput,
  COURTS,
  validateDeadlineInput,
} from "./schemas";

export interface DeadlineCalculatorProps {
  /** Opcional: recebe o resultado para integração com o calendário do app. */
  onCreateCalendarEvent?: (result: DeadlineResult) => void;
  className?: string;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T12:00:00Z`));
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Conta a partir do dia seguinte à data informada, excluindo o marco inicial.
 *
 * ATENÇÃO: é uma regra didática configurável/simplificada. O marco inicial
 * processual correto depende da modalidade de intimação e da legislação
 * aplicável. Feriados e suspensões não são inferidos nem inventados.
 */
export function calculateDeadline(input: DeadlineInput): DeadlineResult {
  const errors = validateDeadlineInput(input);
  if (errors.length) throw new Error(errors.join(" "));

  const cursor = parseLocalDate(input.notificationDate);
  const countedDates: string[] = [];
  const skippedDates: DeadlineResult["skippedDates"] = [];
  const notices: string[] = [];

  // Exclui o dia informado como marco inicial.
  cursor.setDate(cursor.getDate() + 1);

  while (countedDates.length < input.days) {
    const iso = toIsoDate(cursor);

    if (input.countType === "calendar") {
      countedDates.push(iso);
    } else if (isWeekend(cursor)) {
      skippedDates.push({ date: iso, reason: "Sábado ou domingo" });
    } else {
      // Feriados locais/forenses não são excluídos sem uma fonte oficial.
      countedDates.push(iso);
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  if (input.countType === "business") {
    notices.push(
      "A contagem excluiu apenas sábados e domingos; feriados e suspensões precisam ser validados.",
    );
  } else {
    notices.push(
      "A contagem em dias corridos não excluiu fins de semana nem feriados.",
    );
  }

  notices.push(
    "Confirme que a data informada é o marco inicial correto para a modalidade de intimação.",
  );

  return {
    startDate: input.notificationDate,
    dueDate: countedDates[countedDates.length - 1],
    daysRequested: input.days,
    countType: input.countType,
    countedDates,
    skippedDates,
    notices,
  };
}

export default function DeadlineCalculator({
  onCreateCalendarEvent,
  className,
}: DeadlineCalculatorProps) {
  const [notificationDate, setNotificationDate] = useState("");
  const [daysText, setDaysText] = useState("15");
  const [countType, setCountType] = useState<DayCountType>("business");
  const [court, setCourt] = useState<CourtId>("petrolina-pe");
  const [result, setResult] = useState<DeadlineResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const courtLabel = useMemo(
    () => COURTS.find((option) => option.id === court)?.label ?? court,
    [court],
  );

  const setToday = () => {
    setNotificationDate(toIsoDate(new Date()));
  };

  const presetDays = [
    { label: "5 dias (Embargos)", value: "5" },
    { label: "8 dias (CLT)", value: "8" },
    { label: "15 dias (CPC)", value: "15" },
    { label: "30 dias (Especial)", value: "30" },
  ];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input: DeadlineInput = {
      notificationDate,
      days: Number(daysText),
      countType,
      court,
    };
    const validationErrors = validateDeadlineInput(input);
    setErrors(validationErrors);
    setResult(null);

    if (validationErrors.length) return;

    try {
      setResult(calculateDeadline(input));
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : "Não foi possível calcular o prazo.",
      ]);
    }
  }

  return (
    <section
      className={`deadline-calculator flex flex-col gap-6 ${className || ""}`}
      aria-labelledby="deadline-title"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Painel do Formulário */}
        <GlassPanel className="p-5 md:p-6 lg:col-span-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1 border-b border-border/30 pb-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 id="deadline-title" className="font-headline font-bold text-lg text-foreground">
                Simulador de prazos
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Simulação simplificada. O resultado não substitui a conferência das
              regras processuais e do calendário oficial.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Campo Data */}
            <div className="deadline-field flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="notification-date"
                  className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                >
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>Data da intimação / marco informado</span>
                </label>
                <button
                  type="button"
                  onClick={setToday}
                  className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <CalendarDays className="h-3 w-3" />
                  <span>Definir hoje</span>
                </button>
              </div>
              <input
                id="notification-date"
                type="date"
                value={notificationDate}
                onChange={(event) => setNotificationDate(event.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-[11px] text-muted-foreground">
                Art. 224 do CPC: a contagem inicia-se no primeiro dia útil subsequente.
              </span>
            </div>

            {/* Campo Quantidade de Dias */}
            <div className="deadline-field flex flex-col gap-1.5">
              <label
                htmlFor="deadline-days"
                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
              >
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Quantidade de dias</span>
              </label>
              <input
                id="deadline-days"
                type="number"
                min={1}
                max={366}
                step={1}
                value={daysText}
                onChange={(event) => setDaysText(event.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />

              {/* Botões Rápidos de Dias Processuais */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {presetDays.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setDaysText(preset.value)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                      daysText === preset.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo de Contagem */}
            <fieldset className="deadline-fieldset border border-border/40 rounded-xl p-3 flex flex-col gap-2 bg-muted/20">
              <legend className="text-xs font-semibold text-foreground px-1">
                Tipo de contagem
              </legend>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs font-medium border transition-all ${
                    countType === "business"
                      ? "border-primary/50 bg-primary/10 text-primary font-semibold"
                      : "border-border/40 bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="count-type"
                    value="business"
                    checked={countType === "business"}
                    onChange={() => setCountType("business")}
                    className="accent-primary"
                  />
                  <span>Dias úteis (CPC/CLT)</span>
                </label>

                <label
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs font-medium border transition-all ${
                    countType === "calendar"
                      ? "border-primary/50 bg-primary/10 text-primary font-semibold"
                      : "border-border/40 bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="count-type"
                    value="calendar"
                    checked={countType === "calendar"}
                    onChange={() => setCountType("calendar")}
                    className="accent-primary"
                  />
                  <span>Dias corridos</span>
                </label>
              </div>
            </fieldset>

            {/* Comarca */}
            <CourtSelector value={court} onChange={setCourt} />

            {/* Erros de Validação */}
            {errors.length > 0 && (
              <div
                className="deadline-errors rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2.5 animate-in fade-in"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <strong>Revise os dados:</strong>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full rounded-xl gap-2 mt-2 font-semibold shadow-sm">
              <Calculator className="h-4 w-4" />
              <span>Calcular prazo</span>
            </Button>
          </form>

          <HolidayNotice courtLabel={courtLabel} />
        </GlassPanel>

        {/* Painel do Resultado */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {result ? (
            <GlassPanel
              className="deadline-result p-5 md:p-6 flex flex-col gap-5 border-primary/30 animate-in fade-in"
              aria-live="polite"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  <h3 className="font-headline font-bold text-base text-foreground">
                    Resultado estimado
                  </h3>
                </div>
                <StatusBadge status="fatal" label="Termo Final" />
              </div>

              {/* Destaque da Data Final */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 md:p-5 flex flex-col gap-2 text-center items-center justify-center">
                <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Data Limite de Vencimento
                </span>
                <p className="text-2xl md:text-3xl font-bold font-headline text-primary tracking-tight">
                  {formatDate(result.dueDate)}
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-foreground bg-background/80 px-3 py-1 rounded-full border border-border/40 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {result.daysRequested}{" "}
                    {result.countType === "business" ? "dias úteis" : "dias corridos"} a partir do dia seguinte a {formatDate(result.startDate)}
                  </span>
                </div>
              </div>

              {/* Memória de Cálculo Expansível */}
              <div className="border border-border/40 rounded-xl overflow-hidden bg-card/50">
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span>Ver memória de cálculo ({result.countedDates.length} dias computados)</span>
                  </span>
                  {isDetailsOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {isDetailsOpen && (
                  <div className="p-4 pt-1 border-t border-border/30 flex flex-col gap-4 text-xs animate-in fade-in">
                    <div>
                      <h4 className="font-semibold text-muted-foreground mb-2">
                        Dias computados no prazo:
                      </h4>
                      <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                        {result.countedDates.map((date, index) => (
                          <li
                            key={date}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border/20 text-[11px]"
                          >
                            <span className="font-semibold text-foreground">
                              {index + 1}º dia
                            </span>
                            <span className="font-mono text-muted-foreground">
                              {formatDate(date)}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {result.skippedDates.length > 0 && (
                      <div className="pt-2 border-t border-border/20">
                        <h4 className="font-semibold text-muted-foreground mb-2">
                          Dias desconsiderados (fins de semana):
                        </h4>
                        <ul className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                          {result.skippedDates.map((item) => (
                            <li
                              key={item.date}
                              className="px-2 py-1 rounded-md bg-muted/60 text-[11px] text-muted-foreground flex items-center gap-1.5 border border-border/20"
                            >
                              <span className="line-through">{formatDate(item.date)}</span>
                              <span className="text-[10px] opacity-75">({item.reason})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Avisos */}
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {result.notices.map((notice) => (
                  <li key={notice} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>{notice}</span>
                  </li>
                ))}
              </ul>

              {/* Botão de Ação: Adicionar ao Calendário (RF07) */}
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={() => onCreateCalendarEvent?.(result)}
                  disabled={!onCreateCalendarEvent}
                  className="w-full rounded-xl gap-2 font-semibold shadow-sm"
                  title={
                    onCreateCalendarEvent
                      ? "Enviar os dados para o calendário"
                      : "Integre a prop onCreateCalendarEvent ao módulo de calendário"
                  }
                >
                  <CalendarPlus className="h-4 w-4" />
                  <span>Adicionar ao calendário</span>
                </Button>

                {!onCreateCalendarEvent && (
                  <p className="deadline-hint text-[11px] text-muted-foreground text-center">
                    O botão será habilitado quando o componente for conectado ao módulo
                    de calendário por meio da propriedade onCreateCalendarEvent.
                  </p>
                )}
              </div>
            </GlassPanel>
          ) : (
            <GlassPanel className="p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[360px] border-dashed">
              <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                <Clock className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1 max-w-sm">
                <h3 className="font-headline font-bold text-sm text-foreground">
                  Aguardando parâmetros
                </h3>
                <p className="text-xs text-muted-foreground">
                  Preencha a data da intimação, a quantidade de dias e clique em{" "}
                  <strong>Calcular prazo</strong> para ver a data limite e a memória de cálculo.
                </p>
              </div>
            </GlassPanel>
          )}
        </div>
      </div>
    </section>
  );
}

export { DeadlineCalculator };

