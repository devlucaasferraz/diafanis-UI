import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import {
  IoArrowDownOutline,
  IoArrowForwardOutline,
  IoChatbubblesOutline,
  IoDiscOutline,
  IoMailOutline,
  IoOptionsOutline,
  IoPrismOutline,
} from 'react-icons/io5';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AnimatedContent from './reactbits/AnimatedContent';
import SideRays from './reactbits/SideRays';
import { LandingHeader } from '@/features/landing/LandingHeader';
import { LandingFooter } from '@/features/landing/LandingFooter';
import { BrandButton } from '@/features/ui/brand-button';
import { placeholderEmail } from '@/features/landing/LandingContact';
import { team, type TeamMember } from './team';
import '../landing/landing.css';
import './about.css';

gsap.registerPlugin(ScrollTrigger);

const pillars = [
  {
    title: 'Direito',
    description: 'Nascido da prática jurídica real — no rigor dos prazos, dos atos e da estratégia.',
    artwork: '/media/pillar-doric.png',
  },
  {
    title: 'Interações humanas',
    description: 'Presença real para quem confia no escritório.',
    artwork: '/media/pillar-corinthian.png',
  },
  {
    title: 'Engenharia de Software',
    description: 'Arquitetura sólida, rápida e confiável — sustentando a operação de forma invisível.',
    artwork: '/media/pillar-ionic.png',
  },
] as const;

const values = [
  {
    id: 'clareza',
    icon: IoPrismOutline,
    title: 'Clareza',
    description: 'Deixe a complexidade com a gente. Na tela, só o que ajuda a decidir.',
  },
  {
    id: 'precisao',
    icon: IoDiscOutline,
    title: 'Precisão',
    description: 'Na advocacia, um dia muda tudo. Sem margem para erro ou improviso.',
  },
  {
    id: 'criterio',
    icon: IoOptionsOutline,
    title: 'Critério',
    description: 'O operacional fica com o sistema. As decisões e o cliente, com você.',
  },
  {
    id: 'escuta',
    icon: IoChatbubblesOutline,
    title: 'Escuta',
    description: 'Não construímos por suposição. Ouvimos o escritório antes de escrever código.',
  },
] as const;

function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0]?.[0]?.toUpperCase() ?? '';
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function Portrait({ member }: { member: TeamMember }) {
  const [failed, setFailed] = useState(false);
  const initials = getInitials(member.name);

  return (
    <div className="about-portrait">
      {member.photo && !failed ? (
        <img
          src={member.photo}
          alt={`Retrato de ${member.name}`}
          loading="lazy"
          width="360"
          height="360"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="about-portrait-placeholder">
          <span aria-hidden="true">{initials}</span>
        </div>
      )}
    </div>
  );
}

function Reveal({
  children,
  className,
  intro = false,
  delay = 0,
  reduced,
}: {
  children: ReactNode;
  className?: string;
  intro?: boolean;
  delay?: number;
  reduced: boolean;
}) {
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <AnimatedContent
      className={className}
      distance={intro ? 20 : 26}
      duration={intro ? 0.9 : 0.75}
      delay={delay}
      ease="power3.out"
      trigger={intro ? 'mount' : 'scroll'}
      threshold={0.08}
      once
    >
      {children}
    </AnimatedContent>
  );
}

function TeamCard({
  member,
  index,
  selected,
  dimmed,
  reduced,
  onSelect,
}: {
  member: TeamMember;
  index: number;
  selected: boolean;
  dimmed: boolean;
  reduced: boolean;
  onSelect: () => void;
}) {
  const [spot, setSpot] = useState({ x: 32, y: 24 });

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    setSpot({ x, y });
  };

  return (
    <Reveal reduced={reduced} delay={index * 0.08} className="about-member-slot">
      <article
        className={`about-member${selected ? ' is-selected' : ''}${dimmed ? ' is-dimmed' : ''}`}
        style={{ '--mx': `${spot.x}%`, '--my': `${spot.y}%` } as CSSProperties}
        onPointerMove={handlePointerMove}
        onClick={onSelect}
      >
        <Portrait member={member} />
        <h3>{member.name}</h3>
        <p className="about-member-role">{member.role}</p>
        <p className="about-member-qualification">{member.qualification}</p>
        {member.bio && <p className="about-member-bio">{member.bio}</p>}
      </article>
    </Reveal>
  );
}

