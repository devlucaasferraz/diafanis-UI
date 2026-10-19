import * as React from 'react';
import {
  MessageCircle,
  ExternalLink,
  FolderOpen,
  AlertTriangle,
  MoreVertical,
  Eye,
  Scale,
  Archive,
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
import {
  TriageStatusBadge,
  DocumentChecklistTag,
  ProcessLinkBadge,
} from './TriageBadges';
import {
  formatPhoneBR,
  buildWhatsAppUrl,
  getInitials,
} from './mock-data';
import { cn } from '@/shared/cn';

interface TriageTableProps {
  cases: TriageCase[];
  selectedCaseId?: string | null;
  onSelectCase: (triageCase: TriageCase, initialDocumentId?: string) => void;
  onTakeoverWhatsApp: (triageCase: TriageCase) => void;
  onOpenLinkProcess?: (triageCase: TriageCase) => void;
  onCompleteTriage?: (caseId: string) => void;
  footer?: React.ReactNode;
}

export const TriageTable: React.FC<TriageTableProps> = ({
  cases,
  selectedCaseId,
  onSelectCase,
  onTakeoverWhatsApp,
  onOpenLinkProcess,
  onCompleteTriage,
  footer,
}) => {
  if (cases.length === 0) {
    return (
      <GlassPanel className="p-10 flex flex-col items-center justify-center text-center">
        <div className="size-11 rounded-2xl bg-muted/70 border border-border/50 flex items-center justify-center text-muted-foreground mb-3">
          <FolderOpen className="size-5" />
        </div>
        <h3 className="text-sm font-bold font-headline text-foreground">
          Nenhuma sessão de triagem encontrada
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mt-1">
          Não há atendimentos ou coletas de documentos que correspondam aos filtros ou termos pesquisados.
        </p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="overflow-hidden">
      {/* Container com scroll horizontal seguro para monitores menores */}
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
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-semibold text-foreground text-xs group-hover:text-primary transition-colors truncate max-w-[150px]"
                            title={item.cliente.nome}
                          >
                            {item.cliente.nome}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground/75 shrink-0">
                            ({item.protocolo})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                          <a
                            href={buildWhatsAppUrl(item.cliente.telefone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                            title="Abrir conversa no WhatsApp"
                          >
                            <MessageCircle className="size-2.5" />
                            <span>{formatPhoneBR(item.cliente.telefone)}</span>
                            <ExternalLink className="size-2 opacity-65" />
                          </a>
                          <span className="text-border">•</span>
                          <span className="font-mono">{item.cliente.cpf}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Coluna 2: Vínculo / Processo */}
                  <td className="py-3 px-2">
                    <ProcessLinkBadge processo={item.processo} />
                  </td>

                  {/* Coluna 3: Motivo / Área */}
                  <td className="py-3 px-2">
                    <div className="flex flex-col items-start gap-1">
                      <span className="inline-flex items-center rounded-md bg-secondary/10 border border-secondary/25 px-2 py-0.5 text-[10px] font-semibold text-foreground whitespace-nowrap">
                        {item.area_motivo}
                      </span>
                      {item.conversa_bot.alerta_dificuldade && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-400 max-w-[140px] truncate"
                          title={item.conversa_bot.alerta_dificuldade}
                        >
                          <AlertTriangle className="size-3 shrink-0" />
                          <span className="truncate">Relatou dificuldade</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Coluna 4: Checklist de Documentos */}
                  <td className="py-3 px-2">
                    <div className="flex flex-col gap-1 max-w-[240px]">
                      <div className="flex flex-wrap items-center gap-1">
                        {item.documentos.map((doc) => (
                          <DocumentChecklistTag
                            key={doc.id}
                            tipoDocumento={doc.tipo_documento}
                            status={doc.status}
                            motivoReprovacao={doc.motivo_reprovacao}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCase(item, doc.id);
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {approvedCount}/{totalDocs} aprovados
                      </span>
                    </div>
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

      {/* Paginação Fixada na base da tabela fora do scroll horizontal */}
      {footer}
    </GlassPanel>
  );
};
