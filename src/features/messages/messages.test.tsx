import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingTabNav } from './FloatingTabNav';
import { NotificationListItem } from './NotificationListItem';
import { MessagesContainer } from './MessagesContainer';
import { initialNotifications } from './mock-data';
import { NotificationItem } from './types';

describe('FloatingTabNav', () => {
  it('deve renderizar as três abas principais: Notificações, Mensagens e Modelos', () => {
    render(<FloatingTabNav activeTab="notifications" onTabChange={() => {}} />);

    expect(screen.getByRole('tab', { name: /notificações/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /mensagens/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /modelos/i })).toBeInTheDocument();
  });

  it('deve indicar a aba ativa com aria-selected', () => {
    render(<FloatingTabNav activeTab="messages" onTabChange={() => {}} />);

    const messagesTab = screen.getByRole('tab', { name: /mensagens/i });
    const notificationsTab = screen.getByRole('tab', { name: /notificações/i });

    expect(messagesTab).toHaveAttribute('aria-selected', 'true');
    expect(notificationsTab).toHaveAttribute('aria-selected', 'false');
  });

  it('deve exibir a bolinha vermelha de urgência quando a condição for verdadeira', () => {
    render(
      <FloatingTabNav
        activeTab="messages"
        onTabChange={() => {}}
        urgencyMap={{ notifications: true, messages: false }}
      />
    );

    expect(screen.getByTestId('urgency-dot-notifications')).toBeInTheDocument();
    expect(screen.queryByTestId('urgency-dot-messages')).not.toBeInTheDocument();
    expect(screen.queryByTestId('urgency-dot-templates')).not.toBeInTheDocument();
  });

  it('deve chamar onTabChange ao clicar em uma aba diferente', () => {
    let selectedTab = 'notifications';
    const handleTabChange = (tab: string) => {
      selectedTab = tab;
    };

    render(<FloatingTabNav activeTab="notifications" onTabChange={handleTabChange} />);

    const templatesTab = screen.getByRole('tab', { name: /modelos/i });
    fireEvent.click(templatesTab);

    expect(selectedTab).toBe('templates');
  });
});

describe('NotificationListItem (Modelo Simples de Notificação no Grid)', () => {
  const sampleNotification: NotificationItem = initialNotifications[0];

  it('deve exibir título, descrição, advogado atribuído, prazo e indicador de não lida', () => {
    render(<NotificationListItem item={sampleNotification} />);

    expect(screen.getByTestId('notification-unread-dot')).toBeInTheDocument();
    expect(screen.getByTestId('notification-item-title')).toHaveTextContent(sampleNotification.title);
    expect(screen.getByText(sampleNotification.assignedLawyer)).toBeInTheDocument();
    expect(screen.getByText(sampleNotification.deadline)).toBeInTheDocument();
    expect(screen.getByText('Prazo Fatal')).toBeInTheDocument();
  });

  it('deve disparar onToggleRead ao clicar no botão de marcar como lida', () => {
    const handleToggleRead = vi.fn();
    render(<NotificationListItem item={sampleNotification} onToggleRead={handleToggleRead} />);

    fireEvent.click(screen.getByTestId('toggle-read-btn'));
    expect(handleToggleRead).toHaveBeenCalledWith(sampleNotification);
  });
});

describe('MessagesContainer', () => {
  it('deve renderizar a tela inicial com a aba de Notificações ativa, grid de notificações e bolinha de urgência', () => {
    render(<MessagesContainer />);

    expect(screen.getByRole('heading', { name: /notificações internas/i })).toBeInTheDocument();
    expect(screen.getByTestId('urgency-dot-notifications')).toBeInTheDocument();
    expect(screen.getAllByTestId('notification-list-item').length).toBeGreaterThan(0);
  });

  it('deve remover a bolinha de urgência ao marcar todas as notificações como lidas', () => {
    render(<MessagesContainer />);

    fireEvent.click(screen.getByTestId('mark-all-read-btn'));
    expect(screen.queryByTestId('urgency-dot-notifications')).not.toBeInTheDocument();
  });

  it('deve trocar para a aba de Mensagens ao clicar na respectiva aba', () => {
    render(<MessagesContainer />);

    const messagesTab = screen.getByRole('tab', { name: /mensagens/i });
    fireEvent.click(messagesTab);

    expect(screen.getByRole('heading', { name: /interação & mensagens/i })).toBeInTheDocument();
  });

  it('deve trocar para a aba de Modelos ao clicar na respectiva aba', () => {
    render(<MessagesContainer />);

    const templatesTab = screen.getByRole('tab', { name: /modelos/i });
    fireEvent.click(templatesTab);

    expect(screen.getByRole('heading', { name: /modelos de disparo/i })).toBeInTheDocument();
  });
});
