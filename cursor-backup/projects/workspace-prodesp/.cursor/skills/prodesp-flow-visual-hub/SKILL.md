---
name: prodesp-flow-visual-hub
description: >-
  Flow Visual Hub PRODESP — app Node local (porta 8790): schedules CH2 → execuções
  → logs por item → diagrama swimlane com painel visual por nó. Parser log4j,
  job vs item correlation, log-points/overrides, dedupe semântica, UI cards.
  Use ao trabalhar em tarefas/flow-visual-hub, logs no diagrama pagamentos,
  mapLogsToNodes, log-points.json, flow-log-bridge, ou pedir hub de logs CH2.
---

# Flow Visual Hub — logs CH2 + diagrama swimlane

App Node em `tarefas/flow-visual-hub/` (porta **8790**).

Skill relacionadas:

| Assunto | Skill |
|---------|--------|
| Buscar logs AMC / correlationId | `prodesp-mule-runtime-logging` |
| Diagrama swimlane (CSV, layout) | `prodesp-flow-visual-csv-first` |
| Board horizontal | `mulesoft-flow-visual-diagram` |

Referência de diagrama: `tarefas/pagamentos-job-recente-visual/`

## Fluxo do usuário

```
Landing (/) → schedule + janela min
  → execuções (job correlation) + itens SF
  → clique no pedido
  → GET /api/items/{itemCorrelationId}/logs?jobCorrelationId=…
  → sessão + diagrama /flows/pagamentos/?session=…
  → nós com badge L → painel “Por passo” (cards)
```

## Arquivos principais

| Path | Papel |
|------|--------|
| `server.js` | HTTP, API, static, sessões em memória |
| `lib/log-parser.js` | Parser log4j, runs, `mapLogsToNodes`, dedupe semântica |
| `lib/anypoint-client.js` | OAuth + API AMC (mesmo endpoint da UI CH2) |
| `config/schedules.json` | Schedules, `logEntryLabel`, `flowJson`, `logPointsJson` |
| `config/mule-apps.json` | Apps CH2 DEV + `deploymentId` |
| `public/js/log-view.js` | Render HTML (cards, timeline, strip SCHEDULE) |
| `public/js/flow-log-bridge.js` | Painel no diagrama (`?session=`) |
| `public/js/hub-app.js` | Landing |
| `scripts/extract-log-points.js` | Gera `*_flow-log-points.json` do XML |
| `scripts/test-parser.js` | Testes unitários (`npm test`) |
| `fixtures/sample-mgmt-logs.txt` | Fixture offline |

Diagrama consome via hub:

| Path | Papel |
|------|--------|
| `tarefas/{slug}-visual/data/{flow}_flow.json` | `nodeId`, `businessLabel`, `docName` |
| `tarefas/{slug}-visual/data/{flow}_flow-log-points.json` | Mapa nó → padrões de log (gerado) |
| `tarefas/{slug}-visual/data/{flow}_flow-log-points-overrides.json` | Tokens runtime (editar manualmente) |

`index.html` do diagrama:

```html
<script src="/js/log-view.js"></script>
<script src="/js/flow-log-bridge.js"></script>
```

## Subir o hub

```bash
cd tarefas/flow-visual-hub
npm test
npm run start:platform    # logs reais CH2 (Windows-safe)
npm run start:fixture       # offline
```

Windows: usar flags `--platform` / `--fixture` nos scripts npm (não `VAR=valor`).

Credenciais: `ANYPOINT_CLIENT_ID`, `ANYPOINT_CLIENT_SECRET`, `ANYPOINT_ENV=DEV`.

Abrir http://127.0.0.1:8790

Após alterar `server.js`, `log-parser.js` ou JS público: **reiniciar** o processo na 8790.

## Dois correlation IDs (obrigatório entender)

| ID | Origem | Exemplo de logs |
|----|--------|-----------------|
| **Job** | Scheduler / início do job | `Inicio job pagamentos`, query SF pendentes, `Itens selecionados SF` |
| **Item** | `tracing:with-correlation-id` no foreach | `Pagamentos - numeroPedido=…`, DEBUG request/response do item |

- Runs do schedule nascem só em **`Inicio job`** — item órfão não vai parar no run errado.
- Sessão do pedido = **`filterLogsForItemSession`**: merge linhas que batem **job OU item** correlation.
- API item: query `jobCorrelationId` obrigatória quando job ≠ item (hub envia ao abrir pedido).

## Mapa log → nó

### Geração

```bash
cd tarefas/flow-visual-hub
npm run extract-log-points
```

