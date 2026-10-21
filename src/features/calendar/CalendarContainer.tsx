import * as React from 'react';
import { Plus, X, Calendar as CalendarIcon, Clock, MapPin, FileText, ShieldCheck } from 'lucide-react';
import { GlassPanel } from '@/features/ui/glass-panel';
import { Button } from '@/features/ui/button';
import { StatusBadge } from '@/features/ui/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/ui/avatar';
import { MiniCalendarPicker } from './MiniCalendarPicker';
import { CalendarFilters } from './CalendarFilters';
import { TeamFilterList } from './TeamFilterList';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { CalendarLegend } from './CalendarLegend';
import { DayEventsModal } from './DayEventsModal';
import { initialEvents, initialTeamMembers } from './mock-data';
import { CalendarEvent, TeamMember } from './types';

export const CalendarContainer: React.FC = () => {
  const [events, setEvents] = React.useState<CalendarEvent[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('diafanis_calendar_events');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // fallback
      }
    }
    return initialEvents;
  });
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>(initialTeamMembers);
  const [currentView, setCurrentView] = React.useState<string>('month');
  const [selectedDay, setSelectedDay] = React.useState<number>(15);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [dayEventsModal, setDayEventsModal] = React.useState<{ day: number; events: CalendarEvent[] } | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = React.useState<boolean>(false);

  // Filter states
  const [filters, setFilters] = React.useState({
    showFatal: true,
    showInProgress: true,
    showHearings: true,
    showHolidays: true,
  });

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = React.useState('');
  const [newEventType, setNewEventType] = React.useState<CalendarEvent['type']>('fatal');
  const [newEventDay, setNewEventDay] = React.useState(15);
  const [newEventProcess, setNewEventProcess] = React.useState('');
  const [newEventCourt, setNewEventCourt] = React.useState('');

  const handleToggleMember = (id: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, selected: !m.selected } : m))
    );
  };

  // Filter events based on active filters and selected team members
  const filteredEvents = React.useMemo(() => {
    const selectedLawyerIds = new Set(
      teamMembers.filter((m) => m.selected).map((m) => m.id)
    );

    return events.filter((evt) => {
      // Status filter
      if (evt.type === 'fatal' && !filters.showFatal) return false;
      if (evt.type === 'in_progress' && !filters.showInProgress) return false;
      if (evt.type === 'hearing' && !filters.showHearings) return false;
      if (evt.type === 'holiday' && !filters.showHolidays) return false;

      // Lawyer filter (holidays apply to all)
      if (evt.type !== 'holiday' && evt.lawyerId && !selectedLawyerIds.has(evt.lawyerId)) {
        return false;
      }

      return true;
    });
  }, [events, filters, teamMembers]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      day: Number(newEventDay),
      month: 9,
      year: 2026,
      title: newEventTitle,
      type: newEventType,
      processNumber: newEventProcess || undefined,
      court: newEventCourt || undefined,
      lawyerId: 'me',
    };

    setEvents((prev) => {
      const next = [...prev, newEvt];
      try {
        localStorage.setItem('diafanis_calendar_events', JSON.stringify(next));
      } catch {
        // fallback
      }
      return next;
    });
    setIsAddEventOpen(false);
    setNewEventTitle('');
    setNewEventProcess('');
    setNewEventCourt('');
  };

  return (
    <div className="flex flex-col w-full p-4 lg:p-8 gap-6 max-w-[1600px] mx-auto">
      {/* Page Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            Calendário de Prazos & Audiências
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Controle estratégico de prazos fatais, audiências telepresenciais e expedientes forenses da banca jurídica.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={() => {
              setNewEventDay(selectedDay);
              setIsAddEventOpen(true);
            }}
            className="rounded-xl gap-2 font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Agendar Evento</span>
          </Button>
        </div>
      </div>

      {/* Main Two-Panel Layout (Anti-Card Architecture with Equal Heights) */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">
        {/* Left Column: Mini Calendar & Filters (Card 1) + Team (Card 2) */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-5">
          {/* Card 1: Mini Calendar & Display Filters */}
          <GlassPanel className="p-4 flex flex-col gap-4">
            <MiniCalendarPicker
              selectedDay={selectedDay}
              onSelectDay={(day) => setSelectedDay(day)}
            />

            <div className="h-px w-full bg-border/20" />

            <CalendarFilters
              showFatal={filters.showFatal}
              showInProgress={filters.showInProgress}
              showHearings={filters.showHearings}
              showHolidays={filters.showHolidays}
              onChange={setFilters}
            />
          </GlassPanel>

          {/* Card 2: Team Filters */}
          <GlassPanel className="p-4 flex-1 flex flex-col justify-between">
            <TeamFilterList
              members={teamMembers}
              onToggleMember={handleToggleMember}
            />
          </GlassPanel>
        </div>

        {/* Right Main Panel: Calendar Header, Grid and Legend */}
        <div className="flex-1 w-full flex flex-col">
          <GlassPanel className="p-6 flex flex-col justify-between h-full gap-4 min-h-[720px]">
            <div className="flex flex-col gap-4">
              <CalendarHeader
                currentMonth="Setembro 2026"
                currentView={currentView}
                onPrevMonth={() => {}}
                onNextMonth={() => {}}
                onToday={() => setSelectedDay(15)}
                onViewChange={setCurrentView}
              />

              <CalendarGrid
                events={filteredEvents}
                onEventClick={(evt) => setSelectedEvent(evt)}
                onSelectDate={(day) => setSelectedDay(day)}
                onOpenDayEvents={(day, dayEvents) => setDayEventsModal({ day, events: dayEvents })}
              />
            </div>

            <CalendarLegend />
          </GlassPanel>
        </div>
      </div>

      {/* Scalable Day Events Modal for Days with Multiple Events */}
      <DayEventsModal
        isOpen={dayEventsModal !== null}
        day={dayEventsModal?.day ?? 1}
        events={dayEventsModal?.events ?? []}
        teamMembers={teamMembers}
        onClose={() => setDayEventsModal(null)}
        onSelectEvent={(evt) => {
          setDayEventsModal(null);
          setSelectedEvent(evt);
        }}
        onAddNewEvent={(day) => {
          setDayEventsModal(null);
          setNewEventDay(day);
          setIsAddEventOpen(true);
        }}
      />

      {/* Event Details Dialog Modal with Responsible Lawyer */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border/50 rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/20">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedEvent.type} label={selectedEvent.title} />
                <span className="text-xs text-muted-foreground font-medium">
                  {selectedEvent.day} de Setembro de 2026
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              {selectedEvent.time && (
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <span>Horário: {selectedEvent.time}</span>
                </div>
              )}

              {selectedEvent.processNumber && (
                <div className="flex items-start gap-2 text-foreground">
                  <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">Processo / CNJ:</span>
                    <p className="font-mono font-medium text-xs text-foreground mt-0.5">
                      {selectedEvent.processNumber}
                    </p>
                  </div>
                </div>
              )}

              {selectedEvent.court && (
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>Comarca / Foro: {selectedEvent.court}</span>
                </div>
              )}

              {/* Responsible Lawyer Section (when event is personal/assigned) */}
              {selectedEvent.type !== 'holiday' && (
                <div className="pt-3 mt-1 border-t border-border/30 flex flex-col gap-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Advogado Responsável
                  </span>

                  {(() => {
                    const lawyer =
                      teamMembers.find((m) => m.id === selectedEvent.lawyerId) || teamMembers[0];

                    return (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/30">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border/50">
                            {lawyer.avatar && <AvatarImage src={lawyer.avatar} alt={lawyer.name} />}
                            <AvatarFallback>{lawyer.initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-foreground">
                                {lawyer.name}
                              </span>
                              {lawyer.badge && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-primary/10 text-primary">
                                  {lawyer.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {lawyer.role || 'Advogado'} {lawyer.oab ? `• ${lawyer.oab}` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-background/80 px-2 py-1 rounded-md border border-border/20">
                          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                          <span>Atribuído</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Dialog Modal */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <form
            onSubmit={handleAddEvent}
            className="bg-card border border-border/50 rounded-2xl p-6 w-full max-w-lg shadow-xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/20">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <h3 className="font-headline font-bold text-sm text-foreground">
                  Agendar Novo Compromisso Forense
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEventOpen(false)}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Ex.: Apelação Cível, Audiência de Instrução"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">
                    Tipo de Evento
                  </label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as CalendarEvent['type'])}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="fatal">Prazo Fatal (Peremptório)</option>
                    <option value="in_progress">Atenção / Em Andamento</option>
                    <option value="hearing">Audiência Marcada</option>
                    <option value="holiday">Feriado / Sem Expediente</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">
                    Dia (Setembro 2026)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={newEventDay}
                    onChange={(e) => setNewEventDay(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  Número do Processo (CNJ)
                </label>
                <input
                  type="text"
                  value={newEventProcess}
                  onChange={(e) => setNewEventProcess(e.target.value)}
                  placeholder="Ex.: 0001234-56.2026.8.17.0001"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  Comarca / Tribunal
                </label>
                <input
                  type="text"
                  value={newEventCourt}
                  onChange={(e) => setNewEventCourt(e.target.value)}
                  placeholder="Ex.: Petrolina/PE - TJPE, Juazeiro/BA - TJBA"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddEventOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                Salvar Evento
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
