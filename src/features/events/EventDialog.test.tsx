import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EventDialog, type EventDraft } from './EventDialog';

const initialValues: EventDraft = { title: 'Reunião de equipe', date: '2026-12-02', allDay: false, startTime: '14:00', endTime: '15:00', description: '' };
afterEach(cleanup);

describe('Cadastro genérico de evento', () => {
  it('permite escolher a data e salvar sem vínculo com cliente ou processo', () => {
    const onSave = vi.fn();
    render(<EventDialog open initialValues={initialValues} onSave={onSave} onOpenChange={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-12-10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar evento' }));
    expect(onSave).toHaveBeenCalledWith({ ...initialValues, date: '2026-12-10' });
  });
  it('exibe a data calculada em dia/mês/ano e salva a mesma data sem permitir edição', () => {
    const onSave = vi.fn();
    const calculated = { ...initialValues, date: '2030-03-04' };
    render(<EventDialog open dateLocked initialValues={calculated} onSave={onSave} onOpenChange={vi.fn()} />);
    expect(screen.getByLabelText('Data')).toHaveValue('04/03/2030');
    expect(screen.getByLabelText('Data')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Descrição (opcional)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar evento' }));
    expect(onSave).toHaveBeenCalledWith(calculated);
  });
  it('bloqueia intervalos inválidos e permite transformar o evento em dia inteiro', () => {
    const onSave = vi.fn();
    render(<EventDialog open initialValues={initialValues} onSave={onSave} onOpenChange={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Término'), { target: { value: '13:00' } });
    expect(screen.getByRole('alert')).toHaveTextContent('O término deve ser depois do início.');
    expect(screen.getByRole('button', { name: 'Salvar evento' })).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Dia inteiro'));
    expect(screen.queryByLabelText('Início')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar evento' }));
    expect(onSave).toHaveBeenCalledWith({ ...initialValues, endTime: '13:00', allDay: true });
  });
});