- Lê XML mgmt (+ subflows configurados em `extract-log-points.js`).
- Liga `http:request` / Salesforce a loggers `DEBUG antes` / `DEBUG depois` por proximidade no XML.
- `nodeId` vem de `flow.json` quando `doc:name` coincide.
- Loggers INFO (`foreach`, itens SF): **pula** se `nodeId` já existir (evita duplicata no JSON).

### Overrides (fonte da verdade para tokens runtime)

`{flow}_flow-log-points-overrides.json` — editar manualmente:

```json
{
  "mgmt-get-emp": {
    "matchBefore": ["GET /empresas", "- Request"],
    "matchAfter": ["GET /empresas", "- Response"]
  },
  "foreach": {
    "matchInfo": ["Pagamentos - numeroPedido="]
  }
}
```

**Tokens = texto na mensagem do logger em runtime**, não `doc:name` do Studio.

Ex.: logger XML `DEBUG antes GET empresas` → log real `GET /empresas - Request {…}`.

### Matching (`mapLogsToNodes`)

Por nó (`mergeLogPointNodes` une entradas com mesmo `nodeId`):

| Campo | Uso |
|-------|-----|
| `matchBefore` | Primeira linha → **entrada** (`in`) |
| `matchAfter` | Primeira linha → **saída** (`out`) |
| `matchInfo` | Linhas extras — modo **OR** (qualquer token) |
| `logInfo` | Doc name INFO; se presente, combina com `matchInfo` no mesmo branch |

## Parser — regras importantes

### Prefixo SCHEDULE

Mensagens usam `vars.logEntryLabel` → `SCHEDULE pagamentos · recente (2 min) - …`

- Parser expõe `logEntryLabel` e `body` (sem prefixo).
- UI **não** exibe o prefixo (`log-view.js` → `cleanMessage`).

### JSON multiline

Loggers DEBUG com `write(..., "application/json")` podem pretty-print (várias linhas físicas).

`parseLogLines` acumula linhas até `JSON.parse` válido; senão a UI mostra só `{`.

### Dedupe semântica (não usar só `raw`)

Mesma linha pode aparecer 2× no CH2 (ex.: logger INFO antes e dentro de `tracing:with-correlation-id`) ou em buscas job + item com `raw` ligeiramente diferente.

`logSemanticKey(line)`:

- Pedido: `pag:{numeroPedido}:{numeroSolicitacao}:{idOrderSummary}`
- Request/response: `{phase}:{operation}`
- Demais: `{timestamp}|{level}|{body}`

Usar em `dedupeLogLines`, `pushUniqueExtra` e na UI (`FlowLogView.semanticKey`).

Preferir linha **com** `json` quando houver empate.

## UI do painel (não técnico)

- **Linha do tempo**: eventos compactos (hora + frase legível).
- **Por passo**: cards Entrada (azul) / Saída (verde) / Info (roxo).
- Título do nó: `docName` / `businessLabel` de `flow.json` (`flowNodes` na sessão).
- Campos-chave extraídos do JSON (CNPJ, nº pedido, etc.).
- **Ver JSON completo** colapsado (`<details>`).

**Não** usar dump monospace com `textContent` para visualização de pedido.

## API resumida

| Endpoint | Uso |
|----------|-----|
| `GET /api/schedules/{id}/runs?minutes=` | Execuções + itens |
| `GET /api/items/{itemCorr}/logs?scheduleId=&jobCorrelationId=` | Cria sessão |
| `GET /api/session/{sessionId}` | Dados para `flow-log-bridge` |

Sessão inclui: `lines`, `byNode`, `flowNodes`, `itemCorrelationId`, `jobCorrelationId`.

## Checklist — novo nó com log no diagrama

1. `nodeId` estável em `flow.json` (swimlane).
2. Tokens reais em `*_flow-log-points-overrides.json`.
3. `npm run extract-log-points` (se novos componentes no XML).
4. `npm test`.
5. Reiniciar hub; abrir pedido **novo** (sessão antiga não tem `flowNodes`).

## Não fazer neste escopo (salvo pedido)

- Chrome extension de logs.
- Alterar `exchange.json` / deploy CH2.
- Board horizontal em `mapeamento-visual-flows/` (outra skill).

Prompt de continuação: `tarefas/flow-visual-hub/prompts/CONTINUAR-flow-visual-logs.md`

Catálogo geral de ferramentas do repo: [`.ia/dev-tools.yaml`](../../.ia/dev-tools.yaml) (skill `prodesp-dev-tools-catalog`).
