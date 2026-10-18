import * as React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import {
  TriageCase,
  TriageFilterTab,
  Processo,
  Documento,
} from './types';
import {
  initialTriageCases,
  computeMetrics,
  deriveTriageStatusFromDocuments,
  buildWhatsAppUrl,
} from './mock-data';
import { TriageHeaderMetrics } from './TriageHeaderMetrics';
import { TriageTable } from './TriageTable';
import { TriageDrawer } from './TriageDrawer';
import {
  NewTriageModal,
  NewTriageSessionPayload,
} from './NewTriageModal';

export const TriageContainer: React.FC = () => {
  const [cases, setCases] = React.useState<TriageCase[]>(initialTriageCases);
  const [currentTab, setCurrentTab] = React.useState<TriageFilterTab>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showArchived, setShowArchived] = React.useState(false);

  // Drawer state
  const [selectedCaseId, setSelectedCaseId] = React.useState<string | null>(null);
  const [drawerInitialDocId, setDrawerInitialDocId] = React.useState<string | null>(
    null
  );

  // New Triage Modal state
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);

  // Feedback banner
  const [feedbackBanner, setFeedbackBanner] = React.useState<string | null>(
    null
  );

  const showFeedback = (msg: string) => {
    setFeedbackBanner(msg);
  };

  const metrics = React.useMemo(() => computeMetrics(cases), [cases]);

  const filteredCases = React.useMemo(() => {
    return cases.filter((item) => {
      if (!showArchived && item.arquivado) return false;

      if (currentTab === 'ready' && item.status_triagem !== 'Pronto para Análise') {
        return false;
      }
      if (currentTab === 'manual' && item.status_triagem !== 'Intervenção Manual') {
        return false;
      }
      if (currentTab === 'leads' && item.processo !== null) {
        return false;
      }
      if (currentTab === 'ongoing' && item.processo === null) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.cliente.nome.toLowerCase().includes(q);
        const matchCpf = item.cliente.cpf.toLowerCase().includes(q);
        const matchPhone = item.cliente.telefone.toLowerCase().includes(q);
        const matchProtocol = item.protocolo.toLowerCase().includes(q);
        const matchArea = item.area_motivo.toLowerCase().includes(q);
        const matchProcess = item.processo
          ? item.processo.numero_cnj.toLowerCase().includes(q) ||
            item.processo.vara.toLowerCase().includes(q)
          : false;

        if (
          !matchName &&
          !matchCpf &&
          !matchPhone &&
          !matchProtocol &&
          !matchArea &&
          !matchProcess
        ) {
          return false;
        }
      }

      return true;
    });
  }, [cases, currentTab, searchQuery, showArchived]);

  const selectedCase = React.useMemo(
    () => cases.find((c) => c.id === selectedCaseId) || null,
    [cases, selectedCaseId]
  );

  const handleSelectCase = (
    triageCase: TriageCase,
    initialDocumentId?: string
  ) => {
    setSelectedCaseId(triageCase.id);
    setDrawerInitialDocId(initialDocumentId || null);
  };

  const handleApproveDocument = (caseId: string, documentId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const updatedDocs = c.documentos.map((d) =>
          d.id === documentId
            ? {
                ...d,
                status: 'Aprovado' as const,
                motivo_reprovacao: undefined,
                updated_at: new Date().toISOString(),
              }
            : d
        );
        const nextCase: TriageCase = {
          ...c,
          documentos: updatedDocs,
          updated_at: new Date().toISOString(),
        };
        nextCase.status_triagem = deriveTriageStatusFromDocuments(nextCase);
        return nextCase;
      })
    );
    showFeedback('Documento aprovado e validado no checklist.');
  };

  const handleRejectDocument = (
    caseId: string,
    documentId: string,
    customReason: string,
    notifyViaWhatsApp: boolean
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const updatedDocs = c.documentos.map((d) =>
          d.id === documentId
            ? {
                ...d,
                status: 'Reprovado/Ilegível' as const,
                motivo_reprovacao: customReason,
                updated_at: new Date().toISOString(),
              }
            : d
        );
        const nextCase: TriageCase = {
          ...c,
          documentos: updatedDocs,
          status_triagem: 'Intervenção Manual',
          conversa_bot: {
            ...c.conversa_bot,
            ultima_mensagem: notifyViaWhatsApp
              ? `[Solicitação de reenvio enviada]: ${customReason}`
              : c.conversa_bot.ultima_mensagem,
            horario_ultima_mensagem: 'Agora mesmo',
          },
          updated_at: new Date().toISOString(),
        };
        return nextCase;
      })
    );
    showFeedback(
      notifyViaWhatsApp
        ? 'Documento recusado e solicitação personalizada enviada ao WhatsApp do cliente.'
        : 'Documento marcado como Reprovado/Ilegível.'
    );
  };

  const handleManualUpload = (
    caseId: string,
    targetDocumentId: string,
    fileName: string,
    formato: 'pdf' | 'image'
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const updatedDocs = c.documentos.map((d) =>
          d.id === targetDocumentId
            ? {
                ...d,
                nome: fileName,
                formato,
                tamanho: '1.1 MB',
                url_arquivo: `https://diafanis.storage.local/docs/${fileName}`,
                status: 'Aprovado' as const,
                motivo_reprovacao: undefined,
                updated_at: new Date().toISOString(),
              }
            : d
        );
        const nextCase: TriageCase = {
          ...c,
          documentos: updatedDocs,
          updated_at: new Date().toISOString(),
        };
        nextCase.status_triagem = deriveTriageStatusFromDocuments(nextCase);
        return nextCase;
      })
    );
    showFeedback(`Arquivo "${fileName}" anexado manualmente e validado.`);
  };

  const handleLinkProcess = (caseId: string, processo: Processo) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          processo,
          documentos: c.documentos.map((d) => ({
            ...d,
            processo_id: processo.id,
          })),
          updated_at: new Date().toISOString(),
        };
      })
    );
    showFeedback(
      `Atendimento vinculado com sucesso ao processo ${processo.numero_cnj}.`
    );
  };

  const handleTakeoverWhatsApp = (triageCase: TriageCase) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== triageCase.id) return c;
        return {
          ...c,
          status_triagem: 'Intervenção Manual',
          conversa_bot: {
            ...c.conversa_bot,
            bot_pausado: true,
          },
          updated_at: new Date().toISOString(),
        };
      })
    );

    const url = buildWhatsAppUrl(
      triageCase.cliente.telefone,
      `Olá ${triageCase.cliente.nome.split(' ')[0]}, sou da equipe jurídica. Assumi seu atendimento por aqui para te ajudar com os documentos de ${triageCase.area_motivo}.`
    );
    if (typeof window !== 'undefined' && typeof window.open === 'function') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    showFeedback(
      `Bot pausado para ${triageCase.cliente.nome}. Atendimento humano ativado no WhatsApp.`
    );
  };

  const handleToggleBotPause = (caseId: string, openWhatsApp = false) => {
    const target = cases.find((c) => c.id === caseId);
    if (!target) return;

    const willPause = !target.conversa_bot.bot_pausado;

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const nextCase: TriageCase = {
          ...c,
          conversa_bot: {
            ...c.conversa_bot,
            bot_pausado: willPause,
          },
          updated_at: new Date().toISOString(),
        };
        nextCase.status_triagem = willPause
          ? 'Intervenção Manual'
          : deriveTriageStatusFromDocuments(nextCase);
        return nextCase;
      })
    );

    if (willPause && openWhatsApp) {
      const url = buildWhatsAppUrl(
        target.cliente.telefone,
        `Olá ${target.cliente.nome.split(' ')[0]}, assumi seu atendimento para auxiliar no envio dos documentos.`
      );
      if (typeof window !== 'undefined' && typeof window.open === 'function') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }

    showFeedback(
      willPause
        ? `Bot pausado. Você assumiu o atendimento de ${target.cliente.nome}.`
        : `Bot reativado para o atendimento de ${target.cliente.nome}.`
    );
  };

  const handleCompleteTriage = (caseId: string) => {
    const target = cases.find((c) => c.id === caseId);
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          status_triagem: 'Concluído',
          arquivado: true,
          updated_at: new Date().toISOString(),
        };
      })
    );
    setSelectedCaseId(null);
    if (target) {
      showFeedback(
        `Triagem de ${target.cliente.nome} (${target.protocolo}) concluída e arquivada com sucesso.`
      );
    }
  };

  const handleCreateNewSession = (payload: NewTriageSessionPayload) => {
    const nowIso = new Date().toISOString();
    const nextNumber = cases.length + 1;
    const protocolo = `TRI-2026-${String(nextNumber).padStart(3, '0')}`;
    const newCaseId = `tri-new-${Date.now()}`;

    const generatedDocs: Documento[] = payload.documentosSolicitados.map(
      (tipo, idx) => ({
        id: `doc-${Date.now()}-${idx}`,
        cliente_id: payload.cliente.id,
        processo_id: payload.processo ? payload.processo.id : null,
        nome: 'Aguardando envio pelo cliente',
        tipo_documento: tipo,
        url_arquivo: '',
        formato: 'pdf',
        status: 'Pendente',
        created_at: nowIso,
        updated_at: nowIso,
      })
    );

    const newCase: TriageCase = {
      id: newCaseId,
      protocolo,
      cliente: payload.cliente,
      processo: payload.processo,
      area_motivo: payload.area_motivo,
      status_triagem: 'Coleta em Andamento',
      conversa_bot: {
        motivo_relatado: `Coleta iniciada para ${payload.area_motivo} (${payload.documentosSolicitados.length} documentos solicitados).`,
        ultima_mensagem: payload.dispararWhatsAppImediatamente
          ? 'Bot WhatsApp: Mensagem inicial disparada com a lista de documentos solicitados.'
          : 'Sessão criada manualmente. Aguardando disparo.',
        horario_ultima_mensagem: 'Agora mesmo',
        bot_pausado: false,
      },
      documentos: generatedDocs,
      arquivado: false,
      created_at: nowIso,
      updated_at: nowIso,
    };

    setCases((prev) => [newCase, ...prev]);
    setCurrentTab('all');
    showFeedback(
      payload.dispararWhatsAppImediatamente
        ? `Nova sessão ${protocolo} criada e WhatsApp disparado para ${payload.cliente.nome}.`
        : `Nova sessão ${protocolo} criada para ${payload.cliente.nome}.`
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Feedback Banner */}
      {feedbackBanner && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-800 dark:text-emerald-200 animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedbackBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="rounded-lg p-1 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
            aria-label="Fechar aviso"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* 1. Cabeçalho, 3 Cards de Indicadores e Barra de Filtros */}
      <TriageHeaderMetrics
        metrics={metrics}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showArchived={showArchived}
        onToggleShowArchived={() => setShowArchived((prev) => !prev)}
        onOpenNewTriageModal={() => setIsNewModalOpen(true)}
      />

      {/* 2. Tabela Principal de Atendimentos */}
      <TriageTable
        cases={filteredCases}
        selectedCaseId={selectedCaseId}
        onSelectCase={handleSelectCase}
        onTakeoverWhatsApp={handleTakeoverWhatsApp}
      />

      {/* 3. Drawer Lateral de Detalhes & Conferência (Split-View) */}
      <TriageDrawer
        triageCase={selectedCase}
        isOpen={Boolean(selectedCase)}
        initialDocumentId={drawerInitialDocId}
        onClose={() => setSelectedCaseId(null)}
        onApproveDocument={handleApproveDocument}
        onRejectDocument={handleRejectDocument}
        onManualUpload={handleManualUpload}
        onLinkProcess={handleLinkProcess}
        onToggleBotPause={handleToggleBotPause}
        onCompleteTriage={handleCompleteTriage}
      />

      {/* 4. Modal / Dialog de Nova Coleta */}
      <NewTriageModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreateSession={handleCreateNewSession}
      />
    </div>
  );
};
