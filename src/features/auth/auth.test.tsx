import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { router } from '@/app/App';

vi.mock('./AuthLayout', () => ({ AuthLayout: ({ children }: { children: ReactNode }) => <main>{children}</main> }));
beforeEach(() => { vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
async function open(path: string, emailStep = true) {
  const testRouter = createRouter({ routeTree: router.routeTree, history: createMemoryHistory({ initialEntries: [path] }) });
  render(<RouterProvider router={testRouter} />);
  await screen.findByRole('heading', { level: 1 });
  const user = userEvent.setup();
  if (emailStep && (path === '/login' || path === '/cadastro')) await user.click(screen.getByRole('button', { name: 'Continuar com e-mail' }));
  return user;
}

describe('Fluxos de acesso demonstrativos', () => {
  it('começa pela escolha de acesso e permite voltar sem manter a senha', async () => {
    const user = await open('/login', false);
    expect(screen.queryByLabelText('E-mail')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continuar com e-mail' }));
    await user.type(screen.getByLabelText('Senha', { exact: true }), 'Senha123');
    await user.click(screen.getByRole('button', { name: 'Outras formas de acesso' }));
    expect(screen.queryByLabelText('Senha', { exact: true })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continuar com e-mail' }));
    expect(screen.getByLabelText('Senha', { exact: true })).toHaveValue('');
  });
  it('valida o login e só abre o dashboard após preencher os campos', async () => {
    const user = await open('/login');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toHaveFocus();
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.type(screen.getByLabelText('Senha', { exact: true }), 'Senha123');
    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(screen.getByLabelText('Senha', { exact: true })).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('heading', { name: 'Visão geral' })).toBeInTheDocument();
  });
  it('confere as senhas do cadastro e limpa os campos após o sucesso', async () => {
    const user = await open('/cadastro');
    const store = vi.spyOn(Storage.prototype, 'setItem');
    await user.type(screen.getByLabelText('Seu nome'), 'Ana Costa');
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.type(screen.getByLabelText('Senha', { exact: true }), 'Senha123');
    await user.type(screen.getByLabelText('Confirmar senha'), 'Outra123');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(screen.getByText('As senhas precisam ser iguais.')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Confirmar senha'));
    await user.type(screen.getByLabelText('Confirmar senha'), 'Senha123');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(screen.getByRole('heading', { name: 'Tudo pronto.' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Senha', { exact: true })).not.toBeInTheDocument();
    expect(store).not.toHaveBeenCalled();
    await user.click(screen.getByRole('link', { name: 'Ir para o login' }));
    expect(await screen.findByRole('heading', { name: 'Boas-vindas ao Diafanís.' })).toBeInTheDocument();
  });
  it('percorre recuperação e redefinição sem afirmar que enviou e-mail', async () => {
    const user = await open('/login');
    await user.click(screen.getByRole('link', { name: 'Esqueci minha senha' }));
    await screen.findByRole('heading', { name: 'Esqueceu sua senha?' });
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: 'Recuperar acesso' }));
    expect(screen.getByText('Nenhum e-mail foi enviado nesta prévia.')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Testar redefinição de senha' }));
    await screen.findByRole('heading', { name: 'Uma nova senha.' });
    await user.type(screen.getByLabelText('Nova senha'), 'curta');
    await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }));
    expect(screen.getByText('Use pelo menos 8 caracteres.')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Nova senha'));
    await user.type(screen.getByLabelText('Nova senha'), 'NovaSenha123');
    await user.type(screen.getByLabelText('Confirmar senha'), 'NovaSenha123');
    await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }));
    expect(screen.getByRole('heading', { name: 'Senha atualizada na prévia.' })).toBeInTheDocument();
  });
  it.each(['Google', 'Apple', 'Microsoft'])('apresenta a opção %s sem simular conexão real', async provider => {
    const user = await open('/login', false);
    await user.click(screen.getByRole('button', { name: `Continuar com ${provider}` }));
    expect(screen.getByRole('heading', { name: `Continuar com ${provider}.` })).toBeInTheDocument();
    expect(screen.getByText(/estará disponível com a integração de acesso/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Voltar ao formulário' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continuar com e-mail' })).toBeInTheDocument());
  });
});
