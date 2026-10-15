import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FinancialSummary } from './FinancialSummary';
import { FinancialStatusBadge, FeeTypeBadge } from './FinancialBadge';
import { FinancialFilters } from './FinancialFilters';
import { FinancialTable } from './FinancialTable';
import { FinancialPagination } from './FinancialPagination';
import { NewInvoiceModal } from './NewInvoiceModal';
import { InvoiceDetailsModal } from './InvoiceDetailsModal';
import { FinancialContainer } from './FinancialContainer';
import { initialInvoices, calculateSummary } from './mock-data';
import { formatCurrency, formatDateBR } from './utils';

describe('Financial Utils & Calculations (RF13)', () => {
  it('deve calcular corretamente o fluxo financeiro com honorários pagos, pendentes e vencidos', () => {
    const summary = calculateSummary(initialInvoices);

    expect(summary.totalCount).toBe(initialInvoices.length);
    expect(summary.paidCount).toBe(5);
    expect(summary.paidAmount).toBe(34400);
    expect(summary.pendingCount).toBe(5);
    expect(summary.pendingAmount).toBe(28170);
    expect(summary.overdueCount).toBe(2);
    expect(summary.overdueAmount).toBe(12700);
    expect(summary.totalEstimated).toBe(34400 + 28170 + 12700);
  });

  it('deve formatar valores monetários no padrão Real Brasileiro (BRL)', () => {
    const formatted = formatCurrency(12500.5);
    // Deve conter R$ e 12.500,50
    expect(formatted).toContain('12.500,50');
    expect(formatted).toContain('R$');
  });

  it('deve formatar datas no padrão DD/MM/AAAA', () => {
    expect(formatDateBR('2026-10-15')).toBe('15/10/2026');
    expect(formatDateBR('')).toBe('-');
  });
});

