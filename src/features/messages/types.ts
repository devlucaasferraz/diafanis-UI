import type { LucideIcon } from 'lucide-react';

export type MessageTabId = 'notifications' | 'messages' | 'templates';

export interface TabOption {
  id: MessageTabId;
  label: string;
  shortLabel?: string;
  icon?: LucideIcon;
  description?: string;
  hasUrgency?: boolean;
  urgentCount?: number;
}

export interface ClientRecipient {
  id: string;
  name: string;
  fullName: string;
  birthDate: string;
  email?: string;
  phone?: string;
}

export interface LawsuitOption {
  id: string;
  number: string;
  court: string; // Ex: 3ª Vara Cível
  jurisdiction: string; // Ex: Comarca da Capital
  title?: string;
}

export interface FinancialOption {
  id: string;
  code: string;
  amount: string; // Ex: R$ 3.500,00
  dueDate: string; // Ex: 10/11/2026
  pixKey?: string;
}

export interface HearingDateOption {
  id: string;
  title: string; // Ex: Audiência de Instrução e Julgamento
  date: string;  // Ex: 24/11/2026
  time: string;  // Ex: 14:30
  location: string; // Ex: Sala Virtual 04 - TJ
}

export interface ReferenceCounts {
  client: number;
  financial: number;
  lawsuit: number;
  date: number;
}

export type ScheduleScope = 'all' | 'individual';

export type IndividualScheduleType = 'birthday' | 'manual';

export interface ClientScheduleConfig {
  clientId: string;
  type: IndividualScheduleType;
  date?: string; // Data específica (YYYY-MM-DD)
  time: string;  // Horário (HH:mm)
}

export interface ScheduleConfig {
  scope: ScheduleScope;
  globalScheduledAt?: string | null; // Quando scope === 'all'
  clientSchedules?: Record<string, ClientScheduleConfig>; // Quando scope === 'individual'
}

export type MessageCategory = 'birthday' | 'hearing' | 'financial' | 'update' | 'general';

export interface MessageItem {
  id: string;
  title: string;
  content: string;
  category?: MessageCategory;
  references?: ReferenceCounts;
  hasAlert?: boolean; // Bolinha de alerta vermelha (exclusiva para mensagens)
  clients: ClientRecipient[]; // Clientes vinculados à mensagem
  selectedLawsuit?: LawsuitOption | null;
  selectedFinancial?: FinancialOption | null;
  selectedDate?: HearingDateOption | null;
  scheduledAt?: string | null; // Data e hora programada para envio
  scheduleConfig?: ScheduleConfig | null; // Configuração completa de agendamento (todos vs individual)
  createdAt: string;
  updatedAt?: string;
}

export interface TemplateItem {
  id: string;
  title: string;
  content: string;
  category?: MessageCategory;
  references?: ReferenceCounts;
  clients?: ClientRecipient[];
  requiresLawsuit?: boolean;
  requiresFinancial?: boolean;
  requiresDate?: boolean;
  selectedLawsuit?: LawsuitOption | null;
  selectedFinancial?: FinancialOption | null;
  selectedDate?: HearingDateOption | null;
  scheduledAt?: string | null;
  scheduleConfig?: ScheduleConfig | null;
  description?: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  processNumber?: string;
  assignedLawyer: string;
  deadline: string;
  isFatal?: boolean;
  isRead: boolean;
  createdAt: string;
}
