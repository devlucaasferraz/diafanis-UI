import { IoCalendarOutline, IoCalculatorOutline, IoWalletOutline, IoDocumentsOutline, IoPeopleOutline } from 'react-icons/io5';
import { UserRound, Pencil, Download, Eye, ArrowDownLeft, ArrowUpRight, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, FileText, Mail, Bot, Gift, Bell, ExternalLink, MessageCircle, Search, MoreVertical, Plus, Smile, Mic, CheckCheck, Send, X } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import { EventDialog, type EventDraft } from '@/features/events/EventDialog';
import { AppWindow } from '@/features/ui/app-window';
import { monthGrid } from './monthGrid';
import { StoryCursor } from './StoryCursor';
import { regionalCourts } from './regionalCourts';
import { finalStoryStep, type SolutionId, type StoryPhase } from './solutionChoreography';
export type { SolutionId } from './solutionChoreography';
type SceneProps = { step: number };
function Action({ children, complete = false }: { children: ReactNode; complete?: boolean }) { return <span className={`demo-action${complete ? ' complete' : ''}`}>{children}</span>; }
function Person({ initials, children }: { initials: string; children: ReactNode }) { return <span className="demo-person"><span>{initials}</span>{children}</span>; }
function Field({ label, children, active = false }: { label: string; children: ReactNode; active?: boolean }) { return <div className={`demo-field${active ? ' active' : ''}`}><span>{label}</span><div>{children}</div></div>; }

function CalendarScene({ step }: SceneProps) {
  return <>
    <div className="demo-toolbar"><h4><IoCalendarOutline aria-hidden="true" focusable="false" />Novembro <span>2026</span></h4><div className="demo-calendar-tools"><span>Semana <ChevronDown size={16} /></span><ChevronLeft size={20} /><ChevronRight size={20} /></div></div>
    <div className="demo-agenda">
      <div className="demo-hours"><span /><span>09:00</span><span>10:00</span><span>11:00</span><span>14:00</span></div>
      {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map((day, i) => <div className={`demo-day day-${i}${i === 1 ? ' today' : ''}`} key={day}>
        <div className="demo-day-heading"><span>{day}</span><strong>{23 + i}</strong></div>
        <div className="demo-day-body">
          {i === 0 && <div className="demo-appointment meeting"><span>09:00 — 10:00</span><strong>Reunião com cliente</strong><span>Ana Costa</span></div>}
          {i === 1 && <><div className={`demo-appointment hearing${step >= 1 ? ' selected' : ''}`}><span>10:00 — 11:00</span><strong>Audiência de conciliação</strong><span>Maria Oliveira</span></div><div className="demo-appointment deadline"><span>14:00</span><strong>Prazo para contestação</strong></div></>}
          {i === 2 && <div className="demo-appointment followup"><span>09:00 — 09:30</span><strong>Retorno ao cliente</strong><span>João Santos</span></div>}
          {i === 4 && <div className="demo-appointment planning"><span>10:00 — 11:00</span><strong>Planejamento da equipe</strong><span>Ana Costa</span></div>}
          {i === 3 && <div className="demo-appointment review"><span>11:00 — 12:00</span><strong>Revisão de documentos</strong><span>Gabriel Lima</span></div>}
        </div>
      </div>)}
    </div>
    <div className={`demo-event-popover${step >= 2 ? ' open' : ''}`}>
      <div className="demo-popover-heading"><CalendarDays size={22} /><span>Audiência</span><X size={18} /></div>
      <h5>Audiência de conciliação</h5><p>Maria Oliveira</p>
      <div className="demo-event-meta"><span>24 de novembro</span><strong>10:00 — 11:00</strong><span>Fórum de Petrolina</span></div>
      <Person initials="AC">Ana Costa</Person>
      <div className={`demo-reminder${step >= 4 ? ' confirmed' : ''}`}><Mail size={18} /><span>{step >= 4 ? 'Lembrete preparado' : 'Preparar lembrete'}</span>{step >= 4 ? <Check size={18} /> : <ArrowUpRight size={18} />}</div>
    </div>
  </>;
}
function FinancialScene({ step }: SceneProps) {
  const paid = step >= 4;
  return <>
    <div className="demo-toolbar"><h4><IoWalletOutline aria-hidden="true" focusable="false" />Gestão financeira</h4><span>Novembro, 2026 <ChevronDown size={16} /></span></div>
    <div className="demo-finance-summary">
      <div><span><ArrowDownLeft size={18} /> Recebido no mês</span><strong key={String(paid)}>{paid ? 'R$ 14.900' : 'R$ 12.500'}<span>,00</span></strong></div>
      <div><span><ArrowUpRight size={18} /> A receber</span><strong key={String(paid)}>{paid ? 'R$ 4.800' : 'R$ 7.200'}<span>,00</span></strong></div>
    </div>
    <div className="demo-table"><div className="demo-table-head"><span>Cliente</span><span>Vencimento</span><span>Valor</span><span>Situação</span></div>
      {[['MO', 'Maria Oliveira', 'Contratuais', '24 nov', 'R$ 2.400,00'], ['JS', 'João Santos', 'Sucumbenciais', '27 nov', 'R$ 4.800,00'], ['RC', 'Rafael Carvalho', 'Contratuais', '18 nov', 'R$ 6.200,00'], ['BL', 'Beatriz Lima', 'Consultoria', '12 nov', 'R$ 6.300,00']].map(([initials, name, type, date, value], i) => <div key={name} className={`demo-table-row${i === 0 && step >= 1 ? ' selected' : ''}`}><Person initials={initials}><span>{name}<span className="demo-row-description">{type}</span></span></Person><span>{date}</span><strong>{value}</strong><span className={i > 1 || i === 0 && paid ? 'demo-paid' : 'demo-pending'}>{i > 1 || i === 0 && paid ? 'Recebido' : 'Pendente'}</span></div>)}
    </div>
    <div className={`demo-drawer${step >= 2 && step < 5 ? ' open' : ''}`}><div className="demo-drawer-header"><h5>Registrar recebimento</h5><X size={20} /></div><Person initials="MO">Maria Oliveira</Person><div className="demo-payment-value">R$ 2.400<span>,00</span></div><Field label="Recebido em">24 de novembro de 2026</Field><Field label="Forma de pagamento" active={step === 3}>Pix <ChevronDown size={18} /></Field><Action complete={paid}>{paid ? <><Check size={20} /> Recebimento registrado</> : 'Confirmar recebimento'}</Action></div>
  </>;
}
const DEMO_DEADLINE_DATE = '2026-12-02';
const decemberDays = monthGrid(2026, 11);
const demoDeadlineLabel = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', timeZone: 'UTC' }).format(new Date(`${DEMO_DEADLINE_DATE}T00:00:00Z`));

