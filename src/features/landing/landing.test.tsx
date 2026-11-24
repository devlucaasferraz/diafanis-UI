import { cleanup, render, screen, within } from '@testing-library/react';
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

describe('Demonstrações da landing', () => {
  it('registra e desfaz um pagamento apenas na prévia, atualizando os dois totais', async () => {
    const user = userEvent.setup();
    render(<FeaturePreviews paused />);
    expect(screen.getByText('R$ 7.200')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Registrar pagamento' }));
    expect(screen.getByText('R$ 4.800')).toBeInTheDocument();
    expect(screen.getByText('R$ 14.900')).toBeInTheDocument();
    expect(screen.getByText('Pago')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Desfazer exemplo' }));
    expect(screen.getByText('R$ 7.200')).toBeInTheDocument();
    expect(screen.getByText('R$ 12.500')).toBeInTheDocument();
  });
  it('mostra os detalhes do compromisso selecionado e permite fechá-los', async () => {
    const user = userEvent.setup();
    render(<FeaturePreviews paused />);
    await user.click(screen.getByRole('button', { name: /10:00 Audiência de conciliação/ }));
    expect(screen.getByText(/Responsável: Ana Costa/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fechar compromisso' }));
    expect(screen.getByText('Selecione um compromisso para ver os detalhes.')).toBeInTheDocument();
  });
  it('troca o texto de mensagem conforme o modelo, sem disparar mensagens', async () => {
    const user = userEvent.setup();
    render(<FeaturePreviews paused />);
    await user.click(screen.getByRole('button', { name: 'Documentos pendentes' }));
    expect(screen.getByText(/precisamos do comprovante de residência atualizado/)).toBeInTheDocument();
    expect(screen.queryByText(/Sua audiência está marcada/)).not.toBeInTheDocument();
    expect(screen.getByText('Prévia de texto. Nenhuma mensagem é enviada.')).toBeInTheDocument();
  });
});

describe('Contato demonstrativo', () => {
  it('valida os campos antes de preparar o rascunho', async () => {
    const user = userEvent.setup();
    render(<LandingContact />);
    await user.click(screen.getByRole('button', { name: 'Visualizar mensagem' }));
    expect(screen.queryByRole('region', { name: 'Prévia da mensagem' })).not.toBeInTheDocument();
  });
  it('gera uma prévia local e copia o texto sem simular envio', async () => {
    const user = userEvent.setup();
    render(<LandingContact />);
    await user.type(screen.getByLabelText('Seu nome'), 'Ana Costa');
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.type(screen.getByLabelText('Sua mensagem'), 'Quero conhecer o sistema para meu escritório.');
    await user.click(screen.getByRole('button', { name: 'Visualizar mensagem' }));
    const region = screen.getByRole('region', { name: 'Prévia da mensagem' });
    expect(within(region).getByText('Ana Costa')).toBeInTheDocument();
    expect(within(region).getByText('Rascunho local, sem envio.')).toBeInTheDocument();
    await user.click(within(region).getByRole('button', { name: 'Copiar texto' }));
    expect(await navigator.clipboard.readText()).toContain('Quero conhecer o sistema para meu escritório.');
    await user.click(within(region).getByRole('button', { name: 'Fechar prévia da mensagem' }));
    expect(screen.queryByRole('region', { name: 'Prévia da mensagem' })).not.toBeInTheDocument();
  });
});
