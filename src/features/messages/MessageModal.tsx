import * as React from 'react';
import {
  X,
  Sparkles,
  Info,
  DollarSign,
  Scale,
  Calendar,
  Check,
  ChevronDown,
  Trash2,
  Search,
  Eye,
  PenLine,
} from 'lucide-react';
import { Button } from '@/features/ui/button';
import { cn } from '@/shared/cn';
import {
  MessageItem,
  TemplateItem,
  MessageCategory,
  LawsuitOption,
  FinancialOption,
  HearingDateOption,
} from './types';
import {
  availableLawsuits,
  availableFinancials,
  availableHearingDates,
} from './mock-data';

export interface MessageModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  type: 'message' | 'template';
  initialData?: MessageItem | TemplateItem | null;
  onClose: () => void;
  onSave: (data: Partial<MessageItem | TemplateItem>) => void;
}

const CATEGORY_OPTIONS: { value: MessageCategory; label: string }[] = [
  { value: 'birthday', label: 'Aniversário' },
  { value: 'hearing', label: 'Audiência' },
  { value: 'financial', label: 'Financeiro' },
  { value: 'update', label: 'Andamento Processual' },
  { value: 'general', label: 'Geral' },
];

/**
 * Renderiza o texto substituindo tags de menção (@...) por componentes visuais de pills azuis
 */
