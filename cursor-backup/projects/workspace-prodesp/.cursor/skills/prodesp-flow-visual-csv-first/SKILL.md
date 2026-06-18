---
name: prodesp-flow-visual-csv-first
description: >-
  Fluxo visual de negócio PRODESP — CSV de layout (colunas Nível 0–6) como fonte
  da verdade antes do HTML swimlane. Regras de choice, spine col 0, merge encadeado,
  muleApp/cores, omitir proxy HTTP entre apps. Use com comando /fluxo-visual, ao criar
  diagrama swimlane vertical, pagamentos-job-recente-visual, credenciais-job-recente_flow,
  ou quando o usuário pedir "faça fluxo", "diagrama do scheduler" ou CSV antes do HTML.
---

# Flow visual — CSV primeiro, HTML depois

**Comando Cursor:** `/fluxo-visual` (`.cursor/commands/fluxo-visual.md`) — atalho que dispara esta skill.

## Workflow obrigatório (novos fluxos)

```
0. (novo) node .cursor/skills/prodesp-flow-visual-csv-first/scripts/scaffold-flow-visual.js --slug {slug} --flow {flow}
1. Mapear negócio + integrações (XML, README, sequencia.puml)
2. Montar CSV de layout  ← fonte da verdade (usuário valida no Excel)
3. Usuário aprova CSV
4. node scripts/apply-layout-from-csv.js → positions JSON
5. Abrir index.html — swimlane carrega posições + displayLabel do CSV
6. Ajustar flow.json (nós, links, muleApp) e Mule doc:name quando título for aprovado
```

**Não** publicar layout swimlane definitivo sem CSV validado, salvo protótipo descartável.

## Onde ficam os artefatos

| Artefato | Caminho |
|----------|---------|
| Regras de colunas | [regras-layout-colunas-choice.md](../../../tarefas/mapeamento-visual-flows/regras-layout-colunas-choice.md) |
| Template CSV | [flow-layout-colunas-template.csv](../../../tarefas/mapeamento-visual-flows/templates/flow-layout-colunas-template.csv) |
| CSV do fluxo | `tarefas/{slug}-visual/data/{flow}_flow-layout-comma.csv` |
| Posições geradas | `tarefas/{slug}-visual/data/{flow}_flow-layout-positions.json` |
| Grafo | `tarefas/{slug}-visual/data/{flow}_flow.json` |
| Aliases CSV→id | `tarefas/{slug}-visual/scripts/layout-node-aliases.json` |
| Renderer | `tarefas/{slug}-visual/js/swimlane-app.js` |
| Encoding Excel | `.cursor/rules/csv-utf8-excel.mdc` |

Referência: `tarefas/pagamentos-job-recente-visual/`

## Formato CSV

Colunas: `tipo`, `Nível`, `Nível 0` … `Nível 6`

- Vírgula, UTF-8 **com BOM**, CRLF
- `tipo`: vazio · `choice` · `choice-end` · `end` · `*…` (rascunho)
- `Nível`: profundidade do choice (0 = tronco)
- **Mesma linha** = ramos que saem juntos (Sim col 0 + alternativa col 1+)

## Regras de layout (resumo)

Documento completo: `regras-layout-colunas-choice.md`.

| Regra | Detalhe |
|-------|---------|
| Choice | Texto sempre em **Nível 0** |
| Caminho feliz | Desce em **Nível 0** |
| Alternativas | Coluna à direita conforme profundidade do bloco (não `col+1` fixo) |
| **Dois filhos visíveis** | Sim **e** alternativa na mesma linha (ou linha abaixo). Sim só “continua” → nó explícito (`Reutilizar pedido existente`, etc.). Se ambíguo, **perguntar** |
| **choice-end** | `tipo=choice-end`, texto `END choice <pergunta>?` — **sempre Nível 0 (spine)** |
| Rótulo merge | CSV: `END choice …` → tela: **`Fim do choice · <pergunta>`** |
| **Batch END** | Vários `choice-end` consecutivos no spine encadeiam merges antes do próximo passo (ex.: Pedido → Payment → Pagamento efetivado → Estados SF) |
| Negócio em outra app | Manter no CSV (ex. `Pedido existe?` no p-api) mesmo sem `<choice>` na mgmt-s-api |
| **Proxy HTTP omitido** | Request mgmt→outra Mule app **não** entra no diagrama; desenhar lógica **dentro** da app destino |
| **muleApp** | Campo `muleApp` em `flow.json`; cor do card = swatch da legenda no topo |
| **Títulos** | CSV/`displayLabel` = linguagem de negócio (não copiar `doc:name` vago do Studio). Alinhar `doc:name` no XML quando usuário aprovar título |

## Cores por Mule app (swimlane)

Definidas em `swimlane-app.js` → `MULE_APPS`. Legenda só de apps (`#mule-app-legend` no HTML) — **sem** legenda de ícone externo.

| App | Uso típico |
|-----|------------|
| `management-payments-receipts-s-api` | Job / spine principal (azul) |
| `data-integrator-p-api` | Lógica expandida (verde suave) — pedido, empresa, etc. |

Novas apps: adicionar entrada em `MULE_APPS`, CSS `[data-mule-app="…"]` e legenda dinâmica.

## Passos do agente após CSV aprovado

1. **`flow.json`**: nós, links, `muleApp`, nós display (`*-sim-display`, `cota-nao-display`) quando necessário.
2. **`layout-node-aliases.json`**:
   - `labels`: rótulo CSV → id
   - `byRowCol`: `"row:col"` → id (mesmo texto em linhas diferentes)
3. Rodar:
   ```bash
   cd tarefas/{slug}-visual
   node scripts/apply-layout-from-csv.js
   ```
4. Validar `unresolved` no stdout — corrigir aliases ou CSV.
5. Abrir `index.html` (Live Server).
6. Se título aprovado pelo usuário: atualizar `doc:name` no XML Mule correspondente.

## Renderer (`swimlane-app.js`) — comportamento

- **`injectMergeNodes`**: bolinhas de merge; choices aninhados processados **antes** dos externos (evita roubar links).
- **`wireSpineMergeChain`**: merges consecutivos no spine encadeiam antes do próximo choice/end (não pular bolinhas).
- **`choice-end` no script**: `apply-layout-from-csv.js` força **col 0** para merges.
- **Não ocultar** merges intermediários no spine (`hiddenMergeIds` vazio).
- Fallback sem CSV: `computeLayout()` (não usar para entrega final).

## Diagrama horizontal vs swimlane vertical

| Tipo | Skill |
|------|--------|
| Board horizontal (`mapeamento-visual-flows/`) | `mulesoft-flow-visual-diagram` |
| Swimlane vertical + CSV colunas | **esta skill** |
| Swimlane + logs CH2 por pedido/nó | `prodesp-flow-visual-hub` |

## Logs no diagrama swimlane (Flow Visual Hub)

Quando o swimlane tiver overlay de logs (ex. pagamentos):

1. **`flow.json`**: cada nó com log precisa de `id` estável (= `nodeId` nos log-points).
2. **`{flow}_flow-log-points-overrides.json`**: tokens da **mensagem runtime** (`matchBefore`/`matchAfter`/`matchInfo`).
3. Gerar JSON: `cd tarefas/flow-visual-hub && npm run extract-log-points`.
4. `index.html` do diagrama: `/js/log-view.js` + `/js/flow-log-bridge.js` (servidos pelo hub na 8790).
5. Títulos do painel usam `businessLabel` / `docName` do `flow.json`.

Skill completa: `.cursor/skills/prodesp-flow-visual-hub/SKILL.md`.
