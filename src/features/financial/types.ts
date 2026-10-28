export type InvoiceStatus = 'PAGO' | 'PENDENTE' | 'VENCIDO';

export type FeeType = 'CONTRATUAL' | 'SUCUMBENCIAL' | 'RECEITA' | 'DESPESA';

export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone_whatsapp: string;
  data_nascimento: string;
  created_at?: string;
  updated_at?: string;
}

export interface FaturaAPIResponse {
  id: string;
  cliente: string | null;
  processo: string | null;
  descricao: string;
  valor: string | number;
  tipo: string;
  status: string;
  data_vencimento: string;
  data_pagamento: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id: string;
  cliente: string | null;
  clienteNome?: string;
  processo: string | null;
  descricao: string;
  valor: number;
  tipo: FeeType | string;
  status: InvoiceStatus;
  data_vencimento: string; // YYYY-MM-DD
  data_pagamento: string | null; // YYYY-MM-DD
  created_at?: string;
  updated_at?: string;
}

export interface FaturaPayload {
  cliente?: string | null;
  processo?: string | null;
  descricao?: string;
  valor: string | number;
  tipo: string;
  status: InvoiceStatus;
  data_vencimento: string;
  data_pagamento?: string | null;
}

export type InvoiceFilterTab = 'all' | 'PAGO' | 'PENDENTE' | 'VENCIDO';

export type InvoiceSortField = 'data_vencimento' | 'valor' | 'descricao';
export type SortOrder = 'asc' | 'desc';

export interface FinancialSummaryData {
  totalBilled: number;
  totalEstimated: number;
  totalCount: number;
  paidCount: number;
  paidAmount: number;
  pendingCount: number;
  pendingAmount: number;
  overdueCount: number;
  overdueAmount: number;
}
