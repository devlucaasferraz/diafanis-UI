import type { ReactNode, Ref } from 'react';

export function AuthResult({ title, headingRef, children }: { title: string; headingRef: Ref<HTMLHeadingElement>; children: ReactNode }) {
  return <div className="auth-result">
    <h1 ref={headingRef} tabIndex={-1}>{title}</h1>
    {children}
  </div>;
}
