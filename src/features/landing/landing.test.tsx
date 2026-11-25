import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { FeaturePreviews } from './FeaturePreviews';
import { LandingContact } from './LandingContact';

vi.mock('./OfficeFilm', () => ({ OfficeFilm: () => null }));
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
vi.mock('framer-motion', () => ({
  motion: { div: ({ children, className }: { children: ReactNode; className?: string }) => <div className={className}>{children}</div> },
  useReducedMotion: () => true,
  useScroll: () => ({ scrollYProgress: 0 }),
  useSpring: (value: number) => value,
  useTransform: () => 0,
}));
afterEach(cleanup);

describe('Playground de soluções', () => {
  let visibility: (entries: { isIntersecting: boolean }[]) => void;
  function observe() {
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: typeof visibility) { visibility = callback; }
      observe() { visibility([{ isIntersecting: true }]); }
      disconnect() {}
    });
  }
  function advance(steps: number) {
    for (let i = 0; i < steps; i++) {
      const initial = document.querySelector('.solution-demo')?.getAttribute('data-step');
      for (let phase = 0; phase < 4 && document.querySelector('.solution-demo')?.getAttribute('data-step') === initial; phase++) {
        act(() => vi.advanceTimersToNextTimer());
      }
    }
  }
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
  it('reinicia a cena ao trocar de solução e permite repeti-la pelo seletor', () => {
    observe(); vi.useFakeTimers();
    const { container } = render(<FeaturePreviews />);
    expect(screen.getByRole('heading', { name: 'Soluções' })).toBeInTheDocument();
    advance(3);
    expect(container.querySelector('.solution-demo')).toHaveAttribute('data-step', '3');
    fireEvent.click(screen.getByRole('button', { name: 'Financeiro' }));
    expect(container.querySelector('.solution-demo')).toHaveAttribute('data-step', '0');
    expect(screen.getByText('R$ 7.200')).toBeInTheDocument();
    advance(5);
    expect(screen.getByText('R$ 14.900')).toBeInTheDocument();
    expect(container.querySelector('.demo-drawer')).not.toHaveClass('open');
    fireEvent.click(screen.getByRole('button', { name: 'Financeiro' }));
    expect(screen.getByText('R$ 7.200')).toBeInTheDocument();
    expect(container.querySelector('.solution-demo')).toHaveAttribute('data-step', '0');
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });
  it('aproxima o cursor e mostra o clique antes de alterar a interface', () => {
    observe(); vi.useFakeTimers();
    const { container } = render(<FeaturePreviews />);
    act(() => vi.advanceTimersByTime(1600));
    expect(container.querySelector('.solution-demo')).toHaveAttribute('data-phase', 'moving');
    expect(container.querySelector('.demo-appointment.hearing')).not.toHaveClass('selected');
    act(() => vi.advanceTimersByTime(650));
    expect(container.querySelector('.solution-demo')).toHaveAttribute('data-phase', 'pressing');
    expect(container.querySelector('.demo-appointment.hearing')).not.toHaveClass('selected');
    act(() => vi.advanceTimersByTime(180));
    expect(container.querySelector('.demo-appointment.hearing')).toHaveClass('selected');
    expect(container.querySelector('.solution-demo')).toHaveAttribute('data-phase', 'reading');
  });
  it('preserva o tempo da etapa quando a demonstração sai da tela', () => {
    observe(); vi.useFakeTimers();
    const { container } = render(<FeaturePreviews />);
    act(() => vi.advanceTimersByTime(1000));
    act(() => visibility([{ isIntersecting: false }]));
    act(() => vi.advanceTimersByTime(12000));
    expect(container.querySelector('.solution-demo')).toHaveAttribute('data-step', '0');
    act(() => visibility([{ isIntersecting: true }]));
    act(() => vi.advanceTimersByTime(599));
    expect(container.querySelector('.solution-demo')).toHaveAttribute('data-phase', 'reading');
    act(() => vi.advanceTimersByTime(1));
    expect(container.querySelector('.solution-demo')).toHaveAttribute('data-phase', 'moving');
    act(() => vi.advanceTimersByTime(650));
    act(() => vi.advanceTimersByTime(180));
    expect(container.querySelector('.solution-demo')).toHaveAttribute('data-step', '1');
  });
  it('mantém a solução escolhida ao concluir as cinco demonstrações', () => {
    observe(); vi.useFakeTimers();
    const { container } = render(<FeaturePreviews />);
    for (const name of ['Calendário', 'Prazos', 'Financeiro', 'Documentos', 'Gestão de clientes']) {
      fireEvent.click(screen.getByRole('button', { name }));
      const lastStep = name === 'Gestão de clientes' ? 7 : name === 'Prazos' ? 9 : name === 'Documentos' ? 6 : 5;
      advance(lastStep);
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'true');
      expect(container.querySelector('.solution-demo')).toHaveAttribute('data-step', String(lastStep));
    }
    expect(screen.getByText('3 mensagens enviadas pelo bot')).toBeInTheDocument();
  });
  it('demonstra a suspensão local e o vencimento correspondente', () => {
    observe(); vi.useFakeTimers();
    const { container } = render(<FeaturePreviews />);
    fireEvent.click(screen.getByRole('button', { name: 'Prazos' }));
    advance(6);
    expect(screen.getByRole('combobox', { name: 'Calendário local' })).toHaveValue('petrolina');
    expect(screen.getByRole('option', { name: 'Juazeiro · BA' })).toBeInTheDocument();
    expect(screen.getByText('27 nov · Suspensão')).toBeInTheDocument();
    expect(screen.getByText('02 de dezembro')).toBeInTheDocument();
    expect(container.querySelector('.local-day')).not.toHaveClass('due');
    expect(container.querySelector('.demo-local-exception')).toHaveClass('open');
  });
  it('revela o vencimento automaticamente e permite criar um evento com horário e descrição livre', () => {
    observe(); vi.useFakeTimers();
    const { container } = render(<FeaturePreviews />);
    fireEvent.click(screen.getByRole('button', { name: 'Prazos' }));
    advance(6);
    expect(container.querySelector('.solution-demo')).toHaveAttribute('data-cue', '6');
    expect(container.querySelector('.story-cursor')).not.toHaveAttribute('data-gesture', 'click');
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar ao calendário' }));
    expect(screen.getByRole('dialog', { name: 'Novo evento' })).toBeInTheDocument();
    expect(screen.getByLabelText('Data')).toHaveValue('02/12/2026');
    expect(screen.getByLabelText('Data')).toHaveAttribute('readonly');
    fireEvent.change(screen.getByLabelText('Descrição (opcional)'), { target: { value: 'Projeto de consultoria' } });
    fireEvent.change(screen.getByLabelText('Início'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('Término'), { target: { value: '11:30' } });
    fireEvent.change(screen.getByLabelText('Nome do evento'), { target: { value: 'Protocolar defesa' } });
    act(() => vi.advanceTimersByTime(10000));
    expect(container.querySelector('.solution-demo')).toHaveAttribute('data-step', '6');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar evento' }));
    expect(screen.getByRole('status')).toHaveTextContent('Evento adicionado ao calendário');
    expect(screen.getByRole('status')).toHaveTextContent('Protocolar defesa');
    expect(screen.getByRole('status')).toHaveTextContent('Projeto de consultoria');
    expect(screen.getByRole('status')).toHaveTextContent('10:00 — 11:30');
  });
  it('permite escolher outra comarca durante a demonstração', () => {
    observe(); vi.useFakeTimers();
    const { container } = render(<FeaturePreviews />);
    fireEvent.click(screen.getByRole('button', { name: 'Prazos' }));
    advance(6);
    fireEvent.change(screen.getByRole('combobox', { name: 'Calendário local' }), { target: { value: 'sobradinho' } });
    const form = container.querySelector('.demo-regional-form');
    expect(form).toContainElement(screen.getByRole('combobox', { name: 'Calendário local' }));
    expect(screen.getAllByRole('option')).toHaveLength(10);
    expect(screen.queryByRole('option', { name: 'Recife · PE' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Salvador · BA' })).not.toBeInTheDocument();
    expect(screen.getByText('Calculadora de prazos')).toBeInTheDocument();
    expect(screen.getByText('Vencimento em Sobradinho')).toBeInTheDocument();
    expect(screen.getByText('Dia não contado em Sobradinho')).toBeInTheDocument();
    expect(screen.queryByText('Calendário local aplicado')).not.toBeInTheDocument();
  });
  it('segue a sequência de clientes, documentos, notificação e encaminhamento ao WhatsApp', () => {
    observe(); vi.useFakeTimers();
    const { container } = render(<FeaturePreviews />);
    fireEvent.click(screen.getByRole('button', { name: 'Documentos' }));
    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(container.querySelectorAll('.doc-client-row')).toHaveLength(3);
    expect(container.querySelector('.doc-client-row.selected')).not.toBeInTheDocument();
    expect(container.querySelector('.wa-app')).not.toBeInTheDocument();
    advance(1);
    expect(container.querySelector('.doc-client-row.selected')).toHaveAttribute('data-client', 'maria');
    expect(container.querySelector('.doc-active-client')).toHaveTextContent('Maria Oliveira');
    expect(screen.getAllByText('Aprovado na pré-triagem')).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: /^Visualizar / })).toHaveLength(3);
    expect(screen.getAllByRole('link', { name: /^Baixar / })).toHaveLength(3);
    advance(1);
    expect(screen.getByText('João Santos precisa de ajuda')).toBeInTheDocument();
    expect(container.querySelector('.doc-active-client')).toHaveTextContent('Maria Oliveira');
    expect(container.querySelector('.wa-app')).not.toBeInTheDocument();
    advance(1);
    expect(container.querySelector('.doc-client-row.selected')).toHaveAttribute('data-client', 'joao');
    expect(container.querySelector('.doc-active-client')).toHaveTextContent('João Santos');
    expect(screen.getByText('Histórico do atendimento')).toBeInTheDocument();
    expect(screen.getByText('Estou com dificuldade para enviar o documento. Alguém pode me ajudar?')).toBeInTheDocument();
    expect(screen.getByText('Consultando a equipe. Já vamos ajudar você.')).toBeInTheDocument();
    expect(screen.getByText('Assumir atendimento')).toBeInTheDocument();
    expect(container.querySelector('.wa-app')).not.toBeInTheDocument();
    advance(1);
    expect(screen.getByText('Dra. Ana Costa irá assumir o atendimento em instantes.')).toBeInTheDocument();
    expect(container.querySelector('.wa-app')).not.toBeInTheDocument();
    advance(1);
    expect(screen.getByText('Abrindo o WhatsApp')).toBeInTheDocument();
    expect(container.querySelector('.wa-app')).not.toBeInTheDocument();
    advance(1);
    expect(container.querySelector('.wa-app.connected')).toBeInTheDocument();
    expect(container.querySelector('.wa-composer')).toHaveTextContent('Sou a Dra. Ana Costa, do escritório Diafanís.');
    expect(container.querySelector('.doc-workspace')).not.toBeInTheDocument();
  });
  it('pausa o roteiro enquanto a prévia do documento está aberta e retoma ao fechar', () => {
    observe(); vi.useFakeTimers();
    const { container } = render(<FeaturePreviews />);
    fireEvent.click(screen.getByRole('button', { name: 'Documentos' }));
    advance(1);
    const download = screen.getByRole('link', { name: 'Baixar Documento de identidade' });
    expect(download.getAttribute('href')).toMatch(/^data:image\/svg\+xml/);
    expect(download).toHaveAttribute('download', 'identidade-exemplo.svg');
    fireEvent.click(screen.getByRole('button', { name: 'Visualizar Documento de identidade' }));
    expect(screen.getByRole('dialog', { name: 'Prévia de Documento de identidade' })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(20000));
    expect(container.querySelector('.solution-demo')).toHaveAttribute('data-step', '1');
    expect(screen.getByRole('button', { name: 'Fechar prévia do documento' })).toHaveFocus();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Visualizar Documento de identidade' })).toHaveFocus();
    advance(1);
    expect(screen.getByText('João Santos precisa de ajuda')).toBeInTheDocument();
  });
  it('mostra um modelo, permite personalizá-lo e envia o texto editado antes dos lembretes restantes', () => {
    observe(); vi.useFakeTimers();
    const { container } = render(<FeaturePreviews />);
    fireEvent.click(screen.getByRole('button', { name: 'Gestão de clientes' }));
    expect(screen.getByText('Lembrete de audiência · 10h')).toBeInTheDocument();
    expect(screen.getByText('Aniversário hoje')).toBeInTheDocument();
    advance(1);
    expect(container.querySelector('.demo-message-body')).toHaveClass('written');
    expect(container.querySelector('.demo-messages')).toHaveAttribute('data-step', '1');
    expect(screen.getByText('Personalizar mensagem')).toBeInTheDocument();
    expect(container.querySelector('.demo-message-body')).toHaveTextContent('Desejamos saúde e muitas conquistas');
    expect(screen.getByText('Enviar para João')).toBeInTheDocument();
    advance(2);
    expect(screen.getByText('Editando mensagem')).toBeInTheDocument();
    expect(screen.queryByText('Enviado')).not.toBeInTheDocument();
    advance(1);
    expect(container.querySelector('.demo-message-body')).toHaveTextContent('boas pedaladas');
    expect(screen.getByText('Um abraço, Dra. Ana Costa.')).toBeInTheDocument();
    expect(container.querySelector('.demo-message-body')).not.toHaveTextContent('Desejamos saúde e muitas conquistas');
    advance(1);
    expect(screen.getByText('Enviado')).toBeInTheDocument();
    expect(screen.getByText('Enviar 2 lembretes')).toBeInTheDocument();
    advance(2);
    expect(screen.getByText('3 mensagens enviadas pelo bot')).toBeInTheDocument();
  });
  it('mostra o resultado sem executar o roteiro com movimento reduzido', () => {
    observe(); vi.useFakeTimers();
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as MediaQueryList);
    const { container } = render(<FeaturePreviews />);
    expect(container.querySelector('.solution-demo')).toHaveAttribute('data-step', '5');
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Documentos' }));
    expect(container.querySelector('.solution-demo')).toHaveAttribute('data-step', '6');
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('Contato demonstrativo', () => {
  it('valida os campos antes de preparar o rascunho', async () => {
    const user = userEvent.setup();
    render(<LandingContact />);
    await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }));
    expect(screen.queryByRole('region', { name: 'Prévia da mensagem' })).not.toBeInTheDocument();
  });
  it('gera uma prévia local e copia o texto sem simular envio', async () => {
    const user = userEvent.setup();
    render(<LandingContact />);
    await user.type(screen.getByLabelText('Seu nome'), 'Ana Costa');
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.type(screen.getByLabelText('Sua mensagem'), 'Quero conhecer o sistema para meu escritório.');
    await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }));
    const region = screen.getByRole('region', { name: 'Prévia da mensagem' });
    expect(within(region).getByText('Ana Costa')).toBeInTheDocument();
    expect(within(region).getByText('Rascunho local, sem envio.')).toBeInTheDocument();
    await user.click(within(region).getByRole('button', { name: 'Copiar texto' }));
    expect(await navigator.clipboard.readText()).toContain('Quero conhecer o sistema para meu escritório.');
    await user.click(within(region).getByRole('button', { name: 'Fechar prévia da mensagem' }));
    expect(screen.queryByRole('region', { name: 'Prévia da mensagem' })).not.toBeInTheDocument();
  });
});
