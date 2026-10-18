import * as React from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  X,
  Check,
  Trash2,
  Sparkles,
  Users,
  Cake,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/features/ui/button';
import { Avatar, AvatarFallback } from '@/features/ui/avatar';
import { cn } from '@/shared/cn';
import {
  MessageItem,
  TemplateItem,
  ScheduleConfig,
  ScheduleScope,
  IndividualScheduleType,
  ClientScheduleConfig,
} from './types';

export interface ScheduleDispatchModalProps {
  isOpen: boolean;
  message: MessageItem | TemplateItem | null;
  onClose: () => void;
  onSaveSchedule: (config: ScheduleConfig | null) => void;
}

/**
 * Calcula a data do próximo aniversário (YYYY-MM-DD) a partir da data de nascimento
 */
export function getNextBirthdayDate(birthDateStr?: string): string {
  if (!birthDateStr) return '';
  const parts = birthDateStr.split('-');
  if (parts.length < 3) return birthDateStr;
  const month = parts[1];
  const day = parts[2];
  const today = new Date();
  const currentYear = today.getFullYear();
  const candidate = new Date(currentYear, Number(month) - 1, Number(day));

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  if (candidate.getTime() < todayMidnight.getTime()) {
    return `${currentYear + 1}-${month}-${day}`;
  }
  return `${currentYear}-${month}-${day}`;
}