export function AboutPage() {
  const reduced = useReducedMotionPreference();
  const [activeValueIndex, setActiveValueIndex] = useState(0);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const raysLayerRef = useRef<HTMLDivElement>(null);
  const activeValue = values[activeValueIndex];

  useEffect(() => {
    const title = document.title;
    document.title = 'Sobre nós — Diafanís';
    return () => {
      document.title = title;
    };
  }, []);

  useLayoutEffect(() => {
    if (reduced || !heroRef.current || !raysLayerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(raysLayerRef.current, {
        y: -36,
        scale: 1.05,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.7,
        },
      });
    }, heroRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div className="diafanis-landing">
      <a className="landing-skip" href="#about-content">
        Ir para o conteúdo
      </a>
      <LandingHeader current="/sobre-nos" />
      <main id="about-content" className="about-page">
        <section id="inicio" ref={heroRef} className="about-hero" aria-labelledby="about-title">
          <div className="about-hero-visual" aria-hidden="true">
            <div ref={raysLayerRef} className="about-hero-rays">
              <SideRays
                origin="top-right"
                rayColor1="#e4effa"
                rayColor2="#4b80b0"
                blend={0.55}
                speed={reduced ? 0 : 0.55}
                intensity={1.75}
                spread={1.35}
                density={4.6}
                sharpness={0.68}
                falloff={1.45}
                glow={0.9}
                dust={0.14}
                followMouse={!reduced}
                mouseInfluence={0.18}
                mouseSpeed={0.35}
                intro={!reduced}
              />
            </div>
          </div>
          <div className="about-hero-veil" aria-hidden="true" />

          <Reveal intro reduced={reduced} className="about-hero-layout">
            <h1 id="about-title">
              Feito para a rotina
              <br />
              de quem advoga.
            </h1>
            <div className="about-hero-aside">
              <p className="about-lead">
                O Diafanís existe para tirar o ruído da gestão. Menos tempo operando ferramentas. Mais foco no escritório e nos clientes.
              </p>
              <a className="about-hero-link" href="#equipe">
                <span>Conheça a equipe</span>
                <IoArrowDownOutline size={18} aria-hidden="true" focusable="false" />
              </a>
            </div>
          </Reveal>
        </section>

        <section id="pilares" className="about-pillars-section about-section" aria-labelledby="pillars-title">
          <Reveal reduced={reduced} className="about-section-head">
            <h2 id="pillars-title">Nossos pilares.</h2>
            <p>As três bases que sustentam o Diafanís.</p>
          </Reveal>

          <Reveal reduced={reduced}>
            <ul className="about-pillars" aria-label="Pilares do Diafanís">
              {pillars.map(pillar => (
                <li className="about-pillar" key={pillar.title}>
                  <div className="about-pillar-visual" aria-hidden="true">
                    <img src={pillar.artwork} alt="" loading="lazy" width="460" height="700" />
                  </div>
                  <div className="about-pillar-copy">
                    <h3>{pillar.title}</h3>
                    <p>{pillar.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        <section id="valores" className="about-values about-section" aria-labelledby="values-title">
          <Reveal reduced={reduced} className="about-section-head">
            <h2 id="values-title">Nossos valores.</h2>
          </Reveal>

          <div className="about-values-stage">
            <div className="about-values-selector" role="tablist" aria-label="Escolha um valor">
              {values.map(({ id, icon: Icon, title }, index) => {
                const selected = index === activeValueIndex;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    id={`value-tab-${id}`}
                    aria-selected={selected}
                    aria-controls={`value-panel-${id}`}
                    className={`about-value-tab${selected ? ' is-active' : ''}`}
                    onClick={() => setActiveValueIndex(index)}
                    onMouseEnter={() => setActiveValueIndex(index)}
                  >
                    <span className="about-value-tab-icon" aria-hidden="true">
                      <Icon size={24} focusable="false" />
                    </span>
                    <span className="about-value-tab-label">{title}</span>
                  </button>
                );
              })}
            </div>

            <div
              key={activeValue.id}
              role="tabpanel"
              id={`value-panel-${activeValue.id}`}
              aria-labelledby={`value-tab-${activeValue.id}`}
              className="about-value-panel"
            >
              <p>{activeValue.description}</p>
            </div>
          </div>
        </section>

        <section id="equipe" className="about-team about-section" aria-labelledby="team-title">
          <Reveal reduced={reduced} className="about-section-head">
            <h2 id="team-title">Nossa equipe.</h2>
          </Reveal>

          <div className="about-team-grid">
            {team.map((member, index) => (
              <TeamCard
                key={member.name}
                member={member}
                index={index}
                selected={selectedMember === member.name}
                dimmed={selectedMember !== null && selectedMember !== member.name}
                reduced={reduced}
                onSelect={() => setSelectedMember(current => (current === member.name ? null : member.name))}
              />
            ))}
          </div>
        </section>

        <section id="contato" className="about-contact about-section" aria-labelledby="about-contact-title">
          <Reveal reduced={reduced} className="about-contact-inner">
            <div className="about-contact-copy">
              <h2 id="about-contact-title">
                Queremos ouvir
                <br />o seu escritório.
              </h2>
            </div>
            <div className="about-contact-action">
              <p>
                Cada escritório tem seu ritmo. Conte como funciona o seu.
              </p>
              <div className="about-contact-buttons">
                <BrandButton asChild surface="glass" className="about-contact-cta">
                  <a href="/#contato">
                    <span>Conversar com a equipe</span>
                    <IoArrowForwardOutline size={18} aria-hidden="true" focusable="false" />
                  </a>
                </BrandButton>
                <a className="about-contact-email" href={`mailto:${placeholderEmail}`}>
                  <IoMailOutline size={18} aria-hidden="true" focusable="false" />
                  <span>{placeholderEmail}</span>
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
