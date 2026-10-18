import {
  TriageCase,
  Processo,
  Cliente,
  LegalPackage,
  TriageStatus,
} from './types';

export const availableProcesses: Processo[] = [
  {
    id: 'proc-101',
    numero_cnj: '5012849-73.2026.4.04.7100',
    vara: '2ª Vara Federal Previdenciária de Porto Alegre',
    comarca: 'TRF-4 / RS',
  },
  {
    id: 'proc-102',
    numero_cnj: '0020491-18.2026.5.04.0014',
    vara: '14ª Vara do Trabalho de Porto Alegre',
    comarca: 'TRT-4 / RS',
  },
  {
    id: 'proc-103',
    numero_cnj: '5008912-44.2025.4.04.7108',
    vara: '1ª Vara Federal de Novo Hamburgo',
    comarca: 'TRF-4 / RS',
  },
  {
    id: 'proc-104',
    numero_cnj: '5031120-09.2026.8.21.0001',
    vara: '5ª Vara Cível do Foro Central',
    comarca: 'TJRS / Porto Alegre',
  },
  {
    id: 'proc-105',
    numero_cnj: '5019932-11.2026.4.04.7100',
    vara: '4ª Vara Federal Previdenciária de Porto Alegre',
    comarca: 'TRF-4 / RS',
  },
];

export const registeredClients: Cliente[] = [
  {
    id: 'cli-01',
    nome: 'Maria de Lourdes Conceição',
    cpf: '418.293.100-44',
    telefone: '5551998234112',
  },
  {
    id: 'cli-02',
    nome: 'Sebastião Ferreira dos Santos',
    cpf: '192.847.550-12',
    telefone: '5551991428890',
  },
  {
    id: 'cli-03',
    nome: 'Cláudia Regina Monteiro',
    cpf: '739.104.880-09',
    telefone: '5551984127731',
  },
  {
    id: 'cli-04',
    nome: 'João Batista Oliveira Filho',
    cpf: '528.391.020-68',
    telefone: '5551996551204',
  },
  {
    id: 'cli-05',
    nome: 'Terezinha Soares da Silva',
    cpf: '304.928.710-33',
    telefone: '5551997319002',
  },
  {
    id: 'cli-06',
    nome: 'Marcos Vinícius Peixoto',
    cpf: '841.209.330-71',
    telefone: '5551982094415',
  },
  {
    id: 'cli-07',
    nome: 'Helena Vargas Silveira',
    cpf: '612.440.190-25',
    telefone: '5551994110088',
  },
];

export const legalPackages: LegalPackage[] = [
  {
    id: 'aposentadoria',
    nome: 'Aposentadoria (Rural / Urbana)',
    area_motivo: 'Aposentadoria Rural',
    descricao: 'Coleta padrão para requerimento ou revisão de aposentadoria junto ao INSS.',
    documentos_padrao: [
      'RG / CPF',
      'Comprovante de Residência',
      'Extrato CNIS Completo',
      'Autodeclaração Rural / Bloco de Notas',
      'Carteira de Trabalho (CTPS)',
    ],
  },
  {
    id: 'bpc_loas',
    nome: 'BPC / LOAS (Idoso ou PcD)',
    area_motivo: 'BPC/LOAS',
    descricao: 'Pacote assistencial com documentos socioeconômicos, CadÚnico e laudos médicos.',
    documentos_padrao: [
      'RG / CPF do Requerente',
      'Comprovante de Residência Atualizado',
      'Folha Resumo CadÚnico',
      'Laudo Médico com CID-10',
      'RG / CPF do Grupo Familiar',
    ],
  },
  {
    id: 'auxilio_doenca',
    nome: 'Auxílio-Doença / Incapacidade',
    area_motivo: 'Auxílio-Doença',
    descricao: 'Documentação médica, receituários, atestados de afastamento e comunicação de decisão.',
    documentos_padrao: [
      'RG / CPF',
      'Comprovante de Residência',
      'Laudo Médico Detalhado (CID)',
      'Exames Complementares e Receitas',
      'Carta de Indeferimento INSS',
    ],
  },
  {
    id: 'trabalhista',
    nome: 'Reclamatória Trabalhista',
    area_motivo: 'Reclamatória Trabalhista',
    descricao: 'Verbas rescisórias, vínculo empregatício, horas extras e FGTS.',
    documentos_padrao: [
      'RG / CPF',
      'Comprovante de Residência',
      'Carteira de Trabalho (CTPS Digital)',
      'Termo de Rescisão (TRCT)',
      'Extrato Analítico do FGTS',
      'Holerites / Contracheques',
    ],
  },
  {
    id: 'civel',
    nome: 'Cível / Indenizatória',
    area_motivo: 'Cível / Consumidor',
    descricao: 'Contratos, comprovantes de pagamento, protocolos e provas documentais.',
    documentos_padrao: [
      'RG / CPF',
      'Comprovante de Residência',
      'Contrato ou Fatura Objeto da Ação',
      'Comprovantes de Pagamento / Extratos',
      'Prints de Conversas / Protocolos',
    ],
  },
];

