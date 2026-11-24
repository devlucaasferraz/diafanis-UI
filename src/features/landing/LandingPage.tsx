import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu, X, Plus, Minus, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { LightField } from './LightField';
import './landing.css';

const features = [
  { name: 'Calendário', text: 'Consulte compromissos, audiências e prazos. Filtre a agenda por responsável e veja os detalhes de cada dia.', to: '/calendar' as const, word: 'Tempo', detail: 'Compromissos e audiências', type: 'calendar' },
  { name: 'Financeiro', text: 'Acompanhe os honorários do escritório, consulte cobranças e registre pagamentos.', to: '/financial' as const, word: 'Controle', detail: 'Honorários e pagamentos', type: 'finance' },
  { name: 'Mensagens', text: 'Prepare mensagens, organize os destinatários e reutilize modelos na comunicação com seus clientes.', to: '/messages' as const, word: 'Contato', detail: 'Mensagens e modelos', type: 'messages' },
];
const nav = [{ name: 'Sobre', id: 'sobre' }, { name: 'O sistema', id: 'sistema' }, { name: 'Recursos', id: 'recursos' }];

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const feature = features[active];
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, { threshold: .12 });
    root.current?.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menuOpen]);
  const changeFeature = (direction: number) => { setActive(i => (i + direction + features.length) % features.length); setExpanded(false); };
  return (
    <div className={`diafanis-landing${paused ? ' motion-paused' : ''}`} ref={root}>
      <a className="landing-skip" href="#sobre">Ir para o conteúdo</a>
      <header className="landing-header">
        <a href="#inicio" className="landing-brand" aria-label="Diafanís, início"><span className="landing-prism" aria-hidden="true" /><span>diafanís</span></a>
        <nav className="landing-desktop-nav" aria-label="Navegação principal">{nav.map(item => <a href={`#${item.id}`} key={item.id}>{item.name}</a>)}</nav>
        <div className="landing-header-actions"><Link to="/dashboard" className="landing-enter">Entrar</Link><button className="landing-menu-toggle" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="landing-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
      </header>
      {menuOpen && <nav className="landing-menu" id="landing-navigation" aria-label="Menu">{nav.map(item => <a href={`#${item.id}`} key={item.id} onClick={() => setMenuOpen(false)}>{item.name}</a>)}<Link to="/dashboard">Entrar no sistema</Link></nav>}
      <main>
        <section id="inicio" className="landing-hero" aria-labelledby="landing-title">
          {!paused && <LightField />}
          <div className="landing-hero-glow" aria-hidden="true" />
          <div className="landing-hero-top"><span>Gestão para escritórios de advocacia</span><button onClick={() => setPaused(!paused)} className="landing-motion-button" aria-label={paused ? 'Ativar animações' : 'Pausar animações'}>{paused ? <Play size={15} /> : <Pause size={15} />}</button></div>
          <div className="landing-hero-bottom"><h1 id="landing-title">Seu escritório.<br />Tudo à vista.</h1><div className="landing-hero-copy"><p>Organize a agenda, acompanhe honorários e mantenha contato com seus clientes.</p><a href="#sobre" className="landing-text-link">Conheça o Diafanís</a></div></div>
          <div className="landing-hero-footer"><span>Diafanís</span><span className="landing-scroll-cue">Role para conhecer<span aria-hidden="true" /></span></div>
        </section>
        <section id="sobre" className="landing-about landing-section" aria-labelledby="about-heading">
          <div className="landing-section-heading" data-reveal><span className="landing-section-label">Sobre o Diafanís</span><h2 id="about-heading">A rotina do escritório<br />em um só lugar.</h2></div>
          <div className="landing-about-bottom" data-reveal><p>Entre a próxima audiência e o acompanhamento de uma cobrança, há muita coisa para organizar. O Diafanís reúne as informações do dia a dia para você consultar e trabalhar com sua equipe.</p><div className="landing-overview"><div><span>Agenda</span><p>Compromissos e responsáveis.</p></div><div><span>Honorários</span><p>Cobranças e pagamentos.</p></div><div><span>Clientes</span><p>Mensagens e acompanhamento.</p></div></div></div>
        </section>
        <section id="sistema" className="landing-showcase landing-section" aria-labelledby="system-heading">
          <div className="landing-section-heading" data-reveal><span className="landing-section-label">O sistema</span><div><h2 id="system-heading">Veja o que vem<br />pela frente.</h2><p className="landing-section-description">Uma agenda compartilhada para acompanhar os compromissos do escritório.</p></div></div>
          <div className="landing-product-stage" data-reveal>
            <div className="landing-product-halo" aria-hidden="true" />
            <div className="landing-product-window"><div className="landing-product-top"><span className="landing-product-brand">diafanís</span><span>Calendário</span><span>Prévia demonstrativa</span></div><div className="landing-product-content"><div className="landing-product-title"><div><small>Agenda do escritório</small><h3>Novembro 2026</h3></div><Link to="/calendar">Abrir calendário</Link></div><div className="landing-week">{['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map((day, i) => <div key={day} className={i === 1 ? 'today' : ''}><span>{day}</span><strong>{23 + i}</strong>{i === 0 && <div className="demo-event">09:30<em>Reunião com cliente</em></div>}{i === 1 && <><div className="demo-event hearing">10:00<em>Audiência de conciliação</em></div><div className="demo-event deadline">18:00<em>Prazo para contestação</em></div></>}{i === 3 && <div className="demo-event">14:00<em>Revisão de documentos</em></div>}</div>)}</div></div></div>
          </div>
        </section>
        <section id="recursos" className="landing-resources landing-section" aria-labelledby="resources-heading">
          <div className="landing-resource-heading" data-reveal><div><span className="landing-section-label">Recursos</span><h2 id="resources-heading">Parte da sua rotina.</h2></div><div className="landing-carousel-buttons"><button onClick={() => changeFeature(-1)} aria-label="Recurso anterior"><ChevronLeft /></button><button onClick={() => changeFeature(1)} aria-label="Próximo recurso"><ChevronRight /></button></div></div>
          <div className={`landing-feature-visual ${feature.type}`}><div className="landing-feature-sculpture" aria-hidden="true"><div /><div /><div /><div /><div /><div /><div /><div /></div><span className="landing-feature-word" key={feature.word}>{feature.word}</span><span className="landing-feature-detail">{feature.detail}</span></div>
          <div className="landing-feature-caption" aria-live="polite"><h3>{feature.name}</h3><button aria-expanded={expanded} aria-controls="feature-details" onClick={() => setExpanded(!expanded)}>{expanded ? 'Fechar detalhes' : 'Conhecer recurso'}{expanded ? <Minus size={19} /> : <Plus size={19} />}</button></div>
          <div id="feature-details" hidden={!expanded} className="landing-feature-details"><p>{feature.text}</p><Link to={feature.to}>Abrir {feature.name.toLowerCase()}</Link></div>
          <div className="landing-feature-tabs" aria-label="Escolher recurso">{features.map((item, i) => <button key={item.name} aria-pressed={active === i} onClick={() => { setActive(i); setExpanded(false); }}><span />{item.name}</button>)}</div>
        </section>
        <section className="landing-statement" aria-labelledby="statement-heading">{!paused && <LightField variant="ribbon" />}<div data-reveal><span className="landing-section-label">Feito para o dia a dia</span><h2 id="statement-heading">Menos tempo procurando.<br />Mais tempo trabalhando.</h2><p>Da consulta à agenda ao registro de um pagamento, encontre o que precisa no mesmo sistema.</p></div></section>
        <section className="landing-access landing-section" aria-labelledby="access-heading"><div data-reveal><span className="landing-section-label">Comece por aqui</span><h2 id="access-heading">Conheça o sistema<br />por dentro.</h2></div><div data-reveal><p>Explore o Diafanís e veja os recursos disponíveis.</p><Link to="/dashboard" className="landing-access-button">Entrar no Diafanís</Link><small>Acesso à demonstração, sem cadastro.</small></div></section>
      </main>
      <footer className="landing-footer"><a className="landing-brand" href="#inicio"><span className="landing-prism" aria-hidden="true" /><span>diafanís</span></a><span>Sistema de gestão para escritórios de advocacia.</span><a href="#inicio">Voltar ao início</a></footer>
    </div>
  );
}
