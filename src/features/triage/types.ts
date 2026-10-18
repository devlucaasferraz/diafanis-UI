export type DocumentStatus =
  | 'Aprovado'
  | 'Em Análise'
  | 'Reprovado/Ilegível'
  | 'Pendente';

export type TriageStatus =
  | 'Pronto para Análise'
  | 'Intervenção Manual'
  | 'Coleta em Andamento'
  | 'Concluído';

export type TriageFilterTab =
  | 'all'
  | 'ready'
  | 'manual'
  | 'leads'
  | 'ongoing';

export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  avatarUrl?: string;
}

export interface Processo {
  id: string;
  numero_cnj: string;
  vara: string;
  comarca?: string;
}

export interface Documento {
  id: string;
  cliente_id: string;
  processo_id: string | null;
  nome: string;
  tipo_documento: string;
  url_arquivo: string;
  formato: 'pdf' | 'image';
  tamanho?: string;
  status: DocumentStatus;
  motivo_reprovacao?: string;
  created_at: string;
  updated_at: string;
}

export interface BotConversationSummary {
  motivo_relatado: string;
  ultima_mensagem: string;
  horario_ultima_mensagem: string;
  alerta_dificuldade?: string;
  bot_pausado: boolean;
}

export interface TriageCase {
  id: string;
  protocolo: string;
  cliente: Cliente;
  processo: Processo | null;
  area_motivo: string;
  status_triagem: TriageStatus;
  conversa_bot: BotConversationSummary;
  documentos: Documento[];
  arquivado: boolean;
  created_at: string;
  updated_at: string;
}

export type LegalPackageId =
  | 'aposentadoria'
  | 'bpc_loas'
  | 'auxilio_doenca'
  | 'trabalhista'
  | 'civel';

export interface LegalPackage {
  id: LegalPackageId;
  nome: string;
  area_motivo: string;
  descricao: string;
  documentos_padrao: string[];
}
