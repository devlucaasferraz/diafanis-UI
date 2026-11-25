import { useEffect, useRef } from 'react';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { IoArrowForwardOutline } from 'react-icons/io5';
import { BrandButton } from '@/features/ui/brand-button';
import { PrismField } from './PrismField';
import { FeaturePreviews } from './FeaturePreviews';
import { LandingContact } from './LandingContact';
import { ResultsSection } from './ResultsSection';
import './landing.css';

export function LandingPage() {
  const paused = false;
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, { threshold: .12 });
    root.current?.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (
    <div className={`diafanis-landing${paused ? ' motion-paused' : ''}`} ref={root}>
      <a className="landing-skip" href="#resultados">Ir para o conteúdo</a>
      <LandingHeader home />
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
            <BrandButton asChild className="lp-trial-primary"><a href="/cadastro">Começar meu teste <IoArrowForwardOutline size={20} aria-hidden="true" focusable="false" /></a></BrandButton>
          </div>
        </section>
        <LandingContact paused={paused} />
      </main>
      <LandingFooter home />
    </div>
  );
}
