import { useEffect, useRef, useState, type RefObject } from 'react';
import { MousePointer2, TextCursor } from 'lucide-react';
import { finalStoryStep, solutionChoreography, type SolutionId, type StoryPhase } from './solutionChoreography';

type Props = { root: RefObject<HTMLDivElement>; id: SolutionId; cue: number; step: number; phase: StoryPhase; reduced?: boolean };
export function StoryCursor({ root, id, cue, step, phase, reduced }: Props) {
  const [position, setPosition] = useState({ x: 35, y: 40, visible: false, target: '' });
  const lastTarget = useRef<HTMLElement | null>(null);
  const action = solutionChoreography[id][cue];
  const typing = action.gesture === 'type' || id === 'documents' && step === finalStoryStep('documents');
  useEffect(() => {
    const frame = root.current;
    if (!frame || reduced) return;
    const update = () => {
      const bounds = frame.getBoundingClientRect();
      if (!bounds.width || !frame.clientWidth) return;
      const scale = bounds.width / frame.offsetWidth;
      const targets = action.target.split(',').flatMap(selector => [...frame.querySelectorAll<HTMLElement>(selector.trim())]);
      const target = targets.find(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.left < bounds.right && rect.right > bounds.left && rect.top < bounds.bottom && rect.bottom > bounds.top;
      });
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const left = Math.max(rect.left, bounds.left);
      const right = Math.min(rect.right, bounds.right);
      const top = Math.max(rect.top, bounds.top);
      const bottom = Math.min(rect.bottom, bounds.bottom);
      lastTarget.current?.classList.remove('story-target');
      target.classList.toggle('story-target', phase === 'pressing');
      lastTarget.current = target;
      setPosition({
        x: Math.max(12, Math.min(frame.clientWidth - 26, (left - bounds.left + (right - left) * .62) / scale)),
        y: Math.max(12, Math.min(frame.clientHeight - 30, (top - bounds.top + (bottom - top) * .55) / scale)),
        visible: true,
        target: target.getAttribute('class') || '',
      });
    };
    update();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(frame);
    window.addEventListener('resize', update);
    return () => { observer?.disconnect(); window.removeEventListener('resize', update); lastTarget.current?.classList.remove('story-target'); };
  }, [root, action.target, phase, step, reduced]);
  if (reduced) return null;
  return <span className={`story-cursor${phase === 'pressing' ? ' pressing' : ''}`} data-target={position.target} data-gesture={typing ? 'type' : action.gesture} aria-hidden="true" style={{ transform: `translate(${position.x}px,${position.y}px)`, opacity: position.visible ? 1 : 0 }}>
    <span className="story-cursor-glyph">{typing && phase !== 'moving' ? <TextCursor size={23} /> : <MousePointer2 size={23} fill="#fff" stroke="#171717" strokeWidth={1.4} />}</span>
    {phase === 'pressing' && action.gesture === 'click' && <span className="story-cursor-ring" key={`${id}-${cue}`} />}
  </span>;
}
