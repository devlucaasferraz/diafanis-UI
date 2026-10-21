import * as React from 'react';
import {
  Bell,
  MessageSquare,
  FileText,
  AlertCircle,
  Plus,
  Search,
  ArrowUpDown,
  Send,
  Trash2,
} from 'lucide-react';
import { GlassPanel } from '@/features/ui/glass-panel';
import { Button } from '@/features/ui/button';
import { StatusBadge } from '@/features/ui/status-badge';
import { FloatingTabNav } from './FloatingTabNav';
import { MessageListItem } from './MessageListItem';
import { MessageModal } from './MessageModal';
import { ClientRecipientsModal } from './ClientRecipientsModal';
import { SendConfirmationModal } from './SendConfirmationModal';
import { ScheduleDispatchModal } from './ScheduleDispatchModal';
import { MessagePreviewModal } from './MessagePreviewModal';
import { UseTemplateModal } from './UseTemplateModal';
import { initialMessages, initialTemplates } from './mock-data';
import { MessageItem, TemplateItem, MessageTabId, ClientRecipient, ScheduleConfig } from './types';

export const MessagesContainer: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<MessageTabId>('messages');

  // Listas de mensagens e modelos
  const [messages, setMessages] = React.useState<MessageItem[]>(initialMessages);
  const [templates, setTemplates] = React.useState<TemplateItem[]>(initialTemplates);

  // Estados de busca, ordenação e seleção em massa de mensagens
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'title' | 'scheduledAt' | 'client'>('title');
  const [selectedMessageIds, setSelectedMessageIds] = React.useState<string[]>([]);

  const hasAnySelected = selectedMessageIds.length > 0;

  // Estados do Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = React.useState<MessageItem | TemplateItem | null>(null);

  // Estados do Modal de Destinatários (Carrossel de Clientes)
  const [clientModalItem, setClientModalItem] = React.useState<MessageItem | TemplateItem | null>(null);

  // Estados do Modal de Confirmação de Envio
  const [sendModalItem, setSendModalItem] = React.useState<MessageItem | null>(null);

  // Estados do Modal de Agendamento de Envio (Data e Hora)
  const [scheduleModalItem, setScheduleModalItem] = React.useState<MessageItem | TemplateItem | null>(null);

  // Estados do Modal de Prévia de Mensagem (ao clicar na mensagem)
  const [previewMessage, setPreviewMessage] = React.useState<MessageItem | null>(null);

  // Estados do Modal de Usar Modelo (Wizard de 4 etapas)
  const [useTemplateItem, setUseTemplateItem] = React.useState<TemplateItem | null>(null);

  // Mapeamento dinâmico de urgência (bolinha vermelha na barra de abas)
  const hasUrgentMessages = React.useMemo(() => {
    return messages.some((m) => m.hasAlert);
  }, [messages]);

  const urgencyMap: Partial<Record<MessageTabId, boolean>> = {
    notifications: true, // Notificações internas com prazos fatais (RF11)
    messages: hasUrgentMessages, // Alerta dinâmico baseado nas mensagens com alerta
    templates: false,
  };

  // Filtragem e Ordenação de Mensagens (inclui título, conteúdo, cliente e objetos de vínculo)
  const filteredMessages = React.useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const list = !term
      ? [...messages]
      : messages.filter((m) => {
          const matchesTitleOrContent =
            m.title.toLowerCase().includes(term) ||
            m.content.toLowerCase().includes(term);

          const matchesClient =
            m.clients &&
            m.clients.some(
              (c) =>
                c.fullName.toLowerCase().includes(term) ||
                c.name.toLowerCase().includes(term)
            );

          const matchesLawsuit =
            m.selectedLawsuit &&
            (m.selectedLawsuit.number.toLowerCase().includes(term) ||
              m.selectedLawsuit.court.toLowerCase().includes(term) ||
              m.selectedLawsuit.jurisdiction.toLowerCase().includes(term) ||
              (m.selectedLawsuit.title && m.selectedLawsuit.title.toLowerCase().includes(term)));

          const matchesFinancial =
            m.selectedFinancial &&
            (m.selectedFinancial.code.toLowerCase().includes(term) ||
              m.selectedFinancial.amount.toLowerCase().includes(term) ||
              m.selectedFinancial.dueDate.toLowerCase().includes(term));

          const matchesDate =
            m.selectedDate &&
            (m.selectedDate.title.toLowerCase().includes(term) ||
              m.selectedDate.date.toLowerCase().includes(term) ||
              m.selectedDate.location.toLowerCase().includes(term));

          return Boolean(
            matchesTitleOrContent ||
              matchesClient ||
              matchesLawsuit ||
              matchesFinancial ||
              matchesDate
          );
        });

    return list.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title, 'pt-BR');
      }
      if (sortBy === 'scheduledAt') {
        const dateA = new Date(a.scheduledAt || a.createdAt).getTime();
        const dateB = new Date(b.scheduledAt || b.createdAt).getTime();
        return dateA - dateB;
      }
      if (sortBy === 'client') {
        const clientA = a.clients?.[0]?.fullName || '';
        const clientB = b.clients?.[0]?.fullName || '';
        return clientA.localeCompare(clientB, 'pt-BR');
      }
      return 0;
    });
  }, [messages, searchTerm, sortBy]);

  const filteredTemplates = React.useMemo(() => {
    if (!searchTerm.trim()) return templates;
    const term = searchTerm.toLowerCase();
    return templates.filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        t.content.toLowerCase().includes(term)
    );
  }, [templates, searchTerm]);

  // Ações de abertura do modal de edição
  const handleOpenCreate = () => {
    setSelectedItem(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MessageItem | TemplateItem) => {
    setSelectedItem(item);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Ações de gerenciamento de clientes vinculados à mensagem
  const handleOpenClientsModal = (item: MessageItem | TemplateItem) => {
    setClientModalItem(item);
  };

  const handleRemoveClient = (clientId: string) => {
    if (!clientModalItem) return;

    if (activeTab === 'messages') {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === clientModalItem.id
            ? { ...msg, clients: msg.clients.filter((c) => c.id !== clientId) }
            : msg
        )
      );
    } else {
      setTemplates((prev) =>
        prev.map((tmpl) =>
          tmpl.id === clientModalItem.id
            ? { ...tmpl, clients: (tmpl.clients || []).filter((c) => c.id !== clientId) }
            : tmpl
        )
      );
    }

    setClientModalItem((prev) =>
      prev ? { ...prev, clients: (prev.clients || []).filter((c) => c.id !== clientId) } : null
    );
  };

  const handleAddClient = (client: ClientRecipient) => {
    if (!clientModalItem) return;

    if (activeTab === 'messages') {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === clientModalItem.id
            ? { ...msg, clients: [...msg.clients, client] }
            : msg
        )
      );
    } else {
      setTemplates((prev) =>
        prev.map((tmpl) =>
          tmpl.id === clientModalItem.id
            ? { ...tmpl, clients: [...(tmpl.clients || []), client] }
            : tmpl
        )
      );
    }

    setClientModalItem((prev) =>
      prev ? { ...prev, clients: [...(prev.clients || []), client] } : null
    );
  };

  // Ações de envio
  const handleOpenSendModal = (message: MessageItem) => {
    setSendModalItem(message);
  };

  const handleConfirmSend = (message: MessageItem) => {
    // Ao enviar, remove o alerta de urgência daquela mensagem (marcada como tratada)
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, hasAlert: false } : m))
    );
  };

  // Ações de exclusão e urgência individual (no modal de prévia/view)
  const handleDeleteMessage = (message: MessageItem) => {
    setMessages((prev) => prev.filter((m) => m.id !== message.id));
    setSelectedMessageIds((prev) => prev.filter((id) => id !== message.id));
    setPreviewMessage(null);
  };

  const handleToggleMessageUrgency = (message: MessageItem, hasAlert: boolean) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, hasAlert } : m))
    );
    setPreviewMessage((prev) =>
      prev && prev.id === message.id ? { ...prev, hasAlert } : prev
    );
  };

  // Ações de seleção em massa no grid de mensagens
  const handleToggleSelectMessage = (message: MessageItem) => {
    setSelectedMessageIds((prev) =>
      prev.includes(message.id)
        ? prev.filter((id) => id !== message.id)
        : [...prev, message.id]
    );
  };

  const handleSelectAllMessages = () => {
    setSelectedMessageIds(filteredMessages.map((m) => m.id));
  };

  const handleDeselectAllMessages = () => {
    setSelectedMessageIds([]);
  };

  const handleBulkToggleUrgency = () => {
    if (selectedMessageIds.length === 0) return;
    const allSelectedUrgent = messages
      .filter((m) => selectedMessageIds.includes(m.id))
      .every((m) => m.hasAlert);
    const nextUrgency = !allSelectedUrgent;

    setMessages((prev) =>
      prev.map((m) =>
        selectedMessageIds.includes(m.id) ? { ...m, hasAlert: nextUrgency } : m
      )
    );
  };

  const handleBulkSend = () => {
    if (selectedMessageIds.length === 0) return;
    setMessages((prev) =>
      prev.map((m) =>
        selectedMessageIds.includes(m.id) ? { ...m, hasAlert: false } : m
      )
    );
    setSelectedMessageIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedMessageIds.length === 0) return;
    setMessages((prev) => prev.filter((m) => !selectedMessageIds.includes(m.id)));
    setSelectedMessageIds([]);
  };

  // Ações de agendamento (Data e Hora)
  const handleOpenScheduleModal = (item: MessageItem | TemplateItem) => {
    setScheduleModalItem(item);
  };

  const handleSaveSchedule = (config: ScheduleConfig | null) => {
    if (!scheduleModalItem) return;

    const scheduledAt = config?.scope === 'all' ? (config.globalScheduledAt || null) : null;

    if (activeTab === 'messages') {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === scheduleModalItem.id
            ? { ...m, scheduleConfig: config, scheduledAt }
            : m
        )
      );
    } else {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === scheduleModalItem.id
            ? { ...t, scheduleConfig: config, scheduledAt }
            : t
        )
      );
    }
  };

  // Ações de Usar Modelo (Wizard de 4 etapas)
  const handleOpenUseTemplate = (template: TemplateItem) => {
    setUseTemplateItem(template);
  };

  const handleConfirmUseTemplate = (data: Partial<MessageItem> | Partial<MessageItem>[]) => {
    const items = Array.isArray(data) ? data : [data];
    const baseTime = Date.now();

    const newMessages: MessageItem[] = items.map((item, idx) => ({
      id: `msg-${baseTime}-${idx}`,
      title: item.title || 'Nova Mensagem',
      content: item.content || '',
      category: item.category || 'general',
      clients: item.clients || [],
      scheduleConfig: item.scheduleConfig,
      scheduledAt: item.scheduledAt || null,
      selectedLawsuit: item.selectedLawsuit || null,
      selectedFinancial: item.selectedFinancial || null,
      selectedDate: item.selectedDate || null,
      hasAlert: false,
      createdAt: new Date().toISOString(),
    }));

    setMessages((prev) => [...newMessages, ...prev]);
    setActiveTab('messages');
  };

  // Salvar criação ou edição
  const handleSaveModal = (data: Partial<MessageItem | TemplateItem>) => {
    if (activeTab === 'messages') {
      if (modalMode === 'create') {
        const newMessage: MessageItem = {
          id: `msg-${Date.now()}`,
          title: data.title || 'Nova Mensagem',
          content: data.content || '',
          category: data.category || 'general',
          clients: [],
          selectedLawsuit: data.selectedLawsuit || null,
          selectedFinancial: data.selectedFinancial || null,
          selectedDate: data.selectedDate || null,
          hasAlert: Boolean((data as Partial<MessageItem>).hasAlert),
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [newMessage, ...prev]);
      } else if (selectedItem) {
        setMessages((prev) =>
          prev.map((m) => (m.id === selectedItem.id ? ({ ...m, ...data } as MessageItem) : m))
        );
      }
    } else if (activeTab === 'templates') {
      const tmplData = data as Partial<TemplateItem>;
      if (modalMode === 'create') {
        const newTemplate: TemplateItem = {
          id: `tmpl-${Date.now()}`,
          title: tmplData.title || 'Novo Modelo',
          content: tmplData.content || '',
          clients: [],
          requiresLawsuit: Boolean(tmplData.requiresLawsuit),
          requiresFinancial: Boolean(tmplData.requiresFinancial),
          requiresDate: Boolean(tmplData.requiresDate),
          selectedLawsuit: null,
          selectedFinancial: null,
          selectedDate: null,
          updatedAt: new Date().toISOString(),
        };
        setTemplates((prev) => [newTemplate, ...prev]);
      } else if (selectedItem) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === selectedItem.id ? ({ ...t, ...tmplData } as TemplateItem) : t))
        );
      }
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] pb-16">
      {/* Barra de Navegação Persistente e Flutuante no Centro Superior */}
      <FloatingTabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        urgencyMap={urgencyMap}
      />

      {/* Conteúdo Principal de cada Aba */}
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* Painel da Aba: Notificações */}
        {activeTab === 'notifications' && (
          <section
            id="tabpanel-notifications"
            role="tabpanel"
            aria-labelledby="tab-notifications"
            className="space-y-6 animate-in fade-in-50 duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Bell className="h-6 w-6 text-primary" />
                  Notificações Internas
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Avisos internos aos advogados sobre prazos críticos atribuídos a eles (RF11).
                </p>
              </div>
            </div>

            <GlassPanel className="p-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertCircle className="h-7 w-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  Central de Notificações Internas
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Feed de alertas prioritários sobre prazos fatais e intimações atribuídas aos advogados do escritório.
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <StatusBadge status="fatal" label="3 Prazos Críticos Pendentes" />
                <StatusBadge status="in_progress" label="1 Audiência Próxima" />
              </div>
            </GlassPanel>
          </section>
        )}

        {/* Painel da Aba: Mensagens */}
        {activeTab === 'messages' && (
          <section
            id="tabpanel-messages"
            role="tabpanel"
            aria-labelledby="tab-messages"
            className="space-y-6 animate-in fade-in-50 duration-300"
          >
            {/* Header da Aba com Busca e Botão de Nova Mensagem */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  Mensagens
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Comunicação direta com clientes, lembretes de audiência e felicitações (RF9).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleOpenCreate}
                  size="sm"
                  className="gap-1.5 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Nova Mensagem
                </Button>
              </div>
            </div>

            {/* Barra de Busca e Ordenação */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                <div className="relative flex-1 min-w-[220px] max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar mensagens por título, conteúdo, cliente ou vínculo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-border/60 bg-background/80 py-2 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Seletor de Ordenamento: Título, Data de Envio, Cliente */}
                <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3 py-1.5">
                  <label
                    htmlFor="messages-sort-select"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium whitespace-nowrap select-none cursor-pointer"
                  >
                    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>Ordenar por:</span>
                  </label>
                  <select
                    id="messages-sort-select"
                    data-testid="messages-sort-select"
                    aria-label="Ordenar mensagens por"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'title' | 'scheduledAt' | 'client')}
                    className="bg-transparent py-0.5 text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="title">Título</option>
                    <option value="scheduledAt">Data de Envio</option>
                    <option value="client">Cliente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Barra de Ações em Massa abaixo da pesquisa (só aparece se ao menos uma caixa estiver selecionada) */}
            {hasAnySelected && (
              <div
                data-testid="bulk-actions-bar"
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-2.5 animate-in fade-in duration-150"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-foreground mr-1">
                    {selectedMessageIds.length} selecionada(s)
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-testid="bulk-select-all-btn"
                    onClick={handleSelectAllMessages}
                    disabled={
                      filteredMessages.length > 0 &&
                      filteredMessages.every((m) => selectedMessageIds.includes(m.id))
                    }
                    className="text-xs h-7 px-2.5"
                  >
                    Marcar todos
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-testid="bulk-deselect-all-btn"
                    onClick={handleDeselectAllMessages}
                    className="text-xs h-7 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    Desmarcar todos
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-testid="bulk-urgency-btn"
                    onClick={handleBulkToggleUrgency}
                    className="gap-1.5 text-xs h-8 border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Urgência</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-testid="bulk-send-btn"
                    onClick={handleBulkSend}
                    className="gap-1.5 text-xs h-8 border-primary/40 text-primary hover:bg-primary/10"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Enviar</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-testid="bulk-delete-btn"
                    onClick={handleBulkDelete}
                    className="gap-1.5 text-xs h-8 border-destructive/40 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Excluir</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Grid / Lista de Mensagens */}
            <div className="space-y-2.5">
              {filteredMessages.length === 0 ? (
                <GlassPanel className="p-8 text-center text-muted-foreground text-xs">
                  Nenhuma mensagem encontrada com os filtros atuais.
                </GlassPanel>
              ) : (
                filteredMessages.map((message) => (
                  <MessageListItem
                    key={message.id}
                    item={message}
                    isMessage={true}
                    isSelected={selectedMessageIds.includes(message.id)}
                    hasAnySelected={hasAnySelected}
                    onToggleSelect={handleToggleSelectMessage}
                    onSelect={(item) => setPreviewMessage(item as MessageItem)}
                    onEdit={handleOpenEdit}
                    onSend={handleOpenSendModal}
                    onOpenClients={handleOpenClientsModal}
                    onSchedule={handleOpenScheduleModal}
                  />
                ))
              )}
            </div>
          </section>
        )}

        {/* Painel da Aba: Modelos */}
        {activeTab === 'templates' && (
          <section
            id="tabpanel-templates"
            role="tabpanel"
            aria-labelledby="tab-templates"
            className="space-y-6 animate-in fade-in-50 duration-300"
          >
            {/* Header da Aba com Busca e Botão de Novo Modelo */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Modelos de Disparo
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Templates padrão de felicitação ou aviso de audiência para envio manual ou webhook futuro (RF10).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleOpenCreate}
                  size="sm"
                  className="gap-1.5 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Novo Modelo
                </Button>
              </div>
            </div>

            {/* Barra de Filtros e Busca */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar modelos por título ou texto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-background/80 py-2 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="text-[11px] text-muted-foreground hidden sm:block">
                <span>Clique em <strong>Usar Modelo</strong> para gerar uma mensagem com destinatários e agendamento.</span>
              </div>
            </div>

            {/* Grid / Lista de Modelos */}
            <div className="space-y-2.5">
              {filteredTemplates.length === 0 ? (
                <GlassPanel className="p-8 text-center text-muted-foreground text-xs">
                  Nenhum modelo encontrado com os filtros atuais.
                </GlassPanel>
              ) : (
                filteredTemplates.map((template) => (
                  <MessageListItem
                    key={template.id}
                    item={template}
                    isMessage={false}
                    onSelect={handleOpenEdit}
                    onEdit={handleOpenEdit}
                    onUseTemplate={handleOpenUseTemplate}
                    onOpenClients={handleOpenClientsModal}
                    onSchedule={handleOpenScheduleModal}
                  />
                ))
              )}
            </div>
          </section>
        )}
      </div>

      {/* Modal de Criação / Edição com Seleção Única e Desbloqueio de Pills */}
      <MessageModal
        isOpen={isModalOpen}
        mode={modalMode}
        type={activeTab === 'templates' ? 'template' : 'message'}
        initialData={selectedItem}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
      />

      {/* Modal de Prévia ao clicar na mensagem */}
      <MessagePreviewModal
        isOpen={Boolean(previewMessage)}
        message={previewMessage}
        onClose={() => setPreviewMessage(null)}
        onEdit={(msg) => handleOpenEdit(msg)}
        onSend={(msg) => handleOpenSendModal(msg)}
        onDelete={handleDeleteMessage}
        onToggleUrgency={handleToggleMessageUrgency}
      />

      {/* Modal de Usar Modelo (Wizard 4 etapas) */}
      <UseTemplateModal
        isOpen={Boolean(useTemplateItem)}
        template={useTemplateItem}
        onClose={() => setUseTemplateItem(null)}
        onConfirm={handleConfirmUseTemplate}
      />

      {/* Modal / Carrossel de Destinatários de Clientes */}
      <ClientRecipientsModal
        isOpen={Boolean(clientModalItem)}
        messageTitle={clientModalItem?.title || ''}
        clients={clientModalItem?.clients || []}
        onClose={() => setClientModalItem(null)}
        onRemoveClient={handleRemoveClient}
        onAddClient={handleAddClient}
      />

      {/* Modal de Confirmação de Disparo */}
      <SendConfirmationModal
        isOpen={Boolean(sendModalItem)}
        message={sendModalItem}
        onClose={() => setSendModalItem(null)}
        onConfirm={handleConfirmSend}
      />

      {/* Modal de Agendamento de Data e Hora */}
      <ScheduleDispatchModal
        isOpen={Boolean(scheduleModalItem)}
        message={scheduleModalItem}
        onClose={() => setScheduleModalItem(null)}
        onSaveSchedule={handleSaveSchedule}
      />
    </div>
  );
};
