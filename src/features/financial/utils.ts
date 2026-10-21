import { FeeType, FaturaAPIResponse, FinancialSummaryData, Invoice, InvoiceStatus } from './types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateBR(dateString?: string | null): string {
  if (!dateString) return '-';
  const cleanDate = dateString.split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateString;
}

export function formatShortId(id: string): string {
  if (!id) return '-';
  return `#${id.slice(0, 8).toUpperCase()}`;
}

export function normalizeStatus(status?: string | null): InvoiceStatus {
  const upper = (status || '').toUpperCase().trim();
  if (upper === 'PAGO' || upper === 'PAID') return 'PAGO';
  if (upper === 'VENCIDO' || upper === 'OVERDUE') return 'VENCIDO';
  return 'PENDENTE';
}

export function normalizeFeeType(tipo?: string | null): FeeType | string {
  const upper = (tipo || '').toUpperCase().trim();
  if (upper === 'CONTRATUAL' || upper === 'CONTRACTUAL') return 'CONTRATUAL';
  if (upper === 'SUCUMBENCIAL' || upper === 'SUCCUMBENTIAL') return 'SUCUMBENCIAL';
  if (upper === 'RECEITA') return 'RECEITA';
  if (upper === 'DESPESA') return 'DESPESA';
  return upper || 'CONTRATUAL';
}

export function formatFeeTypeLabel(tipo?: string | null): string {
  const normalized = normalizeFeeType(tipo);
  switch (normalized) {
    case 'CONTRATUAL':
      return 'Contratual';
    case 'SUCUMBENCIAL':
      return 'Sucumbencial';
    case 'RECEITA':
      return 'Receita';
    case 'DESPESA':
      return 'Despesa';
    default:
      return tipo || 'Contratual';
  }
}

export function mapFaturaFromAPI(
  raw: FaturaAPIResponse,
  clientesMap?: Record<string, string>
): Invoice {
  const clienteId = raw.cliente || null;
  return {
    id: raw.id,
    cliente: clienteId,
    clienteNome: clienteId && clientesMap?.[clienteId] ? clientesMap[clienteId] : undefined,
    processo: raw.processo || null,
    descricao: raw.descricao ?? '',
    valor: typeof raw.valor === 'number' ? raw.valor : parseFloat(String(raw.valor)) || 0,
    tipo: normalizeFeeType(raw.tipo),
    status: normalizeStatus(raw.status),
    data_vencimento: raw.data_vencimento,
    data_pagamento: raw.data_pagamento ?? null,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export function calculateSummary(invoices: Invoice[]): FinancialSummaryData {
  const totalCount = invoices.length;
  let paidAmount = 0;
  let paidCount = 0;
  let pendingAmount = 0;
  let pendingCount = 0;
  let overdueAmount = 0;
  let overdueCount = 0;

  for (const inv of invoices) {
    if (inv.status === 'PAGO') {
      paidAmount += inv.valor;
      paidCount++;
    } else if (inv.status === 'PENDENTE') {
      pendingAmount += inv.valor;
      pendingCount++;
    } else if (inv.status === 'VENCIDO') {
      overdueAmount += inv.valor;
      overdueCount++;
    }
  }

  const totalBilled = paidAmount;
  const totalEstimated = paidAmount + pendingAmount + overdueAmount;

  return {
    totalBilled,
    totalEstimated,
    totalCount,
    paidCount,
    paidAmount,
    pendingCount,
    pendingAmount,
    overdueCount,
    overdueAmount,
  };
}
