import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import DeadlineCalculator from './DeadlineCalculator';
import { DeadlineResult, COURTS } from './schemas';
import { GlassPanel } from '@/features/ui/glass-panel';
import { Button } from '@/features/ui/button';
import { StatusBadge } from '@/features/ui/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/ui/avatar';
import { initialTeamMembers } from '@/features/calendar/mock-data';
import { CalendarEvent } from '@/features/calendar/types';
import {
  Timer,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  X,
  Scale,
  FileText,
  MapPin,
  Building2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const DeadlinesContainer: React.FC = () => {
  const navigate = useNavigate();
  const [scheduledResult, setScheduledResult] = React.useState<DeadlineResult | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [eventTitle, setEventTitle] = React.useState('');
  const [processNumber, setProcessNumber] = React.useState('');
  const [assignedLawyerId, setAssignedLawyerId] = React.useState('me');
  const [courtName, setCourtName] = React.useState('Petrolina — PE');
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleCreateCalendarEvent = (result: DeadlineResult) => {
    setScheduledResult(result);
    setEventTitle(
      `Prazo Fatal (${result.daysRequested} ${
        result.countType === 'business' ? 'dias úteis' : 'dias corridos'
      })`
    );
    setProcessNumber('');
    const matchedCourt = COURTS.find((c) => c.label.includes(result.dueDate));
    setCourtName(matchedCourt?.label ?? 'Petrolina — PE');
    setIsSuccess(false);
    setIsModalOpen(true);
  };

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledResult) return;

    const [year, month, day] = scheduledResult.dueDate.split('-').map(Number);

    const newCalendarEvent: CalendarEvent = {
      id: `evt-deadline-${Date.now()}`,
      day,
      month,
      year,
      title: eventTitle.trim() || 'Prazo Fatal Processual',
      type: 'fatal',
      time: '23:59',
      processNumber: processNumber.trim() || undefined,
      court: courtName,
      lawyerId: assignedLawyerId,
    };

    try {
      const stored = localStorage.getItem('diafanis_calendar_events');
      let currentEvents: CalendarEvent[] = [];
      if (stored) {
        currentEvents = JSON.parse(stored);
      }
      const updatedEvents = [...currentEvents, newCalendarEvent];
      localStorage.setItem('diafanis_calendar_events', JSON.stringify(updatedEvents));
    } catch {
      // ignore
    }

    setIsSuccess(true);
  };

  const handleGoToCalendar = () => {
    setIsModalOpen(false);
    navigate({ to: '/calendar' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Timer className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-headline text-foreground tracking-tight">
              Motor de Prazos Processuais
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Simulador simplificado de contagem de prazos em dias úteis (CPC/CLT) e dias corridos para as comarcas de Petrolina-PE e Juazeiro-BA.
            </p>
          </div>
        </div>
      </div>

      {/* Cartões Informativos de Contexto Forense */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassPanel className="p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Scale className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs font-semibold text-foreground">Regra Geral de Contagem</span>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Art. 224 do CPC: exclui-se o dia do começo e inclui-se o do vencimento.
            </p>
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs font-semibold text-foreground">Comarcas Integradas</span>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Jurisdições de Petrolina/PE (TJPE) e Juazeiro/BA (TJBA) no Vale do São Francisco.
            </p>
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <CalendarPlus className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs font-semibold text-foreground">Agendamento Direto</span>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Exporte prazos fatais diretamente para o calendário da banca com atribuição de responsável.
            </p>
          </div>
        </GlassPanel>
      </div>

      {/* Componente Central da Calculadora */}
      <DeadlineCalculator onCreateCalendarEvent={handleCreateCalendarEvent} />

      {/* Modal de Agendamento no Calendário (RF07) */}
      {isModalOpen && scheduledResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border/50 rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/20">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="font-headline font-bold text-sm text-foreground">
                  {isSuccess ? 'Prazo Agendado com Sucesso!' : 'Adicionar Prazo ao Calendário'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="flex flex-col gap-1 max-w-sm">
                  <h4 className="font-headline font-bold text-base text-foreground">
                    Compromisso Registrado!
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    O prazo fatal para o dia <strong>{scheduledResult.dueDate}</strong> foi adicionado ao Calendário de Prazos & Audiências da equipe.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                    Fechar
                  </Button>
                  <Button size="sm" onClick={handleGoToCalendar} className="gap-1.5">
                    <span>Visualizar no Calendário</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmSchedule} className="flex flex-col gap-4 text-xs">
                {/* Resumo da Data Calculada */}
                <div className="rounded-xl bg-muted/40 p-3 border border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Data de Vencimento:</span>
                      <span className="font-semibold text-foreground text-xs">
                        {scheduledResult.dueDate}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status="fatal" label="Prazo Fatal" />
                </div>

                {/* Título do Evento */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="schedule-title" className="font-semibold text-foreground">
                    Título do Compromisso *
                  </label>
                  <input
                    id="schedule-title"
                    type="text"
                    required
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Ex.: Apelação Cível, Contestação, Manifestação"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Processo CNJ */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="schedule-process" className="font-semibold text-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span>Número do Processo (CNJ)</span>
                  </label>
                  <input
                    id="schedule-process"
                    type="text"
                    value={processNumber}
                    onChange={(e) => setProcessNumber(e.target.value)}
                    placeholder="Ex.: 0001234-56.2026.8.17.0001"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Comarca / Foro */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="schedule-court" className="font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>Comarca / Tribunal</span>
                  </label>
                  <select
                    id="schedule-court"
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Petrolina — PE (TJPE)">Petrolina — PE (TJPE)</option>
                    <option value="Juazeiro — BA (TJBA)">Juazeiro — BA (TJBA)</option>
                    <option value="TRT6 — Petrolina">TRT6 — Vara do Trabalho de Petrolina</option>
                    <option value="TRT5 — Juazeiro">TRT5 — Vara do Trabalho de Juazeiro</option>
                  </select>
                </div>

                {/* Advogado Responsável */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-foreground block">
                    Advogado Responsável
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {initialTeamMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setAssignedLawyerId(member.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left ${
                          assignedLawyerId === member.id
                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                            : 'border-border/40 bg-muted/20 text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        <Avatar className="h-7 w-7 border border-border/40 shrink-0">
                          {member.avatar && <AvatarImage src={member.avatar} alt={member.name} />}
                          <AvatarFallback className="text-[10px]">{member.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs truncate font-medium text-foreground">{member.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate">{member.role || 'Advogado'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rodapé do Modal */}
                <div className="pt-3 border-t border-border/20 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" className="gap-1.5 font-semibold">
                    <CalendarPlus className="h-3.5 w-3.5" />
                    <span>Salvar no Calendário</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeadlinesContainer;

