import {
  NotificationItem,
  NotificationAPIResponse,
  MessageItem,
  MessageAPIResponse,
  TemplateItem,
  TemplateAPIResponse,
  ClientRecipient,
  ClienteAPIResponse,
  LawsuitOption,
  FinancialOption,
} from './types';

/**
 * Converte resposta da API de Cliente (`Cliente` no backend Django)
 * para o modelo de destinatário do frontend (`ClientRecipient`).
 */
export function mapClientFromAPI(apiItem: ClienteAPIResponse): ClientRecipient {
  const fullName = apiItem.nome || 'Cliente';
  const firstName = fullName.trim().split(' ')[0] || 'Cliente';

  return {
    id: String(apiItem.id),
    name: firstName,
    fullName,
    birthDate: apiItem.data_nascimento || '',
    phone: apiItem.telefone_whatsapp || '',
  };
}

/**
 * Converte resposta da API de Notificação para o modelo de domínio do frontend.
 */
export function mapNotificationFromAPI(apiItem: NotificationAPIResponse): NotificationItem {
  return {
    id: String(apiItem.id),
    title: apiItem.titulo || 'Notificação',
    description: apiItem.texto || '',
    processNumber: apiItem.processo || '',
    assignedLawyer: apiItem.advogado_assinante || 'Advogado',
    deadline: apiItem.prazo || '',
    isFatal: false,
    isRead: Boolean(apiItem.lida),
    createdAt: apiItem.created_at || new Date().toISOString(),
  };
}

/**
 * Converte resposta da API de Mensagem (`Mensagem` no backend Django)
 * para o modelo de domínio da UI (`MessageItem`), resolvendo relacionamentos
 * de clientes, documentos e faturas a partir de mapas opcionais ou dados diretos.
 */
export function mapMessageFromAPI(
  apiItem: MessageAPIResponse,
  context?: {
    clientesMap?: Record<string, ClientRecipient>;
    faturasMap?: Record<string, FinancialOption>;
    documentosMap?: Record<string, LawsuitOption>;
  }
): MessageItem {
  // Resolução do cliente destinatário
  let resolvedClients: ClientRecipient[] = [];
  if (typeof apiItem.destinatario === 'object' && apiItem.destinatario !== null) {
    resolvedClients = [apiItem.destinatario];
  } else if (typeof apiItem.destinatario === 'string') {
    const found = context?.clientesMap?.[apiItem.destinatario];
    if (found) {
      resolvedClients = [found];
    } else {
      resolvedClients = [
        {
          id: apiItem.destinatario,
          name: 'Cliente',
          fullName: 'Cliente Vinculado',
          birthDate: '',
        },
      ];
    }
  }

  // Resolução da fatura vinculada
  let resolvedFinancial: FinancialOption | null = null;
  if (typeof apiItem.fatura === 'object' && apiItem.fatura !== null) {
    resolvedFinancial = apiItem.fatura;
  } else if (typeof apiItem.fatura === 'string') {
    resolvedFinancial = context?.faturasMap?.[apiItem.fatura] || {
      id: apiItem.fatura,
      code: `FAT-${apiItem.fatura.slice(0, 6)}`,
      amount: 'R$ 0,00',
      dueDate: '',
    };
  }

  // Resolução do documento/processo vinculado
  let resolvedLawsuit: LawsuitOption | null = null;
  if (typeof apiItem.documento === 'object' && apiItem.documento !== null) {
    resolvedLawsuit = apiItem.documento;
  } else if (typeof apiItem.documento === 'string') {
    resolvedLawsuit = context?.documentosMap?.[apiItem.documento] || {
      id: apiItem.documento,
      number: 'Processo / Documento',
      court: 'Vara Judicial',
      jurisdiction: 'Comarca',
    };
  }

  return {
    id: String(apiItem.id),
    title: apiItem.titulo || 'Mensagem',
    content: apiItem.texto || '',
    category: 'general',
    hasAlert: Boolean(apiItem.urgente),
    clients: resolvedClients,
    selectedLawsuit: resolvedLawsuit,
    selectedFinancial: resolvedFinancial,
    selectedDate: null,
    scheduledAt: apiItem.data_disparo || null,
    createdAt: apiItem.created_at || new Date().toISOString(),
    updatedAt: apiItem.updated_at,
  };
}

/**
 * Converte resposta da API de Modelo de Mensagem (`ModeloMensagem` no backend Django)
 * para o modelo de domínio da UI (`TemplateItem`).
 */
export function mapTemplateFromAPI(apiItem: TemplateAPIResponse): TemplateItem {
  return {
    id: String(apiItem.id),
    title: apiItem.titulo || 'Modelo',
    content: apiItem.texto || '',
    category: 'general',
    clients: [],
    requiresLawsuit: false,
    requiresFinancial: false,
    requiresDate: false,
    selectedLawsuit: null,
    selectedFinancial: null,
    selectedDate: null,
    updatedAt: apiItem.updated_at || apiItem.created_at || new Date().toISOString(),
  };
}

