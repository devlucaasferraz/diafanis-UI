export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export type FeeType = 'contractual' | 'succumbential';

export interface Invoice {
  id: string;
  reference: string;
  clientName: string;
  processNumber: string;
  feeType: FeeType;
  lawyerName: string;
  lawyerId: string;
  amount: number;
  dueDate: string; // ISO date format YYYY-MM-DD
  paidDate?: string;
  status: InvoiceStatus;
  hasDocument: boolean;
  documentName?: string;
  notes?: string;
}

export type InvoiceFilterTab = 'all' | 'paid' | 'pending' | 'overdue';

export type InvoiceSortField = 'dueDate' | 'amount' | 'clientName' | 'reference';
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
