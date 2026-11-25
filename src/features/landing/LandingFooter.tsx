import { BrandMark } from '@/features/ui/brand-mark';
export function LandingFooter({ home = false }: { home?: boolean }) {
  return (
      <footer className="lp-footer">
        <div className="lp-footer-main">
          <div className="lp-footer-identity">
            <a className="landing-brand" href={home ? '#inicio' : '/#inicio'} aria-label="Diafanís, início"><BrandMark className="landing-prism" /><span>diafanís</span></a>
            <p>© {new Date().getFullYear()} Diafanís</p>
          </div>
          <nav className="lp-footer-column" aria-label="Institucional">
            <h3>Conheça</h3>
            <a href="/sobre-nos">Sobre nós</a>
            <a href={home ? '#sistema' : '/#sistema'}>Soluções</a>
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
  );
}
