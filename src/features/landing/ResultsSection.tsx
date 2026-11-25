import { useEffect, useRef, useState } from 'react';
import { SectionHeading } from './SectionHeading';

const numbers = [
  { value: 20, suffix: '', label: 'Escritórios' },
  { value: 200, suffix: '', label: 'Profissionais' },
  { value: 10, suffix: 'mil', label: 'Mensagens preparadas' },
];

function AnimatedNumber({ value, suffix, paused, delay }: { value: number; suffix: string; paused: boolean; delay: number }) {
  const ref = useRef<HTMLElement>(null);
  const [display, setDisplay] = useState(0);
  const completed = useRef(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, started = false, start = 0;
    const finish = () => { cancelAnimationFrame(frame); completed.current = true; setDisplay(value); };
    const tick = (time: number) => {
      if (!start) start = time;
      const progress = Math.max(0, Math.min((time - start - delay) / 1600, 1));
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else completed.current = true;
    };
    const preferenceChanged = () => { if (reduced.matches) finish(); };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      observer.disconnect();
      if (paused || reduced.matches || completed.current) finish();
      else frame = requestAnimationFrame(tick);
    }, { threshold: .5 });
    observer.observe(element);
    if (paused || reduced.matches || completed.current) finish();
    reduced.addEventListener('change', preferenceChanged);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); reduced.removeEventListener('change', preferenceChanged); };
  }, [value, paused, delay]);
  return <strong ref={ref} className="lp-number-value" aria-label={`+${value}${suffix}`}><span aria-hidden="true">+{display}{suffix}</span></strong>;
}

export function ResultsSection({ paused = false }: { paused?: boolean }) {
  return <section id="resultados" className="lp-results lp-numbers landing-section" aria-labelledby="results-heading">
    <SectionHeading id="results-heading" title="Diafanís em números." />
    <div className="lp-numbers-composition">
      <div className="lp-number-lead">
        <div className="lp-number-flow" aria-hidden="true"><span /><span /><span /></div>
        <div className="lp-number-lead-content">
          <AnimatedNumber value={5} suffix="mil" paused={paused} delay={0} />
          <h3>Compromissos acompanhados</h3>
        </div>

      </div>
      <div className="lp-number-supporting">
        {numbers.map(({ value, suffix, label }, index) => <div className="lp-number-row" key={label}>
          <AnimatedNumber value={value} suffix={suffix} paused={paused} delay={(index + 1) * 120} />
          <h3>{label}</h3>
        </div>)}
      </div>
    </div>
  </section>;
}
