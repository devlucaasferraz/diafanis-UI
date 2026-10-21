import * as React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/features/ui/button';
import { Cliente, FeeType, FaturaPayload, Invoice, InvoiceStatus } from './types';

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: FaturaPayload) => Promise<void> | void;
  clientes?: Cliente[];
  invoiceToEdit?: Invoice | null;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const NewInvoiceModal: React.FC<NewInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  clientes = [],
  invoiceToEdit = null,
}) => {
  const [descricao, setDescricao] = React.useState('');
  const [tipo, setTipo] = React.useState<FeeType | string>('CONTRATUAL');
  const [valor, setValor] = React.useState('');
  const [dataVencimento, setDataVencimento] = React.useState('');
  const [status, setStatus] = React.useState<InvoiceStatus>('PENDENTE');
  const [dataPagamento, setDataPagamento] = React.useState('');
  const [cliente, setCliente] = React.useState('');
  const [processo, setProcesso] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isEditing = Boolean(invoiceToEdit);

  // Reset or populate form on open
  React.useEffect(() => {
    if (isOpen) {
      if (invoiceToEdit) {
        setDescricao(invoiceToEdit.descricao || '');
        setTipo(invoiceToEdit.tipo || 'CONTRATUAL');
        setValor(String(invoiceToEdit.valor));
        setDataVencimento(invoiceToEdit.data_vencimento || '');
        setStatus(invoiceToEdit.status || 'PENDENTE');
        setDataPagamento(invoiceToEdit.data_pagamento || '');
        setCliente(invoiceToEdit.cliente || '');
        setProcesso(invoiceToEdit.processo || '');
      } else {
        const today = new Date().toISOString().split('T')[0];
        setDescricao('');
        setTipo('CONTRATUAL');
        setValor('');
        setDataVencimento(today);
        setStatus('PENDENTE');
        setDataPagamento('');
        setCliente('');
        setProcesso('');
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, invoiceToEdit]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!descricao.trim()) {
      errs.descricao = 'A descrição da fatura é obrigatória.';
    } else if (descricao.trim().length < 3) {
      errs.descricao = 'A descrição da fatura deve conter pelo menos 3 caracteres.';
    }
    if (!valor || isNaN(Number(valor)) || Number(valor) <= 0) {
      errs.valor = 'O valor da fatura deve ser maior que zero.';
    }
    if (!dataVencimento) {
      errs.data_vencimento = 'Data de vencimento é obrigatória.';
    }
    if (!tipo.trim()) {
      errs.tipo = 'Tipo da fatura é obrigatório.';
    }
    if ((status === 'PENDENTE' || status === 'VENCIDO') && dataPagamento) {
      errs.data_pagamento =
        'Faturas com status PENDENTE ou VENCIDO não devem possuir data de pagamento.';
    }
    if (cliente.trim() && !UUID_REGEX.test(cliente.trim())) {
      errs.cliente = 'ID do cliente deve ser um UUID válido.';
    }
    if (processo.trim() && !UUID_REGEX.test(processo.trim())) {
      errs.processo = 'ID do processo deve ser um UUID válido.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const resolvedPaidDate =
      status === 'PAGO' ? dataPagamento || dataVencimento : dataPagamento || null;

    const payload: FaturaPayload = {
      cliente: cliente.trim() ? cliente.trim() : null,
      processo: processo.trim() ? processo.trim() : null,
      descricao: descricao.trim(),
      valor: Number(valor),
      tipo: tipo.trim(),
      status,
      data_vencimento: dataVencimento,
      data_pagamento: resolvedPaidDate,
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Erro ao salvar fatura na API.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className="bg-card border border-border/50 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-invoice-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/10">
          <div className="flex flex-col gap-0.5">
            <h2 id="new-invoice-title" className="text-base font-bold font-headline text-foreground">
              {isEditing ? 'Editar Honorário' : 'Cadastrar Honorário'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isEditing
                ? `Atualizando registro ${invoiceToEdit?.id.slice(0, 8).toUpperCase()}`
                : 'Preencha os dados da fatura conforme o modelo da API'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {errors.submit && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-2 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Descrição */}
          <div className="space-y-1.5">
            <label htmlFor="invoice-descricao" className="font-semibold text-foreground">
              Descrição *
            </label>
            <input
              id="invoice-descricao"
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Honorários advocatícios iniciais"
              className="w-full h-9 px-3 rounded-lg border border-border/70 bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            {errors.descricao && (
              <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{errors.descricao}</span>
              </p>
            )}
          </div>

          {/* Tipo e Valor (R$) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="fee-type" className="font-semibold text-foreground">
                Tipo *
              </label>
              <select
                id="fee-type"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as FeeType)}
                className="w-full h-9 px-3 rounded-lg border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="CONTRATUAL">Honorários Contratuais</option>
                <option value="SUCUMBENCIAL">Honorários Sucumbenciais</option>
                <option value="RECEITA">Receita</option>
                <option value="DESPESA">Despesa</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="amount" className="font-semibold text-foreground">
                Valor (R$) *
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="Ex: 1500.00"
                className="w-full h-9 px-3 rounded-lg border border-border/70 bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              {errors.valor && (
                <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.valor}</span>
                </p>
              )}
            </div>
          </div>

          {/* Data de Vencimento e Data de Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="due-date" className="font-semibold text-foreground">
                Data de Vencimento *
              </label>
              <input
                id="due-date"
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              />
              {errors.data_vencimento && (
                <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.data_vencimento}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="paid-date" className="font-semibold text-foreground">
                Data de Pagamento (Opcional)
              </label>
              <input
                id="paid-date"
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              />
              {errors.data_pagamento && (
                <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.data_pagamento}</span>
                </p>
              )}
            </div>
          </div>

          {/* Cliente e Processo (FKs opcionais do model Fatura) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="client-select" className="font-semibold text-foreground">
                Cliente (Opcional)
              </label>
              <select
                id="client-select"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="">Sem cliente vinculado</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              {errors.cliente && (
                <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.cliente}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="process-id" className="font-semibold text-foreground">
                Processo ID (Opcional)
              </label>
              <input
                id="process-id"
                type="text"
                value={processo}
                onChange={(e) => setProcesso(e.target.value)}
                placeholder="UUID do processo (opcional)"
                className="w-full h-9 px-3 rounded-lg border border-border/70 bg-background font-mono text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              {errors.processo && (
                <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.processo}</span>
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground block">
              Status da Fatura *
            </label>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="PENDENTE"
                  checked={status === 'PENDENTE'}
                  onChange={() => setStatus('PENDENTE')}
                  className="accent-primary"
                />
                <span className="text-foreground">Pendente (A receber)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="PAGO"
                  checked={status === 'PAGO'}
                  onChange={() => {
                    setStatus('PAGO');
                    if (!dataPagamento) {
                      setDataPagamento(new Date().toISOString().split('T')[0]);
                    }
                  }}
                  className="accent-primary"
                />
                <span className="text-foreground">Pago (Liquidado)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="VENCIDO"
                  checked={status === 'VENCIDO'}
                  onChange={() => setStatus('VENCIDO')}
                  className="accent-primary"
                />
                <span className="text-foreground">Vencido</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting}
              className="px-4 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
            >
              {isSubmitting
                ? 'Salvando...'
                : isEditing
                ? 'Salvar Alterações'
                : 'Cadastrar Honorário'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
