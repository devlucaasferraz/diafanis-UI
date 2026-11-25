import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OfficeFilm } from './OfficeFilm';

let notify: IntersectionObserverCallback;
let motionChange: () => void;
const preference = { matches: false, media: '(prefers-reduced-motion: reduce)', addEventListener: vi.fn(), removeEventListener: vi.fn() };
const disconnect = vi.fn();

function visibility(visible: boolean) {
  act(() => notify([{ isIntersecting: visible, intersectionRatio: visible ? 1 : 0 } as IntersectionObserverEntry], {} as IntersectionObserver));
}

beforeEach(() => {
  preference.matches = false;
  preference.addEventListener.mockImplementation((_name: string, listener: () => void) => { motionChange = listener; });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) { notify = callback; }
    observe() {}
    disconnect = disconnect;
  });
  vi.spyOn(window, 'matchMedia').mockReturnValue(preference as unknown as MediaQueryList);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.clearAllMocks(); delete (document as { hidden?: boolean }).hidden; });

describe('Reprodução automática dos vídeos', () => {
  it('só carrega e reproduz dentro da tela, pausando assim que sai', async () => {
    const { container } = render(<OfficeFilm />);
    const video = container.querySelector('video')!;
    expect(video.getAttribute('src')).toBeNull();
    expect(video.controls).toBe(false);
    expect(container.querySelector('button')).toBeNull();
    await act(async () => visibility(true));
    expect(video.getAttribute('src')).toBe('/media/legal-work.mp4');
    expect(video.play).toHaveBeenCalledOnce();
    visibility(false);
    expect(video.pause).toHaveBeenCalled();
  });
  it('pausa quando a página fica oculta e retoma apenas se ainda estiver na tela', async () => {
    const { container } = render(<OfficeFilm variant="wide" source="office-work" />);
    const video = container.querySelector('video')!;
    await act(async () => visibility(true));
    vi.mocked(video.play).mockClear();
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(video.pause).toHaveBeenCalled();
    visibility(false);
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(video.play).not.toHaveBeenCalled();
  });
  it('mantém o poster com movimento reduzido e reage à mudança da preferência', async () => {
    preference.matches = true;
    const { container } = render(<OfficeFilm />);
    const video = container.querySelector('video')!;
    visibility(true);
    expect(video.getAttribute('src')).toBeNull();
    expect(video.play).not.toHaveBeenCalled();
    preference.matches = false;
    await act(async () => motionChange());
    expect(video.play).toHaveBeenCalledOnce();
  });
  it('não deixa um início de reprodução atrasado tocar fora da tela', async () => {
    let resolvePlay: () => void = () => {};
    vi.mocked(HTMLMediaElement.prototype.play).mockImplementation(() => new Promise<void>(resolve => { resolvePlay = resolve; }));
    const { container, unmount } = render(<OfficeFilm />);
    const video = container.querySelector('video')!;
    visibility(true);
    visibility(false);
    vi.mocked(video.pause).mockClear();
    await act(async () => resolvePlay());
    expect(video.pause).toHaveBeenCalledOnce();
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
