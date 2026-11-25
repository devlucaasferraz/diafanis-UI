import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { IoArrowForwardOutline } from 'react-icons/io5';
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
  const header = useRef<HTMLElement>(null);
  const menu = useRef<HTMLElement>(null);
  const menuToggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, { threshold: .12 });
    root.current?.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuToggle.current?.focus();
      }
    };
    const closeOutside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node) && !menu.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 901px)');
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    window.addEventListener('keydown', close);
    document.addEventListener('pointerdown', closeOutside);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      window.removeEventListener('keydown', close);
      document.removeEventListener('pointerdown', closeOutside);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [menuOpen]);
  return (
    <div className={`diafanis-landing${paused ? ' motion-paused' : ''}`} ref={root}>
      <a className="landing-skip" href="#resultados">Ir para o conteúdo</a>
      <header className="landing-header" ref={header}>
        <a href="#inicio" className="landing-brand" aria-label="Diafanís, início"><span className="landing-prism" aria-hidden="true" /><span className="landing-brand-copy"><span>diafanís</span><span className="landing-brand-descriptor">Gestão para advocacia</span></span></a>
        <nav className="landing-desktop-nav" aria-label="Navegação principal">{nav.map(item => <a href={`#${item.id}`} key={item.id}>{item.name}</a>)}</nav>
        <div className="landing-header-actions">
          <a href="/login" className="landing-enter">Entrar</a>
          <a href="/cadastro" className="landing-signup">Criar conta <ArrowUpRight size={18} aria-hidden="true" /></a>
          <button ref={menuToggle} type="button" className="landing-menu-toggle" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="landing-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </header>
      {menuOpen && <nav ref={menu} className="landing-menu" id="landing-navigation" aria-label="Menu">
        {nav.map(item => <a href={`#${item.id}`} key={item.id} onClick={() => setMenuOpen(false)}>{item.name}</a>)}
        <div className="landing-menu-access">
          <a href="/login" onClick={() => setMenuOpen(false)}>Entrar</a>
          <a href="/cadastro" className="landing-signup" onClick={() => setMenuOpen(false)}>Criar conta <ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
      </nav>}
      <main>
        <section id="inicio" className="landing-hero" aria-labelledby="landing-title">
          {!paused && <PrismField />}
          <div className="landing-hero-glow" aria-hidden="true" />
          <div className="landing-hero-bottom"><h1 id="landing-title">Clareza em<br />cada detalhe.</h1><div className="landing-hero-copy"><p>Transparência na gestão. Confiança em cada decisão.</p><a href="#sistema" className="landing-text-link">Conheça o Diafanís</a></div></div>
        </section>
        <ResultsSection paused={paused} />
        <FeaturePreviews paused={paused} />
        <section id="experimentar" className="landing-access landing-section" aria-labelledby="access-heading">
          <div className="lp-trial-content" data-reveal>
            <h2 id="access-heading">Experimente o Diafanís.</h2>
            <a href="/cadastro" className="lp-trial-primary">Começar meu teste <IoArrowForwardOutline size={20} aria-hidden="true" focusable="false" /></a>
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
          <nav className="lp-footer-column" aria-label="Informações">
            <h3>Informações</h3>
            <a href="/duvidas-frequentes">Dúvidas frequentes</a>
            <a href="/precos">Preços</a>
          </nav>
          <nav className="lp-footer-column" aria-label="Acesso à plataforma">
            <h3>Acesso</h3>
            <a href="/login">Entrar</a>
            <a href="/cadastro">Criar conta</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
