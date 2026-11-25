import type { ReactNode } from 'react';

export function SectionHeading({ id, title, description }: { id: string; title: ReactNode; description?: string }) {
  return <header className="lp-section-heading" data-reveal><h2 id={id}>{title}</h2>{description && <p>{description}</p>}</header>;
}