function DeadlinesScene({ step, onInteractionChange }: SceneProps & { onInteractionChange?: (active: boolean) => void }) {
  const [manual, setManual] = useState<'editing' | 'saved' | 'closed' | null>(null);
  const [dialogContainer, setDialogContainer] = useState<HTMLDivElement | null>(null);
  const [eventDraft, setEventDraft] = useState<EventDraft>({ title: 'Defesa de Maria Oliveira', date: DEMO_DEADLINE_DATE, allDay: false, startTime: '14:00', endTime: '15:00', description: 'Conferir os documentos e protocolar a defesa.' });
  const editing = manual === 'editing' || manual === null && step >= 7 && step < 9;
  const saved = manual === 'saved' || step >= 9;
  const editEvent = () => { setManual('editing'); onInteractionChange?.(true); };
  const closeEvent = () => { setManual('closed'); onInteractionChange?.(false); };
  const saveEvent = (event: EventDraft) => { setEventDraft(event); setManual('saved'); onInteractionChange?.(false); };
  const [courtId, setCourtId] = useState('petrolina');
  const court = regionalCourts.find(item => item.id === courtId)!;
  const dates = [
    { d: '25', day: 'Qua' }, { d: '26', day: 'Qui' },
    { d: '27', day: 'Sex', local: true }, { d: '28', day: 'Sáb', off: true },
    { d: '29', day: 'Dom', off: true }, { d: '30', day: 'Seg' },
    { d: '01', day: 'Ter' }, { d: '02', day: 'Qua' },
  ];
  return <div className="demo-deadline-content" ref={setDialogContainer}>
    <div className="demo-toolbar"><h4><IoCalculatorOutline aria-hidden="true" focusable="false" />Calculadora de prazos</h4></div>
    <div className="demo-regional-layout">
      <div className="demo-regional-form">
        <div className="demo-court-field"><label htmlFor="demo-court">Calendário local</label><div className="demo-court-select"><select id="demo-court" value={courtId} onChange={event => setCourtId(event.target.value)}>{(['PE', 'BA'] as const).map(state => <optgroup key={state} label={state === 'PE' ? 'Pernambuco' : 'Bahia'}>{regionalCourts.filter(item => item.state === state).map(item => <option key={item.id} value={item.id}>{item.name} · {item.state}</option>)}</optgroup>)}</select><ChevronDown size={17} aria-hidden="true" />{step === 1 && <div className="demo-court-preview" aria-hidden="true">{[court, ...regionalCourts.filter(item => item.id !== courtId)].map(item => <span key={item.id} className={item.id === courtId ? 'selected' : ''}>{item.name} · {item.state}{item.id === courtId && <Check size={16} />}</span>)}</div>}</div></div>
        <div className="demo-regional-fields"><Field label="Data de início">{step >= 3 ? '24 / 11 / 2026' : '— / — / —'}</Field><Field label="Prazo">{step >= 4 ? '5 dias úteis' : '— dias úteis'}</Field></div>
        <Action complete={step >= 6}>{step >= 6 ? <><Check size={20} /> Prazo calculado</> : 'Calcular prazo'}</Action>
        {step >= 5 && <div className="demo-counting-detail">
          <div className="demo-detail-heading"><CalendarDays size={17} /><span>Como o prazo é contado</span></div>
          <ol className="demo-counting-breakdown">{dates.map(({ d, off, local }, index) => <li key={d} className={off || local ? 'excluded' : 'included'}>
            <span>{d} {index < 6 ? 'nov' : 'dez'}</span>
            <span>{off ? 'Fim de semana' : local ? 'Suspensão' : 'Dia útil'}</span>
            <strong>{off || local ? '—' : `${dates.slice(0, index + 1).filter(day => !day.off && !day.local).length}º`}</strong>
          </li>)}</ol>
          <p><strong>{dates.filter(day => !day.off && !day.local).length} dias úteis</strong> em {dates.length} dias corridos. A data inicial, 24 nov, não entra nesta contagem.</p>
        </div>}
      </div>
      <div className={`demo-regional-calendar${saved ? ' has-saved-event' : ''}`}><h5>Novembro / Dezembro</h5>
        <div className={`demo-counting regional-counting${step >= 5 ? ' counting' : ''}`}>{dates.map(({ d, day, off, local }, i) => <div key={d} className={`${off ? 'off' : ''}${local ? ' local-day' : ''}${step >= 6 && i === 7 ? ' due' : ''}`} style={{ '--day-delay': `${i * 160}ms` } as CSSProperties}><span>{day}</span><strong>{d}</strong><span>{off || local ? '—' : <Check size={16} />}</span></div>)}</div>
        <div className={`demo-local-exception${step >= 5 ? ' open' : ''}`}><CalendarDays size={19} /><div><strong>27 nov · Suspensão</strong><span>Dia não contado em {court.name}</span></div></div>
        <div className={`demo-regional-result${step >= 6 ? ' open' : ''}`}><span>Vencimento em {court.name}</span><strong>{demoDeadlineLabel}</strong>
          {step >= 6 && (saved ? <div className="demo-event-summary-layout"><div className="demo-saved-event" role="status"><Check size={20} /><div><strong>Evento adicionado ao calendário</strong><span>{eventDraft.title}</span><small>{eventDraft.allDay ? 'Dia inteiro' : `${eventDraft.startTime} — ${eventDraft.endTime}`}</small><small>Responsável: Ana Costa</small>{eventDraft.description && <small>{eventDraft.description}</small>}<button type="button" className="demo-edit-event" onClick={editEvent}>Editar evento</button></div></div><div className="demo-month-preview" aria-label="Evento na agenda de dezembro">
          <div className="demo-detail-heading"><CalendarDays size={17} /><span>Dezembro de 2026</span></div>
          <div className="demo-month-grid" aria-hidden="true">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <span className="demo-month-weekday" key={day}>{day}</span>)}{decemberDays.map(day => <span key={day.isoDate} data-date={day.isoDate} className={`${!day.inMonth ? 'outside-month' : ''}${day.isoDate === eventDraft.date ? ' has-event' : ''}`}>{day.day}{day.isoDate === eventDraft.date && <i />}</span>)}</div>

        </div></div> : <button type="button" className="demo-add-event demo-action" onClick={editEvent}><CalendarDays size={18} /> Adicionar ao calendário</button>)}
        </div>

      </div>
    </div>
    <EventDialog open={editing} initialValues={eventDraft} dateLocked container={dialogContainer} demonstration={manual !== 'editing'} onInteract={editEvent} onOpenChange={open => { if (!open) closeEvent(); }} onSave={saveEvent} />
  </div>;
}
const DOCUMENT_FINAL_STEP = finalStoryStep('documents');

