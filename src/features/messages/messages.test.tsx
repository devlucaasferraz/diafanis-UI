import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingTabNav } from './FloatingTabNav';
import { MessagesContainer } from './MessagesContainer';

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

describe('MessagesContainer', () => {
  it('deve renderizar a tela inicial com a aba de Notificações ativa e bolinha de urgência', () => {
    render(<MessagesContainer />);

    expect(screen.getByRole('heading', { name: /notificações internas/i })).toBeInTheDocument();
    expect(screen.getByTestId('urgency-dot-notifications')).toBeInTheDocument();
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
