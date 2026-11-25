import { useEffect, useRef, useState } from 'react';
import { SolutionScene } from './SolutionScene';
import { finalStoryStep, solutionChoreography, type SolutionId, type StoryPhase } from './solutionChoreography';
import './solutions.css';

const solutions = [
  { id: 'calendar', name: 'Calendário', title: 'Espaço para o que importa.', description: 'Prazos, audiências e compromissos. Toda a sua semana em perspectiva.' },
  { id: 'deadlines', name: 'Prazos', title: 'Nunca perca um compromisso.', description: 'Feriados e suspensões da comarca entram na conta. Você acompanha cada dia até o vencimento.' },
  { id: 'financial', name: 'Financeiro', title: 'Sem sustos no fim do mês.', description: 'Veja o que já entrou, o que falta receber e quais honorários precisam de atenção.' },
  { id: 'documents', name: 'Documentos', title: 'O bot organiza. Você conduz.', description: 'O bot recebe e organiza os documentos. Quando o cliente precisa, sua equipe assume pelo WhatsApp.' },
  { id: 'messages', name: 'Gestão de clientes', title: 'Presença nos momentos que importam.', description: 'Lembretes e mensagens para cada cliente. Use um modelo ou personalize antes de enviar pelo bot.' },
] as const;

function Demonstration({ id, paused }: { id: SolutionId; paused: boolean }) {
  const [story, setStory] = useState({ step: 0, cue: 0, phase: 'reading' as StoryPhase });
  const lastStep = finalStoryStep(id);
  const [exploring, setExploring] = useState(false);
  const storyPaused = paused || exploring;
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const remaining = useRef(1600);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (storyPaused || reduced || story.step === lastStep) return;
    const started = performance.now();
    let advanced = false;
    const timer = window.setTimeout(() => {
      advanced = true;
      if (story.phase === 'reading') {
        remaining.current = 650;
        setStory({ ...story, cue: story.step + 1, phase: 'moving' });
      } else if (story.phase === 'moving' && solutionChoreography[id][story.cue].gesture !== 'inspect') {
        remaining.current = 180;
        setStory({ ...story, phase: 'pressing' });
      } else {
        remaining.current = 2200;
        setStory({ step: story.cue, cue: story.cue, phase: 'reading' });
      }
    }, remaining.current);
    return () => {
      window.clearTimeout(timer);
      if (!advanced) remaining.current = Math.max(0, remaining.current - (performance.now() - started));
    };
  }, [storyPaused, reduced, story, lastStep, id]);
  return <SolutionScene id={id} step={reduced ? lastStep : story.step} cue={reduced ? lastStep : story.cue} phase={story.phase} reduced={reduced} paused={storyPaused || reduced} onInteractionChange={setExploring} />;
}

export function FeaturePreviews({ paused = false }: { paused?: boolean }) {
  const [active, setActive] = useState<SolutionId>('calendar');
  const [replay, setReplay] = useState(0);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(!document.hidden);
  const root = useRef<HTMLDivElement>(null);
  const selected = solutions.find(solution => solution.id === active)!;
  useEffect(() => {
    if (!root.current) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .15 });
    observer.observe(root.current);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);
  return <section id="sistema" className="landing-section solutions" aria-labelledby="system-heading">
    <h2 id="system-heading">Soluções para<br />o seu escritório.</h2>
    <div className="solutions-selector" role="group" aria-label="Escolha uma solução">
      {solutions.map(({ id, name }) => <button key={id} aria-pressed={active === id} onClick={() => { setActive(id); setReplay(value => value + 1); }}>{name}<span aria-hidden="true" /></button>)}
    </div>
    <div className="solutions-presentation" ref={root}>
      <div className="solutions-copy" key={active}><h3>{selected.title}</h3><p>{selected.description}</p></div>
      <Demonstration key={`${active}-${replay}`} id={active} paused={paused || !visible || !tabVisible} />
    </div>
  </section>;
}
