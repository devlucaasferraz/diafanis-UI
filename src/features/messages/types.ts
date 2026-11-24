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

// ============================================================================
// CONTRATOS DE DTO / RESPOSTAS DA API (SNAKE_CASE & BACKEND)
// ============================================================================

export interface NotificationAPIResponse {
  id: string | number;
  titulo?: string;
  texto?: string;
  receptor?: string;
  processo?: string;
  advogado_assinante?: string;
  prazo?: string;
  lida?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MessageAPIResponse {
  id: string | number;
  titulo?: string;
  texto?: string;
  urgente?: boolean;
  data_disparo?: string | null;
  enviado?: string | null;
  remetente?: string;
  destinatario?: string | ClientRecipient;
  modelo?: string | null;
  fatura?: string | FinancialOption | null;
  documento?: string | LawsuitOption | null;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateAPIResponse {
  id: string | number;
  titulo?: string;
  texto?: string;
  criador?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClienteAPIResponse {
  id: string | number;
  nome: string;
  cpf?: string;
  telefone_whatsapp?: string;
  data_nascimento?: string;
  created_at?: string;
  updated_at?: string;
}

export type NotificationPayload = Partial<NotificationItem>;
export type MessagePayload = Partial<MessageItem>;
export type TemplatePayload = Partial<TemplateItem>;

// Payloads específicos enviados diretamente para a API Django em `mensagens`
export interface ModeloMensagemAPIPayload {
  titulo: string;
  texto: string;
  criador: string; // UUID do usuário autenticado
}

export interface MensagemAPIPayload {
  titulo: string;
  texto: string;
  remetente: string; // UUID do usuário remetente
  destinatario: string; // UUID do cliente
  data_disparo?: string; // ISO string
  modelo?: string | null; // UUID do ModeloMensagem
  fatura?: string | null; // UUID da Fatura
  documento?: string | null; // UUID do Documento
}

export interface DestinatarioDataPayload {
  destinatario: string; // UUID do Cliente
  data_disparo: string; // ISO string (ex: '2026-11-01T14:00:00Z')
}

export interface UsarModeloAPIPayload {
  modelo: string; // UUID do ModeloMensagem
  titulo?: string;
  remetente: string; // UUID do usuário
  fatura?: string | null; // UUID da Fatura
  documento?: string | null; // UUID do Documento
  dest_e_data: DestinatarioDataPayload[];
}

