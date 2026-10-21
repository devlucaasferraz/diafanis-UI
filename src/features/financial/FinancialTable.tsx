import * as React from 'react';
import { Invoice } from './types';
import { FinancialStatusBadge, FeeTypeBadge } from './FinancialBadge';
import { formatCurrency, formatDateBR, formatShortId } from './utils';
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
  Pencil,
  Inbox,
} from 'lucide-react';
import { cn } from '@/shared/cn';

interface FinancialTableProps {
  invoices: Invoice[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onToggleStatus: (id: string) => void;
  onDeleteInvoice: (id: string) => void;
  onViewInvoiceDetails: (invoice: Invoice) => void;
  onEditInvoice?: (invoice: Invoice) => void;
}

export const FinancialTable: React.FC<FinancialTableProps> = ({
  invoices,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onToggleStatus,
  onDeleteInvoice,
  onViewInvoiceDetails,
  onEditInvoice,
}) => {
  const allSelected =
    invoices.length > 0 && invoices.every((inv) => selectedIds.includes(inv.id));
  const someSelected =
    invoices.some((inv) => selectedIds.includes(inv.id)) && !allSelected;

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
            <th scope="col" className="w-[95px] py-2.5 px-2 font-semibold whitespace-nowrap">
              ID
            </th>
            <th scope="col" className="min-w-[200px] py-2.5 px-2 font-semibold whitespace-nowrap">
              Descrição
            </th>
            <th scope="col" className="min-w-[150px] py-2.5 px-2 font-semibold whitespace-nowrap">
              Cliente
            </th>
            <th scope="col" className="w-[115px] py-2.5 px-2 font-semibold whitespace-nowrap">
              Processo
            </th>
            <th scope="col" className="w-[110px] py-2.5 px-2 font-semibold whitespace-nowrap">
              Tipo
            </th>
            <th scope="col" className="w-[105px] py-2.5 px-2 font-semibold whitespace-nowrap">
              Valor
            </th>
            <th scope="col" className="w-[95px] py-2.5 px-2 font-semibold whitespace-nowrap">
              Vencimento
            </th>
            <th scope="col" className="w-[95px] py-2.5 px-2 font-semibold whitespace-nowrap">
              Pagamento
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
            const shortId = formatShortId(inv.id);
            const clientDisplay =
              inv.clienteNome || (inv.cliente ? formatShortId(inv.cliente) : '-');
            const processDisplay = inv.processo ? formatShortId(inv.processo) : '-';

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
                    aria-label={`Selecionar cobrança ${shortId}`}
                  />
                </td>

                {/* ID */}
                <td className="py-2.5 px-2 font-semibold text-foreground whitespace-nowrap">
                  <span className="font-mono text-xs" title={inv.id}>
                    {shortId}
                  </span>
                </td>

                {/* Descrição */}
                <td className="py-2.5 px-2 font-medium text-foreground whitespace-nowrap">
                  <span
                    className="block max-w-[230px] truncate"
                    title={inv.descricao || 'Sem descrição'}
                  >
                    {inv.descricao || 'Sem descrição'}
                  </span>
                </td>

                {/* Cliente */}
                <td className="py-2.5 px-2 text-muted-foreground whitespace-nowrap">
                  <span
                    className="block max-w-[160px] truncate"
                    title={inv.clienteNome || inv.cliente || 'Sem cliente vinculado'}
                  >
                    {clientDisplay}
                  </span>
                </td>

                {/* Processo */}
                <td className="py-2.5 px-2 whitespace-nowrap">
                  <span
                    className="font-mono text-xs text-muted-foreground"
                    title={inv.processo || 'Sem processo vinculado'}
                  >
                    {processDisplay}
                  </span>
                </td>

                {/* Tipo */}
                <td className="py-2.5 px-2 whitespace-nowrap">
                  <FeeTypeBadge feeType={inv.tipo} />
                </td>

                {/* Valor */}
                <td className="py-2.5 px-2 font-semibold font-headline text-foreground whitespace-nowrap">
                  {formatCurrency(inv.valor)}
                </td>

                {/* Data de Vencimento */}
                <td className="py-2.5 px-2 text-muted-foreground whitespace-nowrap text-xs">
                  {formatDateBR(inv.data_vencimento)}
                </td>

                {/* Data de Pagamento */}
                <td className="py-2.5 px-2 text-muted-foreground whitespace-nowrap text-xs">
                  {formatDateBR(inv.data_pagamento)}
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
                        aria-label={`Opções da cobrança ${shortId}`}
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

                      {onEditInvoice && (
                        <DropdownMenuItem
                          onClick={() => onEditInvoice(inv)}
                          className="gap-2"
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Editar fatura</span>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        onClick={() => onToggleStatus(inv.id)}
                        className="gap-2"
                      >
                        {inv.status === 'PAGO' ? (
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
        </tbody>
      </table>
    </div>
  );
};
