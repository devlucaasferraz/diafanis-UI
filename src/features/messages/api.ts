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
// CONFIGURAÇÃO BASE DE URL, USUÁRIO E VALIDAÇÕES
// ============================================================================

const DEFAULT_API_URL = 'http://localhost:8080';
const DEFAULT_USER_ID = '51a03fca-9084-4a12-ad90-2c5faa89040e';

/** Limite máximo de caracteres para o campo `titulo` na API Django (max_length=50). */
export const MAX_TITLE_LENGTH = 50;

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env?.VITE_API_URL;
  const base = typeof envUrl === 'string' && envUrl.trim().length > 0 ? envUrl.trim() : DEFAULT_API_URL;
  return base.replace(/\/+$/, '').replace(/\/api$/, '');
}

/**
 * Retorna o UUID do usuário atual utilizado como `rcp`, `remetente` ou `criador`
 * enquanto a autenticação não estiver integrada ao contexto da aplicação.
 */
export function getCurrentUserId(): string {
  const envUserId = import.meta.env?.VITE_DEFAULT_USER_ID;
  return typeof envUserId === 'string' && envUserId.trim().length > 0
    ? envUserId.trim()
    : DEFAULT_USER_ID;
}

/**
 * Normaliza o título respeitando o limite máximo aceito pela API (50 caracteres).
 */
export function normalizeTitle(title: string | undefined, fallback = ''): string {
  const cleaned = (title ?? '').trim() || fallback;
  return cleaned.slice(0, MAX_TITLE_LENGTH);
}

/**
 * Função utilitária para requisições com suporte a proxy relativo (Vercel/Vite)
 * para evitar erros de CORS no navegador e apontar para a nuvem quando necessário.
 */
export async function fetchWithFallback(path: string, options?: RequestInit): Promise<Response> {
  const baseUrl = getApiBaseUrl();
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
  const userId = encodeURIComponent(getCurrentUserId());
  const response = await fetchWithFallback(`/api/notificacoes/?rcp=${userId}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (response.ok) {
    const data: NotificationAPIResponse[] = await response.json();
    return data.map(mapNotificationFromAPI);
  }
  return [];
}

/**
 * [REQUISIÇÃO 2] Alternar Status de Leitura da Notificação (Marcar/Desmarcar como Lida)
 * Método: PATCH
 * Endpoint: /api/notificacoes/:id/alternar-lida/
 * Retorno: Promise<{ id: string; isRead: boolean }>
 */
export async function alternarLeituraNotificacao(
  id: string,
  _isRead?: boolean
): Promise<{ id: string; isRead: boolean }> {
  const response = await fetchWithFallback(`/api/notificacoes/${id}/alternar-lida/`, {
    method: 'PATCH',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data: { id: string | number; lida: boolean } = await response.json();
  return {
    id: String(data.id),
    isRead: Boolean(data.lida),
  };
}

/**
 * [REQUISIÇÃO 3] Marcar Todas as Notificações como Lidas
 * Método: PATCH
 * Endpoint: /api/notificacoes/marcar-todas-lidas/?rcp=<uuid>
 * Retorno: Promise<void>
 */
export async function marcarTodasNotificacoesLidas(): Promise<void> {
  const userId = encodeURIComponent(getCurrentUserId());
  const response = await fetchWithFallback(
    `/api/notificacoes/marcar-todas-lidas/?rcp=${userId}`,
    { method: 'PATCH', headers: { Accept: 'application/json' } }
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
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
 * Endpoint: /api/mensagens/:id/alternar-urgencia/
 * Retorno: Promise<{ id: string; hasAlert: boolean }>
 */
export async function alternarUrgenciaMensagem(
  id: string,
  hasAlert?: boolean
): Promise<{ id: string; hasAlert: boolean }> {
  const hasExplicitValue = typeof hasAlert === 'boolean';
  const response = await fetchWithFallback(`/api/mensagens/${id}/alternar-urgencia/`, {
    method: 'PATCH',
    headers: hasExplicitValue
      ? { 'Content-Type': 'application/json', Accept: 'application/json' }
      : { Accept: 'application/json' },
    ...(hasExplicitValue ? { body: JSON.stringify({ urgente: hasAlert }) } : {}),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data: { id: string | number; urgente: boolean } = await response.json();
  return {
    id: String(data.id),
    hasAlert: Boolean(data.urgente),
  };
}

/**
 * [REQUISIÇÃO 8] Enviar / Disparar Mensagem (fluxo simulado na API)
 * Método: POST
 * Endpoint: /api/mensagens/:id/enviar/
 * Retorno: Promise<void>
 */
export async function enviarMensagem(id: string): Promise<void> {
  const response = await fetchWithFallback(`/api/mensagens/${id}/enviar/`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}

/**
 * [REQUISIÇÃO 9] Excluir Mensagem Individual
 * Método: DELETE
 * Endpoint: /api/mensagens/:id/
 * Retorno: Promise<void>
 */
export async function deletarMensagem(id: string): Promise<void> {
  const response = await fetchWithFallback(`/api/mensagens/${id}/`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(await parseErrorMessage(response));
  }
}

/**
 * [REQUISIÇÃO 10] Ações em Massa no Grid de Mensagens (Urgência, Enviar ou Excluir)
 * Executa as requisições individuais em paralelo via Promise.all.
 * Retorno: Promise<void>
 */
export async function executarAcaoEmMassaMensagens(
  ids: string[],
  acao: 'urgencia' | 'enviar' | 'excluir',
  hasAlert?: boolean
): Promise<void> {
  if (ids.length === 0) return;

  if (acao === 'urgencia') {
    await Promise.all(ids.map((id) => alternarUrgenciaMensagem(id, hasAlert)));
    return;
  }

  if (acao === 'enviar') {
    await Promise.all(ids.map((id) => enviarMensagem(id)));
    return;
  }

  if (acao === 'excluir') {
    await Promise.all(ids.map((id) => deletarMensagem(id)));
  }
}

// ----------------------------------------------------------------------------
// ABA 3: MODELOS DE DISPARO
// ----------------------------------------------------------------------------

/**
 * [REQUISIÇÃO 11] Listar Modelos de Disparo
 * Método: GET
 * Endpoint: /api/mensagens/modelos/
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
 * Endpoint: /api/mensagens/modelos/
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
 * Endpoint: /api/mensagens/modelos/:id/
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
