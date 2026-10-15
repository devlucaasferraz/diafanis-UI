import { Invoice } from './types';

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-1',
    reference: 'HON-2026-001',
    clientName: 'Agropecuária Vale do São Francisco Ltda',
    processNumber: '0001842-30.2025.8.17.1130',
    feeType: 'contractual',
    lawyerName: 'Dr. Alberto Queiroz',
    lawyerId: 'me',
    amount: 6750.0,
    dueDate: '2026-10-02',
    paidDate: '2026-10-02',
    status: 'paid',
    hasDocument: true,
    documentName: 'REC-1001.pdf',
    notes: 'Parcela 1 de honorários contratuais de assessoria tributária rural.',
  },
  {
    id: 'inv-2',
    reference: 'HON-2026-002',
    clientName: 'Cooperativa Agrícola de Petrolina (COOPAP)',
    processNumber: '0802145-19.2024.8.17.2001',
    feeType: 'succumbential',
    lawyerName: 'Dra. Patrícia Ávila',
    lawyerId: 'pa',
    amount: 12500.0,
    dueDate: '2026-10-04',
    paidDate: '2026-10-04',
    status: 'paid',
    hasDocument: true,
    documentName: 'REC-1002.pdf',
    notes: 'Honorários sucumbenciais da 2ª Vara Cível da Comarca de Petrolina.',
  },
  {
    id: 'inv-3',
    reference: 'HON-2026-003',
    clientName: 'Frutas do Vale Exportação S/A',
    processNumber: '0014299-81.2023.8.05.0146',
    feeType: 'contractual',
    lawyerName: 'Dr. Himmad Rocha',
    lawyerId: 'hr',
    amount: 9800.0,
    dueDate: '2026-10-06',
    status: 'overdue',
    hasDocument: false,
    notes: 'Aguardando liquidação de boleto bancário vencido há mais de 7 dias.',
  },
  {
    id: 'inv-4',
    reference: 'HON-2026-004',
    clientName: 'Transportadora Juazeirense Ltda',
    processNumber: '0003512-11.2025.8.05.0146',
    feeType: 'contractual',
    lawyerName: 'Dr. Alberto Queiroz',
    lawyerId: 'me',
    amount: 4200.0,
    dueDate: '2026-10-09',
    paidDate: '2026-10-08',
    status: 'paid',
    hasDocument: true,
    documentName: 'REC-1004.pdf',
    notes: 'Defesa trabalhista no TRT-5 Juazeiro.',
  },
  {
    id: 'inv-5',
    reference: 'HON-2026-005',
    clientName: 'Maria Antônia dos Santos (Previdenciário)',
    processNumber: '0800412-44.2024.8.17.1130',
    feeType: 'contractual',
    lawyerName: 'Dra. Patrícia Ávila',
    lawyerId: 'pa',
    amount: 3750.0,
    dueDate: '2026-10-12',
    paidDate: '2026-10-11',
    status: 'paid',
    hasDocument: true,
    documentName: 'REC-1005.pdf',
    notes: 'Aposentadoria rural concedida - honorários de êxito.',
  },
  {
    id: 'inv-6',
    reference: 'HON-2026-006',
    clientName: 'Distribuidora São Francisco de Bebidas',
    processNumber: '0009182-62.2025.8.17.1130',
    feeType: 'succumbential',
    lawyerName: 'Dr. Himmad Rocha',
    lawyerId: 'hr',
    amount: 7200.0,
    dueDate: '2026-10-15',
    paidDate: '2026-10-15',
    status: 'paid',
    hasDocument: true,
    documentName: 'REC-1006.pdf',
    notes: 'Honorários de sucumbência arbitrados pelo TJPE.',
  },
  {
    id: 'inv-7',
    reference: 'HON-2026-007',
    clientName: 'Posto e Hotel Rio Mar Petrolina',
    processNumber: '0011504-22.2024.8.17.2001',
    feeType: 'contractual',
    lawyerName: 'Dr. Alberto Queiroz',
    lawyerId: 'me',
    amount: 5500.0,
    dueDate: '2026-10-18',
    status: 'pending',
    hasDocument: false,
    notes: 'Vencimento próximo. Boleto emitido com código Pix registrado.',
  },
  {
    id: 'inv-8',
    reference: 'HON-2026-008',
    clientName: 'Cerâmica São José Juazeiro',
    processNumber: '0007819-03.2025.8.05.0146',
    feeType: 'contractual',
    lawyerName: 'Dr. Himmad Rocha',
    lawyerId: 'hr',
    amount: 3600.0,
    dueDate: '2026-10-21',
    status: 'pending',
    hasDocument: false,
    notes: 'Consultoria contratual para recuperação de crédito.',
  },
  {
    id: 'inv-9',
    reference: 'HON-2026-009',
    clientName: 'Fazenda Terra Prometida Uvas & Vinhos',
    processNumber: '0803119-75.2023.8.17.1130',
    feeType: 'succumbential',
    lawyerName: 'Dra. Patrícia Ávila',
    lawyerId: 'pa',
    amount: 8320.0,
    dueDate: '2026-10-24',
    status: 'pending',
    hasDocument: false,
    notes: 'Aguardando liberação de alvará judicial.',
  },
  {
    id: 'inv-10',
    reference: 'HON-2026-010',
    clientName: 'Indústria Têxtil Oásis do Sertão',
    processNumber: '0004419-58.2025.8.05.0146',
    feeType: 'contractual',
    lawyerName: 'Dr. Alberto Queiroz',
    lawyerId: 'me',
    amount: 4600.0,
    dueDate: '2026-10-28',
    status: 'pending',
    hasDocument: false,
    notes: 'Honorários fixos de assessoria jurídica mensal preventiva.',
  },
  {
    id: 'inv-11',
    reference: 'HON-2026-011',
    clientName: 'Comercial de Alimentos Sertanejo',
    processNumber: '0801123-90.2024.8.17.1130',
    feeType: 'contractual',
    lawyerName: 'Dr. Himmad Rocha',
    lawyerId: 'hr',
    amount: 2900.0,
    dueDate: '2026-09-28',
    status: 'overdue',
    hasDocument: false,
    notes: 'Tentativa de acordo amigável em andamento.',
  },
  {
    id: 'inv-12',
    reference: 'HON-2026-012',
    clientName: 'Loteamento Parque Imperial Juazeiro',
    processNumber: '0008920-12.2024.8.05.0146',
    feeType: 'succumbential',
    lawyerName: 'Dr. Alberto Queiroz',
    lawyerId: 'me',
    amount: 6150.0,
    dueDate: '2026-10-31',
    status: 'pending',
    hasDocument: false,
    notes: 'Execução de título extrajudicial.',
  },
];

export function calculateSummary(invoices: Invoice[]) {
  const totalCount = invoices.length;
  let paidAmount = 0;
  let paidCount = 0;
  let pendingAmount = 0;
  let pendingCount = 0;
  let overdueAmount = 0;
  let overdueCount = 0;

  for (const inv of invoices) {
    if (inv.status === 'paid') {
      paidAmount += inv.amount;
      paidCount++;
    } else if (inv.status === 'pending') {
      pendingAmount += inv.amount;
      pendingCount++;
    } else if (inv.status === 'overdue') {
      overdueAmount += inv.amount;
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
