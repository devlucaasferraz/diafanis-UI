import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string };
export function AuthField({ label, error, hint, id, type = 'text', ...props }: FieldProps) {
  const [visible, setVisible] = useState(false);
  const password = type === 'password';
  return <div className="auth-field">
    <label htmlFor={id}>{label}</label>
    <div className="auth-input-wrap">
      <input {...props} id={id} type={password && visible ? 'text' : type} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} />
      {password && <button type="button" className="auth-eye" onClick={() => setVisible(!visible)} aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`} aria-pressed={visible}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
    </div>
    {error ? <p id={`${id}-error`} className="auth-error" role="alert">{error}</p> : hint ? <p id={`${id}-hint`} className="auth-hint">{hint}</p> : null}
  </div>;
}
