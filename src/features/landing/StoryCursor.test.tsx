import { act, cleanup, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { StoryCursor } from './StoryCursor';

function Harness() {
  const root = useRef<HTMLDivElement>(null);
  return <div ref={root} className="solution-demo"><div className="demo-appointment hearing" /><StoryCursor root={root} id="calendar" cue={1} step={0} phase="moving" /></div>;
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('mantém a ponta do cursor dentro do alvo quando o layout muda de tamanho', () => {
  const frame = { left: 100, top: 200, width: 1000, height: 520 };
  let target = { left: 300, top: 350, width: 200, height: 80 };
  const rectangle = (rect: typeof frame) => ({ ...rect, right: rect.left + rect.width, bottom: rect.top + rect.height, x: rect.left, y: rect.top, toJSON: () => rect });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return rectangle(this.classList.contains('solution-demo') ? frame : target);
  });
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(1000);
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(998);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(518);
  const { container } = render(<Harness />);
  const cursor = container.querySelector<HTMLElement>('.story-cursor')!;
  const expectOnTarget = () => {
    const numbers = cursor.style.transform.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
    const point = { x: frame.left + numbers[0], y: frame.top + numbers[1] };
    expect(point.x).toBeGreaterThanOrEqual(target.left);
    expect(point.x).toBeLessThanOrEqual(target.left + target.width);
    expect(point.y).toBeGreaterThanOrEqual(target.top);
    expect(point.y).toBeLessThanOrEqual(target.top + target.height);
  };
  expectOnTarget();
  const previous = cursor.style.transform;
  target = { left: 650, top: 500, width: 100, height: 240 };
  act(() => window.dispatchEvent(new Event('resize')));
  expectOnTarget();
  expect(cursor.style.transform).not.toBe(previous);
});
