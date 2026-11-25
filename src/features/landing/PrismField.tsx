import { useEffect, useState } from 'react';
import Prism from './reactbits/Prism';

export function PrismField() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 600px)').matches);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 600px)');
    const update = () => setMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return (
    <div className="landing-lightfield landing-prism-field" aria-hidden="true">
      <Prism
        animationType="3drotate"
        height={3.5}
        baseWidth={5.5}
        scale={mobile ? 2.8 : 3.8}
        offset={{ x: mobile ? 30 : 140, y: mobile ? -120 : -80 }}
        timeScale={0.12}
        glow={0.8}
        saturation={0.8}
        colorFrequency={1}
        noise={0}
        interactive
        hoverStrength={1.5}
        inertia={0.025}
        resolution={0.5}
        dpr={1.5}
      />
    </div>
  );
}
