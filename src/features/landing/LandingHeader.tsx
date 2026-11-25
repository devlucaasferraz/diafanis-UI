import { BrandMark } from '@/features/ui/brand-mark';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { BrandButton } from '@/features/ui/brand-button';

const nav = [{ name: 'Sobre nós', id: '/sobre-nos' }, { name: 'Soluções', id: 'sistema' }, { name: 'Contato', id: 'contato' }];

export function LandingHeader({ home = false, current }: { home?: boolean; current?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menu = useRef<HTMLElement>(null);
  const menuToggle = useRef<HTMLButtonElement>(null);
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
  return <>
      <header className="landing-header" ref={header}>
        <a href={home ? '#inicio' : '/#inicio'} className="landing-brand" aria-label="Diafanís, início"><BrandMark className="landing-prism" /><span className="landing-brand-copy"><span>diafanís</span><span className="landing-brand-descriptor">Gestão para advocacia</span></span></a>
        <nav className="landing-desktop-nav" aria-label="Navegação principal">{nav.map(item => <a href={item.id.startsWith('/') ? item.id : `${home ? '' : '/'}#${item.id}`} key={item.id} aria-current={current === item.id ? 'page' : undefined}>{item.name}</a>)}</nav>
        <div className="landing-header-actions">
          <a href="/login" className="landing-enter">Entrar</a>
          <BrandButton asChild surface="glass" className="landing-signup"><a href="/cadastro">Criar conta <ArrowUpRight size={18} aria-hidden="true" /></a></BrandButton>
          <button ref={menuToggle} type="button" className="landing-menu-toggle" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="landing-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </header>
      {menuOpen && <nav ref={menu} className="landing-menu" id="landing-navigation" aria-label="Menu">
        {nav.map(item => <a href={item.id.startsWith('/') ? item.id : `${home ? '' : '/'}#${item.id}`} key={item.id} aria-current={current === item.id ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{item.name}</a>)}
        <div className="landing-menu-access">
          <a href="/login" onClick={() => setMenuOpen(false)}>Entrar</a>
          <BrandButton asChild surface="glass" className="landing-signup"><a href="/cadastro" onClick={() => setMenuOpen(false)}>Criar conta <ArrowUpRight size={18} aria-hidden="true" /></a></BrandButton>
        </div>
      </nav>}
  </>;
}
