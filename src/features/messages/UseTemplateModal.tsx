import * as React from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Search,
  Trash2,
  UserPlus,
  Users,
  Calendar,
  Clock,
  Cake,
  Sliders,
  Scale,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/features/ui/button';
import { Avatar, AvatarFallback } from '@/features/ui/avatar';
import { cn } from '@/shared/cn';
import {
  TemplateItem,
  MessageItem,
  ClientRecipient,
  ScheduleConfig,
  ScheduleScope,
  IndividualScheduleType,
  ClientScheduleConfig,
  LawsuitOption,
  FinancialOption,
  HearingDateOption,
} from './types';
import {
  allOfficeClients,
  availableLawsuits,
  availableFinancials,
  availableHearingDates,
} from './mock-data';
import { getNextBirthdayDate } from './ScheduleDispatchModal';
import { renderContentWithPills } from './MessageModal';

export interface UseTemplateModalProps {
  isOpen: boolean;
  template: TemplateItem | null;
  onClose: () => void;
  onConfirm: (messageData: Partial<MessageItem> | Partial<MessageItem>[]) => void;
}

/**
 * Formata o nome do cliente com o primeiro nome, abreviação dos demais e o último nome.
 * Ex.: "Roberto Alves da Silva" -> "Roberto A. D. Silva"
 * Ex.: "Mariana Duarte Prado" -> "Mariana D. Prado"
 */
export function formatClientShortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 2) {
    return parts.join(' ');
  }
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const middleAbbreviations = parts
    .slice(1, -1)
    .map((part) => `${part[0].toUpperCase()}.`)
    .join(' ');
  return `${firstName} ${middleAbbreviations} ${lastName}`;
}

type WizardStep = 1 | 2 | 3 | 4;

