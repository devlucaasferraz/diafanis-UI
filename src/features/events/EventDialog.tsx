import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { X } from 'lucide-react';
import './event-dialog.css';

export type EventDraft = {
  title: string;
  date: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
  description: string;
};

type Props = {
  open: boolean;
  initialValues: EventDraft;
  onSave: (event: EventDraft) => void;
  onOpenChange: (open: boolean) => void;
  container?: HTMLElement | null;
  dateLocked?: boolean;
  demonstration?: boolean;
  onInteract?: () => void;
};

export function EventDialog({ open, initialValues, onSave, onOpenChange, container, dateLocked = false, demonstration = false, onInteract }: Props) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange} modal={!demonstration}>
    <Dialog.Portal container={container ?? undefined}>
      <Dialog.Overlay className={`event-dialog-overlay${container ? ' event-dialog-contained' : ''}`} />
      <Dialog.Content className={`event-dialog${container ? ' event-dialog-contained' : ''}`} onOpenAutoFocus={event => { if (demonstration) event.preventDefault(); }} onCloseAutoFocus={event => { if (demonstration) event.preventDefault(); }} onPointerDown={onInteract} onFocusCapture={onInteract}>
        <div className="event-dialog-heading"><Dialog.Title>Novo evento</Dialog.Title><Dialog.Close aria-label="Fechar cadastro de evento"><X size={20} /></Dialog.Close></div>
        <Dialog.Description>{dateLocked ? 'O vencimento calculado já está preenchido. Complete os detalhes do compromisso.' : 'Organize um compromisso, uma tarefa ou um lembrete no calendário.'}</Dialog.Description>
        <EventForm initialValues={initialValues} dateLocked={dateLocked} onSave={onSave} />
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

function EventForm({ initialValues, dateLocked, onSave }: Pick<Props, 'initialValues' | 'onSave' | 'dateLocked'>) {
  const [draft, setDraft] = useState(initialValues);
  const invalidTime = !draft.allDay && draft.endTime <= draft.startTime;
  return <form className="event-dialog-form" onSubmit={event => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const submitted: EventDraft = {
      title: String(fields.get('title') ?? '').trim(),
      date: dateLocked ? initialValues.date : String(fields.get('date') ?? ''),
      description: String(fields.get('description') ?? '').trim(),
      allDay: fields.has('allDay'),
      startTime: String(fields.get('startTime') ?? draft.startTime),
      endTime: String(fields.get('endTime') ?? draft.endTime),
    };
    setDraft(submitted);
    if (submitted.allDay || submitted.endTime > submitted.startTime) onSave(submitted);
  }}>
    <label>Nome do evento<input className="event-dialog-title-input" name="title" required pattern=".*\S.*" maxLength={120} value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} placeholder="Ex.: reunião, entrega ou atendimento" /></label>
    <label>Data{dateLocked ? <input type="text" readOnly value={initialValues.date.split('-').reverse().join('/')} /> : <input type="date" name="date" required value={draft.date} onChange={event => setDraft({ ...draft, date: event.target.value })} />}</label>
    <label className="event-dialog-checkbox"><input type="checkbox" name="allDay" checked={draft.allDay} onChange={event => setDraft({ ...draft, allDay: event.target.checked })} />Dia inteiro</label>
    {!draft.allDay && <div className="event-dialog-times">
      <label>Início<input type="time" name="startTime" required value={draft.startTime} onChange={event => setDraft({ ...draft, startTime: event.target.value })} /></label>
      <label>Término<input type="time" name="endTime" required value={draft.endTime} aria-invalid={invalidTime} aria-describedby={invalidTime ? 'event-time-error' : undefined} onChange={event => setDraft({ ...draft, endTime: event.target.value })} /></label>
    </div>}
    {invalidTime && <p id="event-time-error" role="alert">O término deve ser depois do início.</p>}
    <label>Descrição (opcional)<input name="description" maxLength={160} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} placeholder="Detalhes do compromisso" /></label>
    <div className="event-dialog-actions"><Dialog.Close>Cancelar</Dialog.Close><button type="submit" className="event-dialog-save" disabled={invalidTime}>Salvar evento</button></div>
  </form>;
}
