import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { TriageContainer } from './TriageContainer';
import {
  initialTriageCases,
  computeMetrics,
  formatPhoneBR,
  summarizeCnj,
  buildWhatsAppUrl,
  deriveTriageStatusFromDocuments,
} from './mock-data';

describe('Triage Utilities & Calculations', () => {
  it('deve calcular corretamente as métricas dos 3 cards de topo e abas', () => {
    const metrics = computeMetrics(initialTriageCases);
    expect(metrics.totalActive).toBe(6);
    expect(metrics.inCollectionCount).toBe(2);
    expect(metrics.readyForAnalysisCount).toBe(2);
    expect(metrics.manualInterventionCount).toBe(2);
    expect(metrics.leadsCount).toBe(2);
    expect(metrics.ongoingCount).toBe(4);
  });

  it('deve formatar telefones, resumir número CNJ e gerar URL do WhatsApp', () => {
    expect(formatPhoneBR('5551998234112')).toBe('(51) 99823-4112');
    expect(summarizeCnj('5012849-73.2026.4.04.7100')).toBe('5012849-73.2026...');
    expect(buildWhatsAppUrl('5551998234112', 'Olá Maria')).toContain(
      'https://wa.me/5551998234112?text='
    );
  });

  it('deve derivar o status da triagem a partir dos documentos e estado do bot', () => {
    const readyCase = initialTriageCases[2]; // Cláudia (all approved)
    expect(deriveTriageStatusFromDocuments(readyCase)).toBe('Pronto para Análise');

    const manualCase = initialTriageCases[0]; // Maria (has rejected doc & difficulty alert)
    expect(deriveTriageStatusFromDocuments(manualCase)).toBe('Intervenção Manual');
  });
});