export const UseTemplateModal: React.FC<UseTemplateModalProps> = ({
  isOpen,
  template,
  onClose,
  onConfirm,
}) => {
  const [currentStep, setCurrentStep] = React.useState<WizardStep>(1);

  // Título da mensagem (preenchido inicialmente com o título do modelo)
  const [messageTitle, setMessageTitle] = React.useState('');

  // Etapa 1: Destinatários
  const [selectedClients, setSelectedClients] = React.useState<ClientRecipient[]>([]);
  const [clientSearchTerm, setClientSearchTerm] = React.useState('');
  const [isAddingClient, setIsAddingClient] = React.useState(false);
  const [addSearchTerm, setAddSearchTerm] = React.useState('');

  // Etapa 2: Agendamento
  const [scheduleScope, setScheduleScope] = React.useState<ScheduleScope>('all');
  const [globalDate, setGlobalDate] = React.useState('');
  const [globalTime, setGlobalTime] = React.useState('09:00');
  const [clientSchedules, setClientSchedules] = React.useState<Record<string, ClientScheduleConfig>>({});

  // Etapa 3: Objetos de Referência
  const [selectedLawsuit, setSelectedLawsuit] = React.useState<LawsuitOption | null>(null);
  const [selectedFinancial, setSelectedFinancial] = React.useState<FinancialOption | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<HearingDateOption | null>(null);

  const [lawsuitSearch, setLawsuitSearch] = React.useState('');
  const [financialSearch, setFinancialSearch] = React.useState('');
  const [dateSearch, setDateSearch] = React.useState('');

  // Inicialização quando o modal abre com o modelo selecionado
  React.useEffect(() => {
    if (template && isOpen) {
      setCurrentStep(1);
      setMessageTitle(template.title || '');
      // Pré-preenche clientes se o modelo já tiver algum ou inicializa com os dois primeiros
      const initialClients = template.clients && template.clients.length > 0
        ? [...template.clients]
        : [allOfficeClients[0], allOfficeClients[1]];
      setSelectedClients(initialClients);

      // Agendamento padrão
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      setGlobalDate(`${yyyy}-${mm}-${dd}`);
      setGlobalTime('09:00');
      setScheduleScope('all');

      // Inicializa agendamento individual para cada cliente
      const initialSchedules: Record<string, ClientScheduleConfig> = {};
      initialClients.forEach((cli) => {
        initialSchedules[cli.id] = {
          clientId: cli.id,
          type: 'birthday',
          date: getNextBirthdayDate(cli.birthDate),
          time: '09:00',
        };
      });
      setClientSchedules(initialSchedules);

      // Referência real somente ao usar o modelo (inicia limpo)
      setSelectedLawsuit(null);
      setSelectedFinancial(null);
      setSelectedDate(null);

      setClientSearchTerm('');
      setIsAddingClient(false);
      setAddSearchTerm('');
    }
  }, [template, isOpen]);

  if (!isOpen || !template) return null;

  // Verifica quais objetos de referência foram marcados (boolean) no modal de edição do modelo
  const requiresLawsuit = Boolean(template.requiresLawsuit ?? template.selectedLawsuit);
  const requiresFinancial = Boolean(template.requiresFinancial ?? template.selectedFinancial);
  const requiresDate = Boolean(template.requiresDate ?? template.selectedDate);
  const hasReferenceRequirements = requiresLawsuit || requiresFinancial || requiresDate;

  // Handlers da Etapa 1 (Destinatários)
  const filteredSelectedClients = selectedClients.filter(
    (c) =>
      c.fullName.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  const availableToAdd = allOfficeClients.filter(
    (c) =>
      !selectedClients.some((sc) => sc.id === c.id) &&
      (c.fullName.toLowerCase().includes(addSearchTerm.toLowerCase()) ||
        c.name.toLowerCase().includes(addSearchTerm.toLowerCase()))
  );

  const handleRemoveClient = (clientId: string) => {
    setSelectedClients((prev) => prev.filter((c) => c.id !== clientId));
    setClientSchedules((prev) => {
      const next = { ...prev };
      delete next[clientId];
      return next;
    });
  };

  const handleAddClient = (client: ClientRecipient) => {
    setSelectedClients((prev) => [...prev, client]);
    setClientSchedules((prev) => ({
      ...prev,
      [client.id]: {
        clientId: client.id,
        type: 'birthday',
        date: getNextBirthdayDate(client.birthDate),
        time: '09:00',
      },
    }));
    setIsAddingClient(false);
    setAddSearchTerm('');
  };

  // Handlers da Etapa 2 (Agendamento)
  const handleApplyQuickSchedule = (daysAhead: number, time: string) => {
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    setGlobalDate(`${yyyy}-${mm}-${dd}`);
    setGlobalTime(time);
  };

  const handleClientTypeChange = (clientId: string, type: IndividualScheduleType) => {
    setClientSchedules((prev) => {
      const client = selectedClients.find((c) => c.id === clientId);
      const current = prev[clientId] || { clientId, type: 'birthday', time: '09:00' };
      const defaultDate = type === 'birthday' ? getNextBirthdayDate(client?.birthDate) : globalDate;

      return {
        ...prev,
        [clientId]: {
          ...current,
          type,
          date: defaultDate || current.date,
        },
      };
    });
  };

  const handleClientDateChange = (clientId: string, date: string) => {
    setClientSchedules((prev) => ({
      ...prev,
      [clientId]: {
        ...(prev[clientId] || { clientId, type: 'manual', time: '09:00' }),
        date,
      },
    }));
  };

  const handleClientTimeChange = (clientId: string, time: string) => {
    setClientSchedules((prev) => ({
      ...prev,
      [clientId]: {
        ...(prev[clientId] || { clientId, type: 'manual', date: globalDate }),
        time,
      },
    }));
  };

  const handleSetAllIndividualType = (type: IndividualScheduleType) => {
    setClientSchedules((prev) => {
      const next = { ...prev };
      selectedClients.forEach((client) => {
        const cur = next[client.id] || { clientId: client.id, time: '09:00' };
        const defaultDate = type === 'birthday' ? getNextBirthdayDate(client.birthDate) : globalDate;
        next[client.id] = {
          ...cur,
          type,
          date: defaultDate || cur.date || '',
        };
      });
      return next;
    });
  };

  // Handlers da Etapa 3 (Referências)
  const filteredLawsuits = availableLawsuits.filter(
    (l) =>
      l.number.toLowerCase().includes(lawsuitSearch.toLowerCase()) ||
      l.court.toLowerCase().includes(lawsuitSearch.toLowerCase()) ||
      l.jurisdiction.toLowerCase().includes(lawsuitSearch.toLowerCase())
  );

  const filteredFinancials = availableFinancials.filter(
    (f) =>
      f.code.toLowerCase().includes(financialSearch.toLowerCase()) ||
      f.amount.toLowerCase().includes(financialSearch.toLowerCase())
  );

  const filteredDates = availableHearingDates.filter(
    (d) =>
      d.title.toLowerCase().includes(dateSearch.toLowerCase()) ||
      d.date.toLowerCase().includes(dateSearch.toLowerCase()) ||
      d.location.toLowerCase().includes(dateSearch.toLowerCase())
  );

  // Confirmação final: cria sempre uma mensagem por cliente com "<Título Padrão> - <Nome do Cliente>"
  const handleFinalConfirm = () => {
    const finalTitle = messageTitle.trim() || template.title;
    const globalScheduledAt =
      scheduleScope === 'all' && globalDate ? `${globalDate}T${globalTime || '09:00'}` : null;

    if (selectedClients.length > 0) {
      const clientMessages: Partial<MessageItem>[] = selectedClients.map((client) => {
        const shortClientName = formatClientShortName(client.fullName || client.name);

        if (scheduleScope === 'individual') {
          const cfg = clientSchedules[client.id] || {
            clientId: client.id,
            type: 'birthday',
            date: getNextBirthdayDate(client.birthDate),
            time: '09:00',
          };
          const clientScheduledAt = cfg.date ? `${cfg.date}T${cfg.time || '09:00'}` : null;

          return {
            title: `${finalTitle} - ${shortClientName}`,
            content: template.content,
            category: template.category,
            clients: [client],
            scheduleConfig: {
              scope: 'individual',
              clientSchedules: { [client.id]: cfg },
            },
            scheduledAt: clientScheduledAt,
            selectedLawsuit: requiresLawsuit ? selectedLawsuit : null,
            selectedFinancial: requiresFinancial ? selectedFinancial : null,
            selectedDate: requiresDate ? selectedDate : null,
            hasAlert: false,
          };
        }

        return {
          title: `${finalTitle} - ${shortClientName}`,
          content: template.content,
          category: template.category,
          clients: [client],
          scheduleConfig: {
            scope: 'all',
            globalScheduledAt: globalScheduledAt || undefined,
          },
          scheduledAt: globalScheduledAt,
          selectedLawsuit: requiresLawsuit ? selectedLawsuit : null,
          selectedFinancial: requiresFinancial ? selectedFinancial : null,
          selectedDate: requiresDate ? selectedDate : null,
          hasAlert: false,
        };
      });

      onConfirm(clientMessages);
      onClose();
      return;
    }

    const scheduleConfig: ScheduleConfig =
      scheduleScope === 'all'
        ? { scope: 'all', globalScheduledAt: globalScheduledAt || undefined }
        : { scope: 'individual', clientSchedules };

    onConfirm({
      title: finalTitle,
      content: template.content,
      category: template.category,
      clients: selectedClients,
      scheduleConfig,
      scheduledAt: globalScheduledAt,
      selectedLawsuit: requiresLawsuit ? selectedLawsuit : null,
      selectedFinancial: requiresFinancial ? selectedFinancial : null,
      selectedDate: requiresDate ? selectedDate : null,
      hasAlert: false,
    });
    onClose();
  };

  const stepTitles: Record<WizardStep, string> = {
    1: '1. Destinatários',
    2: '2. Agendamento',
    3: '3. Objetos de Referência',
    4: '4. Título e Prévia',
  };

  return (
    <div
      data-testid="use-template-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="use-template-modal-title"
        data-testid="use-template-modal"
        className="bg-card border border-border/60 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header com indicador de etapas */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Usar Modelo
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{stepTitles[currentStep]}</span>
            </div>
            <h2
              id="use-template-modal-title"
              className="text-base font-semibold text-foreground tracking-tight truncate max-w-md"
              title={template.title}
            >
              {template.title}
            </h2>
          </div>

          <button
            type="button"
            data-testid="close-use-template-btn"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Barra de Progresso visual das 4 etapas */}
        <div className="grid grid-cols-4 border-b border-border/30 bg-muted/10 text-center text-[11px] font-medium">
          {([1, 2, 3, 4] as WizardStep[]).map((step) => {
            const isActive = currentStep === step;
            const isCompleted = currentStep > step;

            return (
              <div
                key={step}
                className={cn(
                  'py-2 px-1 border-r last:border-r-0 border-border/30 transition-colors flex items-center justify-center gap-1.5',
                  isActive && 'bg-primary/10 text-primary font-semibold border-b-2 border-b-primary',
                  isCompleted && 'text-foreground/80 bg-background/50',
                  !isActive && !isCompleted && 'text-muted-foreground/60'
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold',
                    isActive && 'bg-primary text-primary-foreground',
                    isCompleted && 'bg-primary/20 text-primary',
                    !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? '✓' : step}
                </span>
                <span className="hidden sm:inline">
                  {step === 1 && 'Destinatários'}
                  {step === 2 && 'Agendamento'}
                  {step === 3 && 'Referências'}
                  {step === 4 && 'Prévia'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Conteúdo Dinâmico por Etapa */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* ========================================================
              ETAPA 1: SELEÇÃO DE CLIENTES (DESTINATÁRIOS)
              ======================================================== */}
          {currentStep === 1 && (
            <div data-testid="wizard-step-recipients" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Selecione os Destinatários
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Escolha os clientes que receberão esta mensagem gerada a partir do modelo.
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  data-testid="add-client-mode-btn"
                  onClick={() => setIsAddingClient((v) => !v)}
                  className="gap-1.5 text-xs h-8"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{isAddingClient ? 'Cancelar' : 'Adicionar Cliente'}</span>
                </Button>
              </div>

              {/* Modo de adição de cliente */}
              {isAddingClient && (
                <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-2.5 animate-in fade-in duration-150">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <UserPlus className="h-3.5 w-3.5 text-primary" />
                    <span>Adicionar cliente do escritório</span>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Pesquisar cliente disponível..."
                      value={addSearchTerm}
                      onChange={(e) => setAddSearchTerm(e.target.value)}
                      className="w-full rounded-lg border border-border/60 bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="max-h-[140px] overflow-y-auto space-y-1">
                    {availableToAdd.length === 0 ? (
                      <div className="p-3 text-center text-xs text-muted-foreground">
                        Nenhum outro cliente disponível para adicionar.
                      </div>
                    ) : (
                      availableToAdd.map((cli) => (
                        <div
                          key={cli.id}
                          onClick={() => handleAddClient(cli)}
                          className="flex items-center justify-between p-2 rounded-lg bg-card hover:bg-primary/10 cursor-pointer border border-border/30 transition-colors"
                        >
                          <span className="text-xs font-medium text-foreground">{cli.fullName}</span>
                          <span className="text-[10px] text-primary font-semibold">+ Adicionar</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Barra de Pesquisa de Clientes Selecionados */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Pesquisar nos destinatários selecionados..."
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-border/50 bg-background/80 py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Lista com máximo de 5 visíveis e scroll */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Destinatários ({selectedClients.length})</span>
                  <span className="text-[10px] font-normal lowercase">máx. 5 visíveis (scroll para mais)</span>
                </div>

                <div
                  tabIndex={0}
                  className="max-h-[240px] overflow-y-auto pr-1 space-y-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-lg"
                >
                  {filteredSelectedClients.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/60">
                      Nenhum destinatário selecionado. Clique em &quot;Adicionar Cliente&quot; para incluir.
                    </div>
                  ) : (
                    filteredSelectedClients.map((client) => {
                      const initials = client.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('');

                      return (
                        <div
                          key={client.id}
                          data-testid={`use-tmpl-client-${client.id}`}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-card hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20">
                              <AvatarFallback className="text-[11px] font-bold">{initials}</AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-foreground truncate">
                                {client.fullName}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                {client.birthDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-muted-foreground/70" />
                                    Nasc: {client.birthDate.split('-').reverse().slice(0, 2).join('/')}
                                  </span>
                                )}
                                {client.email && (
                                  <span className="truncate hidden sm:inline">{client.email}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveClient(client.id)}
                            title="Remover cliente"
                            aria-label={`Remover ${client.fullName}`}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              ETAPA 2: OPÇÕES DE AGENDAMENTO
              ======================================================== */}
          {currentStep === 2 && (
            <div data-testid="wizard-step-scheduling" className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Configurar Agendamento do Envio
                </h3>
                <p className="text-xs text-muted-foreground">
                  Escolha se todos receberão na mesma data ou defina regras individuais por cliente.
                </p>
              </div>

              {/* Escopo: 'Todos' ou 'Individual' */}
              <div
                role="tablist"
                aria-label="Opções de agendamento"
                className="grid grid-cols-2 p-1 bg-muted/70 rounded-xl gap-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={scheduleScope === 'all'}
                  data-testid="sched-scope-all-btn"
                  onClick={() => setScheduleScope('all')}
                  className={cn(
                    'py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2',
                    scheduleScope === 'all'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Todos os Clientes</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={scheduleScope === 'individual'}
                  data-testid="sched-scope-indiv-btn"
                  onClick={() => setScheduleScope('individual')}
                  className={cn(
                    'py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2',
                    scheduleScope === 'individual'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Individual por Cliente</span>
                </button>
              </div>

              {/* Modo: Todos os Clientes */}
              {scheduleScope === 'all' && (
                <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-card">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Atalhos rápidos:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleApplyQuickSchedule(1, '09:00')}
                        className="px-2.5 py-1 text-xs rounded-lg border border-border/60 bg-muted/40 hover:bg-muted text-foreground transition-colors"
                      >
                        Amanhã às 09:00
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyQuickSchedule(2, '14:00')}
                        className="px-2.5 py-1 text-xs rounded-lg border border-border/60 bg-muted/40 hover:bg-muted text-foreground transition-colors"
                      >
                        Em 2 dias às 14:00
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyQuickSchedule(7, '10:00')}
                        className="px-2.5 py-1 text-xs rounded-lg border border-border/60 bg-muted/40 hover:bg-muted text-foreground transition-colors"
                      >
                        Próxima semana
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        Data de Disparo:
                      </label>
                      <input
                        type="date"
                        data-testid="sched-global-date"
                        value={globalDate}
                        onChange={(e) => setGlobalDate(e.target.value)}
                        className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        Horário:
                      </label>
                      <input
                        type="time"
                        data-testid="sched-global-time"
                        value={globalTime}
                        onChange={(e) => setGlobalTime(e.target.value)}
                        className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modo: Individual por Cliente */}
              {scheduleScope === 'individual' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Regras por Cliente ({selectedClients.length})
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSetAllIndividualType('birthday')}
                        className="text-[10px] font-medium px-2 py-0.5 rounded border border-border/60 bg-muted/40 hover:bg-muted text-foreground transition-colors"
                      >
                        Todos Aniversário
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetAllIndividualType('manual')}
                        className="text-[10px] font-medium px-2 py-0.5 rounded border border-border/60 bg-muted/40 hover:bg-muted text-foreground transition-colors"
                      >
                        Todos Manual
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
                    {selectedClients.map((client) => {
                      const cfg = clientSchedules[client.id] || {
                        clientId: client.id,
                        type: 'birthday',
                        date: getNextBirthdayDate(client.birthDate),
                        time: '09:00',
                      };

                      return (
                        <div
                          key={client.id}
                          className="p-3 rounded-xl border border-border/40 bg-card space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground truncate">
                              {client.fullName}
                            </span>
                            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg">
                              <button
                                type="button"
                                onClick={() => handleClientTypeChange(client.id, 'birthday')}
                                className={cn(
                                  'px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors flex items-center gap-1',
                                  cfg.type === 'birthday'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                )}
                              >
                                <Cake className="h-3 w-3" />
                                <span>Aniversário</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleClientTypeChange(client.id, 'manual')}
                                className={cn(
                                  'px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors flex items-center gap-1',
                                  cfg.type === 'manual'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                )}
                              >
                                <Calendar className="h-3 w-3" />
                                <span>Manual</span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="date"
                              value={cfg.date || ''}
                              onChange={(e) => handleClientDateChange(client.id, e.target.value)}
                              disabled={cfg.type === 'birthday'}
                              className={cn(
                                'rounded-lg border border-border/50 bg-background px-2 py-1 text-xs text-foreground focus:outline-none',
                                cfg.type === 'birthday' && 'opacity-70 bg-muted/30 cursor-not-allowed'
                              )}
                            />
                            <input
                              type="time"
                              value={cfg.time || '09:00'}
                              onChange={(e) => handleClientTimeChange(client.id, e.target.value)}
                              className="rounded-lg border border-border/50 bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              ETAPA 3: OBJETOS DE REFERÊNCIA
              ======================================================== */}
          {currentStep === 3 && (
            <div data-testid="wizard-step-references" className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Referenciar Objetos da Mensagem
                </h3>
                <p className="text-xs text-muted-foreground">
                  Selecione as entidades necessárias para substituir as variáveis no modelo (ex.: processo, fatura, audiência).
                </p>
              </div>

              {!hasReferenceRequirements ? (
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-foreground space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span>Nenhum objeto externo exigido</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Nenhum objeto de referência (processo, fatura ou data) foi marcado no modelo. Você pode avançar para a prévia da mensagem.
                  </p>
                </div>
              ) : null}

              {/* Seletor de Processo (exibido apenas se marcado no modelo) */}
              {requiresLawsuit && (
                <div data-testid="ref-section-lawsuit" className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-blue-500" />
                      Processo Vinculado <span className="text-rose-500">*</span>
                    </span>
                    {selectedLawsuit && (
                      <button
                        type="button"
                        onClick={() => setSelectedLawsuit(null)}
                        className="text-[11px] text-destructive hover:underline"
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Pesquisar processo pelo número, vara ou comarca..."
                        value={lawsuitSearch}
                        onChange={(e) => setLawsuitSearch(e.target.value)}
                        className="w-full rounded-xl border border-border/50 bg-background/80 py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="max-h-[140px] overflow-y-auto space-y-1.5">
                      {filteredLawsuits.map((lawsuit) => {
                        const isSelected = selectedLawsuit?.id === lawsuit.id;
                        return (
                          <div
                            key={lawsuit.id}
                            onClick={() => setSelectedLawsuit(isSelected ? null : lawsuit)}
                            className={cn(
                              'flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all text-xs',
                              isSelected
                                ? 'border-primary bg-primary/10 text-primary font-semibold'
                                : 'border-border/40 bg-card hover:bg-muted/40 text-foreground'
                            )}
                          >
                            <div>
                              <div className="font-mono text-xs">{lawsuit.number}</div>
                              <div className="text-[10px] text-muted-foreground">
                                {lawsuit.court} - {lawsuit.jurisdiction}
                              </div>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Seletor de Fatura / Financeiro (exibido apenas se marcado no modelo) */}
              {requiresFinancial && (
                <div data-testid="ref-section-financial" className="space-y-2 pt-2 border-t border-border/30">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      Fatura / Parcela Financeira <span className="text-rose-500">*</span>
                    </span>
                    {selectedFinancial && (
                      <button
                        type="button"
                        onClick={() => setSelectedFinancial(null)}
                        className="text-[11px] text-destructive hover:underline"
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Pesquisar fatura por código ou valor..."
                        value={financialSearch}
                        onChange={(e) => setFinancialSearch(e.target.value)}
                        className="w-full rounded-xl border border-border/50 bg-background/80 py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="max-h-[120px] overflow-y-auto space-y-1.5">
                      {filteredFinancials.map((fin) => {
                        const isSelected = selectedFinancial?.id === fin.id;
                        return (
                          <div
                            key={fin.id}
                            onClick={() => setSelectedFinancial(isSelected ? null : fin)}
                            className={cn(
                              'flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all text-xs',
                              isSelected
                                ? 'border-primary bg-primary/10 text-primary font-semibold'
                                : 'border-border/40 bg-card hover:bg-muted/40 text-foreground'
                            )}
                          >
                            <div>
                              <div className="font-semibold text-xs">{fin.amount}</div>
                              <div className="text-[10px] text-muted-foreground">
                                {fin.code} • Vencimento: {fin.dueDate}
                              </div>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Seletor de Data de Audiência (exibido apenas se marcado no modelo) */}
              {requiresDate && (
                <div data-testid="ref-section-date" className="space-y-2 pt-2 border-t border-border/30">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-amber-500" />
                      Data de Audiência <span className="text-rose-500">*</span>
                    </span>
                    {selectedDate && (
                      <button
                        type="button"
                        onClick={() => setSelectedDate(null)}
                        className="text-[11px] text-destructive hover:underline"
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Pesquisar audiência por título, local ou data..."
                        value={dateSearch}
                        onChange={(e) => setDateSearch(e.target.value)}
                        className="w-full rounded-xl border border-border/50 bg-background/80 py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="max-h-[120px] overflow-y-auto space-y-1.5">
                      {filteredDates.map((d) => {
                        const isSelected = selectedDate?.id === d.id;
                        return (
                          <div
                            key={d.id}
                            onClick={() => setSelectedDate(isSelected ? null : d)}
                            className={cn(
                              'flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all text-xs',
                              isSelected
                                ? 'border-primary bg-primary/10 text-primary font-semibold'
                                : 'border-border/40 bg-card hover:bg-muted/40 text-foreground'
                            )}
                          >
                            <div>
                              <div className="font-semibold text-xs">{d.title}</div>
                              <div className="text-[10px] text-muted-foreground">
                                {d.date} • {d.location}
                              </div>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              ETAPA 4: TÍTULO, PRÉVIA E CONFIRMAÇÃO
              ======================================================== */}
          {currentStep === 4 && (
            <div data-testid="wizard-step-preview" className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Título e Prévia da Mensagem
                </h3>
                <p className="text-xs text-muted-foreground">
                  Defina o título da mensagem e revise os destinatários, regras de agendamento e o texto formatado antes de confirmar.
                </p>
              </div>

              {/* Campo de Título da Mensagem (preenchido com o título do modelo) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="use-template-title-input"
                  className="text-xs font-semibold text-foreground block"
                >
                  Título da Mensagem
                </label>
                <input
                  id="use-template-title-input"
                  data-testid="use-template-title-input"
                  type="text"
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  placeholder="Digite o título da mensagem..."
                  className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Informações Resumidas */}
              <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Destinatários:</span>
                  <span className="font-semibold text-foreground">
                    {selectedClients.length} {selectedClients.length === 1 ? 'cliente' : 'clientes'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Agendamento:</span>
                  <span className="font-semibold text-foreground">
                    {scheduleScope === 'all'
                      ? `Todos em ${globalDate || 'Imediato'} às ${globalTime || '09:00'}`
                      : `Individual por cliente (${selectedClients.length} ${selectedClients.length === 1 ? 'mensagem' : 'mensagens'})`}
                  </span>
                </div>

                {selectedLawsuit && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Processo:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">
                      {selectedLawsuit.number}
                    </span>
                  </div>
                )}

                {selectedFinancial && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fatura:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {selectedFinancial.amount} ({selectedFinancial.code})
                    </span>
                  </div>
                )}

                {selectedDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Audiência:</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {selectedDate.title} ({selectedDate.date})
                    </span>
                  </div>
                )}
              </div>

              {/* Visualização com Pills formatados */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Prévia do Texto
                </span>
                <div
                  data-testid="use-template-preview-text"
                  className="p-4 rounded-xl border border-border/60 bg-muted/20 text-sm text-foreground leading-relaxed min-h-[140px] whitespace-pre-wrap break-words"
                >
                  {renderContentWithPills(template.content)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer com botões de navegação e confirmação */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/20">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              data-testid="wizard-back-btn"
              onClick={() => setCurrentStep((prev) => (prev - 1) as WizardStep)}
              className="gap-1.5 text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs"
            >
              Cancelar
            </Button>
          )}

          {currentStep < 4 ? (
            <Button
              type="button"
              data-testid="wizard-next-btn"
              onClick={() => setCurrentStep((prev) => (prev + 1) as WizardStep)}
              className="gap-1.5 text-xs shadow-sm"
            >
              <span>Avançar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              data-testid="confirm-use-template-btn"
              onClick={handleFinalConfirm}
              className="gap-1.5 text-xs shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Confirmar e Criar Mensagem</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
