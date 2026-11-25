import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { PinInput } from './PinInput';

afterEach(cleanup);
it('aceita colar o código completo e permite corrigir com o teclado', async () => {
  const user = userEvent.setup();
  const { container } = render(<form><PinInput /></form>);
  await user.click(screen.getByLabelText('Dígito 1 de 6'));
  await user.paste('123456');
  expect(new FormData(container.querySelector('form')!).get('pin')).toBe('123456');
  const last = screen.getByLabelText('Dígito 6 de 6') as HTMLInputElement;
  expect(last).toHaveFocus();
  expect(last.selectionStart).toBe(1);
  expect(last.selectionEnd).toBe(1);
  await user.keyboard('{Backspace}{Backspace}');
  expect(screen.getByLabelText('Dígito 5 de 6')).toHaveFocus();
  expect(screen.getByLabelText('Dígito 5 de 6')).toHaveValue('');
  await user.type(screen.getByLabelText('Dígito 5 de 6'), '56');
  expect(new FormData(container.querySelector('form')!).get('pin')).toBe('123456');
  await user.keyboard('{ArrowLeft}');
  expect(screen.getByLabelText('Dígito 5 de 6')).toHaveFocus();
});

it('substitui o último dígito sem selecionar seu conteúdo', async () => {
  const user = userEvent.setup();
  render(<PinInput />);
  await user.type(screen.getByLabelText('Dígito 1 de 6'), '123456');
  const last = screen.getByLabelText('Dígito 6 de 6') as HTMLInputElement;
  expect(last.selectionStart).toBe(last.selectionEnd);
  await user.keyboard('9');
  expect(last).toHaveValue('9');
  expect(last.selectionStart).toBe(1);
  expect(last.selectionEnd).toBe(1);
});