export const ScheduleDispatchModal: React.FC<ScheduleDispatchModalProps> = ({
  isOpen,
  message,
  onClose,
  onSaveSchedule,
}) => {
  const [scope, setScope] = React.useState<ScheduleScope>('all');
  const [globalDate, setGlobalDate] = React.useState('');
  const [globalTime, setGlobalTime] = React.useState('09:00');
  const [clientSchedules, setClientSchedules] = React.useState<Record<string, ClientScheduleConfig>>({});

  // Inicialização ao abrir com dados da mensagem
  React.useEffect(() => {
    if (message?.scheduleConfig) {
      setScope(message.scheduleConfig.scope || 'all');
      if (message.scheduleConfig.globalScheduledAt) {
        const [d, t] = message.scheduleConfig.globalScheduledAt.split('T');
        setGlobalDate(d || '');
        setGlobalTime(t ? t.slice(0, 5) : '09:00');
      }
      setClientSchedules(message.scheduleConfig.clientSchedules || {});
    } else if (message?.scheduledAt) {
      setScope('all');
      const [d, t] = message.scheduledAt.split('T');
      setGlobalDate(d || '');
      setGlobalTime(t ? t.slice(0, 5) : '09:00');
      setClientSchedules({});
    } else {
      // Padrão: dia seguinte às 09:00 para 'all'
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      setGlobalDate(`${yyyy}-${mm}-${dd}`);
      setGlobalTime('09:00');
      setScope('all');
      setClientSchedules({});
    }

    // Pré-popula configurações para clientes vinculados se ainda não existirem
    if (message?.clients && message.clients.length > 0) {
      setClientSchedules((prev) => {
        const next = { ...prev };
        message.clients?.forEach((cli) => {
          if (!next[cli.id]) {
            next[cli.id] = {
              clientId: cli.id,
              type: 'birthday',
              date: getNextBirthdayDate(cli.birthDate),
              time: '09:00',
            };
          }
        });
        return next;
      });
    }
  }, [message, isOpen]);

  if (!isOpen || !message) return null;

  const linkedClients = message.clients || [];
  const hasClients = linkedClients.length > 0;

  // Sugestões rápidas para o modo 'all'
  const handleApplyQuick = (daysAhead: number, defaultTime: string) => {
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    setGlobalDate(`${yyyy}-${mm}-${dd}`);
    setGlobalTime(defaultTime);
  };

  // Alteração de tipo individual por cliente (aniversário vs manual)
  const handleClientTypeChange = (clientId: string, type: IndividualScheduleType) => {
    setClientSchedules((prev) => {
      const client = linkedClients.find((c) => c.id === clientId);
      const current = prev[clientId] || { clientId, type: 'birthday', time: '09:00' };
      const defaultDate = type === 'birthday' ? getNextBirthdayDate(client?.birthDate) : globalDate;

      return {
        ...prev,
        [clientId]: {
          ...current,
          type,
          date: defaultDate,
        },
      };
    });
  };

  // Alteração de data manual por cliente
  const handleClientDateChange = (clientId: string, dateVal: string) => {
    setClientSchedules((prev) => ({
      ...prev,
      [clientId]: {
        ...(prev[clientId] || { clientId, type: 'manual', time: '09:00' }),
        date: dateVal,
      },
    }));
  };

  // Alteração de horário por cliente
  const handleClientTimeChange = (clientId: string, timeVal: string) => {
    setClientSchedules((prev) => ({
      ...prev,
      [clientId]: {
        ...(prev[clientId] || { clientId, type: 'manual', date: globalDate }),
        time: timeVal,
      },
    }));
  };

  // Marcar todos os clientes como Aniversário ou Manual
  const handleSetAllClientsType = (type: IndividualScheduleType) => {
    setClientSchedules((prev) => {
      const next = { ...prev };
      linkedClients.forEach((client) => {
        const defaultDate =
          type === 'birthday'
            ? getNextBirthdayDate(client.birthDate)
            : (prev[client.id]?.date || globalDate);

        next[client.id] = {
          clientId: client.id,
          type,
          date: defaultDate,
          time: prev[client.id]?.time || '09:00',
        };
      });
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (scope === 'all') {
      if (!globalDate) return;
      const scheduledIso = `${globalDate}T${globalTime || '09:00'}`;
      onSaveSchedule({
        scope: 'all',
        globalScheduledAt: scheduledIso,
      });
    } else {
      onSaveSchedule({
        scope: 'individual',
        clientSchedules,
      });
    }
    onClose();
  };

  const handleClearSchedule = () => {
    onSaveSchedule(null);
    onClose();
  };

  const hasExistingSchedule = Boolean(message.scheduleConfig || message.scheduledAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-modal-title"
        className="bg-card border border-border/60 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 id="schedule-modal-title" className="text-base font-semibold text-foreground tracking-tight">
                Agendar Envio de Mensagem
              </h2>
              <p className="text-xs text-muted-foreground truncate max-w-[280px]" title={message.title}>
                {message.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Escolha do Escopo: 'Todos' ou 'Individual' */}
        <div className="px-6 pt-4 pb-2 border-b border-border/30 bg-muted/10">
          <label className="text-xs font-semibold text-foreground block mb-2">
            Modo de Agendamento:
          </label>
          <div
            role="tablist"
            aria-label="Opções de agendamento"
            className="grid grid-cols-2 p-1 bg-muted/70 rounded-xl gap-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={scope === 'all'}
              data-testid="scope-all-btn"
              onClick={() => setScope('all')}
              className={cn(
                'flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all',
                scope === 'all'
                  ? 'bg-background text-primary shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              <Users className="h-4 w-4" />
              <span>Todos os Clientes</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={scope === 'individual'}
              data-testid="scope-individual-btn"
              onClick={() => setScope('individual')}
              className={cn(
                'flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all',
                scope === 'individual'
                  ? 'bg-background text-primary shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              <Sliders className="h-4 w-4" />
              <span>Individual por Cliente</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* MODO 1: TODOS OS CLIENTES */}
          {scope === 'all' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Sugestões Rápidas */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" /> Sugestões rápidas de envio geral:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyQuick(1, '09:00')}
                    className="rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    Amanhã às 09:00
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyQuick(2, '14:00')}
                    className="rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    Em 2 dias às 14:00
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyQuick(7, '08:30')}
                    className="rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    Em 1 semana
                  </button>
                </div>
              </div>

              {/* Inputs de Data e Hora Globais */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label htmlFor="global-date" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5 text-primary" /> Data do Envio *
                  </label>
                  <input
                    id="global-date"
                    type="date"
                    required
                    value={globalDate}
                    onChange={(e) => setGlobalDate(e.target.value)}
                    className="w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="global-time" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" /> Horário *
                  </label>
                  <input
                    id="global-time"
                    type="time"
                    required
                    value={globalTime}
                    onChange={(e) => setGlobalTime(e.target.value)}
                    className="w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Prévia para todos */}
              <div className="p-3 rounded-xl border border-border/50 bg-primary/5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Disparo programado para todos:</span>
                <strong className="text-primary font-semibold">
                  {globalDate ? `${globalDate.split('-').reverse().join('/')} às ${globalTime}` : 'Nenhuma data'}
                </strong>
              </div>
            </div>
          )}

          {/* MODO 2: INDIVIDUAL POR CLIENTE */}
          {scope === 'individual' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
                <span>Configure para cada cliente: <strong>Aniversário</strong> ou <strong>Manual</strong></span>
                <span className="text-[11px]">({linkedClients.length} destinatários)</span>
              </div>

              {!hasClients ? (
                <div className="p-6 rounded-xl border border-dashed border-border/80 bg-muted/20 text-center space-y-2">
                  <AlertCircle className="h-6 w-6 text-amber-500 mx-auto" />
                  <p className="text-xs text-foreground font-semibold">
                    Nenhum cliente vinculado a esta mensagem
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    Vincule clientes primeiro pelo ícone de User no grid para configurar datas individuais.
                  </p>
                </div>
              ) : (
                <>
                  {/* Ação em Massa: Marcar todos como Aniversário ou Manual */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/40 text-xs">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-primary" /> Ação rápida para todos:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        data-testid="set-all-birthday-btn"
                        onClick={() => handleSetAllClientsType('birthday')}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition-all shadow-2xs"
                        title="Configurar todos os clientes para disparo no dia do aniversário"
                      >
                        <Cake className="h-3.5 w-3.5 text-rose-500" />
                        <span>Todos como Aniversário</span>
                      </button>

                      <button
                        type="button"
                        data-testid="set-all-manual-btn"
                        onClick={() => handleSetAllClientsType('manual')}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all shadow-2xs"
                        title="Configurar todos os clientes com datas manuais"
                      >
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>Todos como Manual</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {linkedClients.map((client) => {
                    const cfg = clientSchedules[client.id] || {
                      clientId: client.id,
                      type: 'birthday',
                      date: getNextBirthdayDate(client.birthDate),
                      time: '09:00',
                    };

                    const nextBday = getNextBirthdayDate(client.birthDate);
                    const formattedBday = nextBday ? nextBday.split('-').reverse().join('/') : 'Não cadastrado';
                    const initials = client.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('');

                    return (
                      <div
                        key={client.id}
                        data-testid={`client-schedule-row-${client.id}`}
                        className="p-3 rounded-xl border border-border/60 bg-card space-y-2.5 shadow-2xs hover:border-primary/30 transition-all"
                      >
                        {/* Topo do Card do Cliente */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar className="h-7 w-7 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                              <AvatarFallback className="text-[10px] font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-foreground truncate">
                                {client.fullName}
                              </h4>
                              {client.birthDate && (
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Cake className="h-3 w-3 text-rose-500" /> Nasc: {client.birthDate.split('-').reverse().slice(0, 2).join('/')}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Alternador: Aniversário vs Manual */}
                          <div
                            role="group"
                            aria-label={`Tipo de envio para ${client.name}`}
                            className="inline-flex items-center p-0.5 bg-muted/80 rounded-lg gap-0.5 shrink-0"
                          >
                            <button
                              type="button"
                              aria-pressed={cfg.type === 'birthday'}
                              data-testid={`btn-birthday-${client.id}`}
                              onClick={() => handleClientTypeChange(client.id, 'birthday')}
                              className={cn(
                                'flex items-center gap-1 px-2 py-1 text-[11px] rounded-md transition-all font-medium',
                                cfg.type === 'birthday'
                                  ? 'bg-background text-rose-600 shadow-2xs font-bold'
                                  : 'text-muted-foreground hover:text-foreground'
                              )}
                            >
                              <Cake className="h-3 w-3" />
                              <span>Aniversário</span>
                            </button>

                            <button
                              type="button"
                              aria-pressed={cfg.type === 'manual'}
                              data-testid={`btn-manual-${client.id}`}
                              onClick={() => handleClientTypeChange(client.id, 'manual')}
                              className={cn(
                                'flex items-center gap-1 px-2 py-1 text-[11px] rounded-md transition-all font-medium',
                                cfg.type === 'manual'
                                  ? 'bg-background text-primary shadow-2xs font-bold'
                                  : 'text-muted-foreground hover:text-foreground'
                              )}
                            >
                              <CalendarIcon className="h-3 w-3" />
                              <span>Manual</span>
                            </button>
                          </div>
                        </div>

                        {/* Configuração Específica do Tipo Escolhido */}
                        {cfg.type === 'birthday' ? (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/5 border border-rose-500/20 text-xs">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                              <Cake className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                              Disparo no próximo aniversário: <strong className="text-foreground">{formattedBday}</strong>
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <input
                                type="time"
                                value={cfg.time || '09:00'}
                                onChange={(e) => handleClientTimeChange(client.id, e.target.value)}
                                className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-muted/20 border border-border/40">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-muted-foreground block">
                                Data de Envio:
                              </label>
                              <input
                                type="date"
                                required
                                value={cfg.date || globalDate}
                                onChange={(e) => handleClientDateChange(client.id, e.target.value)}
                                className="w-full rounded-md border border-border/60 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-muted-foreground block">
                                Horário:
                              </label>
                              <input
                                type="time"
                                required
                                value={cfg.time || '09:00'}
                                onChange={(e) => handleClientTimeChange(client.id, e.target.value)}
                                className="w-full rounded-md border border-border/60 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            {hasExistingSchedule ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSchedule}
                className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remover Agendamento
              </Button>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancelar
              </Button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {hasExistingSchedule && (
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" size="sm" className="gap-1.5">
                <Check className="h-3.5 w-3.5" /> Salvar Agendamento
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
