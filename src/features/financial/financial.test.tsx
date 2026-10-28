import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FinancialSummary } from './FinancialSummary';
import { FinancialStatusBadge, FeeTypeBadge } from './FinancialBadge';
import { FinancialFilters } from './FinancialFilters';
import { FinancialTable } from './FinancialTable';
import { FinancialPagination } from './FinancialPagination';
import { NewInvoiceModal } from './NewInvoiceModal';
import { InvoiceDetailsModal } from './InvoiceDetailsModal';
import { FinancialContainer } from './FinancialContainer';
import {
  calculateSummary,
  formatCurrency,
  formatDateBR,
  formatShortId,
  mapFaturaFromAPI,
} from './utils';
import { Invoice } from './types';
import * as api from './api';

const initialInvoices: Invoice[] = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    cliente: 'aaaa1111-1111-4111-8111-111111111101',
    clienteNome: 'Agropecuária Vale do São Francisco Ltda',
    processo: 'bbbb1111-1111-4111-8111-111111111101',
    descricao: 'Parcela 1 de honorários contratuais de assessoria tributária rural.',
    valor: 6750.0,
    tipo: 'CONTRATUAL',
    status: 'PAGO',
    data_vencimento: '2026-10-02',
    data_pagamento: '2026-10-02',
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-02T14:30:00Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222202',
    cliente: 'aaaa1111-1111-4111-8111-111111111102',
    clienteNome: 'Cooperativa Agrícola de Petrolina (COOPAP)',
    processo: 'bbbb1111-1111-4111-8111-111111111102',
    descricao: 'Honorários sucumbenciais da 2ª Vara Cível da Comarca de Petrolina.',
    valor: 12500.0,
    tipo: 'SUCUMBENCIAL',
    status: 'PAGO',
    data_vencimento: '2026-10-04',
    data_pagamento: '2026-10-04',
    created_at: '2026-10-01T11:00:00Z',
    updated_at: '2026-10-04T16:00:00Z',
  },
  {
    id: '33333333-3333-4333-8333-333333333303',
    cliente: 'aaaa1111-1111-4111-8111-111111111103',
    clienteNome: 'Frutas do Vale Exportação S/A',
    processo: null,
    descricao: 'Aguardando liquidação de boleto bancário vencido há mais de 7 dias.',
    valor: 9800.0,
    tipo: 'CONTRATUAL',
    status: 'VENCIDO',
    data_vencimento: '2026-10-06',
    data_pagamento: null,
    created_at: '2026-10-01T12:00:00Z',
    updated_at: '2026-10-06T12:00:00Z',
  },
  {
    id: '44444444-4444-4444-8444-444444444404',
    cliente: 'aaaa1111-1111-4111-8111-111111111104',
    clienteNome: 'Transportadora Juazeirense Ltda',
    processo: null,
    descricao: 'Defesa trabalhista no TRT-5 Juazeiro.',
    valor: 4200.0,
    tipo: 'CONTRATUAL',
    status: 'PAGO',
    data_vencimento: '2026-10-09',
    data_pagamento: '2026-10-08',
  },
  {
    id: '55555555-5555-4555-8555-555555555505',
    cliente: null,
    clienteNome: undefined,
    processo: null,
    descricao: 'Aposentadoria rural concedida - honorários de êxito.',
    valor: 3750.0,
    tipo: 'CONTRATUAL',
    status: 'PAGO',
    data_vencimento: '2026-10-12',
    data_pagamento: '2026-10-11',
  },
  {
    id: '66666666-6666-4666-8666-666666666606',
    cliente: null,
    processo: null,
    descricao: 'Honorários de sucumbência arbitrados pelo TJPE.',
    valor: 7200.0,
    tipo: 'SUCUMBENCIAL',
    status: 'PAGO',
    data_vencimento: '2026-10-15',
    data_pagamento: '2026-10-15',
  },
  {
    id: '77777777-7777-4777-8777-777777777707',
    cliente: null,
    processo: null,
    descricao: 'Vencimento próximo. Boleto emitido com código Pix registrado.',
    valor: 5500.0,
    tipo: 'CONTRATUAL',
    status: 'PENDENTE',
    data_vencimento: '2026-10-18',
    data_pagamento: null,
  },
  {
    id: '88888888-8888-4888-8888-888888888808',
    cliente: null,
    processo: null,
    descricao: 'Consultoria contratual para recuperação de crédito.',
    valor: 3600.0,
    tipo: 'CONTRATUAL',
    status: 'PENDENTE',
    data_vencimento: '2026-10-21',
    data_pagamento: null,
  },
  {
    id: '99999999-9999-4999-8999-999999999909',
    cliente: null,
    processo: null,
    descricao: 'Aguardando liberação de alvará judicial.',
    valor: 8320.0,
    tipo: 'SUCUMBENCIAL',
    status: 'PENDENTE',
    data_vencimento: '2026-10-24',
    data_pagamento: null,
  },
  {
    id: '10101010-1010-4010-8010-101010101010',
    cliente: null,
    processo: null,
    descricao: 'Honorários fixos de assessoria jurídica mensal preventiva.',
    valor: 4600.0,
    tipo: 'CONTRATUAL',
    status: 'PENDENTE',
    data_vencimento: '2026-10-28',
    data_pagamento: null,
  },
  {
    id: '12121212-1212-4212-8212-121212121211',
    cliente: null,
    processo: null,
    descricao: 'Tentativa de acordo amigável em andamento.',
    valor: 2900.0,
    tipo: 'CONTRATUAL',
    status: 'VENCIDO',
    data_vencimento: '2026-09-28',
    data_pagamento: null,
  },
  {
    id: '13131313-1313-4313-8313-131313131312',
    cliente: null,
    processo: null,
    descricao: 'Execução de título extrajudicial.',
    valor: 6150.0,
    tipo: 'SUCUMBENCIAL',
    status: 'PENDENTE',
    data_vencimento: '2026-10-31',
    data_pagamento: null,
  },
];

