import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/features/ui/sheet';
import { Button } from '@/features/ui/button';
import { Avatar, AvatarFallback } from '@/features/ui/avatar';
import {
  MessageCircle,
  ExternalLink,
  Scale,
  Plus,
  Bot,
  AlertTriangle,
  Check,
  XCircle,
  Upload,
  FileText,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Eye,
  Archive,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { TriageCase, Documento, Processo } from './types';
import { TriageStatusBadge, DocumentStatusPill } from './TriageBadges';
import {
  formatPhoneBR,
  buildWhatsAppUrl,
  getInitials,
} from './mock-data';
import { RejectDocumentModal } from './RejectDocumentModal';
import { LinkProcessModal } from './LinkProcessModal';
import { CompleteTriageAlertModal } from './CompleteTriageAlertModal';
import { cn } from '@/shared/cn';

interface TriageDrawerProps {
  triageCase: TriageCase | null;
  isOpen: boolean;
  initialDocumentId?: string | null;
  onClose: () => void;
  onApproveDocument: (caseId: string, documentId: string) => void;
  onRejectDocument: (
    caseId: string,
    documentId: string,
    customReason: string,
    notifyViaWhatsApp: boolean
  ) => void;
  onManualUpload: (
    caseId: string,
    targetDocumentId: string,
    fileName: string,
    formato: 'pdf' | 'image'
  ) => void;
  onLinkProcess: (caseId: string, processo: Processo) => void;
  onToggleBotPause: (caseId: string, openWhatsApp?: boolean) => void;
  onCompleteTriage: (caseId: string) => void;
}

export const TriageDrawer: React.FC<TriageDrawerProps> = ({
  triageCase,
  isOpen,
  initialDocumentId,
  onClose,
  onApproveDocument,
  onRejectDocument,
  onManualUpload,
  onLinkProcess,
  onToggleBotPause,
  onCompleteTriage,
}) => {
  const [activeDocId, setActiveDocId] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState<number>(100);
  const [rotation, setRotation] = React.useState<number>(0);

  // Modals inside drawer context
  const [docToReject, setDocToReject] = React.useState<Documento | null>(null);
  const [isLinkProcessOpen, setIsLinkProcessOpen] = React.useState(false);
  const [isCompleteAlertOpen, setIsCompleteAlertOpen] = React.useState(false);

  // Manual upload state
  const [uploadTargetDocId, setUploadTargetDocId] = React.useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (triageCase && triageCase.documentos.length > 0) {
      if (
        initialDocumentId &&
        triageCase.documentos.some((d) => d.id === initialDocumentId)
      ) {
        setActiveDocId(initialDocumentId);
      } else {
        setActiveDocId((prev) =>
          prev && triageCase.documentos.some((d) => d.id === prev)
            ? prev
            : triageCase.documentos[0].id
        );
      }

      const firstPendingOrRejected =
        triageCase.documentos.find(
          (d) => d.status === 'Pendente' || d.status === 'Reprovado/Ilegível'
        ) || triageCase.documentos[0];
      setUploadTargetDocId(firstPendingOrRejected.id);
    }
  }, [triageCase, initialDocumentId]);

  React.useEffect(() => {
    setZoom(100);
    setRotation(0);
  }, [activeDocId]);

  if (!triageCase) return null;

  const activeDocument =
    triageCase.documentos.find((d) => d.id === activeDocId) ||
    triageCase.documentos[0] ||
    null;

  const nonApprovedDocs = triageCase.documentos.filter(
    (d) => d.status !== 'Aprovado'
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetDocId) return;
    const isImg = /\.(jpg|jpeg|png|webp)$/i.test(file.name);
    onManualUpload(
      triageCase.id,
      uploadTargetDocId,
      file.name,
      isImg ? 'image' : 'pdf'
    );
    setActiveDocId(uploadTargetDocId);
    e.target.value = '';
  };

  const handleSimulatedManualUpload = () => {
    const targetDoc =
      triageCase.documentos.find((d) => d.id === uploadTargetDocId) ||
      triageCase.documentos[0];
    if (!targetDoc) return;
    const sanitizedType = targetDoc.tipo_documento
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_');
    const cleanClient = triageCase.cliente.nome.split(' ')[0];
    const generatedName = `${sanitizedType}_${cleanClient}_Manual.pdf`;
    onManualUpload(triageCase.id, targetDoc.id, generatedName, 'pdf');
    setActiveDocId(targetDoc.id);
  };

  const handleClickComplete = () => {
    if (nonApprovedDocs.length > 0) {
      setIsCompleteAlertOpen(true);
    } else {
      onCompleteTriage(triageCase.id);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-5xl p-0 flex flex-col overflow-hidden bg-card border-l border-border/60"
        >
          {/* 1. CABEÇALHO DO DRAWER */}
          <SheetHeader className="px-6 py-4 border-b border-border/50 bg-muted/20 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 ring-1 ring-border/60">
                  <AvatarFallback className="bg-primary/10 text-primary dark:text-secondary font-bold text-xs">
                    {getInitials(triageCase.cliente.nome)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SheetTitle className="text-base font-bold font-headline text-foreground">
                      {triageCase.cliente.nome}
                    </SheetTitle>
                    <span className="font-mono text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      {triageCase.protocolo}
                    </span>
                    <TriageStatusBadge
                      status={triageCase.status_triagem}
                      botPaused={triageCase.conversa_bot.bot_pausado}
                    />
                  </div>
                  <SheetDescription className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                    <span>CPF: {triageCase.cliente.cpf}</span>
                    <span>•</span>
                    <span>Área: {triageCase.area_motivo}</span>
                  </SheetDescription>
                </div>
              </div>

              <a
                href={buildWhatsAppUrl(
                  triageCase.cliente.telefone,
                  `Olá ${triageCase.cliente.nome.split(' ')[0]}, aqui é do escritório jurídico sobre seus documentos (${triageCase.area_motivo}).`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors self-start sm:self-auto"
              >
                <MessageCircle className="size-3.5" />
                <span>{formatPhoneBR(triageCase.cliente.telefone)}</span>
                <ExternalLink className="size-3 opacity-75" />
              </a>
            </div>
          </SheetHeader>

          {/* 2. CORPO PRINCIPAL (SCROLLABLE + SPLIT VIEW) */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            {/* Top Context Row: Processo + Resumo da Conversa com o Bot */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Contexto do Processo (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-border/60 bg-background/60 p-4 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold font-headline text-foreground">
                    <Scale className="size-3.5 text-primary" />
                    <span>Contexto do Processo</span>
                  </span>
                  {triageCase.processo ? (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Vinculado
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Pré-processual / Lead
                    </span>
                  )}
                </div>

                {triageCase.processo ? (
                  <div className="flex flex-col gap-1 rounded-xl bg-muted/50 border border-border/50 p-3">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Autos CNJ
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">
                      {triageCase.processo.numero_cnj}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {triageCase.processo.vara}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground">
                      Atendimento em fase pré-processual. Nenhum processo judicial vinculado até o momento.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsLinkProcessOpen(true)}
                      className="w-full justify-center gap-1.5 border-dashed border-primary/40 text-primary hover:bg-primary/5"
                    >
                      <Plus className="size-3.5" />
                      <span>[+ Vincular a Processo Existente]</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Resumo da Conversa com o Bot (7 cols) */}
              <div className="lg:col-span-7 rounded-2xl border border-border/60 bg-background/60 p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold font-headline text-foreground">
                    <Bot className="size-3.5 text-primary" />
                    <span>Resumo da Conversa com o Bot (WhatsApp)</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {triageCase.conversa_bot.horario_ultima_mensagem}
                  </span>
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed">
                  <span className="font-semibold text-foreground">Relato inicial: </span>
                  {triageCase.conversa_bot.motivo_relatado}
                </p>

                <div className="rounded-xl bg-muted/60 border border-border/50 p-2.5 text-xs italic text-muted-foreground">
                  &ldquo;{triageCase.conversa_bot.ultima_mensagem}&rdquo;
                </div>

                {triageCase.conversa_bot.alerta_dificuldade && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Motivo da Intervenção Manual: </span>
                      <span>{triageCase.conversa_bot.alerta_dificuldade}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. SPLIT-VIEW: LISTA DE DOCUMENTOS (ESQUERDA) + VISUALIZADOR INTEGRADO (DIREITA) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Coluna Esquerda: Lista Interativa de Documentos + Upload Manual (6 cols) */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-headline text-foreground">
                    Checklist de Documentos ({triageCase.documentos.length})
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Selecione um item para inspecionar ao lado
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {triageCase.documentos.map((doc) => {
                    const isActive = activeDocument?.id === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setActiveDocId(doc.id)}
                        className={cn(
                          'rounded-2xl border p-3.5 transition-all cursor-pointer flex flex-col gap-2.5',
                          isActive
                            ? 'border-primary bg-primary/[0.04] ring-1 ring-primary/30 shadow-sm'
                            : 'border-border/60 bg-background/70 hover:bg-muted/30'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div
                              className={cn(
                                'size-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border',
                                doc.status === 'Aprovado'
                                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                                  : doc.status === 'Reprovado/Ilegível'
                                  ? 'bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400'
                                  : 'bg-muted border-border/50 text-muted-foreground'
                              )}
                            >
                              {doc.formato === 'image' ? (
                                <ImageIcon className="size-4" />
                              ) : (
                                <FileText className="size-4" />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-foreground truncate">
                                {doc.tipo_documento}
                              </span>
                              <span className="text-[11px] text-muted-foreground truncate">
                                {doc.nome}
                                {doc.tamanho ? ` • ${doc.tamanho}` : ''}
                              </span>
                            </div>
                          </div>

                          <DocumentStatusPill status={doc.status} />
                        </div>

                        {doc.motivo_reprovacao && (
                          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 text-[11px] text-rose-700 dark:text-rose-300">
                            <span className="font-semibold">Motivo da recusa: </span>
                            {doc.motivo_reprovacao}
                          </div>
                        )}

                        {/* Action Buttons per Document */}
                        <div
                          className="flex items-center justify-between gap-2 pt-1 border-t border-border/30"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveDocId(doc.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                          >
                            <Eye className="size-3.5" />
                            <span>Visualizar prévia</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={doc.status === 'Aprovado'}
                              onClick={() =>
                                onApproveDocument(triageCase.id, doc.id)
                              }
                              aria-label={`Aprovar ${doc.tipo_documento}`}
                              className={cn(
                                'h-7 px-2.5 text-[11px] gap-1 border-emerald-500/35 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15',
                                doc.status === 'Aprovado' &&
                                  'bg-emerald-500/10 opacity-60'
                              )}
                            >
                              <Check className="size-3" />
                              <span>Aprovar</span>
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setDocToReject(doc)}
                              aria-label={`Solicitar Reenvio / Recusar ${doc.tipo_documento}`}
                              className="h-7 px-2.5 text-[11px] gap-1 border-rose-500/35 text-rose-700 dark:text-rose-300 hover:bg-rose-500/15"
                            >
                              <XCircle className="size-3" />
                              <span>Solicitar Reenvio / Recusar</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Área de Upload Manual (Dropzone / Anexar arquivo manualmente) */}
                <div className="rounded-2xl border-2 border-dashed border-border/70 bg-muted/20 p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Upload className="size-4 text-primary" />
                      <span className="text-xs font-bold font-headline text-foreground">
                        Upload Manual pelo Advogado
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      PDF, JPG ou PNG (máx. 15MB)
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    Caso o cliente tenha enviado o documento por e-mail, balcão físico ou você tenha emitido no portal Gov.br/Meu INSS:
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <select
                      aria-label="Selecionar tipo de documento para upload manual"
                      value={uploadTargetDocId}
                      onChange={(e) => setUploadTargetDocId(e.target.value)}
                      className="h-8 flex-1 rounded-xl border border-border/70 bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {triageCase.documentos.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.tipo_documento} ({d.status})
                        </option>
                      ))}
                    </select>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      data-testid="manual-file-input"
                    />

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleSimulatedManualUpload}
                      className="gap-1.5 shrink-0"
                    >
                      <Upload className="size-3.5" />
                      <span>Anexar <br /> arquivo</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Coluna Direita: Visualizador Integrado de Documento (6 cols) */}
              <div className="lg:col-span-6 rounded-2xl border border-border/60 bg-background flex flex-col overflow-hidden min-h-[430px] sticky top-0">
                {/* Barra de Ferramentas do Visualizador */}
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="size-4 text-primary shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground truncate">
                        {activeDocument
                          ? activeDocument.tipo_documento
                          : 'Nenhum documento selecionado'}
                      </span>
                      {activeDocument && (
                        <span className="text-[10px] text-muted-foreground truncate">
                          {activeDocument.nome}
                        </span>
                      )}
                    </div>
                  </div>

                  {activeDocument && activeDocument.status !== 'Pendente' && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.max(60, z - 20))}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Reduzir zoom"
                        aria-label="Reduzir zoom"
                      >
                        <ZoomOut className="size-3.5" />
                      </button>
                      <span className="text-[11px] font-mono font-semibold text-foreground px-1">
                        {zoom}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.min(180, z + 20))}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Aumentar zoom"
                        aria-label="Aumentar zoom"
                      >
                        <ZoomIn className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r - 90) % 360)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Girar para a esquerda"
                        aria-label="Girar para a esquerda"
                      >
                        <RotateCcw className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Girar para a direita"
                        aria-label="Girar para a direita"
                      >
                        <RotateCw className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Área Central de Conferência Visual */}
                <div className="flex-1 bg-muted/25 p-5 flex items-center justify-center overflow-auto min-h-[310px]">
                  {!activeDocument || activeDocument.status === 'Pendente' ? (
                    <div className="flex flex-col items-center justify-center text-center max-w-xs gap-3 p-4">
                      <div className="size-12 rounded-2xl bg-muted border border-border/60 flex items-center justify-center text-muted-foreground">
                        <Upload className="size-6" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="text-xs font-bold text-foreground">
                          Documento ainda pendente de envio
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          O cliente ainda não enviou{' '}
                          <span className="font-semibold text-foreground">
                            {activeDocument?.tipo_documento}
                          </span>{' '}
                          pelo WhatsApp. Você pode anexá-lo manualmente abaixo.
                        </p>
                      </div>
                      {activeDocument && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUploadTargetDocId(activeDocument.id);
                            handleSimulatedManualUpload();
                          }}
                          className="gap-1.5"
                        >
                          <Upload className="size-3.5" />
                          <span>Fazer Upload Manual deste Item</span>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                      }}
                      className={cn(
                        'w-full max-w-md rounded-xl border bg-card p-5 shadow-md transition-transform duration-200 flex flex-col gap-3',
                        activeDocument.status === 'Reprovado/Ilegível' &&
                          'border-rose-500/40'
                      )}
                    >
                      {/* Cabeçalho simulado do documento digitalizado */}
                      <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="size-4 text-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Conferência Digital Diafanís
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {activeDocument.formato.toUpperCase()} • {activeDocument.tamanho || '1.0 MB'}
                        </span>
                      </div>

                      {/* Corpo do Documento Simulado */}
                      <div
                        className={cn(
                          'rounded-lg border border-border/40 bg-muted/30 p-4 flex flex-col gap-2 text-xs',
                          activeDocument.status === 'Reprovado/Ilegível' &&
                            'blur-[0.6px] opacity-80'
                        )}
                      >
                        <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                          <span>TITULAR:</span>
                          <span className="font-bold text-foreground">
                            {triageCase.cliente.nome.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                          <span>CPF:</span>
                          <span className="font-mono font-semibold text-foreground">
                            {triageCase.cliente.cpf}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                          <span>TIPO DOCUMENTAL:</span>
                          <span className="font-semibold text-foreground">
                            {activeDocument.tipo_documento}
                          </span>
                        </div>
                        <div className="h-px bg-border/50 my-1" />
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Arquivo recebido via integração WhatsApp / Upload em{' '}
                          {new Date(activeDocument.updated_at).toLocaleDateString('pt-BR')}.
                          Verifique nitidez, validade, assinatura e correspondência com o titular antes de aprovar.
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                        <span>ID: {activeDocument.id}</span>
                        <a
                          href={activeDocument.url_arquivo || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.preventDefault()}
                          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                        >
                          <span>Abrir original</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Barra Inferior do Visualizador */}
                {activeDocument && (
                  <div className="px-4 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-2">
                    <DocumentStatusPill status={activeDocument.status} />

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={activeDocument.status === 'Aprovado'}
                        onClick={() =>
                          onApproveDocument(triageCase.id, activeDocument.id)
                        }
                        className="h-8 gap-1.5 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Aprovar Documento</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDocToReject(activeDocument)}
                        className="h-8 gap-1.5 border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-500/15"
                      >
                        <XCircle className="size-3.5" />
                        <span>Recusar / Pedir Reenvio</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. RODAPÉ COM AÇÕES GLOBAIS */}
          <div className="px-6 py-4 border-t border-border/60 bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => onToggleBotPause(triageCase.id, true)}
                className="gap-2"
              >
                {triageCase.conversa_bot.bot_pausado ? (
                  <>
                    <PlayCircle className="size-4 text-emerald-600" />
                    <span>Retomar Bot Automático</span>
                  </>
                ) : (
                  <>
                    <PauseCircle className="size-4 text-amber-600" />
                    <span>Assumir Chat (Pausar Bot)</span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="ghost"
                size="default"
                onClick={onClose}
              >
                Fechar
              </Button>

              <Button
                type="button"
                variant="default"
                size="default"
                disabled={triageCase.arquivado}
                onClick={handleClickComplete}
                className="gap-2"
              >
                <Archive className="size-4" />
                <span>
                  {triageCase.arquivado
                    ? 'Triagem Arquivada'
                    : 'Concluir Triagem & Arquivar'}
                </span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal de Reprovação com Mensagem Personalizada */}
      <RejectDocumentModal
        isOpen={Boolean(docToReject)}
        documento={docToReject}
        clientName={triageCase.cliente.nome}
        onClose={() => setDocToReject(null)}
        onConfirmReject={(docId, reason, notify) =>
          onRejectDocument(triageCase.id, docId, reason, notify)
        }
      />

      {/* Modal de Vínculo a Processo Existente */}
      <LinkProcessModal
        isOpen={isLinkProcessOpen}
        clientName={triageCase.cliente.nome}
        onClose={() => setIsLinkProcessOpen(false)}
        onLinkProcess={(proc) => onLinkProcess(triageCase.id, proc)}
      />

      {/* Modal de Alerta ao Concluir Triagem com Pendências */}
      <CompleteTriageAlertModal
        isOpen={isCompleteAlertOpen}
        clientName={triageCase.cliente.nome}
        nonApprovedDocuments={nonApprovedDocs}
        onClose={() => setIsCompleteAlertOpen(false)}
        onForceComplete={() => onCompleteTriage(triageCase.id)}
      />
    </>
  );
};
