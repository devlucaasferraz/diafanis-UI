import { useEffect, useRef } from 'react';

type OfficeFilmProps = {
  paused?: boolean;
  source?: 'legal-work' | 'office-work';
  variant?: 'framed' | 'wide';
};

export function OfficeFilm({ paused = false, source = 'legal-work', variant = 'framed' }: OfficeFilmProps) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false, disposed = false;
    const shouldPlay = () => !disposed && visible && !paused && !reduced.matches && !document.hidden;
    const sync = () => {
      if (!shouldPlay()) { video.pause(); return; }
      const src = `/media/${source}.mp4`;
      if (video.getAttribute('src') !== src) video.src = src;
      video.play().then(() => { if (!shouldPlay()) video.pause(); }).catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio > 0;
      sync();
    }, { threshold: 0, rootMargin: '0px' });
    observer.observe(video);
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      disposed = true;
      observer.disconnect();
      reduced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      video.pause();
    };
  }, [paused, source]);
  return <figure className={`lp-office-film lp-office-film--${variant}`} aria-hidden={variant === 'wide' ? true : undefined}>
    <div className="lp-film-frame"><video ref={ref} poster={`/media/${source}.jpg`} muted loop playsInline controls={false} disablePictureInPicture disableRemotePlayback preload="none" aria-label={variant === 'framed' ? (source === 'legal-work' ? 'Profissional revisando e assinando documentos' : 'Profissional trabalhando no computador') : undefined} /></div>
  </figure>;
}
