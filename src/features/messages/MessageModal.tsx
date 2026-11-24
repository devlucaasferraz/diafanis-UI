import * as React from 'react';
import {
  X,
  Sparkles,
  Info,
  DollarSign,
  Scale,
  Calendar,
  Check,
  ChevronDown,
  Trash2,
  Search,
  Eye,
  PenLine,
  ArrowRight,
  ArrowLeft,
  UserPlus,
  Users,
  Clock,
  Cake,
  Sliders,
} from 'lucide-react';
import { Button } from '@/features/ui/button';
import { Avatar, AvatarFallback } from '@/features/ui/avatar';
import { cn } from '@/shared/cn';
import {
  MessageItem,
  TemplateItem,
  LawsuitOption,
  FinancialOption,
  HearingDateOption,
  ClientRecipient,
  ScheduleScope,
  IndividualScheduleType,
  ClientScheduleConfig,
} from './types';
import {
  allOfficeClients,
  availableLawsuits,
  availableFinancials,
  availableHearingDates,
} from './mock-data';
import { listarClientesMensagens } from './api';
import { getNextBirthdayDate } from './ScheduleDispatchModal';
import { formatClientShortName } from './UseTemplateModal';

export interface MessageModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  type: 'message' | 'template';
  initialData?: MessageItem | TemplateItem | null;
  onClose: () => void;
  onSave: (data: Partial<MessageItem | TemplateItem> | Partial<MessageItem>[]) => void;
}

/**
 * Renderiza o texto substituindo tags de menção (@...) por componentes visuais de pills azuis
 */