vi.mock('./api', async () => {
  const actual = await vi.importActual<typeof import('./api')>('./api');
  return {
    ...actual,
    listarFaturas: vi.fn(),
    listarClientes: vi.fn(),
    criarFatura: vi.fn(),
    atualizarFatura: vi.fn(),
    deletarFatura: vi.fn(),
    obterFaturaPorId: vi.fn(),
  };
});

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
    expect(formatted).toContain('12.500,50');
    expect(formatted).toContain('R$');
  });

  it('deve formatar datas no padrão DD/MM/AAAA', () => {
    expect(formatDateBR('2026-10-15')).toBe('15/10/2026');
    expect(formatDateBR('')).toBe('-');
  });

  it('deve mapear corretamente o objeto Fatura retornado pela API para o tipo Invoice da UI', () => {
    const mapped = mapFaturaFromAPI(
      {
        id: '11111111-2222-3333-4444-555555555555',
        cliente: 'aaaa1111-1111-4111-8111-111111111101',
        processo: null,
        descricao: 'Honorários advocatícios iniciais',
        valor: '1500.00',
        tipo: 'RECEITA',
        status: 'PENDENTE',
        data_vencimento: '2026-11-10',
        data_pagamento: null,
      },
      { 'aaaa1111-1111-4111-8111-111111111101': 'Cliente Teste' }
    );

    expect(mapped.valor).toBe(1500);
    expect(mapped.clienteNome).toBe('Cliente Teste');
    expect(mapped.status).toBe('PENDENTE');
    expect(mapped.tipo).toBe('RECEITA');
    expect(formatShortId(mapped.id)).toBe('#11111111');
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
    const { rerender } = render(<FinancialStatusBadge status="PAGO" />);
    expect(screen.getByText('Pago')).toBeInTheDocument();

    rerender(<FinancialStatusBadge status="PENDENTE" />);
    expect(screen.getByText('Pendente')).toBeInTheDocument();

    rerender(<FinancialStatusBadge status="VENCIDO" />);
    expect(screen.getByText('Vencido')).toBeInTheDocument();
  });

  it('deve renderizar os badges de tipo Contratual, Sucumbencial e Receita', () => {
    const { rerender } = render(<FeeTypeBadge feeType="CONTRATUAL" />);
    expect(screen.getByText('Contratual')).toBeInTheDocument();

    rerender(<FeeTypeBadge feeType="SUCUMBENCIAL" />);
    expect(screen.getByText('Sucumbencial')).toBeInTheDocument();

    rerender(<FeeTypeBadge feeType="RECEITA" />);
    expect(screen.getByText('Receita')).toBeInTheDocument();
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
        sortField="data_vencimento"
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
    expect(onTabChange).toHaveBeenCalledWith('PAGO');
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
        sortField="data_vencimento"
        sortOrder="desc"
        onSortChange={vi.fn()}
        onNewInvoice={vi.fn()}
        onExport={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/buscar descrição ou cliente/i);
    fireEvent.change(input, { target: { value: 'Petrolina' } });
    expect(onSearchChange).toHaveBeenCalledWith('Petrolina');

    rerender(
      <FinancialFilters
        currentTab="all"
        onTabChange={vi.fn()}
        counts={defaultCounts}
        searchQuery="Petrolina"
        onSearchChange={onSearchChange}
        feeTypeFilter="all"
        onFeeTypeChange={vi.fn()}
        sortField="data_vencimento"
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
        sortField="data_vencimento"
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

  it('deve renderizar as linhas de cobrança com ID, descrição, cliente, processo e valor', () => {
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

    expect(screen.getByRole('columnheader', { name: 'Descrição' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Cliente' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Processo' })).toBeInTheDocument();
    expect(screen.getByText('#11111111')).toBeInTheDocument();
    expect(
      screen.getByText('Parcela 1 de honorários contratuais de assessoria tributária rural.')
    ).toBeInTheDocument();
    expect(screen.getByText('Agropecuária Vale do São Francisco Ltda')).toBeInTheDocument();
    expect(screen.getByText(/6\.750,00/)).toBeInTheDocument();
    expect(screen.getAllByText('02/10/2026').length).toBeGreaterThanOrEqual(1);
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

    const checkbox = screen.getByLabelText('Selecionar cobrança #11111111');
    fireEvent.click(checkbox);
    expect(onToggleSelect).toHaveBeenCalledWith(sampleInvoices[0].id);
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
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(2);

    const prevBtn = screen.getByRole('button', { name: /anterior/i });
    expect(prevBtn).toBeDisabled();
  });
});

describe('NewInvoiceModal Component (RF12 - Cadastro de Honorários)', () => {
  it('não deve renderizar quando isOpen for false', () => {
    render(<NewInvoiceModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.queryByText('Cadastrar Honorário')).not.toBeInTheDocument();
  });

  it('deve exibir erros de validação ao tentar submeter formulário em branco', () => {
    const onSubmit = vi.fn();
    render(<NewInvoiceModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} />);

    const submitBtn = screen.getByRole('button', { name: 'Cadastrar Honorário' });
    fireEvent.click(submitBtn);

    expect(screen.getByText('A descrição da fatura é obrigatória.')).toBeInTheDocument();
    expect(screen.getByText('O valor da fatura deve ser maior que zero.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('deve submeter o novo honorário com sucesso no formato do model Fatura da API', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<NewInvoiceModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/descrição \*/i), {
      target: { value: 'Honorários advocatícios iniciais' },
    });
    fireEvent.change(screen.getByLabelText(/valor \(r\$\)/i), {
      target: { value: '1500' },
    });
    fireEvent.change(screen.getByLabelText(/data de vencimento/i), {
      target: { value: '2026-11-10' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar Honorário' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          descricao: 'Honorários advocatícios iniciais',
          valor: 1500,
          tipo: 'CONTRATUAL',
          status: 'PENDENTE',
          data_vencimento: '2026-11-10',
          cliente: null,
          processo: null,
          data_pagamento: null,
        })
      );
      expect(onClose).toHaveBeenCalled();
    });
  });
});

