/**
 * Camada de integração com a API para Notificações, Mensagens e Modelos.
 *
 * Siga as instruções numeradas abaixo para implementar cada requisição.
 * Para testar ou referenciar, compare com o padrão implementado em `src/features/financial/api.ts`.
 */

import {
  NotificationItem,
  MessageItem,
  TemplateItem,
  ClientRecipient,
  ClienteAPIResponse,
  LawsuitOption,
  FinancialOption,
  HearingDateOption,
  MessagePayload,
  TemplatePayload,
  NotificationAPIResponse,
  MessageAPIResponse,
  TemplateAPIResponse,
} from './types';
import {
  initialNotifications,
  initialMessages,
  initialTemplates,
  allOfficeClients,
  availableLawsuits,
  availableFinancials,
  availableHearingDates,
} from './mock-data';
import {
  mapClientFromAPI,
  mapMessageFromAPI,
  mapNotificationFromAPI,
  mapTemplateFromAPI,
} from './utils';

// ============================================================================
// CONFIGURAÇÃO BASE DE URL E REQUISIÇÃO (idêntica ao padrão de financial)
// ============================================================================

// const DEFAULT_API_URL = 'https://diafanis-api-239560742520.southamerica-east1.run.app';
const DEFAULT_API_URL = 'http://localhost:8080';

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env?.VITE_API_URL;
  const base = typeof envUrl === 'string' && envUrl.trim().length > 0 ? envUrl.trim() : DEFAULT_API_URL;
  return base.replace(/\/+$/, '').replace(/\/api$/, '');
}

/**
 * Função utilitária para requisições com suporte a proxy relativo (Vercel/Vite)
 * para evitar erros de CORS no navegador e apontar para a nuvem quando necessário.
 */
export async function fetchWithFallback(path: string, options?: RequestInit): Promise<Response> {
  const baseUrl = getApiBaseUrl();

  const isBrowserWithProxy =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('vercel.app') ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  if (isBrowserWithProxy) {
    try {
      const proxyRes = await fetch(path, options);
      if (proxyRes.status !== 404) {
        return proxyRes;
      }
    } catch {
      // Falha no proxy relativo, continua para URL base completa
    }
  }

  return await fetch(`${baseUrl}${path}`, options);
}

export async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data === 'object' && data !== null) {
      const messages = Object.entries(data)
        .map(([field, val]) => {
          const text = Array.isArray(val) ? val.join(', ') : String(val);
          return field === 'detail' || field === 'non_field_errors' || field === 'erro'
            ? text
            : `${field}: ${text}`;
        })
        .join(' | ');
      if (messages) return messages;
    }
  } catch {
    // Ignora erro de JSON
  }
  return `Erro na comunicação com a API (HTTP ${response.status})`;
}

// ============================================================================
// REQUISIÇÕES PARA VOCÊ IMPLEMENTAR (NUMERADAS DE 1 A 13)
// ============================================================================

// ----------------------------------------------------------------------------
// ABA 1: NOTIFICAÇÕES INTERNAS
// ----------------------------------------------------------------------------

/**
 * [REQUISIÇÃO 1] Listar Notificações
 * Método: GET
 * Endpoint: /api/notificacoes/
 * Retorno: Promise<NotificationItem[]>
 * Dica:
 *  - Use `fetchWithFallback('/api/notificacoes/', { method: 'GET', headers: { Accept: 'application/json' } })`
 *  - Se response.ok: faça `const data: NotificationAPIResponse[] = await response.json();`
 *  - Retorne `data.map(mapNotificationFromAPI)`
 *  - Em caso de erro, faça fallback para `initialNotifications` ou dispare erro formatado com `parseErrorMessage`.
 */
export async function listarNotificacoes(): Promise<NotificationItem[]> {
  // TODO: Implemente a requisição 1 aqui
  // Enquanto você implementa, mantemos o retorno simulado com fallback:
  const response = await fetchWithFallback('/api/notificacoes/', { method: 'GET', headers: { Accept: 'application/json' } });

  if(response.ok){
    const data: NotificationAPIResponse[] = await response.json();
    return data.map(mapNotificationFromAPI)
  }
  return [];
}

/**
 * [REQUISIÇÃO 2] Alternar Status de Leitura da Notificação (Marcar/Desmarcar como Lida)
 * Método: PATCH
 * Endpoint: /api/notificacoes/:id/
 * Body: { is_read: boolean } ou { lida: boolean }
 * Retorno: Promise<NotificationItem>
 */