export const initialTriageCases: TriageCase[] = [
  {
    id: 'tri-01',
    protocolo: 'TRI-2026-001',
    cliente: registeredClients[0], // Maria de Lourdes Conceição
    processo: null,
    area_motivo: 'BPC/LOAS',
    status_triagem: 'Intervenção Manual',
    conversa_bot: {
      motivo_relatado:
        'Requerimento de BPC/LOAS para idosa de 68 anos. Cliente mora sozinha e teve benefício negado administrativamente.',
      ultima_mensagem:
        'Moço, eu tenho 68 anos e não sei entrar nesse aplicativo Meu INSS do governo para baixar o CNIS. Minha vista é ruim, alguém pode me ajudar?',
      horario_ultima_mensagem: 'Hoje, 11:42',
      alerta_dificuldade:
        'Cliente idosa relatou dificuldade técnica com o app Gov.br / Meu INSS e enviou foto do laudo cortada.',
      bot_pausado: false,
    },
    documentos: [
      {
        id: 'doc-101',
        cliente_id: 'cli-01',
        processo_id: null,
        nome: 'RG_Maria_Lourdes_Frente_Verso.jpg',
        tipo_documento: 'RG / CPF',
        url_arquivo: 'https://diafanis.storage.local/docs/rg_maria_lourdes.jpg',
        formato: 'image',
        tamanho: '1.8 MB',
        status: 'Aprovado',
        created_at: '2026-10-18T10:15:00Z',
        updated_at: '2026-10-18T10:20:00Z',
      },
      {
        id: 'doc-102',
        cliente_id: 'cli-01',
        processo_id: null,
        nome: 'Conta_Luz_CEEE_Outubro.jpg',
        tipo_documento: 'Comprovante de Residência',
        url_arquivo: 'https://diafanis.storage.local/docs/conta_luz_maria.jpg',
        formato: 'image',
        tamanho: '1.2 MB',
        status: 'Aprovado',
        created_at: '2026-10-18T10:18:00Z',
        updated_at: '2026-10-18T10:22:00Z',
      },
      {
        id: 'doc-103',
        cliente_id: 'cli-01',
        processo_id: null,
        nome: 'Foto_WhatsApp_Laudo_Cortado.jpg',
        tipo_documento: 'Laudo Médico / CadÚnico',
        url_arquivo: 'https://diafanis.storage.local/docs/laudo_cortado_maria.jpg',
        formato: 'image',
        tamanho: '940 KB',
        status: 'Reprovado/Ilegível',
        motivo_reprovacao: 'A imagem está desfocada e cortou o carimbo com o CRM do médico.',
        created_at: '2026-10-18T11:10:00Z',
        updated_at: '2026-10-18T11:30:00Z',
      },
      {
        id: 'doc-104',
        cliente_id: 'cli-01',
        processo_id: null,
        nome: 'Aguardando envio pelo cliente',
        tipo_documento: 'Extrato CNIS / Gov.br',
        url_arquivo: '',
        formato: 'pdf',
        status: 'Pendente',
        created_at: '2026-10-18T10:15:00Z',
        updated_at: '2026-10-18T11:42:00Z',
      },
    ],
    arquivado: false,
    created_at: '2026-10-18T10:12:00Z',
    updated_at: '2026-10-18T11:42:00Z',
  },
  {
    id: 'tri-02',
    protocolo: 'TRI-2026-002',
    cliente: registeredClients[1], // Sebastião Ferreira dos Santos
    processo: availableProcesses[0],
    area_motivo: 'Aposentadoria Rural',
    status_triagem: 'Pronto para Análise',
    conversa_bot: {
      motivo_relatado:
        'Cumprimento de exigência judicial para juntada de notas de produtor rural e documentos pessoais atualizados.',
      ultima_mensagem:
        'Pronto doutor, mandei todas as 4 fotos e o PDF que o robô pediu aqui no WhatsApp. Pode conferir se ficou bom?',
      horario_ultima_mensagem: 'Hoje, 10:55',
      bot_pausado: false,
    },
    documentos: [
      {
        id: 'doc-201',
        cliente_id: 'cli-02',
        processo_id: 'proc-101',
        nome: 'CNH_Sebastiao_Ferreira.pdf',
        tipo_documento: 'RG / CPF',
        url_arquivo: 'https://diafanis.storage.local/docs/cnh_sebastiao.pdf',
        formato: 'pdf',
        tamanho: '650 KB',
        status: 'Aprovado',
        created_at: '2026-10-18T09:30:00Z',
        updated_at: '2026-10-18T09:45:00Z',
      },
      {
        id: 'doc-202',
        cliente_id: 'cli-02',
        processo_id: 'proc-101',
        nome: 'Comprovante_Corsan_Sebastiao.pdf',
        tipo_documento: 'Comprovante de Residência',
        url_arquivo: 'https://diafanis.storage.local/docs/corsan_sebastiao.pdf',
        formato: 'pdf',
        tamanho: '480 KB',
        status: 'Aprovado',
        created_at: '2026-10-18T09:32:00Z',
        updated_at: '2026-10-18T09:46:00Z',
      },
      {
        id: 'doc-203',
        cliente_id: 'cli-02',
        processo_id: 'proc-101',
        nome: 'Extrato_CNIS_2026_Sebastiao.pdf',
        tipo_documento: 'Extrato CNIS Completo',
        url_arquivo: 'https://diafanis.storage.local/docs/cnis_sebastiao.pdf',
        formato: 'pdf',
        tamanho: '2.1 MB',
        status: 'Em Análise',
        created_at: '2026-10-18T10:50:00Z',
        updated_at: '2026-10-18T10:50:00Z',
      },
      {
        id: 'doc-204',
        cliente_id: 'cli-02',
        processo_id: 'proc-101',
        nome: 'Bloco_Produtor_Rural_1998_2012.jpg',
        tipo_documento: 'Autodeclaração Rural / Bloco de Notas',
        url_arquivo: 'https://diafanis.storage.local/docs/bloco_rural_sebastiao.jpg',
        formato: 'image',
        tamanho: '3.4 MB',
        status: 'Em Análise',
        created_at: '2026-10-18T10:54:00Z',
        updated_at: '2026-10-18T10:54:00Z',
      },
    ],
    arquivado: false,
    created_at: '2026-10-18T09:20:00Z',
    updated_at: '2026-10-18T10:55:00Z',
  },
  {
    id: 'tri-03',
    protocolo: 'TRI-2026-003',
    cliente: registeredClients[2], // Cláudia Regina Monteiro
    processo: availableProcesses[2],
    area_motivo: 'Auxílio-Doença',
    status_triagem: 'Pronto para Análise',
    conversa_bot: {
      motivo_relatado:
        'Restabelecimento de Auxílio por Incapacidade Temporária pós-perícia judicial ortopédica.',
      ultima_mensagem:
        'Enviei a ressonância nova e o laudo atualizado do cirurgião de coluna conforme solicitado.',
      horario_ultima_mensagem: 'Hoje, 09:18',
      bot_pausado: false,
    },
    documentos: [
      {
        id: 'doc-301',
        cliente_id: 'cli-03',
        processo_id: 'proc-103',
        nome: 'RG_Claudia_Monteiro.pdf',
        tipo_documento: 'RG / CPF',
        url_arquivo: 'https://diafanis.storage.local/docs/rg_claudia.pdf',
        formato: 'pdf',
        tamanho: '510 KB',
        status: 'Aprovado',
        created_at: '2026-10-17T15:00:00Z',
        updated_at: '2026-10-17T16:10:00Z',
      },
      {
        id: 'doc-302',
        cliente_id: 'cli-03',
        processo_id: 'proc-103',
        nome: 'Comprovante_Resid_Claudia.pdf',
        tipo_documento: 'Comprovante de Residência',
        url_arquivo: 'https://diafanis.storage.local/docs/resid_claudia.pdf',
        formato: 'pdf',
        tamanho: '390 KB',
        status: 'Aprovado',
        created_at: '2026-10-17T15:05:00Z',
        updated_at: '2026-10-17T16:11:00Z',
      },
      {
        id: 'doc-303',
        cliente_id: 'cli-03',
        processo_id: 'proc-103',
        nome: 'Laudo_Ortopedico_CID_M51.pdf',
        tipo_documento: 'Laudo Médico Detalhado (CID)',
        url_arquivo: 'https://diafanis.storage.local/docs/laudo_claudia.pdf',
        formato: 'pdf',
        tamanho: '1.4 MB',
        status: 'Aprovado',
        created_at: '2026-10-18T09:15:00Z',
        updated_at: '2026-10-18T09:18:00Z',
      },
    ],
    arquivado: false,
    created_at: '2026-10-17T14:50:00Z',
    updated_at: '2026-10-18T09:18:00Z',
  },
  {
    id: 'tri-04',
    protocolo: 'TRI-2026-004',
    cliente: registeredClients[3], // João Batista Oliveira Filho
    processo: null,
    area_motivo: 'Reclamatória Trabalhista',
    status_triagem: 'Coleta em Andamento',
    conversa_bot: {
      motivo_relatado:
        'Demissão sem justa causa sem pagamento de multa de 40% do FGTS e horas extras habituais.',
      ultima_mensagem:
        'Já mandei o RG e o Termo de Rescisão. Vou baixar o extrato do FGTS na Caixa agora de tarde e já envio.',
      horario_ultima_mensagem: 'Ontem, 18:30',
      bot_pausado: false,
    },
    documentos: [
      {
        id: 'doc-401',
        cliente_id: 'cli-04',
        processo_id: null,
        nome: 'CNH_Digital_Joao_Batista.pdf',
        tipo_documento: 'RG / CPF',
        url_arquivo: 'https://diafanis.storage.local/docs/cnh_joao.pdf',
        formato: 'pdf',
        tamanho: '720 KB',
        status: 'Aprovado',
        created_at: '2026-10-17T18:10:00Z',
        updated_at: '2026-10-17T18:20:00Z',
      },
      {
        id: 'doc-402',
        cliente_id: 'cli-04',
        processo_id: null,
        nome: 'TRCT_Rescisao_Assinada.pdf',
        tipo_documento: 'Termo de Rescisão (TRCT)',
        url_arquivo: 'https://diafanis.storage.local/docs/trct_joao.pdf',
        formato: 'pdf',
        tamanho: '1.1 MB',
        status: 'Em Análise',
        created_at: '2026-10-17T18:25:00Z',
        updated_at: '2026-10-17T18:25:00Z',
      },
      {
        id: 'doc-403',
        cliente_id: 'cli-04',
        processo_id: null,
        nome: 'Aguardando envio pelo cliente',
        tipo_documento: 'Extrato Analítico do FGTS',
        url_arquivo: '',
        formato: 'pdf',
        status: 'Pendente',
        created_at: '2026-10-17T18:00:00Z',
        updated_at: '2026-10-17T18:00:00Z',
      },
      {
        id: 'doc-404',
        cliente_id: 'cli-04',
        processo_id: null,
        nome: 'Aguardando envio pelo cliente',
        tipo_documento: 'Comprovante de Residência',
        url_arquivo: '',
        formato: 'pdf',
        status: 'Pendente',
        created_at: '2026-10-17T18:00:00Z',
        updated_at: '2026-10-17T18:00:00Z',
      },
    ],
    arquivado: false,
    created_at: '2026-10-17T18:00:00Z',
    updated_at: '2026-10-17T18:30:00Z',
  },
  {
    id: 'tri-05',
    protocolo: 'TRI-2026-005',
    cliente: registeredClients[4], // Terezinha Soares da Silva
    processo: availableProcesses[4],
    area_motivo: 'Aposentadoria Rural',
    status_triagem: 'Intervenção Manual',
    conversa_bot: {
      motivo_relatado:
        'Juntada de documentos complementares de atividade campesina em regime de economia familiar.',
      ultima_mensagem:
        'Não consegui mandar o documento do sindicato porque deu erro na senha do portal. Meu filho só vem no fim de semana.',
      horario_ultima_mensagem: 'Ontem, 16:05',
      alerta_dificuldade:
        'Cliente sem acesso à certidão sindical digital; solicitou apoio da equipe para emissão direta.',
      bot_pausado: true,
    },
    documentos: [
      {
        id: 'doc-501',
        cliente_id: 'cli-05',
        processo_id: 'proc-105',
        nome: 'RG_CPF_Terezinha_Soares.jpg',
        tipo_documento: 'RG / CPF',
        url_arquivo: 'https://diafanis.storage.local/docs/rg_terezinha.jpg',
        formato: 'image',
        tamanho: '1.5 MB',
        status: 'Aprovado',
        created_at: '2026-10-17T14:20:00Z',
        updated_at: '2026-10-17T14:35:00Z',
      },
      {
        id: 'doc-502',
        cliente_id: 'cli-05',
        processo_id: 'proc-105',
        nome: 'Certidao_Casamento_Ilegivel.jpg',
        tipo_documento: 'Certidão de Casamento c/ Qualificação Rural',
        url_arquivo: 'https://diafanis.storage.local/docs/certidao_terezinha.jpg',
        formato: 'image',
        tamanho: '890 KB',
        status: 'Reprovado/Ilegível',
        motivo_reprovacao: 'Reflexo de flash sobre a profissão do cônjuge; necessário reenviar sem flash.',
        created_at: '2026-10-17T15:10:00Z',
        updated_at: '2026-10-17T15:40:00Z',
      },
      {
        id: 'doc-503',
        cliente_id: 'cli-05',
        processo_id: 'proc-105',
        nome: 'Aguardando envio pelo cliente',
        tipo_documento: 'Declaração Sindicato Trabalhadores Rurais',
        url_arquivo: '',
        formato: 'pdf',
        status: 'Pendente',
        created_at: '2026-10-17T14:00:00Z',
        updated_at: '2026-10-17T16:05:00Z',
      },
    ],
    arquivado: false,
    created_at: '2026-10-17T14:00:00Z',
    updated_at: '2026-10-17T16:05:00Z',
  },
  {
    id: 'tri-06',
    protocolo: 'TRI-2026-006',
    cliente: registeredClients[5], // Marcos Vinícius Peixoto
    processo: availableProcesses[1],
    area_motivo: 'Reclamatória Trabalhista',
    status_triagem: 'Coleta em Andamento',
    conversa_bot: {
      motivo_relatado:
        'Adicional de insalubridade e diferenças de FGTS. Coleta complementar de holerites e PPP.',
      ultima_mensagem:
        'Enviei os contracheques de 2024 e 2025. O PPP a empresa pediu 48h para entregar.',
      horario_ultima_mensagem: '16/10, 17:12',
      bot_pausado: false,
    },
    documentos: [
      {
        id: 'doc-601',
        cliente_id: 'cli-06',
        processo_id: 'proc-102',
        nome: 'RG_Marcos_Peixoto.pdf',
        tipo_documento: 'RG / CPF',
        url_arquivo: 'https://diafanis.storage.local/docs/rg_marcos.pdf',
        formato: 'pdf',
        tamanho: '540 KB',
        status: 'Aprovado',
        created_at: '2026-10-16T16:00:00Z',
        updated_at: '2026-10-16T16:30:00Z',
      },
      {
        id: 'doc-602',
        cliente_id: 'cli-06',
        processo_id: 'proc-102',
        nome: 'Holerites_Consolidados_2024_2025.pdf',
        tipo_documento: 'Holerites / Contracheques',
        url_arquivo: 'https://diafanis.storage.local/docs/holerites_marcos.pdf',
        formato: 'pdf',
        tamanho: '4.2 MB',
        status: 'Aprovado',
        created_at: '2026-10-16T17:10:00Z',
        updated_at: '2026-10-16T17:45:00Z',
      },
      {
        id: 'doc-603',
        cliente_id: 'cli-06',
        processo_id: 'proc-102',
        nome: 'Aguardando envio pelo cliente',
        tipo_documento: 'Perfil Profissiográfico Previdenciário (PPP)',
        url_arquivo: '',
        formato: 'pdf',
        status: 'Pendente',
        created_at: '2026-10-16T16:00:00Z',
        updated_at: '2026-10-16T16:00:00Z',
      },
    ],
    arquivado: false,
    created_at: '2026-10-16T16:00:00Z',
    updated_at: '2026-10-16T17:12:00Z',
  },
];

