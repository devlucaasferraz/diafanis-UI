import { z } from 'zod';
const email = z.string().trim().email('Informe um e-mail válido.');
export const loginSchema = z.object({ email, password: z.string().min(1, 'Informe sua senha.') });
const password = z.string().min(8, 'Use pelo menos 8 caracteres.').regex(/[a-zA-Z]/, 'Inclua pelo menos uma letra.').regex(/[0-9]/, 'Inclua pelo menos um número.');
export const signupSchema = z.object({ name: z.string().trim().min(2, 'Informe seu nome.').max(100, 'Use até 100 caracteres.'), email, password, confirmPassword: z.string() }).refine(data => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'As senhas precisam ser iguais.' });
export const recoverySchema = z.object({ email });
export const resetSchema = z.object({ password, confirmPassword: z.string() }).refine(data => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'As senhas precisam ser iguais.' });

export const pinSchema = z.object({ pin: z.string().regex(/^\d{6}$/, 'Informe os 6 dígitos do código.') });
