## Visão Geral do Produto
O Diafanís é um sistema de gestão voltado para escritórios de advocacia com atuação regional (comarcas de Petrolina-PE e Juazeiro-BA). Esta versão de Prova de Conceito (PoC) visa validar a usabilidade, a organização visual dos prazos e o fluxo de documentos antes de integrar automações complexas de tribunais ou bots externos.

## Requisitos Funcionais por Módulo

### Dashboard Geral

- RF01: Resumo: O sistema deve exibir os indicadores vitais do escritório: total de prazos com vencimento em 24h, total de honorários faturados/pendentes no mês e quantidade de atendimentos/documentos em triagem.
- RF02: TodoList Dia: O sistema deve listar as audiências e prazos fatais do dia corrente com indicação de responsável e horário/limite.

### Calendário
- RF03: Visualização Mensal: O sistema deve renderizar uma grade de calendário mensal com dias úteis destacados e semáforo visual de eventos (Vermelho: Prazo Fatal, Âmbar: Atenção, Azul: Audiência, Cinza: Sem Expediente).
- RF04: Cadastro Direto de Eventos: O usuário deve poder registrar manualmente compromissos associados a um processo ou cliente (data/hora, título, responsável e criticidade).   
- RF05: Gestão de Overflow de Eventos: Quando um dia contiver múltiplos compromissos, a célula deve exibir os primeiros badges e um indicador de excesso (+N mais).


### Motor de Prazos (Simulador Simplificado)
- RF06: Simulação de Contagem de Dias: O sistema deve fornecer um simulador onde o usuário informa a data da intimação, a quantidade de dias (úteis ou corridos) e a comarca (Petrolina-PE ou Juazeiro-BA).
- RF07: Agendamento a partir do Cálculo: O resultado calculado pelo simulador deve conter um botão para transformar a data final diretamente em um evento no Calendário.

### Central de Documentos

- RF08.1 - Disparo de Sessão de Coleta (Triger):
	- O sistema cria automaticamente uma sessão de triagem vinculada a um cliente (ou lead) ao receber o evento de primeiro contato do WhatsApp ou via acionamento manual do advogado.
	- O disparo seleciona o pacote de requisitos padrão para a área jurídica (ex.: Aposentadoria Rural: RG/CPF, Comprovante de Residência, CNIS/Extrato Previdenciário).


- RF08.2 - Disparo de Sessão de Coleta (Trigger):
	- O sistema cria automaticamente uma sessão de triagem vinculada a um cliente (ou lead) ao receber o evento de primeiro contato do WhatsApp ou via acionamento manual do advogado.
	- O disparo seleciona o pacote de requisitos padrão para a área jurídica (ex.: Aposentadoria Rural: RG/CPF, Comprovante de Residência, CNIS/Extrato Previdenciário).
- RF08.3: Transição Automática de Status da Sessão:
	- Coleta em Andamento: Bot enviando tutoriais e aguardando uploads.
	- Pronto para Análise: Todos os itens obrigatórios foram recebidos pelo bot.
	- Intervenção Manual Necessária: Cliente reportou dificuldade ou enviou arquivo repetidamente reprovado.



### Notificações e Mensagens
- RF9: Painel de Aniversários: O sistema deve identificar automaticamente os clientes que fazem aniversário no mês/semana com base na data de nascimento cadastrada.
- RF10: Modelo de Disparo de Mensagem: O usuário deve poder visualizar o texto padrão de felicitação ou aviso de audiência para envio manual ou disparo via webhook futuro.
- RF11: Notificações Internas: Exibir avisos internos aos advogados sobre prazos críticos atribuídos a eles. 


### Gestão Financeira

- RF12: Controle de Cobranças (Invoices): Cadastro e listagem de honorários (contratuais ou sucumbenciais) vinculados ao cliente/processo, com valor, data de vencimento e status (Pendente ou Pago).
- RF13: Visão Simplificada de Fluxo: Totalizadores de valores a receber no mês e valores já liquidados. 

