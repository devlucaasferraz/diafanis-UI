import { createRoute, Link } from '@tanstack/react-router';
import { Calendar, MessageSquare, Wallet } from 'lucide-react';
import { Route as rootRoute } from './__root';

const modules = [
  { name: 'Calendário', description: 'Consulte compromissos e audiências.', to: '/calendar' as const, icon: Calendar },
  { name: 'Financeiro', description: 'Acompanhe honorários e pagamentos.', to: '/financial' as const, icon: Wallet },
  { name: 'Mensagens', description: 'Prepare mensagens e organize modelos.', to: '/messages' as const, icon: MessageSquare },
];

function Dashboard() {
  return <div className="mx-auto max-w-6xl px-6 py-12"><p className="text-sm text-muted-foreground">Diafanís</p><h1 className="mt-3 text-3xl font-medium tracking-tight">Visão geral</h1><p className="mt-4 text-muted-foreground">Escolha um recurso para começar.</p><div className="mt-10 grid gap-5 md:grid-cols-3">{modules.map(({ name, description, to, icon: Icon }) => <Link key={name} to={to} className="rounded-xl border border-border bg-card p-7 transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"><Icon className="mb-7 h-6 w-6 text-primary" /><h2 className="text-lg font-medium">{name}</h2><p className="mt-3 text-sm text-muted-foreground">{description}</p></Link>)}</div><p className="mt-8 text-sm text-muted-foreground">Ambiente de demonstração.</p><Link className="mt-8 inline-block text-sm underline underline-offset-4" to="/">Voltar ao site</Link></div>;
}
export const Route = createRoute({ getParentRoute: () => rootRoute, path: '/dashboard', component: Dashboard });