export async function alternarLeituraNotificacao(id: string, isRead: boolean): Promise<NotificationItem> {
  // TODO: Implemente a requisição 2 aqui
  let item = initialNotifications.find((n) => n.id === id);

  const response = await fetchWithFallback(
    `/api/notificacoes/${id}/alternar-lida/`,
    { method: 'PATCH', headers: { Accept: 'application/json' } }
  )
  
  if(response.ok){
    const data = await response.json()
    isRead = data.lida || false
  }

  return item ? { ...item, isRead } : ({} as NotificationItem);
}

/**
 * [REQUISIÇÃO 3] Marcar Todas as Notificações como Lidas
 * Método: POST ou PATCH
 * Endpoint: /api/notificacoes/marcar-todas-lidas/
 * Retorno: Promise<void>
 */
export async function marcarTodasNotificacoesLidas(): Promise<void> {
  const response = await fetchWithFallback(
    `/api/notificacoes/marcar-todas-lidas/`,
    { method: 'PATCH', headers: { Accept: 'application/json' } }
  )
  
  if(response.ok){
    const data = await response.json()
    console.log(`quantidade atualizada: ${data.n_marcadas || 0}`)
  }else{
    console.error("Não foi possível marcar todas as notificações como lidas.")
  }
}

// ----------------------------------------------------------------------------
// ABA 2: MENSAGENS
// ----------------------------------------------------------------------------

/**
 * [REQUISIÇÃO 4] Listar Mensagens
 * Método: GET
 * Endpoint: /api/mensagens/
 * Retorno: Promise<MessageItem[]>
 * Dica:
 *  - Trate a resposta mapeando cada item com `mapMessageFromAPI`.
 */
export async function listarMensagens(): Promise<MessageItem[]> {
  // TODO: Implemente a requisição 4 aqui
  const response = await fetchWithFallback(
    `/api/mensagens/`,
    { method: 'GET', headers: { Accept: 'application/json' } }
  )
  if (response.ok) {
    const data: MessageAPIResponse[] = await response.json();
    return data.map((item) => mapMessageFromAPI(item));
  }
  return [];
}

/**
 * [REQUISIÇÃO 5] Criar Nova Mensagem
 * Método: POST
 * Endpoint: /api/mensagens/
 * Body: MessagePayload
 * Retorno: Promise<MessageItem>
 */
export async function criarMensagem(payload: MessagePayload): Promise<MessageItem> {
  // TODO: Implemente a requisição 5 aqui
  const response = await fetchWithFallback(
    `/api/mensagens/`,
    { method: 'POST', headers: { Accept: 'application/json' }, body: JSON.stringify(payload) }
  )

  if(response.ok){
    const data = await response.json()
    return mapMessageFromAPI(data)
  }
  return {
    id: `msg-${Date.now()}`,
    title: payload.title || 'Nova Mensagem',
    content: payload.content || '',
    category: payload.category || 'general',
    clients: payload.clients || [],
    selectedLawsuit: payload.selectedLawsuit || null,
    selectedFinancial: payload.selectedFinancial || null,
    selectedDate: payload.selectedDate || null,
    hasAlert: Boolean(payload.hasAlert),
    createdAt: new Date().toISOString(),
  };
}

/**
 * [REQUISIÇÃO 6] Atualizar Mensagem (Edição geral ou agendamento)
 * Método: PUT ou PATCH
 * Endpoint: /api/mensagens/:id/
 * Body: Partial<MessagePayload>
 * Retorno: Promise<MessageItem>
 */
export async function atualizarMensagem(id: string, payload: Partial<MessagePayload>): Promise<MessageItem> {
  // TODO: Implemente a requisição 6 aqui
  const existing = initialMessages.find((m) => m.id === id);
  return { ...(existing || ({} as MessageItem)), ...payload, id };
}

/**
 * [REQUISIÇÃO 7] Alternar Status de Urgência da Mensagem
 * Método: PATCH
 * Endpoint: /api/mensagens/:id/urgencia/ (ou /api/mensagens/:id/ com { has_alert: boolean })
 * Body: { hasAlert: boolean }
 * Retorno: Promise<void> ou Promise<MessageItem>
 */
