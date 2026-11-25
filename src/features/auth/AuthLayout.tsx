import { BrandMark } from '@/features/ui/brand-mark';
import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import Prism from '@/features/landing/reactbits/Prism';
import './auth.css';

export function AuthLayout({ children, headerAction, hideHeader = false }: { children: ReactNode; headerAction?: ReactNode; hideHeader?: boolean }) {
  return <main className="auth-page">
    <div className="auth-shell">
      <aside className="auth-art" aria-label="Diafanís, gestão para advocacia">
        <Link to="/" className="auth-brand" aria-label="Diafanís, início"><BrandMark className="auth-brand-prism" /><span className="auth-brand-copy"><span>diafanís</span><span className="auth-brand-description">Gestão para advocacia</span></span></Link>
        <div className="auth-prism" aria-hidden="true"><Prism animationType="3drotate" height={3.5} baseWidth={5.5} scale={3.8} interactive={false} intro={false} offset={{ x: 40, y: -60 }} timeScale={0.12} glow={0.8} saturation={0.8} colorFrequency={1} noise={0} resolution={0.5} dpr={1.5} /></div>
        <div className="auth-art-copy"><p>Clareza em<br />cada detalhe.</p></div>
      </aside>
      <section className="auth-panel" aria-label="Acesso ao Diafanís">
        {!hideHeader && <div className="auth-topbar"><Link to="/" className="auth-back"><ArrowLeft size={16} aria-hidden="true" /> Voltar ao site</Link>{headerAction}</div>}
        <div className="auth-content">{children}</div>
      </section>
    </div>
  </main>;
}
