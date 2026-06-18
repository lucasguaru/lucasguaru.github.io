---
name: prodesp-salesforce-mcp
description: >-
  Configura e usa Salesforce DX MCP Server no Cursor para verificações na org
  PRODESP (alias prodesp-dev), com fallback para sf CLI. Cobre mcp.json,
  toolsets enxutos (data,orgs), aliases DSP vs PRODESP, quando preferir MCP
  vs CLI e troubleshooting. Use ao pedir verificação em Salesforce, consulta
  SOQL, configurar MCP Salesforce, ou explorar OrderSummary/Credencial__c na
  org dev PRODESP.
---

# PRODESP — Salesforce MCP e verificação (Cursor)

Complementa `tarefas/.../sf-cli-dev.md` (SOQL do job credenciais e login CLI).

## Quando usar

| Cenário | Preferir |
|---------|----------|
| Consulta/exploração no chat (pedido, campos, status) | **MCP** (`salesforce-prodesp-dev`) |
| Script/CI, pipe shell, reprodução exata no terminal | **CLI** (`sf data query`, `sf sobject describe`) |
| Deploy/metadata DX | **CLI** ou MCP com `--toolsets metadata` (se habilitado) |
| Governança OAuth por usuário na org | **Hosted MCP** (setup admin — ver abaixo) |

**Ordem no agente:** se MCP `salesforce-prodesp-dev` estiver ativo no Cursor, usar tools MCP primeiro; CLI como fallback se MCP indisponível ou usuário pedir comando explícito.

## Aliases de org (não confundir)

| Alias | Escopo |
|-------|--------|
| `prodesp-dev` | Sandbox PRODESP Portal APIs (padrão verificações) |
| `prodesp-hml` | Homologação PRODESP |
| `dsp-dev`, `dsp-hml` | DesenvolveSP — **outro projeto** |

Validar antes de consultar:

```bash
sf org list
```

Login dev PRODESP (se expirado):

```bash
sf org login web --alias prodesp-dev --instance-url https://test.salesforce.com
```

## MCP configurado (global)

Arquivo: `~/.cursor/mcp.json` — chave `salesforce-prodesp-dev`.

```json
"salesforce-prodesp-dev": {
  "command": "npx",
  "args": [
    "-y",
    "@salesforce/mcp@latest",
    "-o",
    "prodesp-dev",
    "--toolsets",
    "data,orgs"
  ]
}
```

**Notas:**
- Pacote oficial: `@salesforce/mcp` (binário interno: `sf-mcp-server`). `-o` = `--orgs`.
- **Não** usar `--toolsets all` — 60+ tools; infla contexto e tokens.
- Windows: sempre `npx`; **não** usar path macOS (`/opt/homebrew/bin/...`).
- Ativar em Cursor → Settings → Tools & MCP. Primeira carga do `npx` pode levar 1–2 min (ponto amarelo → verde).

### Toolsets recomendados

| Necessidade | `--toolsets` |
|-------------|--------------|
| Verificar pedidos/dados (padrão) | `data,orgs` |
| + retrieve/deploy metadata | `data,orgs,metadata` |
| Menos tokens (experimental) | adicionar `-d` / `--dynamic-tools` nos `args` |

`core` é sempre habilitado pelo servidor.

## CLI (fallback)

Mesmos aliases. Exemplos usados no workspace:

```bash
sf data query --query "SELECT Id, OrderNumber, Status FROM OrderSummary LIMIT 3" -o prodesp-dev --json
sf sobject describe --sobject OrderSummary -o prodesp-dev --json
```

Scripts que reutilizam o padrão:
- `tarefas/.../teste-portal-apis/tests/helpers/salesforce-enrich.ts`
- `tarefas/.../teste-scope-acessos/scripts/salesforce-pedido-acesso.mjs`

## Objetos frequentes (Portal APIs)

| Objeto | Uso |
|--------|-----|
| `OrderSummary` | Pedido portal (`OrderNumber`, `Status`, `OriginalOrderId`) |
| `Order` | Campos Wallet (`NomeSistema__c`, `ClientId__c`, `IdWallet__c`, …) |
| `Credencial__c` | Credenciais geradas pelo job Mule |
| `OrderItem` | Produtos/APIs do pedido |

## Hosted MCP (alternativa — não configurado por padrão)

Salesforce gerencia o servidor; OAuth via External Client App (`mcp_api`, callback `cursor://anysphere.cursor-mcp/oauth/callback`). **App separado do CLI** (JWT vs session token).

Sandbox exemplo:

```json
"url": "https://api.salesforce.com/platform/mcp/v1/sandbox/platform/sobject-all",
"auth": { "CLIENT_ID": "CONSUMER_KEY_ECA" }
```

Doc: [Configure Cursor — Hosted MCP](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/cursor.html).

Usar quando admin exigir permissões por usuário e auditoria; para dev local PRODESP, DX MCP local (`@salesforce/mcp`) é suficiente.

## Troubleshooting

| Sintoma | Ação |
|---------|------|
| Ponto amarelo persistente | Aguardar download `npx`; toggle off/on; ver logs do MCP |
| Org não autorizada | `sf org login web --alias prodesp-dev` |
| Campo SOQL inválido | `describe` do objeto; corrigir nome custom (`__c`) |
| MCP falha | Fallback `sf data query` com `-o prodesp-dev --json` |

## Tokens

- MCP com toolsets enxutos (`data,orgs`) < `--toolsets all`.
- CLI `describe --json` completo é caro — preferir MCP ou query com `FIELDS(CUSTOM)` / campos explícitos.
- Evitar carregar toolsets não usados (lwc, mobile, devops, …).