export async function alternarUrgenciaMensagem(_id: string, _hasAlert: boolean): Promise<void> {
  // TODO: Implemente a requisição 7 aqui
}

/**
 * [REQUISIÇÃO 8] Enviar / Disparar Mensagem
 * Método: POST
 * Endpoint: /api/mensagens/:id/enviar/
 * Retorno: Promise<void>
 */
export async function enviarMensagem(_id: string): Promise<void> {
  // TODO: Implemente a requisição 8 aqui
}

/**
 * [REQUISIÇÃO 9] Excluir Mensagem Individual
 * Método: DELETE
 * Endpoint: /api/mensagens/:id/
 * Retorno: Promise<void>
 */
export async function deletarMensagem(_id: string): Promise<void> {
  // TODO: Implemente a requisição 9 aqui
}

/**
 * [REQUISIÇÃO 10] Ações em Massa no Grid de Mensagens (Urgência, Enviar ou Excluir)
 * Método: POST
 * Endpoint: /api/mensagens/bulk/
 * Body: { ids: string[]; acao: 'urgencia' | 'enviar' | 'excluir'; hasAlert?: boolean }
 * Retorno: Promise<void>
 */
export async function executarAcaoEmMassaMensagens(
  _ids: string[],
  _acao: 'urgencia' | 'enviar' | 'excluir',
  _hasAlert?: boolean
): Promise<void> {
  // TODO: Implemente a requisição 10 aqui
}

// ----------------------------------------------------------------------------
// ABA 3: MODELOS DE DISPARO
// ----------------------------------------------------------------------------

/**
 * [REQUISIÇÃO 11] Listar Modelos de Disparo
 * Método: GET
 * Endpoint: /api/modelos/
 * Retorno: Promise<TemplateItem[]>
 */
export async function listarModelos(): Promise<TemplateItem[]> {
  // TODO: Implemente a requisição 11 aqui
  const response = await fetchWithFallback('/api/mensagens/modelos/', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (response.ok) {
    const data = await response.json();
    const list: TemplateAPIResponse[] = Array.isArray(data) ? data : data?.results || [];
    return list.map(mapTemplateFromAPI);
  }
  return [...initialTemplates];
}

/**
 * [REQUISIÇÃO 12] Criar Novo Modelo
 * Método: POST
 * Endpoint: /api/modelos/
 * Body: TemplatePayload
 * Retorno: Promise<TemplateItem>
 */
export async function criarModelo(payload: TemplatePayload): Promise<TemplateItem> {
  // TODO: Implemente a requisição 12 aqui
  return {
    id: `tmpl-${Date.now()}`,
    title: payload.title || 'Novo Modelo',
    content: payload.content || '',
    clients: payload.clients || [],
    requiresLawsuit: Boolean(payload.requiresLawsuit),
    requiresFinancial: Boolean(payload.requiresFinancial),
    requiresDate: Boolean(payload.requiresDate),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * [REQUISIÇÃO 13] Atualizar Modelo Existente
 * Método: PUT ou PATCH
 * Endpoint: /api/modelos/:id/
 * Body: Partial<TemplatePayload>
 * Retorno: Promise<TemplateItem>
 */
export async function atualizarModelo(id: string, payload: Partial<TemplatePayload>): Promise<TemplateItem> {
  // TODO: Implemente a requisição 13 aqui
  const existing = initialTemplates.find((t) => t.id === id);
  return { ...(existing || ({} as TemplateItem)), ...payload, id };
}

// ----------------------------------------------------------------------------
// DADOS DE CATÁLOGO / APOIO (CLIENTES, PROCESSOS, FATURAS, DATAS)
// ----------------------------------------------------------------------------

export async function listarClientesMensagens(): Promise<ClientRecipient[]> {
  try {
    const response = await fetchWithFallback('/api/clientes/', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      const list: ClienteAPIResponse[] = Array.isArray(data) ? data : data?.results || [];
      return list.map(mapClientFromAPI);
    }
  } catch (err) {
    console.warn('Falha ao buscar clientes da API, usando dados mock:', err);
  }

  return allOfficeClients;
}

export async function listarProcessosMensagens(): Promise<LawsuitOption[]> {
  return availableLawsuits;
}

export async function listarFaturasMensagens(): Promise<FinancialOption[]> {
  return availableFinancials;
}

export async function listarDatasAudiencias(): Promise<HearingDateOption[]> {
  return availableHearingDates;
}
