/**
 * Tipos e validações do Motor de Prazos.
 *
 * Importante: este módulo implementa uma simulação simplificada, não um
 * cálculo jurídico definitivo. A data inicial deve ser o marco processual
 * correto, previamente validado por quem utiliza o sistema.
 */

export type DayCountType = "business" | "calendar";
export type CourtId = "petrolina-pe" | "juazeiro-ba";

export interface CourtOption {
  id: CourtId;
  label: string;
  state: "PE" | "BA";
}

export interface DeadlineInput {
  /** Data ISO YYYY-MM-DD que representa o marco inicial informado. */
  notificationDate: string;
  days: number;
  countType: DayCountType;
  court: CourtId;
}

export interface DeadlineResult {
  startDate: string;
  dueDate: string;
  daysRequested: number;
  countType: DayCountType;
  countedDates: string[];
  skippedDates: Array<{ date: string; reason: string }>;
  notices: string[];
}

export const COURTS: CourtOption[] = [
  { id: "petrolina-pe", label: "Petrolina — PE", state: "PE" },
  { id: "juazeiro-ba", label: "Juazeiro — BA", state: "BA" },
];

export const DEFAULT_MAX_DAYS = 366;

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function validateDeadlineInput(input: DeadlineInput): string[] {
  const errors: string[] = [];

  if (!isIsoDate(input.notificationDate)) {
    errors.push("Informe uma data válida.");
  }

  if (!Number.isInteger(input.days) || input.days < 1) {
    errors.push("A quantidade de dias deve ser um número inteiro maior que zero.");
  } else if (input.days > DEFAULT_MAX_DAYS) {
    errors.push(`A quantidade máxima permitida nesta simulação é ${DEFAULT_MAX_DAYS} dias.`);
  }

  if (input.countType !== "business" && input.countType !== "calendar") {
    errors.push("Selecione dias úteis ou dias corridos.");
  }

  if (!COURTS.some((court) => court.id === input.court)) {
    errors.push("Selecione uma comarca válida.");
  }

  return errors;
}
