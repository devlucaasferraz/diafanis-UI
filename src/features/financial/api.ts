import { Cliente, FaturaAPIResponse, FaturaPayload, Invoice } from './types';
import { mapFaturaFromAPI } from './utils';

const DEFAULT_API_URL = 'https://diafanis-api-239560742520.southamerica-east1.run.app';

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env?.VITE_API_URL;
  const base = typeof envUrl === 'string' && envUrl.trim().length > 0 ? envUrl.trim() : DEFAULT_API_URL;
  return base.replace(/\/+$/, '');
}

function buildLegacyFallbackPath(path: string): string | null {
  if (path.startsWith('/api/faturas/')) {
    return path.replace('/api/faturas/', '/api/faturasfaturas/');
  }
  if (path.startsWith('/api/clientes/')) {
    return path.replace('/api/clientes/', '/api/clientesclientes/');
  }
  return null;
}

async function fetchWithFallback(path: string, options?: RequestInit): Promise<Response> {
  const baseUrl = getApiBaseUrl();

  const executeFetch = async (urlPrefix: string): Promise<Response> => {
    const res = await fetch(`${urlPrefix}${path}`, options);
    if (res.status === 404) {
      const legacyPath = buildLegacyFallbackPath(path);
      if (legacyPath) {
        const legacyRes = await fetch(`${urlPrefix}${legacyPath}`, options);
        if (legacyRes.ok || legacyRes.status !== 404) {
          return legacyRes;
        }
      }
    }
    return res;
  };

  // No navegador (Vercel rewrites ou Vite dev proxy), prioriza a rota relativa (/api/...)
  // para evitar bloqueios de CORS cross-origin caso o backend remoto ainda não envie os headers CORS.
  const isBrowserWithProxy =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('vercel.app') ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  if (isBrowserWithProxy) {
    try {
      const proxyRes = await executeFetch('');
      if (proxyRes.status !== 404) {
        return proxyRes;
      }
    } catch {
      // Se o proxy relativo não responder, tenta a URL direta configurada
    }
  }

  try {
    return await executeFetch(baseUrl);
  } catch (err) {
    if (!isBrowserWithProxy && err instanceof TypeError && baseUrl.startsWith('http')) {
      return await executeFetch('');
    }
    throw err;
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
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
    // Ignora falha ao fazer parse do corpo de erro
  }
  return `Erro na comunicação com a API (HTTP ${response.status})`;
}

export async function listarClientes(): Promise<Cliente[]> {
  const response = await fetchWithFallback('/api/clientes/', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

export async function listarFaturas(clientesMap?: Record<string, string>): Promise<Invoice[]> {
  const response = await fetchWithFallback('/api/faturas/', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data: FaturaAPIResponse[] = await response.json();
  return data.map((item) => mapFaturaFromAPI(item, clientesMap));
}

export async function obterFaturaPorId(
  id: string,
  clientesMap?: Record<string, string>
): Promise<Invoice> {
  const response = await fetchWithFallback(`/api/faturas/${id}/`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data: FaturaAPIResponse = await response.json();
  return mapFaturaFromAPI(data, clientesMap);
}

export async function criarFatura(
  payload: FaturaPayload,
  clientesMap?: Record<string, string>
): Promise<Invoice> {
  const body = {
    cliente: payload.cliente || null,
    processo: payload.processo || null,
    descricao: payload.descricao ?? '',
    valor: Number(payload.valor).toFixed(2),
    tipo: payload.tipo,
    status: payload.status,
    data_vencimento: payload.data_vencimento,
    data_pagamento: payload.data_pagamento || null,
  };

  const response = await fetchWithFallback('/api/faturas/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data: FaturaAPIResponse = await response.json();
  return mapFaturaFromAPI(data, clientesMap);
}

export async function atualizarFatura(
  id: string,
  payload: Partial<FaturaPayload>,
  clientesMap?: Record<string, string>
): Promise<Invoice> {
  const body: Record<string, unknown> = { ...payload };
  if (payload.valor !== undefined) {
    body.valor = Number(payload.valor).toFixed(2);
  }

  const response = await fetchWithFallback(`/api/faturas/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data: FaturaAPIResponse = await response.json();
  return mapFaturaFromAPI(data, clientesMap);
}

export async function deletarFatura(id: string): Promise<void> {
  const response = await fetchWithFallback(`/api/faturas/${id}/`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(await parseErrorMessage(response));
  }
}
