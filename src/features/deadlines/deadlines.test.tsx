import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DeadlineCalculator, {
  calculateDeadline,
} from "./DeadlineCalculator";
import {
  isIsoDate,
  validateDeadlineInput,
  type DeadlineInput,
} from "./schemas";

describe("isIsoDate", () => {
  it("aceita uma data ISO válida", () => {
    expect(isIsoDate("2026-10-19")).toBe(true);
  });

  it("rejeita datas inexistentes e formatos incorretos", () => {
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("19/10/2026")).toBe(false);
  });
});

describe("validateDeadlineInput", () => {
  const validInput: DeadlineInput = {
    notificationDate: "2026-10-19",
    days: 15,
    countType: "business",
    court: "petrolina-pe",
  };

  it("não retorna erros para dados válidos", () => {
    expect(validateDeadlineInput(validInput)).toEqual([]);
  });

  it("rejeita quantidade não inteira ou menor que um", () => {
    expect(validateDeadlineInput({ ...validInput, days: 0 }).length).toBeGreaterThan(0);
    expect(validateDeadlineInput({ ...validInput, days: 1.5 }).length).toBeGreaterThan(0);
  });
});

describe("calculateDeadline", () => {
  it("conta 15 dias úteis excluindo o marco inicial e fins de semana", () => {
    const result = calculateDeadline({
      notificationDate: "2026-10-19",
      days: 15,
      countType: "business",
      court: "petrolina-pe",
    });

    // Este teste deliberadamente não inclui feriados: o componente avisa que
    // feriados e suspensões exigem validação por fonte oficial.
    expect(result.dueDate).toBe("2026-11-09");
    expect(result.countedDates).toHaveLength(15);
    expect(result.countedDates[0]).toBe("2026-10-20");
  });

  it("conta dias corridos incluindo fins de semana", () => {
    const result = calculateDeadline({
      notificationDate: "2026-10-19",
      days: 3,
      countType: "calendar",
      court: "juazeiro-ba",
    });

    expect(result.countedDates).toEqual([
      "2026-10-20",
      "2026-10-21",
      "2026-10-22",
    ]);
    expect(result.dueDate).toBe("2026-10-22");
  });

  it("não presume feriados locais como conhecidos", () => {
    const result = calculateDeadline({
      notificationDate: "2026-10-19",
      days: 15,
      countType: "business",
      court: "petrolina-pe",
    });

    expect(result.notices.join(" ")).toMatch(/feriados e suspensões precisam ser validados/i);
  });
});

describe("DeadlineCalculator Component UI", () => {
  it("deve renderizar o formulário com os campos principais", () => {
    render(<DeadlineCalculator />);

    expect(screen.getByRole("heading", { name: /simulador de prazos/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/data da intimação/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantidade de dias/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/comarca/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /calcular prazo/i })).toBeInTheDocument();
  });

  it("deve permitir preenchimento rápido pelos botões de preset", () => {
    render(<DeadlineCalculator />);

    const embargosBtn = screen.getByRole("button", { name: /^5 dias/i });
    fireEvent.click(embargosBtn);

    const daysInput = screen.getByLabelText(/quantidade de dias/i) as HTMLInputElement;
    expect(daysInput.value).toBe("5");
  });

  it("deve exibir erros de validação quando o formulário é enviado sem data", () => {
    render(<DeadlineCalculator />);

    const submitBtn = screen.getByRole("button", { name: /calcular prazo/i });
    fireEvent.click(submitBtn);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/informe uma data válida/i)).toBeInTheDocument();
  });

  it("deve calcular e exibir o resultado estimado ao fornecer dados válidos", () => {
    render(<DeadlineCalculator />);

    const dateInput = screen.getByLabelText(/data da intimação/i);
    fireEvent.change(dateInput, { target: { value: "2026-10-19" } });

    const submitBtn = screen.getByRole("button", { name: /calcular prazo/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/resultado estimado/i)).toBeInTheDocument();
    expect(screen.getByText(/data limite de vencimento/i)).toBeInTheDocument();
  });

  it("deve disparar onCreateCalendarEvent ao clicar no botão de adicionar ao calendário", () => {
    const handleCalendarEventMock = vi.fn();
    render(<DeadlineCalculator onCreateCalendarEvent={handleCalendarEventMock} />);

    const dateInput = screen.getByLabelText(/data da intimação/i);
    fireEvent.change(dateInput, { target: { value: "2026-10-19" } });

    const submitBtn = screen.getByRole("button", { name: /calcular prazo/i });
    fireEvent.click(submitBtn);

    const addToCalendarBtn = screen.getByRole("button", { name: /adicionar ao calendário/i });
    expect(addToCalendarBtn).toBeEnabled();

    fireEvent.click(addToCalendarBtn);
    expect(handleCalendarEventMock).toHaveBeenCalledTimes(1);
    expect(handleCalendarEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dueDate: "2026-11-09",
        daysRequested: 15,
        countType: "business",
      })
    );
  });
});