describe('Central de Documentos & Triagem — Interface Completa', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  it('deve renderizar o cabeçalho, os 3 cards de indicadores e as 5 abas de filtro', () => {
    render(<TriageContainer />);

    expect(
      screen.getByRole('heading', { name: /Central de Documentos & Triagem/i })
    ).toBeInTheDocument();

    // 3 Metric Cards
    expect(screen.getByText('Em Coleta (Bot WhatsApp)')).toBeInTheDocument();
    expect(screen.getByTestId('metric-in-collection')).toHaveTextContent('2');

    expect(screen.getByText('Prontos para Análise')).toBeInTheDocument();
    expect(screen.getByTestId('metric-ready-analysis')).toHaveTextContent('2');

    expect(screen.getByText('Intervenção Manual Necessária')).toBeInTheDocument();
    expect(screen.getByTestId('metric-manual-intervention')).toHaveTextContent('2');

    // 5 Filter Tabs
    expect(screen.getByRole('tab', { name: /Todos/i })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /Prontos p\/ Análise/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /Intervenção Manual/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /Pré-processuais \(Leads\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /Em Andamento \(Processos\)/i })
    ).toBeInTheDocument();
  });

  it('deve filtrar os atendimentos pelas abas e pelo campo de busca rápida (nome, CPF ou CNJ)', () => {
    render(<TriageContainer />);

    // Filtrar por Pré-processuais (Leads) -> Maria de Lourdes e João Batista
    fireEvent.click(
      screen.getByRole('tab', { name: /Pré-processuais \(Leads\)/i })
    );
    expect(screen.getByText('Maria de Lourdes Conceição')).toBeInTheDocument();
    expect(screen.getByText('João Batista Oliveira Filho')).toBeInTheDocument();
    expect(
      screen.queryByText('Sebastião Ferreira dos Santos')
    ).not.toBeInTheDocument();

    // Voltar para Todos e buscar por número CNJ
    fireEvent.click(screen.getByRole('tab', { name: /Todos/i }));
    const searchInput = screen.getByPlaceholderText(
      /Buscar por cliente, CPF ou nº do processo/i
    );
    fireEvent.change(searchInput, { target: { value: '5012849-73' } });

    expect(screen.getByText('Sebastião Ferreira dos Santos')).toBeInTheDocument();
    expect(
      screen.queryByText('Maria de Lourdes Conceição')
    ).not.toBeInTheDocument();
  });

  it('deve abrir o Drawer lateral em Split-View ao clicar em uma linha, permitindo aprovar documento e realizar upload manual', () => {
    render(<TriageContainer />);

    // Clicar no caso de Sebastião Ferreira
    fireEvent.click(screen.getByText('Sebastião Ferreira dos Santos'));

    // Verifica que o Drawer abriu com o resumo do bot e o visualizador integrado
    expect(
      screen.getByText(/Resumo da Conversa com o Bot/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Conferência Digital Diafanís/i)
    ).toBeInTheDocument();

    // Aprovar o documento 'Extrato CNIS Completo'
    const approveBtn = screen.getByRole('button', {
      name: /Aprovar Extrato CNIS Completo/i,
    });
    fireEvent.click(approveBtn);

    expect(
      screen.getByText(/Documento aprovado e validado no checklist/i)
    ).toBeInTheDocument();
  });

  it('deve abrir o modal de reprovação com campo de texto livre ao clicar em "Solicitar Reenvio / Recusar"', () => {
    render(<TriageContainer />);

    // Abrir o Drawer da Maria de Lourdes
    fireEvent.click(screen.getByText('Maria de Lourdes Conceição'));

    const rejectBtn = screen.getByRole('button', {
      name: /Solicitar Reenvio \/ Recusar RG \/ CPF/i,
    });
    fireEvent.click(rejectBtn);

    // Verifica que o modal abriu com o campo de texto livre
    const textarea = screen.getByLabelText(
      /Mensagem personalizada para o cliente/i
    );
    expect(textarea).toBeInTheDocument();

    fireEvent.change(textarea, {
      target: {
        value: 'Dona Maria, por favor envie uma foto também do verso do RG.',
      },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /Confirmar Recusa & Solicitar Reenvio/i,
      })
    );

    expect(
      screen.getAllByText(
        /Dona Maria, por favor envie uma foto também do verso do RG\./i
      ).length
    ).toBeGreaterThanOrEqual(1);
  });

  it('deve permitir vincular um atendimento pré-processual a um processo existente no Drawer', () => {
    render(<TriageContainer />);

    fireEvent.click(screen.getByText('Maria de Lourdes Conceição'));

    const linkBtn = screen.getByRole('button', {
      name: /\[\+ Vincular a Processo Existente\]/i,
    });
    fireEvent.click(linkBtn);

    expect(
      screen.getByRole('heading', { name: /Vincular a Processo Existente/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Vincular Processo$/i }));

    expect(
      screen.getByText(/Atendimento vinculado com sucesso ao processo/i)
    ).toBeInTheDocument();
  });

  it('deve pausar o bot e abrir o WhatsApp ao clicar em "Assumir no WhatsApp"', () => {
    render(<TriageContainer />);

    const takeoverButtons = screen.getAllByRole('button', {
      name: /Assumir no WhatsApp/i,
    });
    fireEvent.click(takeoverButtons[0]);

    expect(window.open).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(/Atendimento humano ativado no WhatsApp/i)
    ).toBeInTheDocument();
  });

  it('deve exibir alerta de confirmação ao tentar concluir triagem com documentos pendentes ou reprovados', () => {
    render(<TriageContainer />);

    // Maria de Lourdes possui documentos pendentes/reprovados
    fireEvent.click(screen.getByText('Maria de Lourdes Conceição'));

    fireEvent.click(
      screen.getByRole('button', { name: /Concluir Triagem & Arquivar/i })
    );

    // Deve abrir o modal de alerta
    expect(
      screen.getByText(/Existem documentos pendentes ou reprovados/i)
    ).toBeInTheDocument();

    // Confirmar forçando a conclusão
    fireEvent.click(
      screen.getByRole('button', { name: /Forçar Conclusão e Arquivar/i })
    );

    expect(
      screen.getByText(/concluída e arquivada com sucesso/i)
    ).toBeInTheDocument();
  });

  it('deve criar uma nova sessão de coleta com pacote jurídico editável no modal "+ Nova Sessão de Coleta"', () => {
    render(<TriageContainer />);

    fireEvent.click(
      screen.getByRole('button', { name: /\+ Nova Sessão de Coleta/i })
    );

    expect(
      screen.getByRole('heading', {
        name: /Nova Sessão de Coleta \(Triagem WhatsApp\)/i,
      })
    ).toBeInTheDocument();

    // Trocar pacote jurídico para BPC / LOAS
    const packageSelect = screen.getByLabelText(/3\. Seleção do Pacote Jurídico/i);
    fireEvent.change(packageSelect, { target: { value: 'bpc_loas' } });

    expect(screen.getByText('Folha Resumo CadÚnico')).toBeInTheDocument();

    // Adicionar um documento customizado ao checklist
    const extraDocInput = screen.getByLabelText(
      /Adicionar documento extra ao pacote/i
    );
    fireEvent.change(extraDocInput, {
      target: { value: 'Procuração Ad Judicia Assinada' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar Item/i }));

    expect(
      screen.getByText('Procuração Ad Judicia Assinada')
    ).toBeInTheDocument();

    // Submeter criação da sessão
    fireEvent.click(
      screen.getByRole('button', { name: /Iniciar Sessão de Coleta/i })
    );

    // Verifica que Helena Vargas Silveira foi adicionada à tabela
    const table = screen.getByRole('table');
    expect(
      within(table).getByText('Helena Vargas Silveira')
    ).toBeInTheDocument();
  });
});