function WhatsAppScene({ step }: SceneProps) {
  const connected = step === DOCUMENT_FINAL_STEP;
  const reply = 'Olá, João! Sou a Dra. Ana Costa, do escritório Diafanís. Vou ajudar você com o envio do documento.';
  return <div className={`wa-app${connected ? ' connected' : ''}`} key={connected ? 'connected' : 'waiting'}>
    <div className="wa-rail"><MessageCircle size={24} /><span className="wa-rail-active"><MessageCircle size={22} /></span><Bot size={22} /><span className="wa-own-avatar">AC</span></div>
    <aside className="wa-conversations"><div className="wa-list-heading"><h4>Conversas</h4><Plus size={21} /><MoreVertical size={20} /></div><div className="wa-search"><Search size={17} /><span>Pesquisar</span></div><div className="wa-filters"><span>Todos</span><span>Não lidas</span></div>
      <div className="wa-conversation active"><Person initials="JS"><span>João Santos<span className="wa-list-preview">{connected ? 'Dra. Ana Costa irá assumir…' : 'Alguém pode me ajudar?'}</span></span></Person>{!connected && <span className="wa-unread">1</span>}</div>
      <div className="wa-conversation"><Person initials="MO"><span>Maria Oliveira<span className="wa-list-preview">Documentos recebidos. Obrigado!</span></span></Person></div>
      <div className="wa-conversation"><Person initials="RC"><span>Rafael Carvalho<span className="wa-list-preview">Combinado. Até amanhã!</span></span></Person></div>
    </aside>
    <div className="wa-chat"><div className="wa-contact-header"><Person initials="JS">João Santos</Person><div><Search size={20} /><MoreVertical size={20} /></div></div>
      <div className="wa-message-area"><div className="wa-day">Hoje</div><div className="wa-message incoming">Estou com dificuldade para enviar o documento. Alguém pode me ajudar?<span>10:42</span></div>
        {step >= 3 && <div className="wa-message outgoing">Consultando a equipe. Já vamos ajudar você.<span>10:42 <CheckCheck size={15} /></span></div>}
        {connected && <div className="wa-message outgoing handoff">Dra. Ana Costa irá assumir o atendimento em instantes.<span>10:43 <CheckCheck size={15} /></span></div>}
      </div>
      <div className={`wa-composer${connected ? ' writing' : ''}`}><Smile size={22} /><Plus size={22} /><div>{connected ? reply.split(' ').map((word, index) => <span className="wa-draft-word" key={index} style={{ animationDelay: `${650 + index * 65}ms` }}>{word} </span>) : <span className="wa-placeholder">Digite uma mensagem</span>}</div>{connected ? <Send size={21} /> : <Mic size={21} />}</div>
    </div>
  </div>;
}
const approvedDocuments = [
  { name: 'Documento de identidade', file: 'identidade' },
  { name: 'Comprovante de residência', file: 'comprovante' },
  { name: 'Procuração', file: 'procuracao' },
];
function documentExample(name: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="760" viewBox="0 0 600 760"><rect width="600" height="760" fill="#f0efeb"/><text x="50" y="72" font-family="Arial" font-size="16" fill="#666">Documento demonstrativo</text><text x="50" y="140" font-family="Arial" font-size="25" fill="#222">${name}</text><text x="50" y="192" font-family="Arial" font-size="20" fill="#444">Maria Oliveira</text><path d="M50 260H550M50 296H550M50 332H470M50 406H550M50 442H550M50 478H390" stroke="#ccc" stroke-width="3"/><text x="50" y="620" font-family="Georgia" font-style="italic" font-size="26" fill="#555">Maria Oliveira</text><path d="M50 640H360" stroke="#bbb"/></svg>`)}`;
}
function DocumentsScene({ step, onInteractionChange }: SceneProps & { onInteractionChange?: (active: boolean) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const previewClose = useRef<HTMLButtonElement>(null);
  const previewTrigger = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!preview) return;
    previewClose.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setPreview(null); onInteractionChange?.(false); }
      if (event.key === 'Tab') { event.preventDefault(); previewClose.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (previewTrigger.current?.isConnected) previewTrigger.current.focus();
    };
  }, [preview, onInteractionChange]);
  if (step === DOCUMENT_FINAL_STEP) return <WhatsAppScene step={step} />;
  const maria = step === 1 || step === 2;
  const joao = step >= 3;
  const assigned = step >= 4;
  const openPreview = (name: string, trigger: HTMLElement) => { previewTrigger.current = trigger; setPreview(name); onInteractionChange?.(true); };
  const closePreview = () => { setPreview(null); onInteractionChange?.(false); };
  return <>
    <div className="demo-toolbar"><h4><IoDocumentsOutline aria-hidden="true" focusable="false" />Documentos</h4><span><Bot size={19} /> {assigned ? 'Atendimento humano' : 'Integrado ao bot'}</span></div>
    <div className={`doc-workspace${step === 0 ? ' overview' : ' client-open'}`}>
      <div className="doc-clients"><h5>Clientes</h5>
        <div className={`doc-client-row${maria ? ' selected' : ''}`} data-client="maria"><Person initials="MO"><span>Maria Oliveira<span className="doc-client-status demo-paid">Documentos aprovados</span></span></Person><ChevronRight size={17} /></div>
        <div className={`doc-client-row${joao ? ' selected' : ''}`} data-client="joao"><Person initials="JS"><span>João Santos<span className={`doc-client-status${step >= 2 ? ' demo-attention' : ''}`}>{assigned ? 'Com Dra. Ana Costa' : step >= 2 ? 'Solicitou ajuda' : 'Coleta em andamento'}</span></span></Person>{step >= 2 ? <Bell size={17} className="demo-attention" /> : <ChevronRight size={17} />}</div>
        <div className="doc-client-row" data-client="rafael"><Person initials="RC"><span>Rafael Carvalho<span className="doc-client-status">Coleta em andamento</span></span></Person><ChevronRight size={17} /></div>
        <div className="doc-collection-summary"><div className="demo-detail-heading"><FileText size={17} /><span>Coletas de hoje</span></div><div className="doc-collection-progress"><i /></div><p><strong>1 concluída</strong><span>2 em andamento</span></p></div>
      </div>
      <div className="doc-client-page" key={step === 0 ? 'overview' : maria ? 'maria' : 'joao'}>
        {step === 0 ? <div className="demo-selection-empty">
          <div className="doc-welcome-art" aria-hidden="true">
            <span className="doc-welcome-sheet doc-welcome-sheet--back" />
            <span className="doc-welcome-sheet doc-welcome-sheet--front"><FileText size={32} strokeWidth={1.25} /><i /><i /><i /><span><Check size={14} /></span></span>
          </div>
          <h5>Cada cliente, seus documentos.</h5>
          <p>Selecione um cliente ao lado para consultar os arquivos e acompanhar a coleta.</p>
        </div> : <>
          <div className="doc-active-client"><Person initials={maria ? 'MO' : 'JS'}>{maria ? 'Maria Oliveira' : 'João Santos'}</Person><span className={maria ? 'demo-paid' : 'demo-attention'}>{maria ? '3 documentos aprovados' : assigned ? 'Atendimento assumido' : 'Intervenção manual'}</span></div>
          {maria ? <div className="doc-approved-files">{approvedDocuments.map(document => <div className="doc-file-row" key={document.file}><FileText size={24} /><div className="doc-file-name"><strong>{document.name}</strong><span><Check size={14} /> Aprovado na pré-triagem</span></div><div className="doc-file-actions"><button type="button" className="doc-preview" title="Visualizar documento" aria-label={`Visualizar ${document.name}`} onClick={event => openPreview(document.name, event.currentTarget)}><Eye size={19} /></button><a href={documentExample(document.name)} download={`${document.file}-exemplo.svg`} title="Baixar documento de exemplo" aria-label={`Baixar ${document.name}`}><Download size={19} /></a></div></div>)}</div> : <div className="doc-help-page"><h5>Histórico do atendimento</h5><ol className="doc-history"><li><span>João Santos</span><p>Estou com dificuldade para enviar o documento. Alguém pode me ajudar?</p></li><li><span>Bot Diafanís</span><p>Consultando a equipe. Já vamos ajudar você.</p></li>{assigned && <li className="doc-bot-notice"><span>Bot Diafanís · enviado no WhatsApp</span><p>Dra. Ana Costa irá assumir o atendimento em instantes.</p></li>}</ol>{!assigned && <div className="doc-assume-action"><Action><ExternalLink size={18} /> Assumir atendimento</Action></div>}</div>}
        </>}
      </div>
    </div>
    {step === 2 && <div className="demo-team-notification"><Bell size={22} /><div><strong>João Santos precisa de ajuda</strong><span>O cliente solicitou atendimento à equipe.</span></div></div>}
    {step === 5 && <div className="demo-redirect-backdrop"><div className="demo-redirect-dialog"><span className="demo-whatsapp-mark"><MessageCircle size={34} /></span><h5>Abrindo o WhatsApp</h5><p>Continuando o atendimento de João Santos.</p><Person initials="AC">Dra. Ana Costa</Person><span className="demo-redirect-line" /></div></div>}
    {preview && <div className="doc-preview-backdrop"><div className="doc-preview-dialog" role="dialog" aria-modal="true" aria-label={`Prévia de ${preview}`}><div><strong>{preview}</strong><button type="button" ref={previewClose} aria-label="Fechar prévia do documento" onClick={closePreview}><X size={20} /></button></div><img src={documentExample(preview)} alt={`Documento de exemplo de Maria Oliveira: ${preview}`} /></div></div>}
  </>;
}
const birthdayMessage = 'Olá, João! Feliz aniversário! Desejamos saúde e muitas conquistas neste novo ciclo.';
const personalizedBirthday = 'João, feliz aniversário! Muita saúde e boas pedaladas neste novo ciclo!';
function MessagesScene({ step }: SceneProps) {
  const sent = step >= 7;
  const personalized = step >= 4;
  const personalSent = step >= 5;
  return <>
    <div className="demo-toolbar"><h4><IoPeopleOutline aria-hidden="true" focusable="false" />Gestão de clientes</h4><span><Bot size={19} /> Entrega pelo bot</span></div>
    <div className="demo-relationship-layout">
      <div className="demo-day-suggestions"><h5>Sugestões de hoje</h5>
        <div className="demo-suggestion"><CalendarDays size={21} /><div><strong>Maria Oliveira</strong><span>Lembrete de audiência · 10h</span></div>{sent && <Check size={17} className="demo-paid" />}</div>
        <div className={`demo-suggestion${step >= 1 ? ' selected' : ''}`}><Gift size={21} /><div><strong>João Santos</strong><span>Aniversário hoje</span></div>{personalSent && <Check size={17} className="demo-paid" />}</div>
        <div className="demo-suggestion"><CalendarDays size={21} /><div><strong>Rafael Carvalho</strong><span>Lembrete de reunião · 14h</span></div>{sent && <Check size={17} className="demo-paid" />}</div>
        <div className="demo-dispatch-note"><MessageCircle size={18} /><div><strong>Envio pelo WhatsApp</strong><span>Revise cada mensagem antes de enviar.</span></div></div>
        <div className="demo-daily-dispatch"><Action complete={sent}>{sent ? <><Check size={19} /> 3 mensagens enviadas pelo bot</> : <><Send size={18} /> {personalSent ? 'Enviar 2 lembretes' : 'Enviar sugestões do dia'}</>}</Action></div>
      </div>
      {step === 0 ? <div className="demo-selection-empty demo-message-empty">
        <div className="demo-message-empty-art" aria-hidden="true">
          <svg className="demo-people-connections" viewBox="0 0 184 140" fill="none"><path d="M30 40v13a14 14 0 0 0 14 14h34M154 40v13a14 14 0 0 1-14 14h-34M92 44v34" /></svg>
          <span className="demo-person-illustration demo-person-illustration--left"><UserRound size={19} strokeWidth={1.4} /></span>
          <span className="demo-person-illustration demo-person-illustration--center"><UserRound size={22} strokeWidth={1.4} /></span>
          <span className="demo-person-illustration demo-person-illustration--right"><UserRound size={19} strokeWidth={1.4} /></span>
          <span className="demo-message-illustration"><i /><i /><i /><span><Check size={13} strokeWidth={1.5} /></span></span>
        </div>
        <h5>Cada pessoa, uma mensagem.</h5>
        <p>Selecione uma sugestão ao lado para preparar uma mensagem com a sua voz.</p>
      </div> : <div className="demo-personal-message"><div className="demo-personal-heading"><Person initials="JS">João Santos</Person></div>
        <div className="demo-template-options">{['Aniversário', 'Audiência', 'Data especial'].map((name, i) => <span key={name} className={i === 0 && step >= 1 ? 'selected' : ''}>{name}</span>)}</div>
        <div className="demo-editor-shell"><div className="demo-edit-control">{step < 3 ? <span className="demo-customize-action"><Pencil size={16} /> Personalizar mensagem</span> : <span className="demo-edit-label"><Pencil size={16} /> {step === 3 ? 'Editando mensagem' : 'Mensagem personalizada'}</span>}</div>
          <div className={`demo-message-body${step >= 1 ? ' written' : ''}${step >= 3 ? ' editing' : ''}`}><p className="demo-message-copy" key={personalized ? 'personalized' : 'template'}>{(personalized ? personalizedBirthday : birthdayMessage).split(' ').map((word, i) => <span key={i} style={{ animationDelay: `${i * 30}ms` }}>{word} </span>)}</p>{step >= 1 && <p className="demo-message-signature">{personalized ? 'Um abraço, Dra. Ana Costa.' : 'Um abraço da equipe Diafanís.'}</p>}</div>
        </div>
        <div className="demo-personal-send"><Action complete={personalSent}>{personalSent ? <><Check size={18} /> Enviado</> : <><Send size={18} /> Enviar para João</>}</Action></div>
      </div>}
    </div>
  </>;
}
export function SolutionScene({ id, step, cue = step, phase = 'reading', paused = false, reduced = false, onInteractionChange }: { id: SolutionId; step: number; cue?: number; phase?: StoryPhase; paused?: boolean; reduced?: boolean; onInteractionChange?: (active: boolean) => void }) {
  const root = useRef<HTMLDivElement>(null);
  return <div ref={root} className={`solution-demo demo-${id}${paused ? ' demo-paused' : ''}`} data-step={step} data-cue={cue} data-phase={phase} role={id === 'deadlines' || id === 'documents' ? 'region' : 'img'} aria-label={`Demonstração de ${id === 'calendar' ? 'calendário' : id === 'deadlines' ? 'calculadora de prazos' : id === 'financial' ? 'gestão financeira' : id === 'documents' ? 'documentos e atendimento pelo WhatsApp' : 'gestão de clientes pelo bot'}`}><AppWindow scheme="dark" className="demo-window"><div className="demo-interface" aria-hidden={id === 'deadlines' || id === 'documents' ? undefined : true}>{id === 'calendar' ? <CalendarScene step={step} /> : id === 'financial' ? <FinancialScene step={step} /> : id === 'deadlines' ? <DeadlinesScene step={step} onInteractionChange={onInteractionChange} /> : id === 'documents' ? <DocumentsScene step={step} onInteractionChange={onInteractionChange} /> : <MessagesScene step={step} />}</div></AppWindow><StoryCursor root={root} id={id} cue={cue} step={step} phase={phase} reduced={reduced} /></div>;
}
