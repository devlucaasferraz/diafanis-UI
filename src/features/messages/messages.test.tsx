import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingTabNav } from './FloatingTabNav';
import { MessageListItem } from './MessageListItem';
import { MessageModal } from './MessageModal';
import { ClientRecipientsModal } from './ClientRecipientsModal';
import { SendConfirmationModal } from './SendConfirmationModal';
import { ScheduleDispatchModal } from './ScheduleDispatchModal';
import { MessagesContainer } from './MessagesContainer';
import { MessageItem, TemplateItem, ClientRecipient } from './types';
import { allOfficeClients, availableLawsuits } from './mock-data';

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
    expect(messagesTab).toHaveAttribute('aria-selected', 'true');
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
  });
});

describe('MessageListItem (Grid com Ícone de User e Envio)', () => {
  const sampleMessage: MessageItem = {
    id: 'msg-test-1',
    title: 'Aviso de Audiência Urgente',
    content: 'Olá @cliente.nome',
    category: 'hearing',
    hasAlert: true,
    clients: [allOfficeClients[0], allOfficeClients[1]],
    createdAt: '2026-10-16',
  };

  const sampleTemplate: TemplateItem = {
    id: 'tmpl-test-1',
    title: 'Modelo de Felicitação',
    content: 'Parabéns @cliente.nome',
    category: 'birthday',
    clients: [],
  };

  it('deve exibir à esquerda a bolinha de alerta e o título da mensagem', () => {
    render(<MessageListItem item={sampleMessage} isMessage={true} onSelect={() => {}} />);

    expect(screen.getByTestId('message-alert-dot')).toBeInTheDocument();
    expect(screen.getByTestId('message-item-title')).toHaveTextContent('Aviso de Audiência Urgente');
  });

  it('deve exibir à direita o ícone de User com a contagem de clientes e o ícone de Envio', () => {
    render(<MessageListItem item={sampleMessage} isMessage={true} onSelect={() => {}} />);

    const userBtn = screen.getByTestId('open-clients-btn');
    const sendBtn = screen.getByTestId('open-send-btn');

    expect(userBtn).toBeInTheDocument();
    expect(userBtn).toHaveTextContent('2'); // 2 clientes vinculados
    expect(sendBtn).toBeInTheDocument();
  });

  it('não deve exibir botão de envio em modelos', () => {
    render(<MessageListItem item={sampleTemplate} isMessage={false} onSelect={() => {}} />);

    expect(screen.queryByTestId('open-send-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('message-alert-dot')).not.toBeInTheDocument();
  });

  it('deve disparar onOpenClients ao clicar no ícone de User', () => {
    const handleOpenClients = vi.fn();
    render(
      <MessageListItem
        item={sampleMessage}
        isMessage={true}
        onSelect={() => {}}
        onOpenClients={handleOpenClients}
      />
    );

    fireEvent.click(screen.getByTestId('open-clients-btn'));
    expect(handleOpenClients).toHaveBeenCalledWith(sampleMessage);
  });

  it('deve disparar onSend ao clicar no ícone de Envio', () => {
    const handleSend = vi.fn();
    render(
      <MessageListItem
        item={sampleMessage}
        isMessage={true}
        onSelect={() => {}}
        onSend={handleSend}
      />
    );

    fireEvent.click(screen.getByTestId('open-send-btn'));
    expect(handleSend).toHaveBeenCalledWith(sampleMessage);
  });

  it('deve exibir o ícone de Calendar e disparar onSchedule ao clicar nele', () => {
    const handleSchedule = vi.fn();
    render(
      <MessageListItem
        item={sampleMessage}
        isMessage={true}
        onSelect={() => {}}
        onSchedule={handleSchedule}
      />
    );

    const calBtn = screen.getByTestId('open-schedule-btn');
    expect(calBtn).toBeInTheDocument();

    fireEvent.click(calBtn);
    expect(handleSchedule).toHaveBeenCalledWith(sampleMessage);
  });
});

describe('ScheduleDispatchModal (Agendamento: Todos vs Individual e Aniversário vs Manual)', () => {
  const sampleMessageWithClients: MessageItem = {
    id: 'msg-sched',
    title: 'Aviso Agendado',
    content: 'Texto',
    category: 'general',
    clients: [allOfficeClients[0], allOfficeClients[1]],
    createdAt: '2026-10-16',
  };

  it('deve renderizar as opções de escopo "Todos os Clientes" e "Individual por Cliente"', () => {
    render(
      <ScheduleDispatchModal
        isOpen={true}
        message={sampleMessageWithClients}
        onClose={() => {}}
        onSaveSchedule={() => {}}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /todos os clientes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /individual por cliente/i })).toBeInTheDocument();
  });

  it('deve salvar agendamento global no modo "Todos os Clientes"', () => {
    const handleSave = vi.fn();
    render(
      <ScheduleDispatchModal
        isOpen={true}
        message={sampleMessageWithClients}
        onClose={() => {}}
        onSaveSchedule={handleSave}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /salvar agendamento/i }));

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: 'all',
        globalScheduledAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/),
      })
    );
  });

  it('deve permitir alternar para "Individual" e escolher entre "Aniversário" ou "Manual" por cliente', () => {
    const handleSave = vi.fn();
    render(
      <ScheduleDispatchModal
        isOpen={true}
        message={sampleMessageWithClients}
        onClose={() => {}}
        onSaveSchedule={handleSave}
      />
    );

    // Alterna para o modo Individual
    const individualTab = screen.getByRole('tab', { name: /individual por cliente/i });
    fireEvent.click(individualTab);

    // Deve exibir as linhas para os clientes vinculados
    expect(screen.getByTestId(`client-schedule-row-${allOfficeClients[0].id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`client-schedule-row-${allOfficeClients[1].id}`)).toBeInTheDocument();

    // No primeiro cliente, padrão é aniversário
    expect(screen.getAllByText(/disparo no próximo aniversário:/i).length).toBeGreaterThan(0);

    // Alterna o segundo cliente para Manual
    const manualBtn = screen.getByTestId(`btn-manual-${allOfficeClients[1].id}`);
    fireEvent.click(manualBtn);

    // Deve exibir o campo de Data de Envio manual para esse cliente
    expect(screen.getByText(/data de envio:/i)).toBeInTheDocument();

    // Salva o agendamento individual
    fireEvent.click(screen.getByRole('button', { name: /salvar agendamento/i }));

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: 'individual',
        clientSchedules: expect.objectContaining({
          [allOfficeClients[0].id]: expect.objectContaining({ type: 'birthday' }),
          [allOfficeClients[1].id]: expect.objectContaining({ type: 'manual' }),
        }),
      })
    );
  });

  it('deve permitir marcar todos os clientes como Aniversário ou Manual em lote', () => {
    const handleSave = vi.fn();
    render(
      <ScheduleDispatchModal
        isOpen={true}
        message={sampleMessageWithClients}
        onClose={() => {}}
        onSaveSchedule={handleSave}
      />
    );

    // Alterna para o modo Individual
    fireEvent.click(screen.getByRole('tab', { name: /individual por cliente/i }));

    // Clica no botão de marcar todos como Manual
    const setAllManualBtn = screen.getByTestId('set-all-manual-btn');
    expect(setAllManualBtn).toBeInTheDocument();
    fireEvent.click(setAllManualBtn);

    // Salva e verifica que ambos os clientes viraram manual
    fireEvent.click(screen.getByRole('button', { name: /salvar agendamento/i }));

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: 'individual',
        clientSchedules: expect.objectContaining({
          [allOfficeClients[0].id]: expect.objectContaining({ type: 'manual' }),
          [allOfficeClients[1].id]: expect.objectContaining({ type: 'manual' }),
        }),
      })
    );

    // Agora testa marcar todos como Aniversário
    const setAllBirthdayBtn = screen.getByTestId('set-all-birthday-btn');
    fireEvent.click(setAllBirthdayBtn);

    fireEvent.click(screen.getByRole('button', { name: /salvar agendamento/i }));

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: 'individual',
        clientSchedules: expect.objectContaining({
          [allOfficeClients[0].id]: expect.objectContaining({ type: 'birthday' }),
          [allOfficeClients[1].id]: expect.objectContaining({ type: 'birthday' }),
        }),
      })
    );
  });
});

describe('ClientRecipientsModal (Carrossel / Painel de Clientes)', () => {
  const testClients: ClientRecipient[] = allOfficeClients.slice(0, 6);

  it('deve renderizar a lista de clientes, campo de busca e botão fixo de adicionar', () => {
    render(
      <ClientRecipientsModal
        isOpen={true}
        messageTitle="Audiência de Instrução"
        clients={testClients}
        onClose={() => {}}
        onRemoveClient={() => {}}
        onAddClient={() => {}}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/destinatários da mensagem/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/pesquisar cliente por nome/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adicionar cliente/i })).toBeInTheDocument();

    // Verifica que clientes vinculados estão visíveis
    expect(screen.getByText('Roberto Alves da Silva')).toBeInTheDocument();
  });

  it('deve filtrar clientes vinculados pelo campo de pesquisa', () => {
    render(
      <ClientRecipientsModal
        isOpen={true}
        messageTitle="Audiência"
        clients={testClients}
        onClose={() => {}}
        onRemoveClient={() => {}}
        onAddClient={() => {}}
      />
    );

    const searchInput = screen.getByPlaceholderText(/pesquisar cliente por nome/i);
    fireEvent.change(searchInput, { target: { value: 'Mariana' } });

    expect(screen.getByText('Mariana Duarte Prado')).toBeInTheDocument();
    expect(screen.queryByText('Roberto Alves da Silva')).not.toBeInTheDocument();
  });

  it('deve chamar onRemoveClient ao clicar no botão de lixeira', () => {
    const handleRemove = vi.fn();
    render(
      <ClientRecipientsModal
        isOpen={true}
        messageTitle="Audiência"
        clients={testClients}
        onClose={() => {}}
        onRemoveClient={handleRemove}
        onAddClient={() => {}}
      />
    );

    const trashBtn = screen.getByTestId(`remove-client-${testClients[0].id}`);
    fireEvent.click(trashBtn);

    expect(handleRemove).toHaveBeenCalledWith(testClients[0].id);
  });
});

describe('SendConfirmationModal (Confirmação de Envio)', () => {
  const sampleMessage: MessageItem = {
    id: 'msg-test',
    title: 'Aviso Importante',
    content: 'Texto da mensagem',
    category: 'general',
    clients: [allOfficeClients[0], allOfficeClients[1]],
    createdAt: '2026-10-16',
  };

  it('deve exibir dados da mensagem a ser disparada', () => {
    render(
      <SendConfirmationModal
        isOpen={true}
        message={sampleMessage}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/confirmar disparo/i)).toBeInTheDocument();
    expect(screen.getByText(/destinatários \(2\):/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmar envio/i })).toBeInTheDocument();
  });
});

describe('MessageModal & Sistema de Pills Dinâmicas', () => {
  it('deve sempre disponibilizar as pills do cliente', () => {
    render(
      <MessageModal
        isOpen={true}
        mode="create"
        type="message"
        onClose={() => {}}
        onSave={() => {}}
      />
    );

    expect(screen.getByTestId('pill-cliente-nome')).toBeInTheDocument();
    expect(screen.getByTestId('pill-cliente-nome-completo')).toBeInTheDocument();
    expect(screen.getByTestId('pill-cliente-aniversario')).toBeInTheDocument();
  });

  it('deve exibir ícones de referência em cinza quando não selecionados, e ocultar suas pills', () => {
    render(
      <MessageModal
        isOpen={true}
        mode="create"
        type="message"
        onClose={() => {}}
        onSave={() => {}}
      />
    );

    // Ícones no modal
    const lawsuitBtn = screen.getByTestId('ref-btn-lawsuit');
    expect(lawsuitBtn).toHaveClass('text-muted-foreground/50');

    // Pills de processo não devem existir antes da seleção
    expect(screen.queryByTestId('pill-processo-numero')).not.toBeInTheDocument();
  });

  it('deve exibir o ícone em azul e liberar as pills do objeto quando houver seleção', () => {
    const initialDataWithLawsuit: MessageItem = {
      id: 'msg-1',
      title: 'Aviso com Processo',
      content: '',
      category: 'hearing',
      clients: [],
      selectedLawsuit: availableLawsuits[0],
      createdAt: '2026-10-16',
    };

    render(
      <MessageModal
        isOpen={true}
        mode="edit"
        type="message"
        initialData={initialDataWithLawsuit}
        onClose={() => {}}
        onSave={() => {}}
      />
    );

    // Ícone de processo deve estar azul
    const lawsuitBtn = screen.getByTestId('ref-btn-lawsuit');
    expect(lawsuitBtn).toHaveClass('text-blue-600');

    // As pills do processo agora aparecem
    expect(screen.getByTestId('pill-processo-numero')).toBeInTheDocument();
    expect(screen.getByTestId('pill-processo-vara')).toBeInTheDocument();
    expect(screen.getByTestId('pill-processo-comarca')).toBeInTheDocument();
  });

  it('deve inserir a tag no texto da mensagem ao clicar na pill', () => {
    render(
      <MessageModal
        isOpen={true}
        mode="create"
        type="message"
        onClose={() => {}}
        onSave={() => {}}
      />
    );

    const textarea = screen.getByLabelText(/corpo do texto/i) as HTMLTextAreaElement;
    const clientNamePill = screen.getByTestId('pill-cliente-nome');

    fireEvent.click(clientNamePill);
    expect(textarea.value).toContain('@cliente.nome');
  });

  it('deve renderizar o componente da pill como chip azul dentro da caixa de texto do editor', () => {
    render(
      <MessageModal
        isOpen={true}
        mode="create"
        type="message"
        onClose={() => {}}
        onSave={() => {}}
      />
    );

    const clientNamePill = screen.getByTestId('pill-cliente-nome');
    // Verifica que o botão da pill está estilizado em azul
    expect(clientNamePill).toHaveClass('text-blue-700');

    // Clica para inserir na caixa de texto
    fireEvent.click(clientNamePill);

    const textarea = screen.getByLabelText(/corpo do texto/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('@cliente.nome');
  });

  it('deve permitir alternar para a aba de Prévia e visualizar as pills azuis formatadas', () => {
    render(
      <MessageModal
        isOpen={true}
        mode="create"
        type="message"
        onClose={() => {}}
        onSave={() => {}}
      />
    );

    const clientNamePill = screen.getByTestId('pill-cliente-nome');
    fireEvent.click(clientNamePill);

    // Clica no botão de Prévia
    const previewTabBtn = screen.getByTestId('tab-preview-btn');
    fireEvent.click(previewTabBtn);

    // O container de prévia deve estar visível
    const previewContainer = screen.getByTestId('message-preview-container');
    expect(previewContainer).toBeInTheDocument();

    // A pill formatada em azul deve estar renderizada dentro da prévia
    const previewPill = screen.getByTestId('preview-pill-cliente-nome');
    expect(previewPill).toBeInTheDocument();
    expect(previewPill).toHaveTextContent('@cliente.nome');
    expect(previewPill).toHaveClass('text-blue-700');

    // Volta para a aba "Escrever"
    const writeTabBtn = screen.getByTestId('tab-write-btn');
    fireEvent.click(writeTabBtn);

    // Textarea deve voltar e conter o texto original
    const textarea = screen.getByLabelText(/corpo do texto/i) as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toContain('@cliente.nome');
  });

  it('deve permitir pesquisar opções no seletor de objetos de referência', () => {
    render(
      <MessageModal
        isOpen={true}
        mode="create"
        type="message"
        onClose={() => {}}
        onSave={() => {}}
      />
    );

    // Abre seletor de processo
    const lawsuitBtn = screen.getByTestId('ref-btn-lawsuit');
    fireEvent.click(lawsuitBtn);

    const lawsuitPopover = screen.getByTestId('selector-popover-lawsuit');
    expect(lawsuitPopover).toBeInTheDocument();

    const searchInput = screen.getByTestId('search-lawsuit-input');
    // Pesquisa por número específico
    fireEvent.change(searchInput, { target: { value: '5004321' } });

    expect(screen.getByText(/5004321-12.2025.8.26.0100/i)).toBeInTheDocument();
    expect(screen.queryByText(/0012345-89.2026.8.19.0001/i)).not.toBeInTheDocument();
  });

  it('deve fechar o carrossel/popover de referência ao clicar fora ou pressionar Escape', () => {
    render(
      <MessageModal
        isOpen={true}
        mode="create"
        type="message"
        onClose={() => {}}
        onSave={() => {}}
      />
    );

    // Abre seletor de data
    const dateBtn = screen.getByTestId('ref-btn-date');
    fireEvent.click(dateBtn);
    expect(screen.getByTestId('selector-popover-date')).toBeInTheDocument();

    // Clica fora
    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId('selector-popover-date')).not.toBeInTheDocument();

    // Abre seletor financeiro e fecha com Escape
    const financialBtn = screen.getByTestId('ref-btn-financial');
    fireEvent.click(financialBtn);
    expect(screen.getByTestId('selector-popover-financial')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('selector-popover-financial')).not.toBeInTheDocument();
  });
});

describe('MessagesContainer (Integração Completa)', () => {
  it('deve renderizar a tela de mensagens com o grid atualizado', () => {
    render(<MessagesContainer />);

    expect(screen.getByRole('heading', { name: /^mensagens$/i })).toBeInTheDocument();
    expect(screen.getAllByTestId('message-list-item').length).toBeGreaterThan(0);
  });

  it('deve abrir o modal de clientes ao clicar no ícone de User da primeira mensagem', () => {
    render(<MessagesContainer />);

    const userBtns = screen.getAllByTestId('open-clients-btn');
    fireEvent.click(userBtns[0]);

    expect(screen.getByText(/destinatários da mensagem/i)).toBeInTheDocument();
  });

  it('deve abrir o modal de confirmação de envio ao clicar no ícone de Envio', () => {
    render(<MessagesContainer />);

    const sendBtns = screen.getAllByTestId('open-send-btn');
    fireEvent.click(sendBtns[0]);

    expect(screen.getByText(/confirmar disparo/i)).toBeInTheDocument();
  });
});
