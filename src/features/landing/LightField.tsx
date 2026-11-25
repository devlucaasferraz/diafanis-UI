import { useEffect, useRef } from 'react';

export function LightField({ variant = 'hero' }: { variant?: 'hero' | 'ribbon' }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, frame = 0, visible = true, last = 0;
    const pointer = { x: 0, y: 0 };
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (motion.matches) draw(0);
    });
    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const t = motion.matches ? 0 : time * 0.00012;
      const cx = width * .56 + pointer.x * 14;
      const cy = height * .45 + pointer.y * 10;
      ctx.globalCompositeOperation = 'screen';
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * .55);
      halo.addColorStop(0, 'rgba(13,63,84,.28)'); halo.addColorStop(.4, 'rgba(8,24,44,.18)'); halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo; ctx.fillRect(0, 0, width, height);
      const count = width < 600 ? 70 : 120;
      for (let line = 0; line < count; line++) {
        const n = line / count;
        ctx.beginPath();
        for (let step = 0; step <= 110; step++) {
          const u = step / 110;
          let x, y;
          if (variant === 'hero') {
            const angle = u * Math.PI * 2;
            const radius = Math.min(width * .35, height * .46) * (.28 + n * .85);
            const fold = Math.sin(angle * 3 + t * 1.4 + n * 3) * 28;
            x = cx + Math.cos(angle + t * .13) * (radius + fold) * 1.6;
            y = cy + Math.sin(angle) * (radius + fold) * .53 + Math.sin(angle * 2 + t + n * 5) * 45;
            y += (x - cx) * -.26;
          } else {
            x = u * width;
            y = height * .5 + Math.sin(u * 6 + t + n * 2) * height * .21 + Math.cos(u * 10 - t * .7) * 25 + (n - .5) * height * .4;
          }
          if (step === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        const bright = Math.pow(Math.sin(n * Math.PI), 6);
        ctx.strokeStyle = `rgba(${100 + Math.round(n * 80)},${165 + Math.round(n * 45)},${200 + Math.round(n * 45)},${.045 + bright * .21})`;
        ctx.lineWidth = line % 13 === 0 ? 1.3 : .55;
        ctx.stroke();
      }
      for (let i = 0; i < 70; i++) {
        const x = ((Math.sin(i * 127.1) * 43758.5453 % 1 + 1) % 1 * width + t * (i % 3 + 1) * 3) % width;
        const y = (Math.cos(i * 311.7) * 19642.349 % 1 + 1) % 1 * height;
        ctx.fillStyle = `rgba(204,224,237,${.12 + (Math.sin(t * 2 + i) + 1) * .12})`;
        ctx.fillRect(x, y, i % 7 === 0 ? 1.8 : .8, i % 7 === 0 ? 1.8 : .8);
      }
      ctx.globalCompositeOperation = 'source-over';
    };
    const loop = (time: number) => {
      if (visible && !document.hidden && time - last > 32) { draw(time); last = time; }
      if (!motion.matches) frame = requestAnimationFrame(loop);
    };
    const start = () => { cancelAnimationFrame(frame); draw(0); if (!motion.matches) frame = requestAnimationFrame(loop); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    const move = (e: PointerEvent) => { pointer.x = e.clientX / window.innerWidth - .5; pointer.y = e.clientY / window.innerHeight - .5; };
    resize.observe(canvas); observer.observe(canvas); window.addEventListener('pointermove', move, { passive: true }); motion.addEventListener('change', start); start();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); window.removeEventListener('pointermove', move); motion.removeEventListener('change', start); };
  }, [variant]);
  return <canvas ref={ref} className="landing-lightfield" aria-hidden="true" />;
}