export function renderContentWithPills(text: string) {
  const parts = text.split(/(@[a-zA-Z0-9_.]+)/g);
  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((part, idx) => {
        if (!part) return null;
        if (part.startsWith('@')) {
          const testId = `preview-pill-${part.replace('@', '').replace('.', '-')}`;
          return (
            <span
              key={idx}
              data-testid={testId}
              className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-[11px] font-mono font-semibold align-baseline shadow-2xs"
            >
              {part}
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}

type WizardStep = 1 | 2 | 3 | 4;

export const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  mode,
  type,
  initialData,
  onClose,
  onSave,
}) => {
  const isMessage = type === 'message';
  const isCreateMessage = isMessage && mode === 'create';

  // Etapa ativa no Wizard (1 a 4) para criação de mensagem
  const [currentStep, setCurrentStep] = React.useState<WizardStep>(1);

  // Campos básicos de mensagem/modelo
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [hasAlert, setHasAlert] = React.useState(false);

  // Destinatários (clientes)
  const [officeClients, setOfficeClients] = React.useState<ClientRecipient[]>(allOfficeClients);
  const [isLoadingClients, setIsLoadingClients] = React.useState<boolean>(false);
  const [selectedClients, setSelectedClients] = React.useState<ClientRecipient[]>([]);
  const [clientSearchTerm, setClientSearchTerm] = React.useState('');
  const [isAddingClient, setIsAddingClient] = React.useState(false);
  const [addSearchTerm, setAddSearchTerm] = React.useState('');

  // Agendamento (Data de Disparo)
  const [scheduleScope, setScheduleScope] = React.useState<ScheduleScope>('all');
  const [globalDate, setGlobalDate] = React.useState('');
  const [globalTime, setGlobalTime] = React.useState('09:00');
  const [clientSchedules, setClientSchedules] = React.useState<Record<string, ClientScheduleConfig>>({});

  // Objetos de referência
  const [requiresLawsuit, setRequiresLawsuit] = React.useState(false);
  const [requiresFinancial, setRequiresFinancial] = React.useState(false);
  const [requiresDate, setRequiresDate] = React.useState(false);

  const [selectedLawsuit, setSelectedLawsuit] = React.useState<LawsuitOption | null>(null);
  const [selectedFinancial, setSelectedFinancial] = React.useState<FinancialOption | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<HearingDateOption | null>(null);

  // Controles de seletor / popovers
  const [openSelector, setOpenSelector] = React.useState<'lawsuit' | 'financial' | 'date' | null>(null);
  const [financialSearch, setFinancialSearch] = React.useState('');
  const [lawsuitSearch, setLawsuitSearch] = React.useState('');
  const [dateSearch, setDateSearch] = React.useState('');
  const selectorRef = React.useRef<HTMLDivElement>(null);

  // Aba escrever vs prévia
  const [activeTab, setActiveTab] = React.useState<'edit' | 'preview'>('preview');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Fechar popover ao clicar fora ou Escape
  React.useEffect(() => {
    if (!openSelector) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setOpenSelector(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenSelector(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openSelector]);

  // Inicializa dados quando abre o modal
  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setSelectedLawsuit(initialData.selectedLawsuit || null);
      setSelectedFinancial(initialData.selectedFinancial || null);
      setSelectedDate(initialData.selectedDate || null);
      setSelectedClients(initialData.clients && initialData.clients.length > 0 ? [...initialData.clients] : []);

      const tmplData = initialData as TemplateItem;
      setRequiresLawsuit(Boolean(tmplData.requiresLawsuit ?? initialData.selectedLawsuit));
      setRequiresFinancial(Boolean(tmplData.requiresFinancial ?? initialData.selectedFinancial));
      setRequiresDate(Boolean(tmplData.requiresDate ?? initialData.selectedDate));

      if ('hasAlert' in initialData) {
        setHasAlert(Boolean(initialData.hasAlert));
      }

      if ('scheduledAt' in initialData && initialData.scheduledAt) {
        const [d, t] = initialData.scheduledAt.split('T');
        setGlobalDate(d || '');
        setGlobalTime(t ? t.slice(0, 5) : '09:00');
      }
    } else {
      setTitle('');
      setContent('');
      setHasAlert(false);
      setRequiresLawsuit(false);
      setRequiresFinancial(false);
      setRequiresDate(false);
      setSelectedLawsuit(null);
      setSelectedFinancial(null);
      setSelectedDate(null);

      // Nova mensagem inicia com o primeiro cliente e data padrão de amanhã
      const defaultClients = [allOfficeClients[0]];
      setSelectedClients(defaultClients);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      setGlobalDate(`${yyyy}-${mm}-${dd}`);
      setGlobalTime('09:00');
      setScheduleScope('all');

      const initialSchedules: Record<string, ClientScheduleConfig> = {};
      defaultClients.forEach((cli) => {
        initialSchedules[cli.id] = {
          clientId: cli.id,
          type: 'manual',
          date: `${yyyy}-${mm}-${dd}`,
          time: '09:00',
        };
      });
      setClientSchedules(initialSchedules);
    }

    setCurrentStep(1);
    setIsAddingClient(false);
    setClientSearchTerm('');
    setAddSearchTerm('');
    setOpenSelector(null);
    setActiveTab('preview');
  }, [initialData, isOpen]);

  // Carrega a carteira de clientes da API ao abrir o modal
  React.useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingClients(true);

    listarClientesMensagens()
      .then((clients) => {
        if (!isMounted) return;
        if (clients && clients.length > 0) {
          setOfficeClients(clients);
          // Se for nova mensagem e o cliente selecionado ainda for o mock default, sincroniza com o primeiro cliente da API
          if (mode === 'create' && isMessage && !initialData) {
            setSelectedClients((prev) => {
              if (
                prev.length === 0 ||
                (prev.length === 1 && prev[0].id === allOfficeClients[0]?.id && clients[0].id !== allOfficeClients[0]?.id)
              ) {
                return [clients[0]];
              }
              return prev;
            });
          }
        }
      })
      .catch((err) => {
        console.warn('Falha ao listar clientes da API em MessageModal:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingClients(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, mode, isMessage, initialData]);

  if (!isOpen) return null;

  // Handlers de clientes
  const filteredSelectedClients = selectedClients.filter(
    (c) =>
      c.fullName.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  const availableToAdd = officeClients.filter(
    (c) =>
      !selectedClients.some((sc) => sc.id === c.id) &&
      (c.fullName.toLowerCase().includes(addSearchTerm.toLowerCase()) ||
        c.name.toLowerCase().includes(addSearchTerm.toLowerCase()))
  );

  const handleAddClient = (client: ClientRecipient) => {
    setSelectedClients((prev) => [...prev, client]);
    setClientSchedules((prev) => ({
      ...prev,
      [client.id]: {
        clientId: client.id,
        type: 'manual',
        date: globalDate || getNextBirthdayDate(client.birthDate),
        time: globalTime || '09:00',
      },
    }));
    setIsAddingClient(false);
    setAddSearchTerm('');
  };

  const handleRemoveClient = (clientId: string) => {
    setSelectedClients((prev) => prev.filter((c) => c.id !== clientId));
    setClientSchedules((prev) => {
      const next = { ...prev };
      delete next[clientId];
      return next;
    });
  };

  // Handlers de agendamento
  const handleApplyQuickSchedule = (daysAhead: number, time: string) => {
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    setGlobalDate(`${yyyy}-${mm}-${dd}`);
    setGlobalTime(time);
  };

  const handleClientTypeChange = (clientId: string, schedType: IndividualScheduleType) => {
    setClientSchedules((prev) => {
      const client = selectedClients.find((c) => c.id === clientId);
      const current = prev[clientId] || { clientId, type: 'birthday', time: '09:00' };
      const defaultDate = schedType === 'birthday' ? getNextBirthdayDate(client?.birthDate) : globalDate;

      return {
        ...prev,
        [clientId]: {
          ...current,
          type: schedType,
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

  const handleSetAllIndividualType = (schedType: IndividualScheduleType) => {
    setClientSchedules((prev) => {
      const next = { ...prev };
      selectedClients.forEach((client) => {
        const cur = next[client.id] || { clientId: client.id, time: '09:00' };
        const defaultDate = schedType === 'birthday' ? getNextBirthdayDate(client.birthDate) : globalDate;
        next[client.id] = {
          ...cur,
          type: schedType,
          date: defaultDate || cur.date || '',
        };
      });
      return next;
    });
  };

  // Handlers de referências
  const handleToggleSelector = (target: 'lawsuit' | 'financial' | 'date') => {
    setOpenSelector((prev) => {
      const next = prev === target ? null : target;
      setFinancialSearch('');
      setLawsuitSearch('');
      setDateSearch('');
      return next;
    });
  };

  const filteredFinancials = availableFinancials.filter(
    (f) =>
      !financialSearch.trim() ||
      f.code.toLowerCase().includes(financialSearch.toLowerCase()) ||
      f.amount.toLowerCase().includes(financialSearch.toLowerCase()) ||
      f.dueDate.toLowerCase().includes(financialSearch.toLowerCase())
  );

  const filteredLawsuits = availableLawsuits.filter(
    (l) =>
      !lawsuitSearch.trim() ||
      l.number.toLowerCase().includes(lawsuitSearch.toLowerCase()) ||
      l.court.toLowerCase().includes(lawsuitSearch.toLowerCase()) ||
      l.jurisdiction.toLowerCase().includes(lawsuitSearch.toLowerCase()) ||
      (l.title && l.title.toLowerCase().includes(lawsuitSearch.toLowerCase()))
  );

  const filteredDates = availableHearingDates.filter(
    (d) =>
      !dateSearch.trim() ||
      d.title.toLowerCase().includes(dateSearch.toLowerCase()) ||
      d.date.toLowerCase().includes(dateSearch.toLowerCase()) ||
      d.location.toLowerCase().includes(dateSearch.toLowerCase())
  );

  // Inserção de menções
  const handleInsertMention = (mentionTag: string) => {
    if (activeTab === 'preview') {
      setActiveTab('edit');
    }

    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const current = content;

      const prefix = start > 0 && current[start - 1] !== ' ' ? ' ' : '';
      const newContent =
        current.substring(0, start) +
        prefix +
        mentionTag +
        ' ' +
        current.substring(end);

      setContent(newContent);

      setTimeout(() => {
        textarea.focus();
        const cursor = start + prefix.length + mentionTag.length + 1;
        textarea.setSelectionRange(cursor, cursor);
      }, 0);
    } else {
      setContent((prev) => (prev ? `${prev} ${mentionTag} ` : `${mentionTag} `));
    }
  };

  const hasFinancialActive = isMessage ? Boolean(selectedFinancial) : requiresFinancial;
  const hasLawsuitActive = isMessage ? Boolean(selectedLawsuit) : requiresLawsuit;
  const hasDateActive = isMessage ? Boolean(selectedDate) : requiresDate;

  // Submissão do formulário
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    if (isCreateMessage) {
      const globalScheduledAt =
        scheduleScope === 'all' && globalDate ? `${globalDate}T${globalTime || '09:00'}` : null;

      // Se houver mais de um cliente, cria uma mensagem por cliente formatando o título
      if (selectedClients.length > 1) {
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
              title: `${title.trim()} - ${shortClientName}`,
              content: content.trim(),
              category: 'general',
              clients: [client],
              scheduleConfig: {
                scope: 'individual',
                clientSchedules: { [client.id]: cfg },
              },
              scheduledAt: clientScheduledAt,
              selectedLawsuit,
              selectedFinancial,
              selectedDate,
              hasAlert,
            };
          }

          return {
            title: `${title.trim()} - ${shortClientName}`,
            content: content.trim(),
            category: 'general',
            clients: [client],
            scheduleConfig: {
              scope: 'all',
              globalScheduledAt: globalScheduledAt || undefined,
            },
            scheduledAt: globalScheduledAt,
            selectedLawsuit,
            selectedFinancial,
            selectedDate,
            hasAlert,
          };
        });

        onSave(clientMessages);
        onClose();
        return;
      }

      // Mensagem única (1 cliente ou sem clientes)
      onSave({
        title: title.trim(),
        content: content.trim(),
        category: 'general',
        clients: selectedClients,
        selectedLawsuit,
        selectedFinancial,
        selectedDate,
        hasAlert,
        scheduledAt: globalScheduledAt,
        scheduleConfig: {
          scope: scheduleScope,
          globalScheduledAt: globalScheduledAt || undefined,
          clientSchedules: scheduleScope === 'individual' ? clientSchedules : undefined,
        },
      });
      onClose();
      return;
    }

    if (isMessage) {
      onSave({
        ...(initialData || {}),
        title: title.trim(),
        content: content.trim(),
        selectedLawsuit,
        selectedFinancial,
        selectedDate,
        hasAlert,
        clients: selectedClients,
      });
    } else {
      onSave({
        ...(initialData || {}),
        title: title.trim(),
        content: content.trim(),
        requiresLawsuit,
        requiresFinancial,
        requiresDate,
        selectedLawsuit: null,
        selectedFinancial: null,
        selectedDate: null,
      });
    }
    onClose();
  };

  const modalTitle =
    mode === 'create'
      ? isMessage
        ? 'Nova Mensagem'
        : 'Novo Modelo de Disparo'
      : isMessage
        ? 'Editar Mensagem'
        : 'Editar Modelo de Disparo';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-modal-title"
        className="bg-card border border-border/60 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/20">
          <div>
            <h2 id="message-modal-title" className="text-base font-semibold text-foreground tracking-tight">
              {modalTitle}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isCreateMessage
                ? 'Configure destinatários, data de disparo, conteúdo e referências'
                : isMessage
                  ? 'Configure o texto e vincule os objetos de referência'
                  : 'Configure o modelo de texto padrão com tags dinâmicas'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Barra de Progresso visual das 4 etapas (exibida apenas ao criar nova mensagem) */}
        {isCreateMessage && (
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
                    {step === 3 && 'Conteúdo'}
                    {step === 4 && 'Prévia'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Corpo do Modal */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* =========================================================================
              WIZARD ETAPA 1: DESTINATÁRIOS (somente em Nova Mensagem e Step 1)
              ========================================================================= */}
          {isCreateMessage && currentStep === 1 && (
            <div data-testid="wizard-step-recipients" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Selecione os Destinatários
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Escolha os clientes que receberão esta nova mensagem.
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
                        {isLoadingClients ? 'Carregando clientes da API...' : 'Nenhum outro cliente disponível para adicionar.'}
                      </div>
                    ) : (
                      availableToAdd.map((cli) => (
                        <div
                          key={cli.id}
                          data-testid={`add-client-${cli.id}`}
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

              {/* Lista de Destinatários Selecionados */}
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
                          data-testid={`msg-client-${client.id}`}
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
                            data-testid={`remove-client-${client.id}`}
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

          {/* =========================================================================
              WIZARD ETAPA 2: AGENDAMENTO (somente em Nova Mensagem e Step 2)
              ========================================================================= */}
          {isCreateMessage && currentStep === 2 && (
            <div data-testid="wizard-step-scheduling" className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Configurar Agendamento do Envio
                </h3>
                <p className="text-xs text-muted-foreground">
                  Defina a data e o horário em que a mensagem será disparada.
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
                        data-testid="quick-tomorrow-09"
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
                        data-testid="btn-set-all-birthday"
                        onClick={() => handleSetAllIndividualType('birthday')}
                        className="text-[10px] font-medium px-2 py-0.5 rounded border border-border/60 bg-muted/40 hover:bg-muted text-foreground transition-colors"
                      >
                        Todos Aniversário
                      </button>
                      <button
                        type="button"
                        data-testid="btn-set-all-manual"
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
                        type: 'manual',
                        date: globalDate || getNextBirthdayDate(client.birthDate),
                        time: globalTime || '09:00',
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
                                data-testid={`client-type-btn-${client.id}-birthday`}
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
                                data-testid={`client-type-btn-${client.id}-manual`}
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
                              data-testid={`client-date-input-${client.id}`}
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
                              data-testid={`client-time-input-${client.id}`}
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

          {/* =========================================================================
              CONTEÚDO PRINCIPAL (Step 3 do Wizard de Nova Mensagem OU formulário normal)
              ========================================================================= */}
          {(!isCreateMessage || currentStep === 3) && (
            <div data-testid="wizard-step-content" className="space-y-5">
              {/* Título */}
              <div className="space-y-1.5">
                <label htmlFor="message-title" className="text-xs font-semibold text-foreground">
                  Título da {isMessage ? 'Mensagem' : 'Template'} *
                </label>
                <input
                  id="message-title"
                  type="text"
                  required
                  placeholder="Ex: Aviso de Audiência de Instrução ou Felicitação de Aniversário"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-background/80 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* SEÇÃO: Ícones de Objetos de Referência */}
              <div className="space-y-2.5 p-3.5 rounded-xl border border-border/60 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground">
                      {isMessage ? 'Objetos de Referência Vinculados:' : 'Objetos de Referência Exigidos:'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {isMessage
                        ? '(clique no ícone para vincular 1 item)'
                        : '(marque para exigir a referência ao usar o modelo)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Não aplicado (cinza)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-500" /> Aplicado (azul)
                    </span>
                  </div>
                </div>

                {/* Linha com os 3 Ícones (Financeiro, Processo, Data) */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* 1. Ícone de Financeiro */}
                  <div
                    ref={openSelector === 'financial' ? selectorRef : null}
                    className="relative"
                  >
                    <button
                      type="button"
                      data-testid="ref-btn-financial"
                      aria-pressed={hasFinancialActive}
                      onClick={() => {
                        if (isMessage) {
                          handleToggleSelector('financial');
                        } else {
                          setRequiresFinancial((prev) => !prev);
                        }
                      }}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-xs',
                        hasFinancialActive
                          ? 'bg-blue-500/10 text-blue-600 border-blue-500/40 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-700/60'
                          : 'bg-muted/40 text-muted-foreground/50 border-border/40 hover:text-foreground hover:bg-muted/60'
                      )}
                      title={
                        isMessage
                          ? selectedFinancial
                            ? `Financeiro: ${selectedFinancial.code} (${selectedFinancial.amount})`
                            : 'Nenhuma fatura selecionada (clique para escolher)'
                          : requiresFinancial
                            ? 'Financeiro exigido neste modelo (clique para desativar)'
                            : 'Financeiro não exigido (clique para ativar)'
                      }
                    >
                      <DollarSign className="h-4 w-4" />
                      <span>
                        {isMessage && selectedFinancial ? selectedFinancial.code : 'Financeiro'}
                      </span>
                      {isMessage ? (
                        <ChevronDown className="h-3 w-3 opacity-60" />
                      ) : (
                        hasFinancialActive && <Check className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Dropdown / Seletor de Financeiro */}
                    {isMessage && openSelector === 'financial' && (
                      <div
                        data-testid="selector-popover-financial"
                        className="absolute left-0 top-full mt-1.5 z-20 w-72 rounded-xl border border-border/80 bg-popover shadow-xl animate-in fade-in-50 zoom-in-95 overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-2 border-b border-border/40 text-[11px] font-semibold text-muted-foreground bg-muted/20">
                          <span>Selecione 1 fatura</span>
                          {selectedFinancial && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFinancial(null);
                                setOpenSelector(null);
                              }}
                              className="text-destructive hover:underline flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" /> Limpar
                            </button>
                          )}
                        </div>

                        <div className="relative p-2 border-b border-border/30 bg-background/50">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <input
                            type="text"
                            autoFocus
                            data-testid="search-financial-input"
                            placeholder="Buscar por código, valor ou vencimento..."
                            value={financialSearch}
                            onChange={(e) => setFinancialSearch(e.target.value)}
                            className="w-full rounded-lg border border-border/50 bg-background py-1.5 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                          />
                        </div>

                        <div className="p-1 space-y-1 max-h-40 overflow-y-auto">
                          {filteredFinancials.length === 0 ? (
                            <div className="py-3 text-center text-xs text-muted-foreground">
                              Nenhuma fatura encontrada.
                            </div>
                          ) : (
                            filteredFinancials.map((fin) => (
                              <button
                                key={fin.id}
                                type="button"
                                onClick={() => {
                                  setSelectedFinancial(fin);
                                  setOpenSelector(null);
                                }}
                                className={cn(
                                  'w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors',
                                  selectedFinancial?.id === fin.id
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'hover:bg-muted text-foreground'
                                )}
                              >
                                <div>
                                  <div className="font-semibold">{fin.amount}</div>
                                  <div className="text-[10px] text-muted-foreground">{fin.code} • Vencimento: {fin.dueDate}</div>
                                </div>
                                {selectedFinancial?.id === fin.id && <Check className="h-3.5 w-3.5" />}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Ícone de Processo */}
                  <div
                    ref={openSelector === 'lawsuit' ? selectorRef : null}
                    className="relative"
                  >
                    <button
                      type="button"
                      data-testid="ref-btn-lawsuit"
                      aria-pressed={hasLawsuitActive}
                      onClick={() => {
                        if (isMessage) {
                          handleToggleSelector('lawsuit');
                        } else {
                          setRequiresLawsuit((prev) => !prev);
                        }
                      }}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-xs',
                        hasLawsuitActive
                          ? 'bg-blue-500/10 text-blue-600 border-blue-500/40 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-700/60'
                          : 'bg-muted/40 text-muted-foreground/50 border-border/40 hover:text-foreground hover:bg-muted/60'
                      )}
                      title={
                        isMessage
                          ? selectedLawsuit
                            ? `Processo: ${selectedLawsuit.number}`
                            : 'Nenhum processo selecionado (clique para escolher)'
                          : requiresLawsuit
                            ? 'Processo exigido neste modelo (clique para desativar)'
                            : 'Processo não exigido (clique para ativar)'
                      }
                    >
                      <Scale className="h-4 w-4" />
                      <span className="max-w-[140px] truncate font-mono">
                        {isMessage && selectedLawsuit ? selectedLawsuit.number : 'Processo'}
                      </span>
                      {isMessage ? (
                        <ChevronDown className="h-3 w-3 opacity-60" />
                      ) : (
                        hasLawsuitActive && <Check className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Dropdown / Seletor de Processo */}
                    {isMessage && openSelector === 'lawsuit' && (
                      <div
                        data-testid="selector-popover-lawsuit"
                        className="absolute left-0 top-full mt-1.5 z-20 w-80 rounded-xl border border-border/80 bg-popover shadow-xl animate-in fade-in-50 zoom-in-95 overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-2 border-b border-border/40 text-[11px] font-semibold text-muted-foreground bg-muted/20">
                          <span>Selecione 1 processo</span>
                          {selectedLawsuit && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLawsuit(null);
                                setOpenSelector(null);
                              }}
                              className="text-destructive hover:underline flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" /> Limpar
                            </button>
                          )}
                        </div>

                        <div className="relative p-2 border-b border-border/30 bg-background/50">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <input
                            type="text"
                            autoFocus
                            data-testid="search-lawsuit-input"
                            placeholder="Buscar por número CNJ, vara ou comarca..."
                            value={lawsuitSearch}
                            onChange={(e) => setLawsuitSearch(e.target.value)}
                            className="w-full rounded-lg border border-border/50 bg-background py-1.5 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                          />
                        </div>

                        <div className="p-1 space-y-1 max-h-40 overflow-y-auto">
                          {filteredLawsuits.length === 0 ? (
                            <div className="py-3 text-center text-xs text-muted-foreground">
                              Nenhum processo encontrado.
                            </div>
                          ) : (
                            filteredLawsuits.map((law) => (
                              <button
                                key={law.id}
                                type="button"
                                onClick={() => {
                                  setSelectedLawsuit(law);
                                  setOpenSelector(null);
                                }}
                                className={cn(
                                  'w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors',
                                  selectedLawsuit?.id === law.id
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'hover:bg-muted text-foreground'
                                )}
                              >
                                <div>
                                  <div className="font-mono text-xs">{law.number}</div>
                                  <div className="text-[10px] text-muted-foreground">{law.court} • {law.jurisdiction}</div>
                                </div>
                                {selectedLawsuit?.id === law.id && <Check className="h-3.5 w-3.5" />}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Ícone de Data/Audiência */}
                  <div
                    ref={openSelector === 'date' ? selectorRef : null}
                    className="relative"
                  >
                    <button
                      type="button"
                      data-testid="ref-btn-date"
                      aria-pressed={hasDateActive}
                      onClick={() => {
                        if (isMessage) {
                          handleToggleSelector('date');
                        } else {
                          setRequiresDate((prev) => !prev);
                        }
                      }}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-xs',
                        hasDateActive
                          ? 'bg-blue-500/10 text-blue-600 border-blue-500/40 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-700/60'
                          : 'bg-muted/40 text-muted-foreground/50 border-border/40 hover:text-foreground hover:bg-muted/60'
                      )}
                      title={
                        isMessage
                          ? selectedDate
                            ? `Data: ${selectedDate.title} (${selectedDate.date})`
                            : 'Nenhuma audiência/data selecionada (clique para escolher)'
                          : requiresDate
                            ? 'Data de audiência exigida neste modelo (clique para desativar)'
                            : 'Data de audiência não exigida (clique para ativar)'
                      }
                    >
                      <Calendar className="h-4 w-4" />
                      <span className="max-w-[130px] truncate">
                        {isMessage && selectedDate ? selectedDate.date : 'Data / Audiência'}
                      </span>
                      {isMessage ? (
                        <ChevronDown className="h-3 w-3 opacity-60" />
                      ) : (
                        hasDateActive && <Check className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Dropdown / Seletor de Data */}
                    {isMessage && openSelector === 'date' && (
                      <div
                        data-testid="selector-popover-date"
                        className="absolute left-0 top-full mt-1.5 z-20 w-80 rounded-xl border border-border/80 bg-popover shadow-xl animate-in fade-in-50 zoom-in-95 overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-2 border-b border-border/40 text-[11px] font-semibold text-muted-foreground bg-muted/20">
                          <span>Selecione 1 evento</span>
                          {selectedDate && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDate(null);
                                setOpenSelector(null);
                              }}
                              className="text-destructive hover:underline flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" /> Limpar
                            </button>
                          )}
                        </div>

                        <div className="relative p-2 border-b border-border/30 bg-background/50">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <input
                            type="text"
                            autoFocus
                            data-testid="search-date-input"
                            placeholder="Buscar por título, data ou local..."
                            value={dateSearch}
                            onChange={(e) => setDateSearch(e.target.value)}
                            className="w-full rounded-lg border border-border/50 bg-background py-1.5 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                          />
                        </div>

                        <div className="p-1 space-y-1 max-h-40 overflow-y-auto">
                          {filteredDates.length === 0 ? (
                            <div className="py-3 text-center text-xs text-muted-foreground">
                              Nenhum evento encontrado.
                            </div>
                          ) : (
                            filteredDates.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  setSelectedDate(item);
                                  setOpenSelector(null);
                                }}
                                className={cn(
                                  'w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors',
                                  selectedDate?.id === item.id
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'hover:bg-muted text-foreground'
                                )}
                              >
                                <div>
                                  <div>{item.title}</div>
                                  <div className="text-[10px] text-muted-foreground">{item.date} às {item.time}</div>
                                </div>
                                {selectedDate?.id === item.id && <Check className="h-3.5 w-3.5" />}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SEÇÃO: Pills / Mentions Disponíveis e Textarea */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="message-content" className="text-xs font-semibold text-foreground">
                    Corpo do Texto *
                  </label>

                  <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/40">
                    <button
                      type="button"
                      data-testid="tab-write-btn"
                      onClick={() => setActiveTab('edit')}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                        activeTab === 'edit'
                          ? 'bg-background text-foreground shadow-2xs font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <PenLine className="h-3.5 w-3.5" />
                      <span>Escrever</span>
                    </button>
                    <button
                      type="button"
                      data-testid="tab-preview-btn"
                      onClick={() => setActiveTab('preview')}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                        activeTab === 'preview'
                          ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Prévia</span>
                    </button>
                  </div>
                </div>

                {activeTab === 'edit' && (
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-2.5">
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-blue-500" /> Pills do Cliente (sempre disponíveis):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertMention('@cliente.nome')}
                          data-testid="pill-cliente-nome"
                          className="rounded-lg bg-blue-500/10 border border-blue-500/40 px-2 py-1 text-[11px] font-mono text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors shadow-2xs"
                        >
                          @cliente.nome
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertMention('@cliente.telefone')}
                          data-testid="pill-cliente-telefone"
                          className="rounded-lg bg-blue-500/10 border border-blue-500/40 px-2 py-1 text-[11px] font-mono text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors shadow-2xs"
                        >
                          @cliente.telefone
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertMention('@cliente.aniversario')}
                          data-testid="pill-cliente-aniversario"
                          className="rounded-lg bg-blue-500/10 border border-blue-500/40 px-2 py-1 text-[11px] font-mono text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors shadow-2xs"
                        >
                          @cliente.aniversario
                        </button>
                      </div>
                    </div>

                    {(hasLawsuitActive || hasFinancialActive || hasDateActive) ? (
                      <div className="pt-2 border-t border-border/30">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Check className="h-3 w-3 text-emerald-500" /> Pills dos Objetos Aplicados:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {hasLawsuitActive && (
                            <>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleInsertMention('@processo.numero')}
                                data-testid="pill-processo-numero"
                                className="rounded-lg bg-indigo-500/10 border border-indigo-500/40 px-2 py-1 text-[11px] font-mono text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 transition-colors shadow-2xs"
                              >
                                @processo.numero
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleInsertMention('@processo.vara')}
                                data-testid="pill-processo-vara"
                                className="rounded-lg bg-indigo-500/10 border border-indigo-500/40 px-2 py-1 text-[11px] font-mono text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 transition-colors shadow-2xs"
                              >
                                @processo.vara
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleInsertMention('@processo.comarca')}
                                data-testid="pill-processo-comarca"
                                className="rounded-lg bg-indigo-500/10 border border-indigo-500/40 px-2 py-1 text-[11px] font-mono text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 transition-colors shadow-2xs"
                              >
                                @processo.comarca
                              </button>
                            </>
                          )}

                          {hasFinancialActive && (
                            <>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleInsertMention('@fatura.codigo')}
                                data-testid="pill-fatura-codigo"
                                className="rounded-lg bg-emerald-500/10 border border-emerald-500/40 px-2 py-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors shadow-2xs"
                              >
                                @fatura.codigo
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleInsertMention('@fatura.valor')}
                                data-testid="pill-fatura-valor"
                                className="rounded-lg bg-emerald-500/10 border border-emerald-500/40 px-2 py-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors shadow-2xs"
                              >
                                @fatura.valor
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleInsertMention('@fatura.vencimento')}
                                data-testid="pill-fatura-vencimento"
                                className="rounded-lg bg-emerald-500/10 border border-emerald-500/40 px-2 py-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors shadow-2xs"
                              >
                                @fatura.vencimento
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleInsertMention('@fatura.codigo_pix')}
                                data-testid="pill-fatura-pix"
                                className="rounded-lg bg-emerald-500/10 border border-emerald-500/40 px-2 py-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors shadow-2xs"
                              >
                                @fatura.codigo_pix
                              </button>
                            </>
                          )}

                          {hasDateActive && (
                            <>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleInsertMention('@data.audiencia')}
                                data-testid="pill-data-audiencia"
                                className="rounded-lg bg-purple-500/10 border border-purple-500/40 px-2 py-1 text-[11px] font-mono text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-colors shadow-2xs"
                              >
                                @data.audiencia
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleInsertMention('@data.horario')}
                                data-testid="pill-data-horario"
                                className="rounded-lg bg-purple-500/10 border border-purple-500/40 px-2 py-1 text-[11px] font-mono text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-colors shadow-2xs"
                              >
                                @data.horario
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleInsertMention('@data.local')}
                                data-testid="pill-data-local"
                                className="rounded-lg bg-purple-500/10 border border-purple-500/40 px-2 py-1 text-[11px] font-mono text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-colors shadow-2xs"
                              >
                                @data.local
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1.5 text-[11px] text-muted-foreground/80 flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
                        <span>Selecione um ícone acima (Financeiro, Processo ou Data) para habilitar as tags específicas daquele objeto.</span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'edit' ? (
                  <textarea
                    id="message-content"
                    ref={textareaRef}
                    rows={5}
                    required
                    placeholder="Digite a mensagem. Ex: Olá @cliente.nome, informamos que a sua audiência do processo @processo.numero está marcada para @data.audiencia."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-xl border border-border/60 bg-background/80 p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed font-sans transition-all"
                  />
                ) : (
                  <div
                    data-testid="message-preview-container"
                    className="w-full min-h-[120px] max-h-[220px] overflow-y-auto rounded-xl border border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/20 p-3.5 text-xs text-foreground leading-relaxed font-sans"
                  >
                    <div className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Visualização com Pills Formatadas:
                    </div>
                    {content.trim() ? (
                      renderContentWithPills(content)
                    ) : (
                      <span className="text-muted-foreground italic text-xs">
                        Nenhum texto digitado ainda. Volte para a aba &quot;Escrever&quot; para redigir a mensagem ou inserir pills.
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              WIZARD ETAPA 4: PRÉVIA E CONFIRMAÇÃO (somente em Nova Mensagem e Step 4)
              ========================================================================= */}
          {isCreateMessage && currentStep === 4 && (
            <div data-testid="wizard-step-preview" className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Revisão e Confirmação da Mensagem
                </h3>
                <p className="text-xs text-muted-foreground">
                  Confira os detalhes dos destinatários, agendamento e texto antes de salvar.
                </p>
              </div>

              {/* Informações Resumidas */}
              <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Título:</span>
                  <span className="font-semibold text-foreground">{title || 'Sem título'}</span>
                </div>

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

              {/* Prévia com Pills */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Prévia do Texto
                </span>
                <div className="p-4 rounded-xl border border-border/60 bg-muted/20 text-sm text-foreground leading-relaxed min-h-[120px] whitespace-pre-wrap break-words">
                  {content.trim() ? (
                    renderContentWithPills(content)
                  ) : (
                    <span className="text-muted-foreground italic text-xs">Nenhum texto redigido.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer com botões de navegação ou salvar */}
          <div className="flex items-center justify-between pt-4 border-t border-border/30">
            {isCreateMessage ? (
              <>
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-testid="wizard-back-btn"
                    onClick={() => setCurrentStep((prev) => (prev - 1) as WizardStep)}
                    className="gap-1.5 text-xs"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Voltar</span>
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">
                    Cancelar
                  </Button>
                )}

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    data-testid="wizard-next-btn"
                    onClick={() => {
                      if (currentStep === 1 && selectedClients.length === 0) {
                        alert('Selecione ao menos um destinatário para continuar.');
                        return;
                      }
                      if (currentStep === 3 && !title.trim()) {
                        alert('Informe o título da mensagem antes de avançar.');
                        return;
                      }
                      setCurrentStep((prev) => (prev + 1) as WizardStep);
                    }}
                    className="gap-1.5 text-xs shadow-sm"
                  >
                    <span>Avançar</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    data-testid="confirm-create-message-btn"
                    onClick={() => handleSubmit()}
                    className="gap-1.5 text-xs shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Confirmar e Criar Mensagem</span>
                  </Button>
                )}
              </>
            ) : (
              <div className="flex items-center justify-end gap-2.5 w-full">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm">
                  Salvar {isMessage ? 'Mensagem' : 'Modelo'}
                </Button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