describe('FinancialSummary Component (RF13 - Visão Simplificada de Fluxo)', () => {
  it('deve renderizar o total faturado e o total previsto com valores corretos', () => {
    const summary = calculateSummary(initialInvoices);
    render(<FinancialSummary summary={summary} />);

    expect(screen.getByText('Fluxo de Honorários')).toBeInTheDocument();
    expect(screen.getByText('Total previsto (Mês)')).toBeInTheDocument();
    expect(screen.getAllByText(/34\.400,00/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/75\.270,00/)).toBeInTheDocument();
  });

  it('deve exibir a contagem e valores discriminados de pagos, a vencer e vencidos', () => {
    const summary = calculateSummary(initialInvoices);
    render(<FinancialSummary summary={summary} />);

    expect(screen.getByText('Pago:')).toBeInTheDocument();
    expect(screen.getByText('A vencer:')).toBeInTheDocument();
    expect(screen.getByText('Vencido:')).toBeInTheDocument();

    expect(screen.getByText(/\(5 cobranças liquidadas\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/34\.400,00/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/28\.170,00/)).toBeInTheDocument();
    expect(screen.getByText(/12\.700,00/)).toBeInTheDocument();
  });

  it('deve renderizar a barra de progresso com acessibilidade', () => {
    const summary = calculateSummary(initialInvoices);
    render(<FinancialSummary summary={summary} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-label', 'Distribuição do fluxo de honorários');
  });
});

describe('FinancialBadge Components', () => {
  it('deve renderizar os badges de status Pago, Pendente e Vencido corretamente', () => {
    const { rerender } = render(<FinancialStatusBadge status="paid" />);
    expect(screen.getByText('Pago')).toBeInTheDocument();

    rerender(<FinancialStatusBadge status="pending" />);
    expect(screen.getByText('Pendente')).toBeInTheDocument();

    rerender(<FinancialStatusBadge status="overdue" />);
    expect(screen.getByText('Vencido')).toBeInTheDocument();
  });

  it('deve renderizar os badges de tipo Contratual e Sucumbencial', () => {
    const { rerender } = render(<FeeTypeBadge feeType="contractual" />);
    expect(screen.getByText('Contratual')).toBeInTheDocument();

    rerender(<FeeTypeBadge feeType="succumbential" />);
    expect(screen.getByText('Sucumbencial')).toBeInTheDocument();
  });
});

describe('FinancialFilters Component', () => {
  const defaultCounts = { all: 12, paid: 5, pending: 5, overdue: 2 };

  it('deve renderizar as abas com contagens e permitir troca de aba', () => {
    const onTabChange = vi.fn();
    render(
      <FinancialFilters
        currentTab="all"
        onTabChange={onTabChange}
        counts={defaultCounts}
        searchQuery=""
        onSearchChange={vi.fn()}
        feeTypeFilter="all"
        onFeeTypeChange={vi.fn()}
        sortField="dueDate"
        sortOrder="desc"
        onSortChange={vi.fn()}
        onNewInvoice={vi.fn()}
        onExport={vi.fn()}
      />
    );

    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Pagos')).toBeInTheDocument();
    expect(screen.getByText('Pendentes')).toBeInTheDocument();
    expect(screen.getByText('Vencidos')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Pagos'));
    expect(onTabChange).toHaveBeenCalledWith('paid');
  });

  it('deve disparar onSearchChange ao digitar na busca e permitir limpar', () => {
    const onSearchChange = vi.fn();
    const { rerender } = render(
      <FinancialFilters
        currentTab="all"
        onTabChange={vi.fn()}
        counts={defaultCounts}
        searchQuery=""
        onSearchChange={onSearchChange}
        feeTypeFilter="all"
        onFeeTypeChange={vi.fn()}
        sortField="dueDate"
        sortOrder="desc"
        onSortChange={vi.fn()}
        onNewInvoice={vi.fn()}
        onExport={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/buscar cliente ou processo/i);
    fireEvent.change(input, { target: { value: 'Petrolina' } });
    expect(onSearchChange).toHaveBeenCalledWith('Petrolina');

    // Rerender with active search query and click clear button
    rerender(
      <FinancialFilters
        currentTab="all"
        onTabChange={vi.fn()}
        counts={defaultCounts}
        searchQuery="Petrolina"
        onSearchChange={onSearchChange}
        feeTypeFilter="all"
        onFeeTypeChange={vi.fn()}
        sortField="dueDate"
        sortOrder="desc"
        onSortChange={vi.fn()}
        onNewInvoice={vi.fn()}
        onExport={vi.fn()}
      />
    );

    const clearBtn = screen.getByTitle('Limpar busca');
    fireEvent.click(clearBtn);
    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('deve disparar onNewInvoice ao clicar em Novo Honorário', () => {
    const onNewInvoice = vi.fn();
    render(
      <FinancialFilters
        currentTab="all"
        onTabChange={vi.fn()}
        counts={defaultCounts}
        searchQuery=""
        onSearchChange={vi.fn()}
        feeTypeFilter="all"
        onFeeTypeChange={vi.fn()}
        sortField="dueDate"
        sortOrder="desc"
        onSortChange={vi.fn()}
        onNewInvoice={onNewInvoice}
        onExport={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Novo Honorário'));
    expect(onNewInvoice).toHaveBeenCalled();
  });
});

describe('FinancialTable Component (RF12 - Listagem de Honorários)', () => {
  const sampleInvoices = initialInvoices.slice(0, 3);

  it('deve renderizar as linhas de cobrança com código, cliente, processo e valor', () => {
    render(
      <FinancialTable
        invoices={sampleInvoices}
        selectedIds={[]}
        onToggleSelect={vi.fn()}
        onSelectAll={vi.fn()}
        onToggleStatus={vi.fn()}
        onDeleteInvoice={vi.fn()}
        onViewInvoiceDetails={vi.fn()}
      />
    );

    expect(screen.getByRole('columnheader', { name: 'Cliente' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Processo' })).toBeInTheDocument();
    expect(screen.getByText('HON-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Agropecuária Vale do São Francisco Ltda')).toBeInTheDocument();
    expect(screen.getByText('0001842-30.2025.8.17.1130')).toBeInTheDocument();
    expect(screen.getByText('Dr. Alberto Queiroz')).toBeInTheDocument();
    expect(screen.getByText(/6\.750,00/)).toBeInTheDocument();
    expect(screen.getByText('02/10/2026')).toBeInTheDocument();
    expect(screen.getByText('REC-1001.pdf')).toBeInTheDocument();
  });

  it('deve disparar onToggleSelect ao clicar no checkbox da linha', () => {
    const onToggleSelect = vi.fn();
    render(
      <FinancialTable
        invoices={sampleInvoices}
        selectedIds={[]}
        onToggleSelect={onToggleSelect}
        onSelectAll={vi.fn()}
        onToggleStatus={vi.fn()}
        onDeleteInvoice={vi.fn()}
        onViewInvoiceDetails={vi.fn()}
      />
    );

    const checkbox = screen.getByLabelText('Selecionar cobrança HON-2026-001');
    fireEvent.click(checkbox);
    expect(onToggleSelect).toHaveBeenCalledWith('inv-1');
  });

  it('deve disparar onSelectAll ao clicar no checkbox do cabeçalho', () => {
    const onSelectAll = vi.fn();
    render(
      <FinancialTable
        invoices={sampleInvoices}
        selectedIds={[]}
        onToggleSelect={vi.fn()}
        onSelectAll={onSelectAll}
        onToggleStatus={vi.fn()}
        onDeleteInvoice={vi.fn()}
        onViewInvoiceDetails={vi.fn()}
      />
    );

    const headerCheckbox = screen.getByLabelText('Selecionar todas as cobranças');
    fireEvent.click(headerCheckbox);
    expect(onSelectAll).toHaveBeenCalledWith(true);
  });

  it('deve renderizar estado vazio quando a lista de faturas for vazia', () => {
    render(
      <FinancialTable
        invoices={[]}
        selectedIds={[]}
        onToggleSelect={vi.fn()}
        onSelectAll={vi.fn()}
        onToggleStatus={vi.fn()}
        onDeleteInvoice={vi.fn()}
        onViewInvoiceDetails={vi.fn()}
      />
    );

    expect(screen.getByText('Nenhuma cobrança encontrada')).toBeInTheDocument();
  });
});

describe('FinancialPagination Component', () => {
  it('deve renderizar a página atual, total e permitir navegar', () => {
    const onPageChange = vi.fn();
    render(
      <FinancialPagination
        currentPage={1}
        totalPages={3}
        totalItems={15}
        pageSize={5}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText(/mostrando 1–5 de 15 cobranças/i)).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /próximo/i });
    expect(nextBtn).toBeInTheDocument();
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(2);

    const prevBtn = screen.getByRole('button', { name: /anterior/i });
    expect(prevBtn).toBeDisabled();
  });
});

describe('NewInvoiceModal Component (RF12 - Cadastro de Honorários)', () => {
  it('não deve renderizar quando isOpen for false', () => {
    render(
      <NewInvoiceModal
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.queryByText('Cadastrar Honorário')).not.toBeInTheDocument();
  });

  it('deve exibir erros de validação ao tentar submeter formulário em branco', () => {
    const onSubmit = vi.fn();
    render(
      <NewInvoiceModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByRole('heading', { name: 'Cadastrar Honorário' })).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: 'Cadastrar Honorário' });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Nome do cliente é obrigatório.')).toBeInTheDocument();
    expect(screen.getByText('Número do processo CNJ é obrigatório.')).toBeInTheDocument();
    expect(screen.getByText('Informe um valor válido maior que zero.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('deve submeter o novo honorário com sucesso quando todos os dados forem preenchidos', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(
      <NewInvoiceModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        nextReferenceCode="HON-2026-099"
      />
    );

    // Preenche cliente
    const clientInput = screen.getByLabelText(/cliente ou requerente/i);
    fireEvent.change(clientInput, { target: { value: 'Usina Solar São Francisco' } });

    // Preenche processo CNJ
    const processInput = screen.getByLabelText(/processo cnj/i);
    fireEvent.change(processInput, { target: { value: '0004567-12.2026.8.17.1130' } });

    // Preenche valor
    const amountInput = screen.getByLabelText(/valor \(r\$\)/i);
    fireEvent.change(amountInput, { target: { value: '8500' } });

    // Preenche vencimento
    const dueDateInput = screen.getByLabelText(/data de vencimento/i);
    fireEvent.change(dueDateInput, { target: { value: '2026-11-20' } });

    // Clica em cadastrar
    const submitBtn = screen.getByRole('button', { name: 'Cadastrar Honorário' });
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        clientName: 'Usina Solar São Francisco',
        processNumber: '0004567-12.2026.8.17.1130',
        amount: 8500,
        dueDate: '2026-11-20',
        feeType: 'contractual',
        status: 'pending',
      })
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('deve fechar o modal ao clicar no botão Cancelar', () => {
    const onClose = vi.fn();
    render(
      <NewInvoiceModal
        isOpen={true}
        onClose={onClose}
        onSubmit={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalled();
  });
});

describe('InvoiceDetailsModal Component', () => {
  const paidSample = initialInvoices[0]; // status: 'paid', hasDocument: true
  const pendingSample = initialInvoices[2]; // status: 'overdue' / pending

  it('deve renderizar as informações principais do honorário no modal de detalhes', () => {
    render(
      <InvoiceDetailsModal
        isOpen={true}
        invoice={paidSample}
        onClose={vi.fn()}
        onToggleStatus={vi.fn()}
      />
    );

    expect(screen.getByText(paidSample.reference)).toBeInTheDocument();
    expect(screen.getByText(paidSample.clientName)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(paidSample.processNumber))).toBeInTheDocument();
    expect(screen.getByText(paidSample.lawyerName)).toBeInTheDocument();
    expect(screen.getByText(paidSample.documentName!)).toBeInTheDocument();
  });

  it('deve permitir reverter honorário pago para pendente e fechar o modal', () => {
    const onToggleStatus = vi.fn();
    const onClose = vi.fn();
    render(
      <InvoiceDetailsModal
        isOpen={true}
        invoice={paidSample}
        onClose={onClose}
        onToggleStatus={onToggleStatus}
      />
    );

    const revertBtn = screen.getByText('Reverter para Pendente');
    fireEvent.click(revertBtn);
    expect(onToggleStatus).toHaveBeenCalledWith(paidSample.id);

    const closeBtn = screen.getByRole('button', { name: 'Fechar' });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('deve exibir fluxo de liquidação com upload de recibo para honorário pendente', () => {
    const onRegisterPayment = vi.fn();
    render(
      <InvoiceDetailsModal
        isOpen={true}
        invoice={pendingSample}
        onClose={vi.fn()}
        onToggleStatus={vi.fn()}
        onRegisterPayment={onRegisterPayment}
      />
    );

    expect(screen.getByText(/selecionar comprovante/i)).toBeInTheDocument();
    expect(screen.getByText('Liquidar com Comprovante')).toBeInTheDocument();

    const liquidateBtn = screen.getByText('Liquidar com Comprovante');
    fireEvent.click(liquidateBtn);

    expect(onRegisterPayment).toHaveBeenCalledWith(
      pendingSample.id,
      expect.objectContaining({
        paidDate: expect.any(String),
      })
    );
  });
});

describe('FinancialContainer (Integração Completa da Tela de Gestão Financeira)', () => {
  it('deve renderizar o título da página e componentes principais', () => {
    render(<FinancialContainer />);

    expect(screen.getByRole('heading', { level: 1, name: 'Gestão Financeira' })).toBeInTheDocument();
    expect(screen.getByText('Fluxo de Honorários')).toBeInTheDocument();
    expect(screen.getByText('Cobranças e Honorários')).toBeInTheDocument();
  });

  it('deve filtrar por abas (Todos, Pagos, Pendentes, Vencidos)', () => {
    render(<FinancialContainer />);

    // Clica na aba Vencidos
    const overdueTab = screen.getByText('Vencidos');
    fireEvent.click(overdueTab);

    // Deve exibir faturas vencidas
    expect(screen.getByText('HON-2026-003')).toBeInTheDocument();
    // Não deve exibir faturas pagas nesta aba
    expect(screen.queryByText('HON-2026-001')).not.toBeInTheDocument();
  });

  it('deve filtrar dinamicamente pelo campo de busca', () => {
    render(<FinancialContainer />);

    const searchInput = screen.getByPlaceholderText(/buscar cliente ou processo/i);
    fireEvent.change(searchInput, { target: { value: 'Juazeirense' } });

    expect(screen.getByText('Transportadora Juazeirense Ltda')).toBeInTheDocument();
    expect(screen.queryByText('Agropecuária Vale do São Francisco Ltda')).not.toBeInTheDocument();
  });

  it('deve abrir o modal de cadastro e adicionar uma nova fatura com recálculo em tempo real', () => {
    render(<FinancialContainer />);

    // Clica no botão Novo Honorário
    const newBtn = screen.getByText('Novo Honorário');
    fireEvent.click(newBtn);

    expect(screen.getByRole('heading', { name: 'Cadastrar Honorário' })).toBeInTheDocument();

    // Preenche o formulário
    fireEvent.change(screen.getByLabelText(/cliente ou requerente/i), {
      target: { value: 'Hospital Regional de Petrolina' },
    });
    fireEvent.change(screen.getByLabelText(/processo cnj/i), {
      target: { value: '0809999-11.2026.8.17.1130' },
    });
    fireEvent.change(screen.getByLabelText(/valor \(r\$\)/i), {
      target: { value: '15000' },
    });
    fireEvent.change(screen.getByLabelText(/data de vencimento/i), {
      target: { value: '2026-11-30' },
    });

    // Submete
    const submitBtn = screen.getByRole('button', { name: 'Cadastrar Honorário' });
    fireEvent.click(submitBtn);

    // Modal deve fechar e nova fatura deve aparecer na listagem
    expect(screen.queryByRole('heading', { name: 'Cadastrar Honorário' })).not.toBeInTheDocument();
    expect(screen.getByText('Hospital Regional de Petrolina')).toBeInTheDocument();
    expect(screen.getByText('0809999-11.2026.8.17.1130')).toBeInTheDocument();
  });

  it('deve permitir selecionar cobranças e disparar ação em massa', () => {
    render(<FinancialContainer />);

    const selectAllCheckbox = screen.getByLabelText('Selecionar todas as cobranças');
    fireEvent.click(selectAllCheckbox);

    // Deve exibir banner de seleção em massa
    expect(screen.getByText(/cobranças selecionadas/i)).toBeInTheDocument();
    expect(screen.getByText('Marcar selecionadas como pagas')).toBeInTheDocument();

    // Clica em marcar selecionadas como pagas
    fireEvent.click(screen.getByText('Marcar selecionadas como pagas'));

    // Banner desaparece após ação
    expect(screen.queryByText(/cobranças selecionadas/i)).not.toBeInTheDocument();
  });
});
