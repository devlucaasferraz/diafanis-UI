import * as React from 'react';
import {
  Bell,
  MessageSquare,
  FileText,
  AlertCircle,
  Plus,
  Search,
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

  // Estados de busca/filtro
  const [searchTerm, setSearchTerm] = React.useState('');

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

  // Filtragem
  const filteredMessages = React.useMemo(() => {
    if (!searchTerm.trim()) return messages;
    const term = searchTerm.toLowerCase();
    return messages.filter(
      (m) =>
        m.title.toLowerCase().includes(term) ||
        m.content.toLowerCase().includes(term) ||
        (m.clients && m.clients.some((c) => c.fullName.toLowerCase().includes(term)))
    );
  }, [messages, searchTerm]);

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
      if (modalMode === 'create') {
        const newTemplate: TemplateItem = {
          id: `tmpl-${Date.now()}`,
          title: data.title || 'Novo Modelo',
          content: data.content || '',
          category: data.category || 'general',
          clients: [],
          selectedLawsuit: data.selectedLawsuit || null,
          selectedFinancial: data.selectedFinancial || null,
          selectedDate: data.selectedDate || null,
          updatedAt: new Date().toISOString(),
        };
        setTemplates((prev) => [newTemplate, ...prev]);
      } else if (selectedItem) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === selectedItem.id ? ({ ...t, ...data } as TemplateItem) : t))
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

            {/* Barra de Filtros e Busca */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar mensagens por título, conteúdo ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-background/80 py-2 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="text-[11px] text-muted-foreground hidden sm:block">
                <span>Clique em uma mensagem para visualizar a prévia ou no botão de envio para disparar.</span>
              </div>
            </div>

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
