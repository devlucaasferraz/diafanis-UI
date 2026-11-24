import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu, X } from 'lucide-react';
import { PrismField } from './PrismField';
import { FeaturePreviews } from './FeaturePreviews';
import { LandingContact, placeholderEmail } from './LandingContact';
import { SectionHeading } from './SectionHeading';
import { OfficeFilm } from './OfficeFilm';
import { ResultsSection } from './ResultsSection';
import './landing.css';

const nav = [{ name: 'Sobre', id: 'sobre' }, { name: 'O sistema', id: 'sistema' }, { name: 'Contato', id: 'contato' }];

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const paused = false;
  const root = useRef<HTMLDivElement>(null);
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
  return (
    <div className={`diafanis-landing${paused ? ' motion-paused' : ''}`} ref={root}>
      <a className="landing-skip" href="#sobre">Ir para o conteúdo</a>
      <header className="landing-header">
        <a href="#inicio" className="landing-brand" aria-label="Diafanís, início"><span className="landing-prism" aria-hidden="true" /><span className="landing-brand-copy"><span>diafanís</span><span className="landing-brand-descriptor">Gestão para advocacia</span></span></a>
        <nav className="landing-desktop-nav" aria-label="Navegação principal">{nav.map(item => <a href={`#${item.id}`} key={item.id}>{item.name}</a>)}</nav>
        <div className="landing-header-actions"><Link to="/dashboard" className="landing-enter">Entrar</Link><button className="landing-menu-toggle" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="landing-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
      </header>
      {menuOpen && <nav className="landing-menu" id="landing-navigation" aria-label="Menu">{nav.map(item => <a href={`#${item.id}`} key={item.id} onClick={() => setMenuOpen(false)}>{item.name}</a>)}<Link to="/dashboard">Entrar no sistema</Link></nav>}
      <main>
        <section id="inicio" className="landing-hero" aria-labelledby="landing-title">
          {!paused && <PrismField />}
          <div className="landing-hero-glow" aria-hidden="true" />
          <div className="landing-hero-bottom"><h1 id="landing-title">Clareza em<br />cada detalhe.</h1><div className="landing-hero-copy"><p>Transparência na gestão. Confiança em cada decisão.</p><a href="#sistema" className="landing-text-link">Conheça o Diafanís</a></div></div>
        </section>
        <section id="sobre" className="landing-about landing-section" aria-labelledby="about-heading">
          <SectionHeading id="about-heading" title="Feito para o seu escritório." />
          <OfficeFilm paused={paused} />
        </section>
        <FeaturePreviews paused={paused} />
        <ResultsSection paused={paused} />
        <LandingContact paused={paused} />
        <section className="landing-access landing-section" aria-labelledby="access-heading"><SectionHeading id="access-heading" title="Entre e conheça." /><div className="lp-access-action"><Link to="/dashboard" className="landing-access-button">Entrar no Diafanís</Link><small>Acesso à demonstração, sem cadastro.</small></div></section>
      </main>
      <footer className="lp-footer">
        <div className="lp-footer-grid"><div className="lp-footer-intro"><a className="landing-brand" href="#inicio"><span className="landing-prism" aria-hidden="true" /><span>diafanís</span></a></div>
          <nav aria-label="Recursos no rodapé"><h3>O sistema</h3><Link to="/calendar">Calendário</Link><Link to="/financial">Financeiro</Link><Link to="/messages">Mensagens</Link><Link to="/dashboard">Entrar no sistema</Link></nav>
          <nav aria-label="Navegação no rodapé"><h3>Conheça</h3><a href="#sobre">Sobre o Diafanís</a><a href="#sistema">Prévias do sistema</a><a href="#resultados">Resultados</a><a href="#contato">Contato</a></nav>
          <div className="lp-footer-contact"><h3>Fale com a equipe</h3><a href="#contato">{placeholderEmail}</a><p>Contato ilustrativo.</p></div>
        </div>
        <div className="lp-footer-wordmark" aria-hidden="true">diafanís</div>
        <div className="lp-footer-bottom"><span>© {new Date().getFullYear()} Diafanís</span><a href="#inicio">Voltar ao início</a></div>
      </footer>
    </div>
  );
}