export function renderContentWithPills(text: string) {
  const parts = text.split(/(@[a-zA-Z0-9_.]+)/g);
  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((part, idx) => {
        if (!part) return null;
        if (part.startsWith('@')) {
          const testId = `preview-pill-${part.replace('@', '').replace('.', '-')}`;
          return (
            <span
              key={idx}
              data-testid={testId}
              className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-[11px] font-mono font-semibold align-baseline shadow-2xs"
            >
              {part}
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}

export const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  mode,
  type,
  initialData,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [category, setCategory] = React.useState<MessageCategory>('general');
  const [hasAlert, setHasAlert] = React.useState(false);

  // Objetos de referência selecionados (um, e somente um, para cada ícone)
  const [selectedLawsuit, setSelectedLawsuit] = React.useState<LawsuitOption | null>(null);
  const [selectedFinancial, setSelectedFinancial] = React.useState<FinancialOption | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<HearingDateOption | null>(null);

  // Estado para controlar qual popover/menu de seleção está aberto
  const [openSelector, setOpenSelector] = React.useState<'lawsuit' | 'financial' | 'date' | null>(null);

  // Estados de busca para cada seletor
  const [financialSearch, setFinancialSearch] = React.useState('');
  const [lawsuitSearch, setLawsuitSearch] = React.useState('');
  const [dateSearch, setDateSearch] = React.useState('');

  // Ref para detectar clique fora e fechar o carrossel/seletor ativo
  const selectorRef = React.useRef<HTMLDivElement>(null);

  // Efeito para fechar o seletor ativo ao clicar fora dele ou ao pressionar Escape
  React.useEffect(() => {
    if (!openSelector) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setOpenSelector(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenSelector(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openSelector]);

  // Função auxiliar para alternar o seletor limpando os filtros
  const handleToggleSelector = (target: 'lawsuit' | 'financial' | 'date') => {
    setOpenSelector((prev) => {
      const next = prev === target ? null : target;
      setFinancialSearch('');
      setLawsuitSearch('');
      setDateSearch('');
      return next;
    });
  };

  // Listas filtradas pela pesquisa de cada seletor
  const filteredFinancials = React.useMemo(() => {
    if (!financialSearch.trim()) return availableFinancials;
    const term = financialSearch.toLowerCase();
    return availableFinancials.filter(
      (f) =>
        f.code.toLowerCase().includes(term) ||
        f.amount.toLowerCase().includes(term) ||
        f.dueDate.toLowerCase().includes(term)
    );
  }, [financialSearch]);

  const filteredLawsuits = React.useMemo(() => {
    if (!lawsuitSearch.trim()) return availableLawsuits;
    const term = lawsuitSearch.toLowerCase();
    return availableLawsuits.filter(
      (l) =>
        l.number.toLowerCase().includes(term) ||
        l.court.toLowerCase().includes(term) ||
        l.jurisdiction.toLowerCase().includes(term) ||
        (l.title && l.title.toLowerCase().includes(term))
    );
  }, [lawsuitSearch]);

  const filteredDates = React.useMemo(() => {
    if (!dateSearch.trim()) return availableHearingDates;
    const term = dateSearch.toLowerCase();
    return availableHearingDates.filter(
      (d) =>
        d.title.toLowerCase().includes(term) ||
        d.date.toLowerCase().includes(term) ||
        d.location.toLowerCase().includes(term)
    );
  }, [dateSearch]);

  // Estado para alternar entre "Escrever" e "Prévia" (padrão: prévia)
  const [activeTab, setActiveTab] = React.useState<'edit' | 'preview'>('preview');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Inicializa dados quando abre o modal
  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setCategory(initialData.category || 'general');
      setSelectedLawsuit(initialData.selectedLawsuit || null);
      setSelectedFinancial(initialData.selectedFinancial || null);
      setSelectedDate(initialData.selectedDate || null);
      if ('hasAlert' in initialData) {
        setHasAlert(Boolean(initialData.hasAlert));
      }
    } else {
      setTitle('');
      setContent('');
      setCategory('general');
      setHasAlert(false);
      setSelectedLawsuit(null);
      setSelectedFinancial(null);
      setSelectedDate(null);
    }
    setOpenSelector(null);
    setActiveTab('preview');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Função para inserir a menção no textarea no ponto do cursor
  const handleInsertMention = (mentionTag: string) => {
    if (activeTab === 'preview') {
      setActiveTab('edit');
    }

    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const current = content;

      const prefix = start > 0 && current[start - 1] !== ' ' ? ' ' : '';
      const newContent =
        current.substring(0, start) +
        prefix +
        mentionTag +
        ' ' +
        current.substring(end);

      setContent(newContent);

      setTimeout(() => {
        textarea.focus();
        const cursor = start + prefix.length + mentionTag.length + 1;
        textarea.setSelectionRange(cursor, cursor);
      }, 0);
    } else {
      setContent((prev) => (prev ? `${prev} ${mentionTag} ` : `${mentionTag} `));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...(initialData || {}),
      title: title.trim(),
      content: content.trim(),
      category,
      selectedLawsuit,
      selectedFinancial,
      selectedDate,
      ...(type === 'message' ? { hasAlert } : {}),
    });
    onClose();
  };

  const isMessage = type === 'message';
  const modalTitle =
    mode === 'create'
      ? isMessage
        ? 'Nova Mensagem'
        : 'Novo Modelo de Disparo'
      : isMessage
        ? 'Editar Mensagem'
        : 'Editar Modelo de Disparo';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-modal-title"
        className="bg-card border border-border/60 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/20">
          <div>
            <h2 id="message-modal-title" className="text-base font-semibold text-foreground tracking-tight">
              {modalTitle}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isMessage
                ? 'Configure o texto e vincule os objetos de referência'
                : 'Configure o modelo de texto padrão com tags dinâmicas'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Título */}
          <div className="space-y-1.5">
            <label htmlFor="message-title" className="text-xs font-semibold text-foreground">
              Título da {isMessage ? 'Mensagem' : 'Template'} *
            </label>
            <input
              id="message-title"
              type="text"
              required
              placeholder="Ex: Aviso de Audiência de Instrução ou Felicitação de Aniversário"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-background/80 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Categoria & Status de Urgência */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="message-category" className="text-xs font-semibold text-foreground">
                Categoria
              </label>
              <select
                id="message-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as MessageCategory)}
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle de Alerta de Urgência (apenas para mensagens) */}
            {isMessage && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Status de Urgência
                </label>
                <label className="flex items-center gap-2.5 p-2 rounded-xl border border-border/50 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={hasAlert}
                    onChange={(e) => setHasAlert(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <span className="h-2 w-2 rounded-full bg-rose-600 inline-block" />
                    <span>Exibir bolinha vermelha de alerta</span>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* SEÇÃO: Ícones de Objetos de Referência (com cores Cinza vs Azul e seleção única) */}
          <div className="space-y-2.5 p-3.5 rounded-xl border border-border/60 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">
                  Objetos de Referência Vinculados:
                </span>
                <span className="text-[10px] text-muted-foreground">
                  (clique no ícone para vincular 1 item)
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Não selecionado (cinza)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Selecionado (azul)
                </span>
              </div>
            </div>

            {/* Linha com os 3 Ícones (Financeiro, Processo, Data) */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 1. Ícone de Financeiro */}
              <div
                ref={openSelector === 'financial' ? selectorRef : null}
                className="relative"
              >
                <button
                  type="button"
                  data-testid="ref-btn-financial"
                  onClick={() => handleToggleSelector('financial')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-xs',
                    selectedFinancial
                      ? 'bg-blue-500/10 text-blue-600 border-blue-500/40 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-700/60'
                      : 'bg-muted/40 text-muted-foreground/50 border-border/40 hover:text-foreground hover:bg-muted/60'
                  )}
                  title={
                    selectedFinancial
                      ? `Financeiro: ${selectedFinancial.code} (${selectedFinancial.amount})`
                      : 'Nenhuma fatura selecionada (clique para escolher)'
                  }
                >
                  <DollarSign className="h-4 w-4" />
                  <span>
                    {selectedFinancial ? selectedFinancial.code : 'Financeiro'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {/* Dropdown / Seletor de Financeiro */}
                {openSelector === 'financial' && (
                  <div
                    data-testid="selector-popover-financial"
                    className="absolute left-0 top-full mt-1.5 z-20 w-72 rounded-xl border border-border/80 bg-popover shadow-xl animate-in fade-in-50 zoom-in-95 overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-2 border-b border-border/40 text-[11px] font-semibold text-muted-foreground bg-muted/20">
                      <span>Selecione 1 fatura</span>
                      {selectedFinancial && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFinancial(null);
                            setOpenSelector(null);
                          }}
                          className="text-destructive hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Limpar
                        </button>
                      )}
                    </div>

                    {/* Campo de Pesquisa */}
                    <div className="relative p-2 border-b border-border/30 bg-background/50">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        autoFocus
                        data-testid="search-financial-input"
                        placeholder="Buscar por código, valor ou vencimento..."
                        value={financialSearch}
                        onChange={(e) => setFinancialSearch(e.target.value)}
                        className="w-full rounded-lg border border-border/50 bg-background py-1.5 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </div>

                    <div className="p-1 space-y-1 max-h-40 overflow-y-auto">
                      {filteredFinancials.length === 0 ? (
                        <div className="py-3 text-center text-xs text-muted-foreground">
                          Nenhuma fatura encontrada.
                        </div>
                      ) : (
                        filteredFinancials.map((fin) => (
                          <button
                            key={fin.id}
                            type="button"
                            onClick={() => {
                              setSelectedFinancial(fin);
                              setOpenSelector(null);
                            }}
                            className={cn(
                              'w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors',
                              selectedFinancial?.id === fin.id
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'hover:bg-muted text-foreground'
                            )}
                          >
                            <div>
                              <div>{fin.code} • {fin.amount}</div>
                              <div className="text-[10px] text-muted-foreground">Venc: {fin.dueDate}</div>
                            </div>
                            {selectedFinancial?.id === fin.id && <Check className="h-3.5 w-3.5" />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Ícone de Processo */}
              <div
                ref={openSelector === 'lawsuit' ? selectorRef : null}
                className="relative"
              >
                <button
                  type="button"
                  data-testid="ref-btn-lawsuit"
                  onClick={() => handleToggleSelector('lawsuit')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-xs',
                    selectedLawsuit
                      ? 'bg-blue-500/10 text-blue-600 border-blue-500/40 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-700/60'
                      : 'bg-muted/40 text-muted-foreground/50 border-border/40 hover:text-foreground hover:bg-muted/60'
                  )}
                  title={
                    selectedLawsuit
                      ? `Processo: ${selectedLawsuit.number}`
                      : 'Nenhum processo selecionado (clique para escolher)'
                  }
                >
                  <Scale className="h-4 w-4" />
                  <span className="truncate max-w-[130px]">
                    {selectedLawsuit ? selectedLawsuit.court : 'Processo'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {/* Dropdown / Seletor de Processo */}
                {openSelector === 'lawsuit' && (
                  <div
                    data-testid="selector-popover-lawsuit"
                    className="absolute left-0 top-full mt-1.5 z-20 w-80 rounded-xl border border-border/80 bg-popover shadow-xl animate-in fade-in-50 zoom-in-95 overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-2 border-b border-border/40 text-[11px] font-semibold text-muted-foreground bg-muted/20">
                      <span>Selecione 1 processo</span>
                      {selectedLawsuit && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLawsuit(null);
                            setOpenSelector(null);
                          }}
                          className="text-destructive hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Limpar
                        </button>
                      )}
                    </div>

                    {/* Campo de Pesquisa */}
                    <div className="relative p-2 border-b border-border/30 bg-background/50">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        autoFocus
                        data-testid="search-lawsuit-input"
                        placeholder="Buscar por número, vara, comarca..."
                        value={lawsuitSearch}
                        onChange={(e) => setLawsuitSearch(e.target.value)}
                        className="w-full rounded-lg border border-border/50 bg-background py-1.5 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </div>

                    <div className="p-1 space-y-1 max-h-44 overflow-y-auto">
                      {filteredLawsuits.length === 0 ? (
                        <div className="py-3 text-center text-xs text-muted-foreground">
                          Nenhum processo encontrado.
                        </div>
                      ) : (
                        filteredLawsuits.map((law) => (
                          <button
                            key={law.id}
                            type="button"
                            onClick={() => {
                              setSelectedLawsuit(law);
                              setOpenSelector(null);
                            }}
                            className={cn(
                              'w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors',
                              selectedLawsuit?.id === law.id
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'hover:bg-muted text-foreground'
                            )}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-mono text-[11px] truncate">{law.number}</div>
                              <div className="text-[10px] text-muted-foreground truncate">{law.court} - {law.jurisdiction}</div>
                            </div>
                            {selectedLawsuit?.id === law.id && <Check className="h-3.5 w-3.5 shrink-0" />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Ícone de Data / Audiência */}
              <div
                ref={openSelector === 'date' ? selectorRef : null}
                className="relative"
              >
                <button
                  type="button"
                  data-testid="ref-btn-date"
                  onClick={() => handleToggleSelector('date')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-xs',
                    selectedDate
                      ? 'bg-blue-500/10 text-blue-600 border-blue-500/40 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-700/60'
                      : 'bg-muted/40 text-muted-foreground/50 border-border/40 hover:text-foreground hover:bg-muted/60'
                  )}
                  title={
                    selectedDate
                      ? `Data: ${selectedDate.date} às ${selectedDate.time}`
                      : 'Nenhuma data selecionada (clique para escolher)'
                  }
                >
                  <Calendar className="h-4 w-4" />
                  <span>
                    {selectedDate ? `${selectedDate.date} ${selectedDate.time}` : 'Data / Prazo'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {/* Dropdown / Seletor de Data */}
                {openSelector === 'date' && (
                  <div
                    data-testid="selector-popover-date"
                    className="absolute left-0 top-full mt-1.5 z-20 w-72 rounded-xl border border-border/80 bg-popover shadow-xl animate-in fade-in-50 zoom-in-95 overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-2 border-b border-border/40 text-[11px] font-semibold text-muted-foreground bg-muted/20">
                      <span>Selecione 1 evento/data</span>
                      {selectedDate && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate(null);
                            setOpenSelector(null);
                          }}
                          className="text-destructive hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Limpar
                        </button>
                      )}
                    </div>

                    {/* Campo de Pesquisa */}
                    <div className="relative p-2 border-b border-border/30 bg-background/50">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        autoFocus
                        data-testid="search-date-input"
                        placeholder="Buscar por título, data ou local..."
                        value={dateSearch}
                        onChange={(e) => setDateSearch(e.target.value)}
                        className="w-full rounded-lg border border-border/50 bg-background py-1.5 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </div>

                    <div className="p-1 space-y-1 max-h-40 overflow-y-auto">
                      {filteredDates.length === 0 ? (
                        <div className="py-3 text-center text-xs text-muted-foreground">
                          Nenhum evento encontrado.
                        </div>
                      ) : (
                        filteredDates.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setSelectedDate(item);
                              setOpenSelector(null);
                            }}
                            className={cn(
                              'w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors',
                              selectedDate?.id === item.id
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'hover:bg-muted text-foreground'
                            )}
                          >
                            <div>
                              <div>{item.title}</div>
                              <div className="text-[10px] text-muted-foreground">{item.date} às {item.time}</div>
                            </div>
                            {selectedDate?.id === item.id && <Check className="h-3.5 w-3.5" />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SEÇÃO: Pills / Mentions Disponíveis */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="message-content" className="text-xs font-semibold text-foreground">
                Corpo do Texto *
              </label>

              {/* Botões de Alternância: Escrever vs Prévia */}
              <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/40">
                <button
                  type="button"
                  data-testid="tab-write-btn"
                  onClick={() => setActiveTab('edit')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                    activeTab === 'edit'
                      ? 'bg-background text-foreground shadow-2xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <PenLine className="h-3.5 w-3.5" />
                  <span>Escrever</span>
                </button>
                <button
                  type="button"
                  data-testid="tab-preview-btn"
                  onClick={() => setActiveTab('preview')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                    activeTab === 'preview'
                      ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Prévia</span>
                </button>
              </div>
            </div>

            {/* Bloco de Pills (exibido apenas no modo de edição/escrita) */}
            {activeTab === 'edit' && (
              <div className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-2.5">
              {/* Pills do Tipo 1: Relacionadas ao Cliente (sempre presentes) */}
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-blue-500" /> Pills do Cliente (sempre disponíveis):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleInsertMention('@cliente.nome')}
                    data-testid="pill-cliente-nome"
                    className="rounded-lg bg-blue-500/10 border border-blue-500/40 px-2 py-1 text-[11px] font-mono text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors shadow-2xs"
                  >
                    @cliente.nome
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleInsertMention('@cliente.nome_completo')}
                    data-testid="pill-cliente-nome-completo"
                    className="rounded-lg bg-blue-500/10 border border-blue-500/40 px-2 py-1 text-[11px] font-mono text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors shadow-2xs"
                  >
                    @cliente.nome_completo
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleInsertMention('@cliente.data_aniversario')}
                    data-testid="pill-cliente-aniversario"
                    className="rounded-lg bg-blue-500/10 border border-blue-500/40 px-2 py-1 text-[11px] font-mono text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors shadow-2xs"
                  >
                    @cliente.data_aniversario
                  </button>
                </div>
              </div>

              {/* Pills do Tipo 2: Condicionais aos Objetos Adicionados */}
              {(selectedLawsuit || selectedFinancial || selectedDate) ? (
                <div className="pt-2 border-t border-border/30 space-y-2">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Pills dos Objetos Vinculados:
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {/* Pills do Processo (só aparecem se tiver processo selecionado) */}
                    {selectedLawsuit && (
                      <>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertMention('@processo.numero')}
                          data-testid="pill-processo-numero"
                          className="rounded-lg bg-blue-500/10 border border-blue-500/40 px-2 py-1 text-[11px] font-mono text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors shadow-2xs"
                        >
                          @processo.numero
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertMention('@processo.vara')}
                          data-testid="pill-processo-vara"
                          className="rounded-lg bg-blue-500/10 border border-blue-500/40 px-2 py-1 text-[11px] font-mono text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors shadow-2xs"
                        >
                          @processo.vara
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertMention('@processo.comarca')}
                          data-testid="pill-processo-comarca"
                          className="rounded-lg bg-blue-500/10 border border-blue-500/40 px-2 py-1 text-[11px] font-mono text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors shadow-2xs"
                        >
                          @processo.comarca
                        </button>
                      </>
                    )}

                    {/* Pills de Financeiro (só aparecem se tiver financeiro selecionado) */}
                    {selectedFinancial && (
                      <>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertMention('@fatura.valor')}
                          data-testid="pill-fatura-valor"
                          className="rounded-lg bg-emerald-500/10 border border-emerald-500/40 px-2 py-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors shadow-2xs"
                        >
                          @fatura.valor
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertMention('@fatura.vencimento')}
                          data-testid="pill-fatura-vencimento"
                          className="rounded-lg bg-emerald-500/10 border border-emerald-500/40 px-2 py-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors shadow-2xs"
                        >
                          @fatura.vencimento
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertMention('@fatura.codigo_pix')}
                          data-testid="pill-fatura-pix"
                          className="rounded-lg bg-emerald-500/10 border border-emerald-500/40 px-2 py-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors shadow-2xs"
                        >
                          @fatura.codigo_pix
                        </button>
                      </>
                    )}

                    {/* Pills de Data/Prazo (só aparecem se tiver data selecionada) */}
                    {selectedDate && (
                      <>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertMention('@data.audiencia')}
                          data-testid="pill-data-audiencia"
                          className="rounded-lg bg-purple-500/10 border border-purple-500/40 px-2 py-1 text-[11px] font-mono text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-colors shadow-2xs"
                        >
                          @data.audiencia
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertMention('@data.horario')}
                          data-testid="pill-data-horario"
                          className="rounded-lg bg-purple-500/10 border border-purple-500/40 px-2 py-1 text-[11px] font-mono text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-colors shadow-2xs"
                        >
                          @data.horario
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertMention('@data.local')}
                          data-testid="pill-data-local"
                          className="rounded-lg bg-purple-500/10 border border-purple-500/40 px-2 py-1 text-[11px] font-mono text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-colors shadow-2xs"
                        >
                          @data.local
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="pt-1.5 text-[11px] text-muted-foreground/80 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span>Selecione um ícone acima (Financeiro, Processo ou Data) para habilitar as tags específicas daquele objeto.</span>
                </div>
              )}
            </div>
            )}

            {/* Campo Textarea (Escrever) ou Container de Prévia (Prévia) */}
            {activeTab === 'edit' ? (
              <textarea
                id="message-content"
                ref={textareaRef}
                rows={5}
                required
                placeholder="Digite a mensagem. Ex: Olá @cliente.nome, informamos que a sua audiência do processo @processo.numero está marcada para @data.audiencia."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-background/80 p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed font-sans transition-all"
              />
            ) : (
              <div
                data-testid="message-preview-container"
                className="w-full min-h-[120px] max-h-[220px] overflow-y-auto rounded-xl border border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/20 p-3.5 text-xs text-foreground leading-relaxed font-sans"
              >
                <div className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                  <Eye className="h-3 w-3" /> Visualização com Pills Formatadas:
                </div>
                {content.trim() ? (
                  renderContentWithPills(content)
                ) : (
                  <span className="text-muted-foreground italic text-xs">
                    Nenhum texto digitado ainda. Volte para a aba "Escrever" para redigir a mensagem ou inserir pills.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/30">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              Salvar {isMessage ? 'Mensagem' : 'Modelo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
