import { useRef, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { BrandButton } from '@/features/ui/brand-button';
import { AuthResult } from './AuthResult';
import { AuthLayout } from './AuthLayout';
import { PinInput } from './PinInput';
import { AuthField } from './AuthFields';
import { pinSchema, recoverySchema, resetSchema } from './validation';

type Step = 'email' | 'sent' | 'pin' | 'password' | 'complete';
const DEMO_PIN = '123456';

export function PasswordRecovery() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resent, setResent] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const changeStep = (next: Step) => {
    setErrors({});
    setStep(next);
    requestAnimationFrame(() => next === 'pin' ? document.getElementById('pin-0')?.focus() : heading.current?.focus());
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const schema = step === 'email' ? recoverySchema : step === 'pin' ? pinSchema : resetSchema;
    const result = schema.safeParse(values);
    const showErrors = (next: Record<string, string>) => {
      setErrors(next);
      if (next.pin) document.getElementById('pin-0')?.focus();
      else (form.elements.namedItem(Object.keys(next)[0]) as HTMLInputElement | null)?.focus();
    };
    if (!result.success) {
      const next: Record<string, string> = {};
      result.error.issues.forEach(issue => { const field = String(issue.path[0]); if (!next[field]) next[field] = issue.message; });
      showErrors(next);
      return;
    }
    if (step === 'pin' && values.pin !== DEMO_PIN) {
      showErrors({ pin: 'Código inválido. Confira os 6 dígitos.' });
      return;
    }
    if (step === 'email') { setEmail(String(values.email).trim()); setResent(false); }
    form.reset();
    changeStep(step === 'email' ? 'sent' : step === 'pin' ? 'password' : 'complete');
  };

  return <AuthLayout hideHeader={step === 'sent' || step === 'complete'}>
    {step === 'sent' ? <AuthResult title="Confira seu e-mail." headingRef={heading}>
      <p>Se houver uma conta com este e-mail, você receberá um código de recuperação.</p>
      <BrandButton shape="rectangular" className="auth-primary" onClick={() => changeStep('pin')}>Inserir código</BrandButton>
      <button className="auth-text-button" type="button" onClick={() => changeStep('email')}>Usar outro e-mail</button>
    </AuthResult> : step === 'complete' ? <AuthResult title="Tudo pronto." headingRef={heading}>
      <BrandButton asChild shape="rectangular" className="auth-primary"><Link to="/login">Ir para o login</Link></BrandButton>
    </AuthResult> : <div className={step === 'pin' ? 'auth-recovery-pin' : undefined}>
      <header className="auth-heading"><h1 ref={heading} tabIndex={-1}>{step === 'email' ? 'Esqueceu sua senha?' : step === 'pin' ? 'Digite o código.' : 'Redefinir senha.'}</h1><p>{step === 'email' ? 'Informe seu e-mail para recuperar o acesso.' : step === 'pin' ? email : 'Escolha sua nova senha.'}</p></header>
      <form key={step} onSubmit={submit} noValidate className="auth-form">
        {step === 'email' ? <AuthField id="recovery-email" name="email" type="email" label="E-mail" defaultValue={email} autoComplete="email" placeholder="voce@escritorio.com.br" maxLength={254} required error={errors.email} /> : step === 'pin' ? <PinInput error={errors.pin} /> : <>
          <AuthField id="recovery-password" name="password" type="password" label="Nova senha" autoComplete="new-password" required error={errors.password} hint="Pelo menos 8 caracteres, com letra e número." />
          <AuthField id="recovery-confirm" name="confirmPassword" type="password" label="Confirmar senha" autoComplete="new-password" required error={errors.confirmPassword} />
        </>}
        <BrandButton type="submit" shape="rectangular" fullWidth className="auth-primary">{step === 'email' ? 'Recuperar acesso' : step === 'pin' ? 'Verificar código' : 'Salvar nova senha'}</BrandButton>
      </form>
      {step === 'pin' ? <>
        <div className="auth-pin-resend"><span>Não recebeu?</span><button type="button" onClick={() => { setResent(true); setErrors({}); }}>Reenviar código</button></div>
        {resent && <p role="status" className="auth-resend-status">Se houver uma conta com este e-mail, você receberá um novo código.</p>}
        <button type="button" className="auth-text-button" onClick={() => { setResent(false); changeStep('email'); }}><ArrowLeft size={16} aria-hidden="true" />Alterar e-mail</button>
      </> : <Link to="/login" className="auth-text-button"><ArrowLeft size={16} aria-hidden="true" />Voltar para o login</Link>}
    </div>}
  </AuthLayout>;
}
