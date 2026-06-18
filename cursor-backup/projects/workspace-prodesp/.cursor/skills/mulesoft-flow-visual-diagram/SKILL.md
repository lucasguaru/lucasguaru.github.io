---
name: mulesoft-flow-visual-diagram
description: >-
  Cria diagramas visuais horizontais de flows MuleSoft (JSON + HTML/SVG, board
  zoom/pan). Achata flow-ref, mostra Scheduler/Salesforce/HTTP/Choice/End.
  Use ao pedir mapeamento visual de flow, diagrama de integração Mule, visual
  mapping, credenciais-event_flow ou novo diagrama em tarefas/mapeamento-visual-flows.
---

# Diagrama visual de flows MuleSoft

## Documentação completa

**Definições acordadas:** [tarefas/mapeamento-visual-flows/definicoes.md](../../../tarefas/mapeamento-visual-flows/definicoes.md)

**Implementação de referência:** `tarefas/mapeamento-visual-flows/`

| Artefato | Arquivo |
|----------|---------|
| Entrada (Live Server) | `index.html` |
| Estilos | `css/board.css` |
| Renderer + board | `js/board-app.js` |
| Pipeline (exemplo) | `data/credenciais-event_flow.json` |
| Ícones | `assets/icon-salesforce.svg`, `assets/icon-request.svg` |

Abrir `index.html` com **Live Server**.

---

## Workflow do agente

1. Ler **definicoes.md** antes de criar ou alterar diagrama.
2. Identificar o **flow** pedido (um flow por diagrama, salvo pedido contrário).
3. Ler XML do flow + subflows referenciados por `flow-ref`.
4. Montar pipeline achatado → JSON.
5. Reutilizar `index.html` + `css/board.css` + `js/board-app.js`; novo JSON em `data/`.
6. Validar visualmente (Live Server ou Chrome DevTools).

---

## Regras resumidas (não pular)

- **Mostrar:** scheduler, salesforce query/update, http request, choice, end.
- **Ocultar na tela:** flow-ref, logger, transform, set-variable, foreach, try, tracing.
- **Achatar flow-ref:** conteúdo interno (request, SF, choice) inline.
- **Choice:** losango SVG em `MAIN_CY`; texto abaixo; ramos à direita; setas → direita, cantos arredondados.
- **merge true:** ramos voltam ao eixo principal; fluxo continua.
- **merge false (terminal):** um único **End** centralizado no fim do flow.
- **Board:** scroll = zoom; botão do meio = pan; sem legenda.

---

## Diagrama horizontal (board) vs swimlane vertical

| Tipo | Onde | Skill |
|------|------|--------|
| Board horizontal | `tarefas/mapeamento-visual-flows/` | **esta skill** |
| Swimlane vertical + CSV | `tarefas/*-visual/` (ex. pagamentos-job-recente-visual) | `prodesp-flow-visual-csv-first` |
| Swimlane + logs CH2 por pedido | Hub `8790` + `?session=` no diagrama | `prodesp-flow-visual-hub` |

Ambos os diagramas estáticos podem mapear o mesmo flow Mule; o CSV de colunas é específico do swimlane vertical.

---

## Extensões

Seção em **definicoes.md** e abaixo — preencher em chats futuros com regras novas do usuário.
