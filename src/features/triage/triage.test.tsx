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
    expect(metrics.totalActive).toBe(21);
    expect(metrics.inCollectionCount).toBe(7);
    expect(metrics.readyForAnalysisCount).toBe(7);
    expect(metrics.manualInterventionCount).toBe(7);
    expect(metrics.leadsCount).toBe(9);
    expect(metrics.ongoingCount).toBe(12);
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

  it('deve renderizar o cabeçalho, os 3 cards indicadores e a barra em 2 níveis (4 abas + botão nova sessão)', () => {
    render(<TriageContainer />);

    expect(
      screen.getByRole('heading', { name: /Central de Documentos & Triagem/i })
    ).toBeInTheDocument();

    // 3 Metric Cards (enxutos e sem poluição de texto)
    expect(screen.getByText('Em Coleta (Bot WhatsApp)')).toBeInTheDocument();
    expect(screen.getByTestId('metric-in-collection')).toHaveTextContent('7');

    expect(screen.getByText('Prontos para Análise')).toBeInTheDocument();
    expect(screen.getByTestId('metric-ready-analysis')).toHaveTextContent('7');

    expect(screen.getByText('Intervenção Manual Necessária')).toBeInTheDocument();
    expect(screen.getByTestId('metric-manual-intervention')).toHaveTextContent('7');

    // Nível 1: 4 Status Tabs
    expect(screen.getByRole('tab', { name: /Todos/i })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /Em Coleta \(Bot\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /Prontos p\/ Análise/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /Intervenção Manual/i })
    ).toBeInTheDocument();

    // Botão Nova Sessão no nível 1 da barra
    expect(
      screen.getByRole('button', { name: /Nova Sessão de Coleta/i })
    ).toBeInTheDocument();

    // Nível 2: Seletor de Fase Processual
    expect(
      screen.getByLabelText(/Filtrar por fase processual/i)
    ).toBeInTheDocument();
  });

  it('deve paginar os atendimentos e permitir navegar entre as páginas', () => {
    render(<TriageContainer />);

    // Na página 1 de 5 (pageSize=5, total=21)
    expect(screen.getByText(/Página/i)).toBeInTheDocument();
    expect(screen.getByText(/mostrando 1–5 de 21 atendimentos/i)).toBeInTheDocument();

    // Os 5 primeiros casos devem estar visíveis
    expect(screen.getByText('Maria de Lourdes Conceição')).toBeInTheDocument();
    expect(screen.getByText('Terezinha Soares da Silva')).toBeInTheDocument();

    // O 6º caso (Marcos Vinícius Peixoto) não deve estar na página 1
    expect(screen.queryByText('Marcos Vinícius Peixoto')).not.toBeInTheDocument();

    // Clicar no botão 'Próximo' ou página '2'
    const nextBtn = screen.getByRole('button', { name: /Próximo/i });
    fireEvent.click(nextBtn);

    // Agora o 6º caso deve estar visível na página 2
    expect(screen.getByText('Marcos Vinícius Peixoto')).toBeInTheDocument();
    expect(screen.getByText(/mostrando 6–10 de 21 atendimentos/i)).toBeInTheDocument();
    expect(screen.queryByText('Maria de Lourdes Conceição')).not.toBeInTheDocument();
  });

  it('deve filtrar pela nova aba "Em Coleta (Bot)" e pelo seletor de fase processual (Leads)', () => {
    render(<TriageContainer />);

    // Clicar na nova aba 'Em Coleta (Bot)'
    fireEvent.click(
      screen.getByRole('tab', { name: /Em Coleta \(Bot\)/i })
    );

    // Devem aparecer apenas João Batista e Marcos Vinícius (casos em coleta pelo bot)
    expect(screen.getByText('João Batista Oliveira Filho')).toBeInTheDocument();
    expect(screen.getByText('Marcos Vinícius Peixoto')).toBeInTheDocument();
    expect(
      screen.queryByText('Maria de Lourdes Conceição')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Sebastião Ferreira dos Santos')
    ).not.toBeInTheDocument();

    // Voltar para Todos e filtrar por Pré-processuais (Leads) no dropdown
    fireEvent.click(screen.getByRole('tab', { name: /Todos/i }));
    const phaseSelect = screen.getByLabelText(/Filtrar por fase processual/i);
    fireEvent.change(phaseSelect, { target: { value: 'leads' } });

    expect(screen.getByText('Maria de Lourdes Conceição')).toBeInTheDocument();
    expect(screen.getByText('João Batista Oliveira Filho')).toBeInTheDocument();
    expect(
      screen.queryByText('Sebastião Ferreira dos Santos')
    ).not.toBeInTheDocument();
  });

  it('deve abrir o Drawer lateral ao clicar diretamente na linha e exibir o upload manual estruturado verticalmente', () => {
    render(<TriageContainer />);

    // Clicar na linha de Sebastião Ferreira
    fireEvent.click(screen.getByText('Sebastião Ferreira dos Santos'));

    // Verifica que o Drawer abriu com o resumo do bot e o visualizador integrado
    expect(
      screen.getByText(/Resumo da Conversa com o Bot/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Conferência Digital Diafanís/i)
    ).toBeInTheDocument();

    // Verifica que a seção de Upload Manual possui o seletor rotulado e o botão
    expect(
      screen.getByText(/Documento a regularizar \/ anexar:/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Anexar arquivo manualmente/i })
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

  it('deve renderizar o menu de mais opções (3 pontinhos) e atalho do WhatsApp em cada linha da tabela', () => {
    render(<TriageContainer />);

    const menuButtons = screen.getAllByRole('button', {
      name: /Mais opções do atendimento/i,
    });
    expect(menuButtons.length).toBeGreaterThanOrEqual(1);
    expect(menuButtons[0]).toHaveAttribute('aria-haspopup', 'menu');

    const whatsappButtons = screen.getAllByRole('button', {
      name: /Assumir no WhatsApp/i,
    });
    expect(whatsappButtons.length).toBeGreaterThanOrEqual(1);
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

  it('deve pausar o bot e abrir o WhatsApp ao clicar no atalho do WhatsApp', () => {
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
      screen.getByRole('button', { name: /Nova Sessão de Coleta/i })
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

  it('deve exibir as colunas limpas (sem CPF/protocolo, vínculo em texto) e abrir o balão do checklist ao clicar no badge', () => {
    render(<TriageContainer />);

    const table = screen.getByRole('table');
    expect(within(table).getByText('Maria de Lourdes Conceição')).toBeInTheDocument();
    expect(within(table).queryByText('(TRI-2026-001)')).not.toBeInTheDocument();

    // Coluna Vínculo: Exibe 'Pré-processual' em texto limpo para casos sem processo
    expect(within(table).getAllByText('Pré-processual').length).toBeGreaterThanOrEqual(1);

    // Coluna Motivo: Exibe 'BPC/LOAS' em texto limpo sem a escrita 'Relatou dificuldade'
    expect(within(table).getByText('BPC/LOAS')).toBeInTheDocument();
    expect(within(table).queryByText(/Relatou dificuldade/i)).not.toBeInTheDocument();

    // Coluna Checklist: Botão com contador compacto
    const checklistBtns = screen.getAllByRole('button', {
      name: /Checklist: 2 de 4 documentos aprovados/i,
    });
    expect(checklistBtns.length).toBeGreaterThanOrEqual(1);
    const checklistBtn = checklistBtns[0];
    expect(checklistBtn).toHaveTextContent('2/4 aprovados');
    expect(checklistBtn).toHaveAttribute('aria-haspopup', 'menu');

    // Clicar ou acionar Enter no botão abre o balão popover
    fireEvent.pointerDown(checklistBtn);
    fireEvent.keyDown(checklistBtn, { key: 'Enter' });
    expect(screen.getAllByText('Checklist de Documentos').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Laudo Médico / CadÚnico')).toBeInTheDocument();
  });
});
