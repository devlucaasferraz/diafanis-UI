import { useRef, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Check, X, CalendarDays, Wallet, MessageSquare } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

function PreviewStage({ children, paused, reverse = false }: { children: ReactNode; paused: boolean; reverse?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 28 });
  const rotateX = useTransform(progress, [0, .5, 1], [12, 0, -5]);
  const rotateY = useTransform(progress, [0, .5, 1], [reverse ? 7 : -7, 0, reverse ? -3 : 3]);
  const y = useTransform(progress, [0, .5, 1], [55, 0, -25]);
  return <div ref={ref} className="landing-product-stage landing-scroll-stage"><div className="landing-product-halo" aria-hidden="true" /><motion.div className="landing-product-window" style={reduce || paused ? { transform: 'none' } : { rotateX, rotateY, y }}>{children}</motion.div></div>;
}

function WindowBar({ name }: { name: string }) {
  return <div className="landing-product-top"><span>{name}</span></div>;
}

function CalendarPreview() {
  const [selected, setSelected] = useState<string | null>(null);
  return <><WindowBar name="Calendário" /><div className="landing-product-content"><div className="landing-product-title"><div><h3>Novembro 2026</h3></div><Link to="/calendar">Abrir calendário</Link></div><div className="landing-week">{['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map((day, i) => <div key={day} className={i === 1 ? 'today' : ''}><span>{day}</span><strong>{23 + i}</strong>{i === 0 && <button className="demo-event" onClick={() => setSelected('Reunião com cliente')}>09:30<em>Reunião com cliente</em></button>}{i === 1 && <><button className="demo-event hearing" onClick={() => setSelected('Audiência de conciliação')}>10:00<em>Audiência de conciliação</em></button><button className="demo-event deadline" onClick={() => setSelected('Prazo para contestação')}>18:00<em>Prazo para contestação</em></button></>}{i === 3 && <button className="demo-event" onClick={() => setSelected('Revisão de documentos')}>14:00<em>Revisão de documentos</em></button>}</div>)}</div><div className="lp-preview-detail" aria-live="polite">{selected ? <><span><strong>{selected}</strong><small>Responsável: Ana Costa · Petrolina / PE</small></span><button onClick={() => setSelected(null)} aria-label="Fechar compromisso"><X size={17} /></button></> : <span>Selecione um compromisso para ver os detalhes.</span>}</div></div></>;
}

function FinancePreview() {
  const [paid, setPaid] = useState(false);
  return <><WindowBar name="Financeiro" /><div className="landing-product-content"><div className="landing-product-title"><div><h3>Gestão financeira</h3></div><Link to="/financial">Abrir financeiro</Link></div><div className="lp-finance-summary" aria-live="polite"><div><small>A receber</small><strong>{paid ? 'R$ 4.800' : 'R$ 7.200'}</strong></div><div><small>Recebido no mês</small><strong>{paid ? 'R$ 14.900' : 'R$ 12.500'}</strong></div><div><small>Em atraso</small><strong>R$ 1.800</strong></div></div><div className="lp-preview-table-wrap"><table className="lp-preview-table"><thead><tr><th>Cliente / descrição</th><th>Vencimento</th><th>Valor</th><th>Status</th></tr></thead><tbody><tr><td><strong>Maria Oliveira</strong><small>Honorários contratuais</small></td><td>24 nov 2026</td><td>R$ 2.400,00</td><td><span className={paid ? 'lp-demo-status paid' : 'lp-demo-status'}>{paid ? 'Pago' : 'Pendente'}</span></td></tr><tr><td><strong>João Santos</strong><small>Honorários sucumbenciais</small></td><td>27 nov 2026</td><td>R$ 4.800,00</td><td><span className="lp-demo-status">Pendente</span></td></tr></tbody></table></div><div className="lp-preview-action"><button className={paid ? 'lp-demo-button completed' : 'lp-demo-button'} onClick={() => setPaid(!paid)}>{paid ? <><Check size={15} /> Desfazer exemplo</> : 'Registrar pagamento'}</button></div></div></>;
}

const templates = [
  { name: 'Lembrete de audiência', text: 'Olá, Maria. Sua audiência está marcada para 24 de novembro, às 10h. Entre em contato com o escritório se precisar de alguma orientação.' },
  { name: 'Documentos pendentes', text: 'Olá, Maria. Para dar continuidade ao seu atendimento, precisamos do comprovante de residência atualizado. Podemos ajudar com alguma dúvida?' },
  { name: 'Felicitação de aniversário', text: 'Olá, Maria. Desejamos um feliz aniversário, com muita saúde e bons momentos. Um abraço da equipe do escritório!' },
];

function MessagesPreview() {
  const [template, setTemplate] = useState(0);
  return <><WindowBar name="Mensagens" /><div className="landing-product-content"><div className="landing-product-title"><div><h3>Mensagens e modelos</h3></div><Link to="/messages">Abrir mensagens</Link></div><div className="lp-messages-layout"><div className="lp-template-list" aria-label="Modelos de demonstração">{templates.map((item, i) => <button aria-pressed={template === i} key={item.name} onClick={() => setTemplate(i)}><MessageSquare size={15} /><span>{item.name}</span></button>)}</div><div className="lp-message-preview"><div className="lp-message-recipient"><span className="lp-demo-avatar">MO</span><div><strong>Maria Oliveira</strong></div></div><div className="lp-message-paper" aria-live="polite"><p key={template}>{templates[template].text}</p></div><small className="lp-message-disclaimer">Prévia de texto. Nenhuma mensagem é enviada.</small></div></div></div></>;
}

const previews = [
  { id: 'preview-calendario', name: 'Calendário', title: 'Calendário', description: 'Visualize a semana, identifique prazos e saiba quem é responsável por cada compromisso.', icon: CalendarDays, component: CalendarPreview },
  { id: 'preview-financeiro', name: 'Financeiro', title: 'Financeiro', description: 'Acompanhe valores a receber e pagamentos, com cada cobrança vinculada ao cliente.', icon: Wallet, component: FinancePreview },
  { id: 'preview-mensagens', name: 'Mensagens', title: 'Mensagens', description: 'Organize modelos e prepare mensagens para os diferentes momentos do atendimento.', icon: MessageSquare, component: MessagesPreview },
];

export function FeaturePreviews({ paused }: { paused: boolean }) {
  return <section id="sistema" className="landing-showcase landing-section" aria-labelledby="system-heading"><SectionHeading id="system-heading" title="Experimente as telas." description="Demonstração com dados fictícios." /><nav className="lp-preview-nav" aria-label="Prévias do sistema">{previews.map(({ id, name, icon: Icon }) => <a href={`#${id}`} key={id}><Icon size={16} />{name}</a>)}</nav>{previews.map(({ id, title, description, component: Component }, index) => <article key={id} id={id} className={`lp-feature-preview${index % 2 ? ' reverse' : ''}`}><div className="lp-preview-intro" data-reveal><h3>{title}</h3><p>{description}</p></div><PreviewStage paused={paused} reverse={index % 2 === 1}><Component /></PreviewStage></article>)}</section>;
}
