import * as React from 'react';
import {
  MessageCircle,
  ExternalLink,
  FolderOpen,
  MoreVertical,
  Archive,
  FileText,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  FileSearch,
  Eye,
  Scale,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/ui/avatar';
import { Button } from '@/features/ui/button';
import { GlassPanel } from '@/features/ui/glass-panel';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/features/ui/dropdown-menu';
import { TriageCase } from './types';
import { TriageStatusBadge } from './TriageBadges';
import {
  formatPhoneBR,
  buildWhatsAppUrl,
  getInitials,
  summarizeCnj,
} from './mock-data';
import { cn } from '@/shared/cn';

interface TriageTableProps {
  cases: TriageCase[];
  selectedCaseId?: string | null;
  onSelectCase: (triageCase: TriageCase, initialDocumentId?: string) => void;
  onTakeoverWhatsApp: (triageCase: TriageCase) => void;
  onOpenLinkProcess?: (triageCase: TriageCase) => void;
  onCompleteTriage?: (caseId: string) => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const TriageTable: React.FC<TriageTableProps> = ({
  cases,
  selectedCaseId,
  onSelectCase,
  onTakeoverWhatsApp,
  onOpenLinkProcess,
  onCompleteTriage,
  header,
  footer,
}) => {
  return (
    <GlassPanel className="overflow-hidden">
      {/* Barra de Filtros e Ações integrada no topo da caixa */}
      {header && (
        <>
          <div className="p-3.5 sm:p-4">
            {header}
          </div>
          <div className="border-t border-border/50" />
        </>
      )}

      {cases.length === 0 ? (
        <div className="p-10 flex flex-col items-center justify-center text-center">
          <div className="size-11 rounded-2xl bg-muted/70 border border-border/50 flex items-center justify-center text-muted-foreground mb-3">
            <FolderOpen className="size-5" />
          </div>
          <h3 className="text-sm font-bold font-headline text-foreground">
            Nenhuma sessão de triagem encontrada
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mt-1">
            Não há atendimentos ou coletas de documentos que correspondam aos filtros ou termos pesquisados.
          </p>
        </div>
      ) : (
        /* Container com scroll horizontal seguro para monitores menores */
        <div className="w-full overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs min-w-[860px]">
          <thead>
            <tr className="border-b border-border/50 bg-muted/20 text-[11px] font-semibold text-muted-foreground h-10">
              <th scope="col" className="py-2.5 pl-4 pr-2 font-semibold">
                Cliente
              </th>
              <th scope="col" className="py-2.5 px-2 font-semibold">
                Vínculo / Processo
              </th>
              <th scope="col" className="py-2.5 px-2 font-semibold">
                Motivo / Área
              </th>
              <th scope="col" className="py-2.5 px-2 font-semibold">
                Checklist de Documentos
              </th>
              <th scope="col" className="py-2.5 px-2 font-semibold">
                Status
              </th>
              <th scope="col" className="py-2.5 pl-2 pr-4 text-right font-semibold w-[90px]">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {cases.map((item) => {
              const isSelected = selectedCaseId === item.id;
              const approvedCount = item.documentos.filter(
                (d) => d.status === 'Aprovado'
              ).length;
              const totalDocs = item.documentos.length;

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectCase(item)}
                  className={cn(
                    'transition-colors hover:bg-muted/35 cursor-pointer group',
                    isSelected && 'bg-primary/[0.04]',
                    item.arquivado && 'opacity-70'
                  )}
                >
                  {/* Coluna 1: Cliente */}
                  <td className="py-3 pl-4 pr-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8 ring-1 ring-border/60 shrink-0">
                        {item.cliente.avatarUrl && (
                          <AvatarImage
                            src={item.cliente.avatarUrl}
                            alt={item.cliente.nome}
                          />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary dark:text-secondary font-bold text-[11px]">
                          {getInitials(item.cliente.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span
                          className="font-semibold text-foreground text-xs group-hover:text-primary transition-colors truncate max-w-[170px]"
                          title={item.cliente.nome}
                        >
                          {item.cliente.nome}
                        </span>
                        <div className="flex items-center text-[10px] text-muted-foreground mt-0.5">
                          <a
                            href={buildWhatsAppUrl(item.cliente.telefone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                            title="Abrir conversa no WhatsApp"
                          >
                            <MessageCircle className="size-2.5" />
                            <span>{formatPhoneBR(item.cliente.telefone)}</span>
                            <ExternalLink className="size-2 opacity-65" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Coluna 2: Vínculo / Processo */}
                  <td className="py-3 px-2">
                    {!item.processo ? (
                      <span className="text-xs text-muted-foreground/85 font-medium">
                        Pré-processual
                      </span>
                    ) : (
                      <div
                        className="flex flex-col items-start leading-tight"
                        title={`CNJ: ${item.processo.numero_cnj} — ${item.processo.vara}`}
                      >
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {summarizeCnj(item.processo.numero_cnj)}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[170px] mt-0.5">
                          {item.processo.vara}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Coluna 3: Motivo / Área */}
                  <td className="py-3 px-2 whitespace-nowrap">
                    <span className="text-xs font-medium text-foreground">
                      {item.area_motivo}
                    </span>
                  </td>

                  {/* Coluna 4: Checklist de Documentos (Balão Popover Interativo) */}
                  <td
                    className="py-3 px-2 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all select-none',
                            approvedCount === totalDocs
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20'
                              : item.documentos.some(
                                  (d) => d.status === 'Reprovado/Ilegível'
                                )
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25 hover:bg-rose-500/20'
                              : 'bg-muted/70 text-foreground border-border/70 hover:bg-muted'
                          )}
                          title="Clique para ver o checklist completo de documentos"
                          aria-label={`Checklist: ${approvedCount} de ${totalDocs} documentos aprovados`}
                        >
                          <FileText className="size-3.5 shrink-0" />
                          <span>
                            {approvedCount}/{totalDocs} aprovados
                          </span>
                          <ChevronDown className="size-3 opacity-60 shrink-0" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-84 sm:w-96 p-3 bg-popover text-popover-foreground border border-border shadow-xl dark:shadow-2xl dark:shadow-black/60 ring-1 ring-black/5 dark:ring-white/10 rounded-2xl"
                      >
                        <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-border/60 px-0.5">
                          <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                            <FileText className="size-4 text-primary" />
                            <span>Checklist de Documentos</span>
                          </div>
                          <span
                            className={cn(
                              'text-[11px] font-bold px-2 py-0.5 rounded-full border',
                              approvedCount === totalDocs
                                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                                : item.documentos.some(
                                    (d) => d.status === 'Reprovado/Ilegível'
                                  )
                                ? 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30'
                                : 'bg-muted text-foreground/80 border-border/60'
                            )}
                          >
                            {approvedCount} de {totalDocs} aprovados
                          </span>
                        </div>

                        <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-0.5">
                          {item.documentos.map((doc) => {
                            const isApproved = doc.status === 'Aprovado';
                            const isRejected =
                              doc.status === 'Reprovado/Ilegível';
                            const isUnderAnalysis =
                              doc.status === 'Em Análise';

                            return (
                              <DropdownMenuItem
                                key={doc.id}
                                onClick={() => onSelectCase(item, doc.id)}
                                className={cn(
                                  'flex flex-col items-start gap-1.5 p-2.5 rounded-xl border transition-all cursor-pointer',
                                  isApproved
                                    ? 'border-emerald-500/25 bg-emerald-500/[0.04] hover:bg-emerald-500/10 hover:border-emerald-500/40'
                                    : isRejected
                                    ? 'border-rose-500/30 bg-rose-500/[0.06] hover:bg-rose-500/15 hover:border-rose-500/45'
                                    : 'border-border/60 bg-muted/20 hover:bg-muted/60 hover:border-border'
                                )}
                              >
                                <div className="flex items-center justify-between w-full gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {isApproved ? (
                                      <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    ) : isRejected ? (
                                      <XCircle className="size-4 text-rose-600 dark:text-rose-400 shrink-0" />
                                    ) : isUnderAnalysis ? (
                                      <FileSearch className="size-4 text-primary shrink-0" />
                                    ) : (
                                      <Clock className="size-4 text-muted-foreground shrink-0" />
                                    )}
                                    <span
                                      className="text-xs font-semibold text-foreground truncate"
                                      title={doc.tipo_documento}
                                    >
                                      {doc.tipo_documento}
                                    </span>
                                  </div>
                                  <span
                                    className={cn(
                                      'text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0',
                                      isApproved &&
                                        'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
                                      isRejected &&
                                        'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30',
                                      isUnderAnalysis &&
                                        'bg-primary/15 text-primary dark:text-secondary border-primary/30',
                                      doc.status === 'Pendente' &&
                                        'bg-muted text-foreground/80 border-border/60'
                                    )}
                                  >
                                    {doc.status}
                                  </span>
                                </div>
                                {doc.motivo_reprovacao && (
                                  <div className="w-full text-[11px] font-medium text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-2.5 py-1 mt-0.5 leading-snug">
                                    <span className="font-semibold">Motivo:</span> {doc.motivo_reprovacao}
                                  </div>
                                )}
                              </DropdownMenuItem>
                            );
                          })}
                        </div>

                        <div className="pt-2 mt-2 border-t border-border/50 px-1 text-[11px] text-muted-foreground flex items-center justify-between font-medium">
                          <span>Clique no documento para inspecionar no painel</span>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>

                  {/* Coluna 5: Status da Triagem */}
                  <td className="py-3 px-2 whitespace-nowrap">
                    <TriageStatusBadge
                      status={item.status_triagem}
                      botPaused={item.conversa_bot.bot_pausado}
                    />
                  </td>

                  {/* Coluna 6: Ações (Atalho WhatsApp + Menu Dropdown) */}
                  <td
                    className="py-3 pl-2 pr-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="inline-flex items-center justify-end gap-1">
                      {/* Atalho Direto WhatsApp */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTakeoverWhatsApp(item)}
                        className="size-7 p-0 rounded-lg border-emerald-500/35 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 shrink-0"
                        title="Assumir no WhatsApp"
                        aria-label="Assumir no WhatsApp"
                      >
                        <MessageCircle className="size-3.5" />
                      </Button>

                      {/* Menu de Opções Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="size-7 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Mais opções do atendimento"
                            aria-label={`Mais opções do atendimento ${item.protocolo}`}
                          >
                            <MoreVertical className="size-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem
                            onClick={() => onSelectCase(item)}
                            className="gap-2"
                          >
                            <Eye className="size-3.5 text-muted-foreground" />
                            <span>Ver Detalhes & Conferência</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => onTakeoverWhatsApp(item)}
                            className="gap-2 text-emerald-700 dark:text-emerald-400 focus:text-emerald-700"
                          >
                            <MessageCircle className="size-3.5" />
                            <span>Assumir no WhatsApp</span>
                          </DropdownMenuItem>

                          {!item.processo && onOpenLinkProcess && (
                            <DropdownMenuItem
                              onClick={() => onOpenLinkProcess(item)}
                              className="gap-2"
                            >
                              <Scale className="size-3.5 text-primary" />
                              <span>Vincular a Processo</span>
                            </DropdownMenuItem>
                          )}

                          {onCompleteTriage && !item.arquivado && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onCompleteTriage(item.id)}
                                className="gap-2 text-muted-foreground hover:text-foreground"
                              >
                                <Archive className="size-3.5" />
                                <span>Concluir & Arquivar</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      {/* Paginação Fixada na base da tabela fora do scroll horizontal */}
      {footer}
    </GlassPanel>
  );
};
