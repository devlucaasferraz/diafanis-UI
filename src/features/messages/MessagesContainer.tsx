import * as React from 'react';
import { Bell, MessageSquare, FileText, Clock, Sparkles, Search, CheckCheck } from 'lucide-react';
import { GlassPanel } from '@/features/ui/glass-panel';
import { Button } from '@/features/ui/button';
import { FloatingTabNav } from './FloatingTabNav';
import { NotificationListItem } from './NotificationListItem';
import { initialNotifications } from './mock-data';
import { MessageTabId, NotificationItem } from './types';

export const MessagesContainer: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<MessageTabId>('notifications');
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(initialNotifications);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Estado que gerencia a urgência das demais abas
  const [otherUrgency, setOtherUrgency] = React.useState<{ messages: boolean; templates: boolean }>({
    messages: false,
    templates: false,
  });

  const hasUnreadNotifications = React.useMemo(
    () => notifications.some((n) => !n.isRead),
    [notifications]
  );

  const urgencyMap: Partial<Record<MessageTabId, boolean>> = {
    notifications: hasUnreadNotifications,
    messages: otherUrgency.messages,
    templates: otherUrgency.templates,
  };

  const filteredNotifications = React.useMemo(() => {
    if (!searchTerm.trim()) return notifications;
    const term = searchTerm.toLowerCase();
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(term) ||
        n.description.toLowerCase().includes(term) ||
        n.assignedLawyer.toLowerCase().includes(term) ||
        (n.processNumber && n.processNumber.toLowerCase().includes(term))
    );
  }, [notifications, searchTerm]);

  const handleToggleRead = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const toggleUrgency = (tabId: 'messages' | 'templates') => {
    setOtherUrgency((prev) => ({
      ...prev,
      [tabId]: !prev[tabId],
    }));
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
                  Alertas prioritários sobre prazos críticos e intimações atribuídas à sua equipe (RF11).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="mark-all-read-btn"
                  onClick={handleMarkAllRead}
                  disabled={!hasUnreadNotifications}
                  className="gap-1.5 text-xs"
                >
                  <CheckCheck className="h-4 w-4" />
                  Marcar todas como lidas
                </Button>
              </div>
            </div>

            {/* Barra de Busca */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar notificações por título, processo ou advogado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-background/80 py-2 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Grid / Lista de Notificações */}
            <div className="space-y-2.5">
              {filteredNotifications.length === 0 ? (
                <GlassPanel className="p-8 text-center text-muted-foreground text-xs">
                  Nenhuma notificação encontrada com os filtros atuais.
                </GlassPanel>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationListItem
                    key={notification.id}
                    item={notification}
                    onSelect={handleToggleRead}
                    onToggleRead={handleToggleRead}
                  />
                ))
              )}
            </div>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  Interação & Mensagens
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Comunicação com clientes e painel de aniversariantes da semana/mês (RF9).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleUrgency('messages')}
                  className="text-xs"
                >
                  {urgencyMap.messages ? 'Remover Urgência' : 'Simular Urgência'}
                </Button>
              </div>
            </div>

            <GlassPanel className="p-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Clock className="h-7 w-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  Aba de Mensagens & Painel de Aniversários
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Aqui exibiremos a identificação automática dos clientes que fazem aniversário na semana/mês (RF9) e canais de contato direto.
                </p>
              </div>
            </GlassPanel>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Modelos de Disparo
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Textos padrão de felicitação ou avisos de audiência para envio manual ou webhook futuro (RF10).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleUrgency('templates')}
                  className="text-xs"
                >
                  {urgencyMap.templates ? 'Remover Urgência' : 'Simular Urgência'}
                </Button>
              </div>
            </div>

            <GlassPanel className="p-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  Aba de Modelos de Mensagem
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Aqui permitiremos visualizar e editar os textos padrão de felicitação ou avisos de audiência para envio manual ou disparo via webhook (RF10).
                </p>
              </div>
            </GlassPanel>
          </section>
        )}
      </div>
    </div>
  );
};
