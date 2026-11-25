import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Check, Mail } from 'lucide-react';
import { BrandButton } from '@/features/ui/brand-button';
import { AuthLayout } from './AuthLayout';
import { AuthField } from './AuthFields';
import { SocialLogin, type SocialProvider } from './SocialLogin';
import { loginSchema, signupSchema, recoverySchema, resetSchema } from './validation';

export type AuthMode = 'login' | 'signup' | 'recovery' | 'reset';
const copy = {
  login: { title: 'Bom ter você de volta.', description: 'Entre na sua conta para continuar.', action: 'Entrar' },
  signup: { title: 'Seu próximo passo.', description: 'Crie sua conta no Diafanís.', action: 'Criar conta' },
  recovery: { title: 'Esqueceu sua senha?', description: 'Informe seu e-mail para recuperar o acesso.', action: 'Recuperar acesso' },
  reset: { title: 'Uma nova senha.', description: 'Escolha uma senha para voltar à sua conta.', action: 'Salvar nova senha' },
};

export function AuthPage({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [emailStep, setEmailStep] = useState(false);
  const [email, setEmail] = useState('');
  const [provider, setProvider] = useState<SocialProvider | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const isAccess = mode === 'login' || mode === 'signup';
  const hasPassword = mode !== 'recovery';
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const schema = { login: loginSchema, signup: signupSchema, recovery: recoverySchema, reset: resetSchema }[mode];
    const result = schema.safeParse(values);
    if (!result.success) {
      const next: Record<string, string> = {};
      result.error.issues.forEach(issue => { const field = String(issue.path[0]); if (!next[field]) next[field] = issue.message; });
      setErrors(next);
      (form.elements.namedItem(Object.keys(next)[0]) as HTMLInputElement | null)?.focus();
      return;
    }
    setErrors({});
    setEmail(String(values.email ?? '').trim());
    form.reset();
    if (mode === 'login') { void navigate({ to: '/dashboard' }); return; }
    setDone(true);
    requestAnimationFrame(() => heading.current?.focus());
  };
  const selectProvider = (value: SocialProvider) => {
    formRef.current?.reset();
    setErrors({});
    setProvider(value);
    requestAnimationFrame(() => heading.current?.focus());
  };

  const accessSwitch = isAccess ? <p className="auth-switch">{mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'} <Link to={mode === 'login' ? '/cadastro' : '/login'}>{mode === 'login' ? 'Criar conta' : 'Entrar'}</Link></p> : undefined;
  const chooseEmail = () => {
    setEmailStep(true);
    requestAnimationFrame(() => document.getElementById(mode === 'signup' ? 'auth-name' : 'auth-email')?.focus());
  };
  return <AuthLayout headerAction={accessSwitch} hideHeader={done && mode === 'signup'}>
    {provider ? <div className="auth-result">
      <h1 ref={heading} tabIndex={-1}>Continuar com {provider}.</h1>
      <p>A conexão com {provider === 'Microsoft' ? 'sua conta Microsoft ou Outlook' : `sua conta ${provider}`} estará disponível com a integração de acesso.</p>
      <p className="auth-hint">Você pode explorar o ambiente de demonstração agora, sem conectar sua conta.</p>
      <BrandButton shape="rectangular" asChild fullWidth className="auth-primary"><Link to="/dashboard">Explorar demonstração</Link></BrandButton>
      <button type="button" className="auth-text-button" onClick={() => setProvider(null)}><ArrowLeft size={16} aria-hidden="true" />Voltar ao formulário</button>
    </div> : done ? <div className={`auth-result${mode === 'signup' ? ' auth-result--signup' : ''}`}>
      <span className="auth-result-icon" aria-hidden="true">{mode === 'recovery' ? <Mail size={26} /> : <Check size={26} />}</span>
      <h1 ref={heading} tabIndex={-1}>{mode === 'signup' ? 'Tudo pronto.' : mode === 'recovery' ? 'Confira seu e-mail.' : 'Senha atualizada na prévia.'}</h1>
      <p>{mode === 'signup' ? 'Cadastro validado. Continue para explorar a demonstração do Diafanís.' : mode === 'recovery' ? <>Na versão conectada, as instruções de recuperação serão enviadas para <strong>{email}</strong>.</> : 'Você concluiu a demonstração de recuperação. Volte para a tela de login para continuar.'}</p>
      {mode === 'recovery' ? <>
        <p className="auth-hint">Nenhum e-mail foi enviado nesta prévia.</p>
        <BrandButton shape="rectangular" asChild fullWidth className="auth-primary"><Link to="/redefinir-senha">Testar redefinição de senha</Link></BrandButton>
        <button type="button" className="auth-text-button" onClick={() => setDone(false)}>Usar outro e-mail</button>
      </> : <BrandButton shape="rectangular" asChild fullWidth className="auth-primary"><Link to="/login">Ir para o login</Link></BrandButton>}
    </div> : isAccess && !emailStep ? <div className="auth-welcome">
      <span className="auth-brand-prism auth-welcome-mark" aria-hidden="true" />
      <h1>{mode === 'login' ? 'Boas-vindas ao Diafanís.' : 'Crie sua conta no Diafanís.'}</h1>
      <div className="auth-methods">
        <SocialLogin onSelect={selectProvider} />
        <button type="button" className="auth-email-option" onClick={chooseEmail}><span className="auth-option-content"><Mail size={20} aria-hidden="true" /><span>Continuar com e-mail</span></span></button>
      </div>
    </div> : <>
      <header className="auth-heading"><h1>{copy[mode].title}</h1><p>{copy[mode].description}</p></header>
      <form ref={formRef} onSubmit={submit} noValidate className="auth-form">
        {mode === 'signup' && <AuthField id="auth-name" name="name" label="Seu nome" autoComplete="name" placeholder="Nome completo" required maxLength={100} error={errors.name} />}
        {mode !== 'reset' && <AuthField id="auth-email" name="email" label="E-mail" type="email" autoComplete="email" placeholder="voce@escritorio.com.br" required maxLength={254} error={errors.email} />}
        {hasPassword && <AuthField id="auth-password" name="password" label={mode === 'reset' ? 'Nova senha' : 'Senha'} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder={mode === 'login' ? 'Sua senha' : 'Crie sua senha'} required error={errors.password} hint={mode !== 'login' ? 'Pelo menos 8 caracteres, com letra e número.' : undefined} />}
        {(mode === 'signup' || mode === 'reset') && <AuthField id="auth-confirm" name="confirmPassword" label="Confirmar senha" type="password" autoComplete="new-password" placeholder="Repita a senha" required error={errors.confirmPassword} />}
        {mode === 'login' && <Link to="/esqueci-senha" className="auth-forgot">Esqueci minha senha</Link>}
        <BrandButton shape="rectangular" type="submit" fullWidth className="auth-primary">{copy[mode].action}</BrandButton>
      </form>
      {isAccess ? <button type="button" className="auth-text-button" onClick={() => { setEmailStep(false); setErrors({}); }}><ArrowLeft size={16} aria-hidden="true" />Outras formas de acesso</button> : <Link to="/login" className="auth-text-button"><ArrowLeft size={16} aria-hidden="true" />Voltar para o login</Link>}
    </>}
  </AuthLayout>;
}