describe('InvoiceDetailsModal Component', () => {
  const paidSample = initialInvoices[0];
  const pendingSample = initialInvoices[2];

  it('deve renderizar as informações principais do honorário no modal de detalhes', () => {
    render(
      <InvoiceDetailsModal
        isOpen={true}
        invoice={paidSample}
        onClose={vi.fn()}
        onToggleStatus={vi.fn()}
      />
    );

    expect(screen.getByText('#11111111')).toBeInTheDocument();
    expect(screen.getByText(paidSample.descricao)).toBeInTheDocument();
    expect(screen.getByText(paidSample.clienteNome!)).toBeInTheDocument();
  });

  it('deve permitir registrar pagamento para fatura pendente/vencida', () => {
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

    fireEvent.click(screen.getByText('Registrar Pagamento'));

    expect(onRegisterPayment).toHaveBeenCalledWith(
      pendingSample.id,
      expect.objectContaining({
        data_pagamento: expect.any(String),
      })
    );
  });
});

describe('FinancialContainer (Integração CRUD Completa com diafanis-api)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.listarClientes).mockResolvedValue([
      {
        id: 'aaaa1111-1111-4111-8111-111111111101',
        nome: 'Agropecuária Vale do São Francisco Ltda',
        cpf: '12345678901',
        telefone_whatsapp: '87999998888',
        data_nascimento: '1985-05-10',
      },
    ]);
    vi.mocked(api.listarFaturas).mockResolvedValue(initialInvoices);
  });

  it('deve carregar faturas da API ao montar e exibir na tabela', async () => {
    render(<FinancialContainer />);

    expect(screen.getByRole('heading', { level: 1, name: 'Gestão Financeira' })).toBeInTheDocument();

    await waitFor(() => {
      expect(api.listarFaturas).toHaveBeenCalled();
      expect(screen.getByText('#13131313')).toBeInTheDocument();
    });
  });

  it('deve criar uma nova fatura via POST na API e atualizar a listagem', async () => {
    const createdInvoice = {
      id: '99990000-1111-4111-8111-111111111199',
      cliente: null,
      processo: null,
      descricao: 'Honorários de consultoria tributária',
      valor: 15000,
      tipo: 'CONTRATUAL',
      status: 'PENDENTE' as const,
      data_vencimento: '2026-11-30',
      data_pagamento: null,
    };
    vi.mocked(api.criarFatura).mockResolvedValue(createdInvoice);

    render(<FinancialContainer />);

    await waitFor(() => {
      expect(screen.getByText('#13131313')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Novo Honorário'));

    fireEvent.change(screen.getByLabelText(/descrição \*/i), {
      target: { value: 'Honorários de consultoria tributária' },
    });
    fireEvent.change(screen.getByLabelText(/valor \(r\$\)/i), {
      target: { value: '15000' },
    });
    fireEvent.change(screen.getByLabelText(/data de vencimento/i), {
      target: { value: '2026-11-30' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar Honorário' }));

    await waitFor(() => {
      expect(api.criarFatura).toHaveBeenCalled();
      expect(screen.getByText('Honorários de consultoria tributária')).toBeInTheDocument();
    });
  });

  it('deve atualizar status em massa via PATCH na API ao marcar selecionadas como pagas', async () => {
    vi.mocked(api.atualizarFatura).mockImplementation(async (id) => {
      const found = initialInvoices.find((i) => i.id === id)!;
      return { ...found, status: 'PAGO', data_pagamento: '2026-10-20' };
    });

    render(<FinancialContainer />);

    await waitFor(() => {
      expect(screen.getByText('#13131313')).toBeInTheDocument();
    });

    const selectAllCheckbox = screen.getByLabelText('Selecionar todas as cobranças');
    fireEvent.click(selectAllCheckbox);

    expect(screen.getByText('Marcar selecionadas como pagas')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Marcar selecionadas como pagas'));

    await waitFor(() => {
      expect(api.atualizarFatura).toHaveBeenCalled();
      expect(screen.queryByText(/cobranças selecionadas/i)).not.toBeInTheDocument();
    });
  });
});
