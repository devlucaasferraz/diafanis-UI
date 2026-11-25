import { FaApple } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';

export type SocialProvider = 'Google' | 'Apple' | 'Microsoft';
export function SocialLogin({ onSelect }: { onSelect: (provider: SocialProvider) => void }) {
  return (
    <div className="auth-social">
      <button type="button" aria-label="Continuar com Google" onClick={() => onSelect('Google')}><span className="auth-option-content"><FcGoogle size={20} aria-hidden="true" /><span>Continuar com Google</span></span></button>
      <button type="button" aria-label="Continuar com Microsoft" onClick={() => onSelect('Microsoft')}><span className="auth-option-content"><span className="auth-microsoft" aria-hidden="true"><i /><i /><i /><i /></span><span>Continuar com Microsoft</span></span></button>
      <button type="button" aria-label="Continuar com Apple" onClick={() => onSelect('Apple')}><span className="auth-option-content"><FaApple size={22} aria-hidden="true" /><span>Continuar com Apple</span></span></button>
    </div>);
}
