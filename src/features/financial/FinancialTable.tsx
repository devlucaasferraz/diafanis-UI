import * as React from 'react';
import { Invoice } from './types';
import { FinancialStatusBadge } from './FinancialBadge';
import { DocumentReceiptBadge } from './DocumentReceiptBadge';
import { formatCurrency, formatDateBR } from './utils';
import { Checkbox } from '@/features/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/features/ui/dropdown-menu';
import {
  MoreVertical,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  Download,
  Inbox,
} from 'lucide-react';
import { cn } from '@/shared/cn';

interface FinancialTableProps {
  invoices: Invoice[];
  selectedIds: string[];
  pageSize?: number;
  onToggleSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onToggleStatus: (id: string) => void;
  onDeleteInvoice: (id: string) => void;
  onViewInvoiceDetails: (invoice: Invoice) => void;
}

export const FinancialTable: React.FC<FinancialTableProps> = ({
  invoices,
  selectedIds,
  pageSize = 10,
  onToggleSelect,
  onSelectAll,
  onToggleStatus,
  onDeleteInvoice,
  onViewInvoiceDetails,
}) => {
  const allSelected =
    invoices.length > 0 && invoices.every((inv) => selectedIds.includes(inv.id));
  const someSelected =
    invoices.some((inv) => selectedIds.includes(inv.id)) && !allSelected;

  const emptySlots = invoices.length > 0 ? Math.max(0, pageSize - invoices.length) : 0;

  if (invoices.length === 0) {
    return (
      <div className="h-[565px] min-h-[565px] flex flex-col items-center justify-center text-center px-4">
        <div className="h-12 w-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mb-3 border border-border/40">
          <Inbox className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold font-headline text-foreground">
          Nenhuma cobrança encontrada
        </h4>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Não foram localizados honorários com os critérios de filtro ou busca selecionados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto h-[565px] min-h-[565px]">
      <table className="w-full text-left border-collapse text-xs min-w-[980px]">
        <thead>
          <tr className="border-b border-border/50 text-[11px] font-semibold text-muted-foreground/80 h-[42px]">
            <th scope="col" className="w-8 py-2.5 pl-2 pr-1">
              <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
                aria-label="Selecionar todas as cobranças"
              />
            </th>
            <th scope="col" className="w-[110px] py-2.5 px-2 font-semibold whitespace-nowrap">
              Código
            </th>
            <th scope="col" className="min-w-[170px] py-2.5 px-2 font-semibold whitespace-nowrap">
              Cliente
            </th>
            <th scope="col" className="w-[185px] py-2.5 px-2 font-semibold whitespace-nowrap">
              Processo
            </th>
            <th scope="col" className="w-[130px] py-2.5 px-2 font-semibold whitespace-nowrap">
              Advogado
            </th>
            <th scope="col" className="w-[95px] py-2.5 px-2 font-semibold whitespace-nowrap">
              Valor
            </th>
            <th scope="col" className="w-[90px] py-2.5 px-2 font-semibold whitespace-nowrap">
              Vencimento
            </th>
            <th scope="col" className="w-[125px] py-2.5 px-2 font-semibold whitespace-nowrap">
              Recibo
            </th>
            <th scope="col" className="w-[105px] py-2.5 px-2 font-semibold whitespace-nowrap">
              Status
            </th>
            <th scope="col" className="w-8 py-2.5 pr-2 text-right">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {invoices.map((inv) => {
            const isSelected = selectedIds.includes(inv.id);

            return (
              <tr
                key={inv.id}
                className={cn(
                  'h-[52px] transition-colors hover:bg-muted/30 group',
                  isSelected && 'bg-primary/[0.03]'
                )}
              >
                {/* Selection Checkbox */}
                <td className="py-2.5 pl-2 pr-1">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(inv.id)}
                    aria-label={`Selecionar cobrança ${inv.reference}`}
                  />
                </td>

                {/* Reference Code */}
                <td className="py-2.5 px-2 font-semibold text-foreground whitespace-nowrap">
                  <span className="font-mono text-xs">{inv.reference}</span>
                </td>

                {/* Customer / Client */}
                <td className="py-2.5 px-2 font-medium text-foreground whitespace-nowrap">
                  <span className="block max-w-[180px] truncate" title={inv.clientName}>
                    {inv.clientName}
                  </span>
                </td>

                {/* Legal Docket / Process Number */}
                <td className="py-2.5 px-2 whitespace-nowrap">
                  <span className="font-mono text-xs text-muted-foreground">
                    {inv.processNumber}
                  </span>
                </td>

                {/* Responsible Lawyer */}
                <td className="py-2.5 px-2 text-muted-foreground whitespace-nowrap text-xs">
                  {inv.lawyerName}
                </td>

                {/* Amount (standardized to left-aligned like all other fields) */}
                <td className="py-2.5 px-2 font-semibold font-headline text-foreground whitespace-nowrap">
                  {formatCurrency(inv.amount)}
                </td>

                {/* Due Date */}
                <td className="py-2.5 px-2 text-muted-foreground whitespace-nowrap text-xs">
                  {formatDateBR(inv.dueDate)}
                </td>

                {/* Document / Invoice Receipt */}
                <td className="w-[125px] py-2.5 px-2 whitespace-nowrap">
                  {inv.hasDocument && inv.documentName ? (
                    <DocumentReceiptBadge
                      documentName={inv.documentName}
                      onClick={() => alert(`Baixando comprovante ${inv.documentName}`)}
                    />
                  ) : (
                    <span className="text-muted-foreground/50 select-none pl-1">-</span>
                  )}
                </td>

                {/* Status Badge */}
                <td className="py-2.5 px-2 whitespace-nowrap">
                  <FinancialStatusBadge status={inv.status} />
                </td>

                {/* Row Actions Menu */}
                <td className="py-2.5 pr-2 text-right whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="h-7 w-7 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Opções da cobrança"
                        aria-label={`Opções da cobrança ${inv.reference}`}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => onViewInvoiceDetails(inv)}
                        className="gap-2"
                      >
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Ver detalhes</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => onToggleStatus(inv.id)}
                        className="gap-2"
                      >
                        {inv.status === 'paid' ? (
                          <>
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            <span>Marcar como Pendente</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Marcar como Pago</span>
                          </>
                        )}
                      </DropdownMenuItem>

                      {inv.hasDocument && (
                        <DropdownMenuItem
                          onClick={() => alert(`Baixando comprovante ${inv.documentName}`)}
                          className="gap-2"
                        >
                          <Download className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Baixar comprovante</span>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => onDeleteInvoice(inv.id)}
                        className="gap-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Excluir cobrança</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}

          {/* Placeholder rows to keep table height fixed and prevent layout jumping */}
          {Array.from({ length: emptySlots }).map((_, idx) => (
            <tr
              key={`empty-slot-${idx}`}
              className="h-[52px] select-none pointer-events-none !border-transparent"
              aria-hidden="true"
            >
              <td className="py-2.5 pl-2 pr-1">&nbsp;</td>
              <td className="py-2.5 px-2">&nbsp;</td>
              <td className="py-2.5 px-2">&nbsp;</td>
              <td className="py-2.5 px-2">&nbsp;</td>
              <td className="py-2.5 px-2">&nbsp;</td>
              <td className="py-2.5 px-2">&nbsp;</td>
              <td className="py-2.5 px-2">&nbsp;</td>
              <td className="w-[125px] py-2.5 px-2">&nbsp;</td>
              <td className="py-2.5 px-2">&nbsp;</td>
              <td className="w-8 py-2.5 pr-2">&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
