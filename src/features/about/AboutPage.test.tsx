import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AboutPage } from './AboutPage';
import { team } from './team';

vi.mock('./reactbits/SideRays', () => ({
  default: () => <div data-testid="about-side-rays" />,
}));

afterEach(cleanup);

describe('Página sobre nós', () => {
  it('renderiza a hero com SideRays sem vídeo repetido e exibe a lista de valores', () => {
    const { container } = render(<AboutPage />);
    expect(screen.getByRole('heading', { level: 1, name: /feito para a rotina/i })).toBeInTheDocument();
    expect(screen.getByTestId('about-side-rays')).toBeInTheDocument();
    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Conheça a equipe' })).toHaveAttribute('href', '#equipe');

    const sectionIds = Array.from(container.querySelectorAll('main > section')).map(section => section.id);
    expect(sectionIds).toEqual(['inicio', 'pilares', 'valores', 'equipe', 'contato']);

    const pillarsList = screen.getByRole('list', { name: 'Pilares do Diafanís' });
    const pillarItems = within(pillarsList).getAllByRole('listitem');
    expect(pillarItems).toHaveLength(3);
    expect(pillarItems.map(item => within(item).getByRole('heading', { level: 3 }).textContent)).toEqual([
      'Direito',
      'Interações humanas',
      'Engenharia de Software',
    ]);
    expect(screen.queryByText(/Ordem /i)).not.toBeInTheDocument();

    const valuesSection = container.querySelector('#valores') as HTMLElement;
    expect(valuesSection).toBeInTheDocument();
    const tabs = within(valuesSection).getAllByRole('tab');
    expect(tabs).toHaveLength(4);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(within(valuesSection).getByRole('tabpanel')).toHaveTextContent(/deixe a complexidade com a gente/i);

    fireEvent.click(within(valuesSection).getByRole('tab', { name: 'Critério' }));
    expect(within(valuesSection).getByRole('tabpanel')).toHaveTextContent(/o operacional fica com o sistema/i);
  });

  it('apresenta os cinco integrantes com cargos, formações, lorem ipsum provisório e seleção interativa', () => {
    render(<AboutPage />);
    expect(team).toHaveLength(5);
    for (const member of team) {
      expect(screen.getByRole('heading', { name: member.name })).toBeInTheDocument();
    }
    expect(screen.getAllByText(/Lorem ipsum/i)).toHaveLength(5);
    expect(screen.getByText('Product Owner')).toBeInTheDocument();
    expect(screen.getByText('Advocacia')).toBeInTheDocument();
    expect(screen.queryByAltText(/^Retrato de /)).not.toBeInTheDocument();

    const firstHeading = screen.getByRole('heading', { name: team[0].name });
    const firstCard = firstHeading.closest('article') as HTMLElement;
    fireEvent.click(firstCard);
    expect(firstCard).toHaveClass('is-selected');
    fireEvent.click(firstCard);
    expect(firstCard).not.toHaveClass('is-selected');
  });

  it('mantém a navegação mobile, estado ativo no header e rodapé compartilhados com a landing', () => {
    render(<AboutPage />);
    const desktopNav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(desktopNav).getByRole('link', { name: 'Sobre nós' })).toHaveAttribute('aria-current', 'page');

    const toggle = screen.getByLabelText('Abrir menu');
    fireEvent.click(toggle);
    expect(screen.getByRole('navigation', { name: 'Menu' })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('navigation', { name: 'Menu' })).not.toBeInTheDocument();
    expect(toggle).toHaveFocus();

    expect(screen.getByRole('link', { name: 'Dúvidas frequentes' })).toHaveAttribute('href', '/duvidas-frequentes');
    expect(screen.getByRole('link', { name: 'Preços' })).toHaveAttribute('href', '/precos');
  });

  it('oferece fechamento voltado à conversa com a equipe e restaura o título ao sair', () => {
    const previous = document.title;
    const { unmount } = render(<AboutPage />);
    expect(document.title).toBe('Sobre nós — Diafanís');
    expect(screen.getByRole('link', { name: 'Conversar com a equipe' })).toHaveAttribute('href', '/#contato');
    expect(screen.getByRole('link', { name: 'diafanis.contato@outlook.com' })).toHaveAttribute(
      'href',
      'mailto:diafanis.contato@outlook.com',
    );
    unmount();
    expect(document.title).toBe(previous);
  });
});