export function formatPhoneBR(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const withoutCountry = digits.startsWith('55') && digits.length >= 12 ? digits.slice(2) : digits;
  if (withoutCountry.length === 11) {
    return `(${withoutCountry.slice(0, 2)}) ${withoutCountry.slice(2, 7)}-${withoutCountry.slice(7)}`;
  }
  if (withoutCountry.length === 10) {
    return `(${withoutCountry.slice(0, 2)}) ${withoutCountry.slice(2, 6)}-${withoutCountry.slice(6)}`;
  }
  return phone;
}

export function summarizeCnj(cnj: string): string {
  if (!cnj || cnj.length < 15) return cnj;
  const parts = cnj.split('.');
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[1]}...`;
  }
  return `${cnj.slice(0, 15)}...`;
}

export function buildWhatsAppUrl(phone: string, customMessage?: string): string {
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.startsWith('55') ? digits : `55${digits}`;
  const base = `https://wa.me/${normalized}`;
  if (!customMessage) return base;
  return `${base}?text=${encodeURIComponent(customMessage)}`;
}

export function computeMetrics(cases: TriageCase[]) {
  const activeCases = cases.filter((c) => !c.arquivado);
  return {
    inCollectionCount: activeCases.filter((c) => c.status_triagem === 'Coleta em Andamento').length,
    readyForAnalysisCount: activeCases.filter((c) => c.status_triagem === 'Pronto para Análise').length,
    manualInterventionCount: activeCases.filter((c) => c.status_triagem === 'Intervenção Manual').length,
    leadsCount: activeCases.filter((c) => c.processo === null).length,
    ongoingCount: activeCases.filter((c) => c.processo !== null).length,
    totalActive: activeCases.length,
    archivedCount: cases.filter((c) => c.arquivado).length,
  };
}

export function deriveTriageStatusFromDocuments(
  currentCase: TriageCase
): TriageStatus {
  if (currentCase.arquivado) return 'Concluído';

  const hasRejected = currentCase.documentos.some(
    (d) => d.status === 'Reprovado/Ilegível'
  );
  if (
    hasRejected ||
    Boolean(currentCase.conversa_bot.alerta_dificuldade) ||
    currentCase.conversa_bot.bot_pausado
  ) {
    return 'Intervenção Manual';
  }

  const allReceived =
    currentCase.documentos.length > 0 &&
    currentCase.documentos.every(
      (d) => d.status === 'Aprovado' || d.status === 'Em Análise'
    );

  if (allReceived) {
    return 'Pronto para Análise';
  }

  return 'Coleta em Andamento';
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return 'CL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
