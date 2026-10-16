import * as React from 'react';
import { Bell, MessageSquare, FileText, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { GlassPanel } from '@/features/ui/glass-panel';
import { Button } from '@/features/ui/button';
import { StatusBadge } from '@/features/ui/status-badge';
import { FloatingTabNav } from './FloatingTabNav';
import { MessageTabId } from './types';

export const MessagesContainer: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<MessageTabId>('notifications');

  // Estado que gerencia a urgência de cada aba (ex: RF11 para Notificações com prazos críticos)
  const [urgencyMap, setUrgencyMap] = React.useState<Partial<Record<MessageTabId, boolean>>>({
    notifications: true, // Notificações com alerta ativo por padrão (prazos fatais próximos)
    messages: false,
    templates: false,
  });

  const toggleUrgency = (tabId: MessageTabId) => {
    setUrgencyMap((prev) => ({
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

              {/* Botão de demonstração para testar a bolinha de urgência */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleUrgency('notifications')}
                  className="text-xs"
                >
                  {urgencyMap.notifications ? 'Simular: Sem Urgência' : 'Simular: Com Urgência'}
                </Button>
              </div>
            </div>

            <GlassPanel className="p-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertCircle className="h-7 w-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  Aba de Notificações Pronta para Desenvolvimento
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Aqui ficará o feed de avisos internos aos advogados sobre prazos críticos atribuídos a eles (RF11).
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
