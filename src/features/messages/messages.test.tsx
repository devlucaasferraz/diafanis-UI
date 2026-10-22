import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingTabNav } from './FloatingTabNav';
import { NotificationListItem } from './NotificationListItem';
import { MessageListItem } from './MessageListItem';
import { MessageModal } from './MessageModal';
import { MessagePreviewModal } from './MessagePreviewModal';
import { UseTemplateModal } from './UseTemplateModal';
import { ClientRecipientsModal } from './ClientRecipientsModal';
import { SendConfirmationModal } from './SendConfirmationModal';
import { ScheduleDispatchModal } from './ScheduleDispatchModal';
import { MessagesContainer } from './MessagesContainer';
import { MessageItem, TemplateItem, ClientRecipient, NotificationItem } from './types';
import { allOfficeClients, availableLawsuits, availableFinancials, availableHearingDates, initialNotifications } from './mock-data';

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

describe('MessageListItem (Envio e Edição em Mensagens, Usar Modelo em Modelos)', () => {
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

  it('deve exibir apenas botão de envio e edição em mensagens (sem user ou calendar)', () => {
    render(<MessageListItem item={sampleMessage} isMessage={true} onSelect={() => {}} />);

    expect(screen.getByTestId('open-send-btn')).toBeInTheDocument();
    expect(screen.getByTestId('open-edit-btn')).toBeInTheDocument();
    expect(screen.queryByTestId('open-clients-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('open-schedule-btn')).not.toBeInTheDocument();
  });

  it('deve exibir botão de "Usar Modelo" e edição em modelos (sem envio, user ou calendar)', () => {
    render(<MessageListItem item={sampleTemplate} isMessage={false} onSelect={() => {}} />);

    expect(screen.getByTestId('use-template-btn')).toBeInTheDocument();
    expect(screen.getByTestId('open-edit-btn')).toBeInTheDocument();
    expect(screen.queryByTestId('open-send-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('open-clients-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('open-schedule-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('message-alert-dot')).not.toBeInTheDocument();
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

  it('deve disparar onEdit ao clicar no botão de Edição', () => {
    const handleEdit = vi.fn();
    render(
      <MessageListItem
        item={sampleMessage}
        isMessage={true}
        onSelect={() => {}}
        onEdit={handleEdit}
      />
    );

    fireEvent.click(screen.getByTestId('open-edit-btn'));
    expect(handleEdit).toHaveBeenCalledWith(sampleMessage);
  });

  it('deve disparar onUseTemplate ao clicar em Usar Modelo', () => {
    const handleUseTemplate = vi.fn();
    render(
      <MessageListItem
        item={sampleTemplate}
        isMessage={false}
        onSelect={() => {}}
        onUseTemplate={handleUseTemplate}
      />
    );

    fireEvent.click(screen.getByTestId('use-template-btn'));
    expect(handleUseTemplate).toHaveBeenCalledWith(sampleTemplate);
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
  it('deve abrir no modo de preview por padrão, sem exibir o bloco de adição de pills', () => {
    render(
      <MessageModal
        isOpen={true}
        mode="create"
        type="message"
        onClose={() => {}}
        onSave={() => {}}
      />
    );

    // Em modo de preview por padrão, a prévia está visível
    expect(screen.getByTestId('message-preview-container')).toBeInTheDocument();
    // E os botões de inserção de pills NÃO devem estar visíveis
    expect(screen.queryByTestId('pill-cliente-nome')).not.toBeInTheDocument();
  });

  it('ao alternar para a aba "Escrever", deve exibir o bloco de pills e permitir inserção no textarea', () => {
    render(
      <MessageModal
        isOpen={true}
        mode="create"
        type="message"
        onClose={() => {}}
        onSave={() => {}}
      />
    );

    // Clica para alternar para a aba "Escrever"
    fireEvent.click(screen.getByTestId('tab-write-btn'));

    // Agora o bloco de pills deve estar presente
    const clientNamePill = screen.getByTestId('pill-cliente-nome');
    expect(clientNamePill).toBeInTheDocument();
    expect(clientNamePill).toHaveClass('text-blue-700');

    // Inserção no textarea
    const textarea = screen.getByLabelText(/corpo do texto/i) as HTMLTextAreaElement;
    fireEvent.click(clientNamePill);
    expect(textarea.value).toContain('@cliente.nome');
  });

  it('deve exibir ícones de referência em cinza quando não selecionados, e ocultar suas pills no modo Escrever', () => {
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

    // Alterna para Escrever
    fireEvent.click(screen.getByTestId('tab-write-btn'));
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

    // Alterna para Escrever
    fireEvent.click(screen.getByTestId('tab-write-btn'));

    // As pills do processo agora aparecem
    expect(screen.getByTestId('pill-processo-numero')).toBeInTheDocument();
    expect(screen.getByTestId('pill-processo-vara')).toBeInTheDocument();
    expect(screen.getByTestId('pill-processo-comarca')).toBeInTheDocument();
  });

  it('deve permitir alternar entre Escrever e Prévia e visualizar as pills azuis formatadas', () => {
    render(
      <MessageModal
        isOpen={true}
        mode="create"
        type="message"
        onClose={() => {}}
        onSave={() => {}}
      />
    );

    // Vai para Escrever
    fireEvent.click(screen.getByTestId('tab-write-btn'));
    const clientNamePill = screen.getByTestId('pill-cliente-nome');
    fireEvent.click(clientNamePill);

    // Volta para Prévia
    const previewTabBtn = screen.getByTestId('tab-preview-btn');
    fireEvent.click(previewTabBtn);

    const previewContainer = screen.getByTestId('message-preview-container');
    expect(previewContainer).toBeInTheDocument();

    const previewPill = screen.getByTestId('preview-pill-cliente-nome');
    expect(previewPill).toBeInTheDocument();
    expect(previewPill).toHaveTextContent('@cliente.nome');
    expect(previewPill).toHaveClass('text-blue-700');
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

  it('no modo de modelo (type="template"), não deve exibir campo Categoria e os botões de referência devem ser toggles booleanos', () => {
    const handleSave = vi.fn();
    render(
      <MessageModal
        isOpen={true}
        mode="create"
        type="template"
        onClose={() => {}}
        onSave={handleSave}
      />
    );

    // Não deve exibir o campo Categoria
    expect(screen.queryByLabelText(/categoria/i)).not.toBeInTheDocument();

    // Clicar no botão de processo ativa o boolean (azul) sem abrir popover de seleção real
    const lawsuitBtn = screen.getByTestId('ref-btn-lawsuit');
    expect(lawsuitBtn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(lawsuitBtn);
    expect(lawsuitBtn).toHaveAttribute('aria-pressed', 'true');
    expect(lawsuitBtn).toHaveClass('text-blue-600');
    expect(screen.queryByTestId('selector-popover-lawsuit')).not.toBeInTheDocument();

    // Na aba Escrever, as pills de processo são liberadas
    fireEvent.click(screen.getByTestId('tab-write-btn'));
    expect(screen.getByTestId('pill-processo-numero')).toBeInTheDocument();

    // Preenche título e texto e salva
    fireEvent.change(screen.getByLabelText(/título da template/i), {
      target: { value: 'Modelo Teste' },
    });
    fireEvent.change(screen.getByLabelText(/corpo do texto/i), {
      target: { value: 'Olá @cliente.nome, processo @processo.numero' },
    });
    fireEvent.click(screen.getByRole('button', { name: /salvar modelo/i }));

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Modelo Teste',
        requiresLawsuit: true,
        requiresFinancial: false,
        requiresDate: false,
        selectedLawsuit: null,
      })
    );
  });
});

describe('MessagePreviewModal (Visualização da Mensagem com Vínculos, Urgência, Exclusão e Edição)', () => {
  const sampleMessage: MessageItem = {
    id: 'msg-prev-1',
    title: 'Notificação de Despacho',
    content: 'Prezado(a) @cliente.nome, informamos despacho no processo.',
    clients: [allOfficeClients[0]],
    selectedLawsuit: availableLawsuits[0],
    selectedFinancial: availableFinancials[0],
    selectedDate: availableHearingDates[0],
    createdAt: '2026-10-16',
    hasAlert: true,
  };

  it('deve renderizar a prévia sem quantidade de destinatários, exibindo Vínculos coloridos, urgência e botão excluir', () => {
    const handleDelete = vi.fn();
    const handleToggleUrgency = vi.fn();

    render(
      <MessagePreviewModal
        isOpen={true}
        message={sampleMessage}
        onClose={() => {}}
        onEdit={() => {}}
        onDelete={handleDelete}
        onToggleUrgency={handleToggleUrgency}
      />
    );

    expect(screen.getByTestId('preview-modal-title')).toHaveTextContent('Notificação de Despacho');
    expect(screen.getByTestId('message-preview-content')).toBeInTheDocument();
    expect(screen.getByTestId('preview-pill-cliente-nome')).toBeInTheDocument();

    // Não deve exibir a contagem "1 destinatário"
    expect(screen.queryByText(/1 destinatário/i)).not.toBeInTheDocument();

    // Deve exibir a seção "Vínculos" com badges coloridos por tipo de objeto
    expect(screen.getByTestId('preview-links-section')).toBeInTheDocument();
    expect(screen.getByText('Vínculos')).toBeInTheDocument();
    expect(screen.getByTestId('link-badge-client')).toHaveTextContent(allOfficeClients[0].fullName);
    expect(screen.getByTestId('link-badge-lawsuit')).toHaveTextContent(availableLawsuits[0].number);
    expect(screen.getByTestId('link-badge-financial')).toHaveTextContent(availableFinancials[0].code);
    expect(screen.getByTestId('link-badge-date')).toHaveTextContent(availableHearingDates[0].title);

    // Toggle de Status de Urgência no modal de view
    const urgencyToggle = screen.getByTestId('preview-urgency-toggle') as HTMLInputElement;
    expect(urgencyToggle.checked).toBe(true);
    fireEvent.click(urgencyToggle);
    expect(handleToggleUrgency).toHaveBeenCalledWith(sampleMessage, false);

    // Botão de Exclusão
    const deleteBtn = screen.getByTestId('preview-delete-btn');
    expect(deleteBtn).toBeInTheDocument();
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith(sampleMessage);
  });

  it('deve disparar onEdit ao clicar no botão de Editar', () => {
    const handleEdit = vi.fn();
    render(
      <MessagePreviewModal
        isOpen={true}
        message={sampleMessage}
        onClose={() => {}}
        onEdit={handleEdit}
      />
    );

    fireEvent.click(screen.getByTestId('preview-edit-btn'));
    expect(handleEdit).toHaveBeenCalledWith(sampleMessage);
  });
});

describe('UseTemplateModal (Fluxo em 4 Etapas: Destinatários, Agendamento, Referências e Prévia)', () => {
  const sampleTemplate: TemplateItem = {
    id: 'tmpl-flow-1',
    title: 'Aviso de Audiência Modelo',
    content: 'Olá @cliente.nome, sua audiência no processo @processo.numero foi marcada.',
    clients: [allOfficeClients[0]],
    requiresLawsuit: true,
    requiresFinancial: false,
    requiresDate: false,
  };

  it('deve navegar pelas 4 etapas, solicitar apenas referências marcadas no modelo e criar mensagem com título + nome do cliente', () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(
      <UseTemplateModal
        isOpen={true}
        template={sampleTemplate}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );

    // Etapa 1: Destinatários
    expect(screen.getByTestId('wizard-step-recipients')).toBeInTheDocument();
    expect(screen.getByText(/selecione os destinatários/i)).toBeInTheDocument();

    // Avança para Etapa 2
    fireEvent.click(screen.getByTestId('wizard-next-btn'));

    // Etapa 2: Agendamento
    expect(screen.getByTestId('wizard-step-scheduling')).toBeInTheDocument();
    expect(screen.getByTestId('sched-scope-all-btn')).toBeInTheDocument();

    // Avança para Etapa 3
    fireEvent.click(screen.getByTestId('wizard-next-btn'));

    // Etapa 3: Referências — exibe APENAS Processo (marcado no modelo) e oculta Financeiro e Data
    expect(screen.getByTestId('wizard-step-references')).toBeInTheDocument();
    expect(screen.getByTestId('ref-section-lawsuit')).toBeInTheDocument();
    expect(screen.queryByTestId('ref-section-financial')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ref-section-date')).not.toBeInTheDocument();

    // Avança para Etapa 4
    fireEvent.click(screen.getByTestId('wizard-next-btn'));

    // Etapa 4: Título, Prévia e Confirmação
    expect(screen.getByTestId('wizard-step-preview')).toBeInTheDocument();
    const titleInput = screen.getByTestId('use-template-title-input') as HTMLInputElement;
    expect(titleInput).toBeInTheDocument();
    expect(titleInput.value).toBe(sampleTemplate.title);
    expect(screen.getByTestId('use-template-preview-text')).toBeInTheDocument();

    // Edita o título da mensagem
    fireEvent.change(titleInput, { target: { value: 'Título Personalizado da Mensagem' } });

    // Clica no botão de confirmação
    const confirmBtn = screen.getByTestId('confirm-use-template-btn');
    expect(confirmBtn).toBeInTheDocument();
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledWith([
      expect.objectContaining({
        title: 'Título Personalizado da Mensagem - Roberto A. D. Silva',
        content: sampleTemplate.content,
        clients: [allOfficeClients[0]],
      }),
    ]);
  });

  it('deve criar uma mensagem diferente para cada cliente com título padrão mais nome do cliente tanto em "Todos os Clientes" quanto em "Individual"', () => {
    const handleConfirmAll = vi.fn();
    const multiClientTemplate: TemplateItem = {
      ...sampleTemplate,
      clients: [allOfficeClients[0], allOfficeClients[1]],
    };

    const { unmount } = render(
      <UseTemplateModal
        isOpen={true}
        template={multiClientTemplate}
        onClose={() => {}}
        onConfirm={handleConfirmAll}
      />
    );

    // Mantém "Todos os Clientes" (padrão) e avança até a Etapa 4
    fireEvent.click(screen.getByTestId('wizard-next-btn'));
    fireEvent.click(screen.getByTestId('wizard-next-btn'));
    fireEvent.click(screen.getByTestId('wizard-next-btn'));
    fireEvent.click(screen.getByTestId('confirm-use-template-btn'));

    expect(handleConfirmAll).toHaveBeenCalledTimes(1);
    const allModePayload = handleConfirmAll.mock.calls[0][0];
    expect(Array.isArray(allModePayload)).toBe(true);
    expect(allModePayload).toHaveLength(2);
    expect(allModePayload[0].title).toBe('Aviso de Audiência Modelo - Roberto A. D. Silva');
    expect(allModePayload[1].title).toBe('Aviso de Audiência Modelo - Mariana D. Prado');

    unmount();

    const handleConfirmIndiv = vi.fn();
    render(
      <UseTemplateModal
        isOpen={true}
        template={multiClientTemplate}
        onClose={() => {}}
        onConfirm={handleConfirmIndiv}
      />
    );

    // Etapa 1 -> Etapa 2 (Agendamento)
    fireEvent.click(screen.getByTestId('wizard-next-btn'));

    // Seleciona modo "Individual por Cliente"
    fireEvent.click(screen.getByTestId('sched-scope-indiv-btn'));

    // Etapa 2 -> Etapa 3 (Referências) -> Etapa 4 (Título e Prévia)
    fireEvent.click(screen.getByTestId('wizard-next-btn'));
    fireEvent.click(screen.getByTestId('wizard-next-btn'));

    // Confirma criação
    fireEvent.click(screen.getByTestId('confirm-use-template-btn'));

    expect(handleConfirmIndiv).toHaveBeenCalledTimes(1);
    const createdPayload = handleConfirmIndiv.mock.calls[0][0];
    expect(Array.isArray(createdPayload)).toBe(true);
    expect(createdPayload).toHaveLength(2);
    expect(createdPayload[0].clients).toEqual([allOfficeClients[0]]);
    expect(createdPayload[0].title).toBe('Aviso de Audiência Modelo - Roberto A. D. Silva');
    expect(createdPayload[1].clients).toEqual([allOfficeClients[1]]);
    expect(createdPayload[1].title).toBe('Aviso de Audiência Modelo - Mariana D. Prado');
  });

  it('deve permitir voltar entre etapas usando o botão Voltar', () => {
    render(
      <UseTemplateModal
        isOpen={true}
        template={sampleTemplate}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );

    // Avança para Etapa 2
    fireEvent.click(screen.getByTestId('wizard-next-btn'));
    expect(screen.getByTestId('wizard-step-scheduling')).toBeInTheDocument();

    // Clica em Voltar
    fireEvent.click(screen.getByTestId('wizard-back-btn'));
    expect(screen.getByTestId('wizard-step-recipients')).toBeInTheDocument();
  });
});

describe('MessagesContainer (Integração Completa)', () => {
  it('deve renderizar a tela de mensagens com o grid atualizado', () => {
    render(<MessagesContainer />);

    expect(screen.getByRole('heading', { name: /^mensagens$/i })).toBeInTheDocument();
    expect(screen.getAllByTestId('message-list-item').length).toBeGreaterThan(0);
  });

  it('deve abrir o modal de prévia ao clicar no card da mensagem', () => {
    render(<MessagesContainer />);

    const messageCards = screen.getAllByTestId('message-list-item');
    fireEvent.click(messageCards[0]);

    expect(screen.getByTestId('message-preview-modal')).toBeInTheDocument();
    expect(screen.getByTestId('preview-edit-btn')).toBeInTheDocument();
  });

  it('deve abrir o modal de edição ao clicar no botão "Editar" dentro do modal de prévia', () => {
    render(<MessagesContainer />);

    // Clica na mensagem para abrir a prévia
    const messageCards = screen.getAllByTestId('message-list-item');
    fireEvent.click(messageCards[0]);

    // Clica em Editar dentro da prévia
    fireEvent.click(screen.getByTestId('preview-edit-btn'));

    // Modal de edição (MessageModal) deve estar aberto
    expect(screen.getByRole('heading', { name: /editar mensagem/i })).toBeInTheDocument();
  });

  it('deve abrir o modal de confirmação de envio ao clicar no ícone de Envio', () => {
    render(<MessagesContainer />);

    const sendBtns = screen.getAllByTestId('open-send-btn');
    fireEvent.click(sendBtns[0]);

    expect(screen.getByText(/confirmar disparo/i)).toBeInTheDocument();
  });

  it('deve abrir o modal de "Usar Modelo" ao clicar no botão correspondente na aba de modelos', () => {
    render(<MessagesContainer />);

    // Alterna para a aba de modelos
    const templatesTab = screen.getByRole('tab', { name: /modelos/i });
    fireEvent.click(templatesTab);

    // Localiza e clica no botão "Usar Modelo"
    const useTemplateBtns = screen.getAllByTestId('use-template-btn');
    fireEvent.click(useTemplateBtns[0]);

    expect(screen.getByTestId('use-template-modal')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-step-recipients')).toBeInTheDocument();
  });

  it('deve permitir ordenar mensagens por título, data de envio e cliente', () => {
    render(<MessagesContainer />);

    const sortSelect = screen.getByTestId('messages-sort-select') as HTMLSelectElement;
    expect(sortSelect).toBeInTheDocument();

    // Por padrão está ordenado por Título ('title')
    let titles = screen.getAllByTestId('message-item-title').map((el) => el.textContent);
    expect(titles[0]).toContain('Aviso de Audiência');

    // Ordena por Data de Envio ('scheduledAt') -> msg-3 (2026-10-22) vem primeiro
    fireEvent.change(sortSelect, { target: { value: 'scheduledAt' } });
    titles = screen.getAllByTestId('message-item-title').map((el) => el.textContent);
    expect(titles[0]).toContain('Felicitação de Aniversário');

    // Ordena por Cliente ('client') -> Beatriz Vasconcelos (msg-4) vem primeiro
    fireEvent.change(sortSelect, { target: { value: 'client' } });
    titles = screen.getAllByTestId('message-item-title').map((el) => el.textContent);
    expect(titles[0]).toContain('Beatriz Vasconcelos');
  });

  it('deve exibir ações em massa (urgência, enviar, excluir) e caixas de seleção visíveis somente quando ao menos uma mensagem estiver selecionada', () => {
    render(<MessagesContainer />);

    // Inicialmente nenhuma mensagem está selecionada -> barra de ações em massa oculta
    expect(screen.queryByTestId('bulk-actions-bar')).not.toBeInTheDocument();
    const wrapper1 = screen.getByTestId('select-checkbox-wrapper-msg-1');
    expect(wrapper1).toHaveClass('opacity-0');

    // Seleciona a primeira mensagem
    const checkbox1 = screen.getByTestId('select-message-msg-1');
    fireEvent.click(checkbox1);

    // Agora todas as caixas de seleção do grid ficam visíveis (opacity-100) e a barra de ações aparece
    expect(screen.getByTestId('select-checkbox-wrapper-msg-1')).toHaveClass('opacity-100');
    expect(screen.getByTestId('select-checkbox-wrapper-msg-2')).toHaveClass('opacity-100');
    expect(screen.getByTestId('bulk-actions-bar')).toBeInTheDocument();
    expect(screen.getByTestId('bulk-select-all-btn')).toBeInTheDocument();
    expect(screen.getByTestId('bulk-deselect-all-btn')).toBeInTheDocument();
    expect(screen.getByTestId('bulk-urgency-btn')).toBeInTheDocument();
    expect(screen.getByTestId('bulk-send-btn')).toBeInTheDocument();
    expect(screen.getByTestId('bulk-delete-btn')).toBeInTheDocument();

    // Testa "Marcar todos" -> seleciona todas as 4 mensagens
    fireEvent.click(screen.getByTestId('bulk-select-all-btn'));
    expect(screen.getByText(/4 selecionada\(s\)/i)).toBeInTheDocument();

    // Testa "Desmarcar todos" -> limpa a seleção e oculta a barra
    fireEvent.click(screen.getByTestId('bulk-deselect-all-btn'));
    expect(screen.queryByTestId('bulk-actions-bar')).not.toBeInTheDocument();

    // Seleciona novamente a primeira mensagem e exclui em massa
    fireEvent.click(screen.getByTestId('select-message-msg-1'));
    fireEvent.click(screen.getByTestId('bulk-delete-btn'));
    expect(screen.queryByTestId('select-message-msg-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bulk-actions-bar')).not.toBeInTheDocument();
  });

  it('deve filtrar mensagens pelo nome/código dos objetos de vínculo (processo, financeiro e data)', () => {
    render(<MessagesContainer />);

    const searchInput = screen.getByPlaceholderText(/buscar mensagens por título, conteúdo, cliente ou vínculo/i);

    // Busca pelo código da fatura vinculada (FAT-2026-042 -> msg-2)
    fireEvent.change(searchInput, { target: { value: 'FAT-2026-042' } });
    let items = screen.getAllByTestId('message-item-title');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Cobrança de Honorários Sucumbenciais - Mariana D. Prado');

    // Busca pelo número do processo vinculado (5004321-12.2025.8.26.0100 -> msg-4)
    fireEvent.change(searchInput, { target: { value: '5004321-12' } });
    items = screen.getAllByTestId('message-item-title');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Notificação de Andamento Processual - Beatriz Vasconcelos');

    // Busca pelo local/título da data de audiência vinculada (Sala Virtual 04 -> msg-1)
    fireEvent.change(searchInput, { target: { value: 'Sala Virtual 04' } });
    items = screen.getAllByTestId('message-item-title');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Aviso de Audiência de Instrução - Roberto A. D. Silva');
  });

  it('deve renderizar o grid de notificações na aba de Notificações e permitir marcar como lidas', () => {
    render(<MessagesContainer />);

    const notificationsTab = screen.getByRole('tab', { name: /notificações/i });
    fireEvent.click(notificationsTab);

    expect(screen.getByRole('heading', { name: /notificações internas/i })).toBeInTheDocument();
    expect(screen.getAllByTestId('notification-list-item').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByTestId('mark-all-read-btn'));
    expect(screen.queryByTestId('urgency-dot-notifications')).not.toBeInTheDocument();
  });
});

describe('NotificationListItem (Modelo Simples de Notificação no Grid)', () => {
  const sampleNotification: NotificationItem = initialNotifications[0];

  it('deve exibir título, descrição, advogado atribuído, prazo, indicador de não lida e Prazo Fatal quando isFatal for true', () => {
    render(<NotificationListItem item={sampleNotification} />);

    expect(screen.getByTestId('notification-unread-dot')).toBeInTheDocument();
    expect(screen.getByTestId('notification-item-title')).toHaveTextContent(sampleNotification.title);
    expect(screen.getByText(sampleNotification.assignedLawyer)).toBeInTheDocument();
    expect(screen.getByText(sampleNotification.deadline)).toBeInTheDocument();
    expect(screen.getByText('Prazo Fatal')).toBeInTheDocument();
  });

  it('não deve exibir nenhuma legenda de status quando não for prazo fatal', () => {
    const regularNotification: NotificationItem = initialNotifications[1];
    render(<NotificationListItem item={regularNotification} />);

    expect(screen.queryByText('Prazo Fatal')).not.toBeInTheDocument();
    expect(screen.queryByText('Audiência')).not.toBeInTheDocument();
    expect(screen.queryByText('Em Andamento')).not.toBeInTheDocument();
  });

  it('deve disparar onToggleRead ao clicar no botão de marcar como lida', () => {
    const handleToggleRead = vi.fn();
    render(<NotificationListItem item={sampleNotification} onToggleRead={handleToggleRead} />);

    fireEvent.click(screen.getByTestId('toggle-read-btn'));
    expect(handleToggleRead).toHaveBeenCalledWith(sampleNotification);
  });
});
