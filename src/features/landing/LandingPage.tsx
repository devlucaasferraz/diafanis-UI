import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { PrismField } from './PrismField';
import { FeaturePreviews } from './FeaturePreviews';
import { LandingContact } from './LandingContact';
import { ResultsSection } from './ResultsSection';
import './landing.css';

const nav = [{ name: 'Sobre nós', id: 'resultados' }, { name: 'Soluções', id: 'sistema' }, { name: 'Contato', id: 'contato' }];

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
      <a className="landing-skip" href="#resultados">Ir para o conteúdo</a>
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
        <ResultsSection paused={paused} />
        <FeaturePreviews paused={paused} />
        <section id="experimentar" className="landing-access landing-section" aria-labelledby="access-heading">
          <h2 id="access-heading" data-reveal>Experimente<br />o Diafanís.</h2>
          <div className="lp-access-action" data-reveal>
            <Link to="/dashboard" className="landing-access-button"><span className="lp-access-orbit" aria-hidden="true"><ArrowUpRight /></span><span>Acesse a plataforma</span></Link>
            <p>Demonstração sem cadastro.</p>
          </div>
        </section>
        <LandingContact paused={paused} />
      </main>
      <footer className="lp-footer">
        <div className="lp-footer-main">
          <div className="lp-footer-identity">
            <a className="landing-brand" href="#inicio" aria-label="Diafanís, início"><span className="landing-prism" aria-hidden="true" /><span>diafanís</span></a>
            <p>© {new Date().getFullYear()} Diafanís</p>
          </div>
          <nav className="lp-footer-column" aria-label="Institucional">
            <h3>Conheça</h3>
            <a href="#resultados">Sobre nós</a>
            <a href="#sistema">Soluções</a>
          </nav>
          <nav className="lp-footer-column" aria-label="Recursos da plataforma">
            <h3>Plataforma</h3>
            <Link to="/calendar">Calendário</Link>
            <Link to="/financial">Financeiro</Link>
            <Link to="/messages">Mensagens</Link>
          </nav>
          <nav className="lp-footer-column" aria-label="Acesso à plataforma">
            <h3>Acesso</h3>
            <Link to="/dashboard">Experimentar o Diafanís</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
