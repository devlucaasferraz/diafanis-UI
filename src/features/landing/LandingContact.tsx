import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Mail, Phone, Check, X } from 'lucide-react';
import { BrandButton } from '@/features/ui/brand-button';
import { SectionHeading } from './SectionHeading';
import { OfficeFilm } from './OfficeFilm';

export const placeholderEmail = 'diafanis.contato@outlook.com';
export const contactPhone = { label: '(74) 90000-0000', href: 'tel:+5574900000000' };

export function LandingContact({ paused = false }: { paused?: boolean }) {
  const [preview, setPreview] = useState<{ name: string; email: string; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const prepare = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setPreview({ name: String(fields.get('name')).trim(), email: String(fields.get('email')).trim(), message: String(fields.get('message')).trim() });
    setCopied(false); setCopyError(false);
  };
  const copy = async () => {
    if (!preview) return;
    try { await navigator.clipboard.writeText(`Nome: ${preview.name}\nE-mail: ${preview.email}\n\n${preview.message}`); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  };
  return <section id="contato" className="lp-contact lp-contact--wide landing-section" aria-labelledby="contact-heading"><OfficeFilm paused={paused} source="office-work" variant="wide" /><SectionHeading id="contact-heading" title="Converse com a equipe." description="Conte o que seu escritório precisa." /><div className="lp-contact-intro" data-reveal><div className="lp-contact-channels"><a className="lp-contact-address" href={`mailto:${placeholderEmail}`}><Mail size={20} aria-hidden="true" /><span>{placeholderEmail}</span></a><a className="lp-contact-address" href={contactPhone.href}><Phone size={20} aria-hidden="true" /><span>{contactPhone.label}</span></a></div></div><div className="lp-contact-form-area" data-reveal><form onSubmit={prepare} className="lp-contact-form"><label htmlFor="contact-name">Seu nome<input id="contact-name" name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Como podemos chamar você?" /></label><label htmlFor="contact-email">E-mail<input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="voce@escritorio.com.br" /></label><label htmlFor="contact-message">Sua mensagem<textarea id="contact-message" name="message" required minLength={10} maxLength={3000} rows={4} placeholder="Conte um pouco sobre o seu escritório." /></label><div className="lp-contact-submit"><p>Prévia da mensagem, sem envio.</p><BrandButton type="submit" shape="rectangular" surface="glass" className="lp-contact-button"><span>Enviar mensagem</span><ArrowUpRight size={20} aria-hidden="true" /></BrandButton></div></form>{preview && <div className="lp-contact-confirmation" role="region" aria-label="Prévia da mensagem"><div><strong>Prévia da mensagem</strong><button aria-label="Fechar prévia da mensagem" onClick={() => setPreview(null)}><X size={18} /></button></div><p><strong>{preview.name}</strong><small>{preview.email}</small></p><p className="lp-contact-message">{preview.message}</p><div><span role="status">{copyError ? 'Selecione o texto acima para copiar.' : copied ? 'Mensagem copiada.' : 'Rascunho local, sem envio.'}</span><button onClick={copy}>{copied ? <Check size={15} /> : null}{copied ? 'Copiado' : 'Copiar texto'}</button></div></div>}</div></section>;
}
