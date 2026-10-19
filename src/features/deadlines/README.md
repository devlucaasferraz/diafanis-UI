# Motor de Prazos (`deadlines/`)

Componentes React + TypeScript para uma **simulação simplificada** de contagem de dias.

## Arquivos

- `DeadlineCalculator.tsx`: formulário, validação, resultado, memória de cálculo e ponto de integração com calendário.
- `CourtSelector.tsx`: seletor de Petrolina-PE e Juazeiro-BA.
- `HolidayNotice.tsx`: aviso explícito sobre feriados e suspensões não consultados.
- `schemas.ts`: tipos, opções de comarca e validação.
- `deadlines.test.ts`: testes com Vitest.

## Integração

Importe o componente:

```tsx
import DeadlineCalculator from "@/deadlines/DeadlineCalculator";

export default function PrazosPage() {
  return (
    <DeadlineCalculator
      onCreateCalendarEvent={(result) => {
        // Integrar aqui com a API/serviço de calendário do projeto.
        // Ex.: abrir modal de confirmação e persistir o evento.
        console.log("Evento a preparar:", result);
      }}
    />
  );
}
```

O callback `onCreateCalendarEvent` é intencionalmente uma integração, não uma
persistência automática. Ligue-o ao serviço de calendário já existente no app.

## Testes

Com Vitest instalado no projeto:

```bash
npx vitest run deadlines/deadlines.test.ts
```

## Limitações importantes

1. O componente exclui o dia informado e inicia a contagem no dia seguinte.
   A data informada deve representar o marco inicial processualmente correto.
2. A contagem de dias úteis exclui sábado e domingo, mas **não** consulta
   feriados nacionais, estaduais, municipais, suspensões de expediente ou
   indisponibilidades do sistema eletrônico.
3. A comarca é coletada e exibida no aviso, mas não altera o cálculo sem uma
   fonte oficial de feriados integrada.
4. Antes de uso real, implemente uma fonte de calendário forense oficial,
   versionada por tribunal/comarca, e revise as regras específicas da classe
   processual e modalidade de intimação. Não utilize a data estimada como
   aconselhamento jurídico.

## CSS

O componente usa classes `deadline-*` para permitir que você aplique o estilo
do projeto. Nenhum framework visual específico é exigido.
