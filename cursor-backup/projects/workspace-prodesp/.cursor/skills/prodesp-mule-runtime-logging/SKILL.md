---
name: prodesp-mule-runtime-logging
description: >-
  Logs e tracing de apps Mule no CloudHub 2 PRODESP: scope logging remoto (CLI/API),
  leitura via API AMC Application Manager (regexp/correlationId), CLI ch2-logs-cli,
  MCP list_applications (limitado), diferença tracing vs log, consulta de config
  ativa no servidor. Use ao pedir ativar DEBUG, tail/download de logs, buscar por
  correlationId, nível por pacote/classe sem log4j, ou listar scopeLoggingConfigurations.
disable-model-invocation: true
---

# PRODESP — Logs e tracing no runtime (CH2)

Org Exchange: `1c8711d7-2135-4686-89f0-fb014e1662ac`.

Ambiente Dev no Anypoint: **`DEV`** (não `dev` / `Development`).

Nome da app no CH2: `${project.name}-${mule.env}` (ex.: `management-payments-receipts-s-api-dev`).

**Não confundir:** log de **policy no API Manager** (Message Logging antes/depois do flow) → skill **`prodesp-api-manager-policy-logging`**. Esta skill cobre **runtime CH2** (scope logging, AMC, correlationId).

## Log vs tracing

| | **Log** | **Tracing** (`hasTracing` / `tracingEnabled`) |
|---|--------|-----------------------------------------------|
| Conteúdo | Mensagens Logger, erros, stack | Spans OpenTelemetry (duração, caminho da transação) |
| Onde ver | Runtime Manager → Logs; Monitoring | Anypoint Monitoring → Traces |
| CLI `modify` | `--scopeLoggingConfig`, `--disableAmLogForwarding` | Sem flag no CLI (doc: UI/API) |
| MCP | Só **leitura** de logs (`list_applications`) | `update_mule_application` → `hasTracing` |

Tracing **não** substitui nível DEBUG/INFO de log.

## Duas camadas de configuração de log

1. **`log4j2.xml` no JAR** — embarcado no artefato publicado; vale no runtime enquanto o JAR estiver implantado.
2. **Scope logging no Runtime Manager** — `application.configuration.mule.agent.logging.service.scopeLoggingConfigurations` (pacote/classe + nível), aplicado **sem editar o repo**; alteração **reinicia** a app (doc CH2: [Managing App Logs](https://docs.mulesoft.com/cloudhub-2/ch2-manage-app-logs) — *"Changing the log level and clicking Apply Changes restarts the application"*).

Para saber o que está **ativo no servidor**, consultar a API (script abaixo) ou CLI `application describe`. Não inferir só pelo `log4j2.xml` local se houve override via plataforma.

## Ler logs CH2 — três caminhos (não confundir)

| Caminho | Titanium Monitoring? | Filtro `regexp` / correlationId? | Quando usar |
|---------|---------------------|----------------------------------|-------------|
| **API AMC** (Application Manager v2) | **Não** — funciona na org PRODESP Dev com Connected App | **Sim** (`regexp`, `length`, `descending`) | **Preferido** — mesmo endpoint da UI CloudHub |
| **CLI** `ch2-logs-cli` | **Não** | **Sim** | Scripts locais, flow-visual-hub, automação |
| **MCP** `list_applications` + `includeLogs` | **Pode exigir** — erro Titanium na org Dev | Não (só `logLevel`, `timeFrame`) | Evitar para busca fina; OK para visão geral se licenciado |
| **CLI** `anypoint-cli-v4 application logs` | **Não** | Limitado | Tail/download por spec |
| **Export manual** Runtime Manager | N/A | UI | Fallback offline |

**Correção comum:** a mensagem *"API programática de logs exige Titanium"* refere-se ao **MCP / Monitoring API**, **não** ao endpoint AMC usado pela aba Logs do Runtime Manager. Esse endpoint **está disponível** com `ANYPOINT_CLIENT_ID` / `ANYPOINT_CLIENT_SECRET`.

## API AMC — buscar logs (preferido)

Mesma requisição que a UI CloudHub (OAuth Connected App; **sem** cookie de browser):

```
GET /amc/application-manager/api/v2/organizations/{orgId}/environments/{envId}/deployments/{deploymentId}/specs/{specVersion}/logs
  ?length=100
  &regexp=a43dbe60\-67fe\-11f1\-bf7d\-46ac77a38af2
  &descending=true
```

- **`regexp`:** escapar hífens de UUID (`uuid.replace(/-/g, '\\-')`) — igual à UI.
- **`specVersion`:** campo `version` de `GET .../deployments/{id}/specs` (não confundir com versão Maven).
- Logs ficam **por versão de deploy**; se a spec atual não retornar entradas, consultar specs anteriores (o CLI faz isso em paralelo).
- Resposta JSON: `{ docId, timestamp, message, logLevel, replicaId, context: { event, logger, class } }`.
- **`startTime` / `endTime`:** parâmetros existem mas são inconsistentes; preferir filtrar por `timestamp` client-side após a busca.

IDs PRODESP Dev (referência):

| Campo | Valor |
|-------|-------|
| orgId | `1c8711d7-2135-4686-89f0-fb014e1662ac` |
| environmentId (DEV) | `aecde9e6-c027-4354-b490-2894dcbe68c2` |
| deploymentId (mgmt-payments-receipts-s-api-dev) | `83f299eb-aede-41db-895c-33f4ae7af3af` |

Resolver `deploymentId` dinamicamente:

```
GET /amc/application-manager/api/v2/organizations/{orgId}/environments/{envId}/deployments
```

## CLI `ch2-logs-cli` (implementação local)

Path: `tarefas/ch2-logs-cli/`. Node 18+, credenciais no ambiente.

```bash
cd tarefas/ch2-logs-cli

# Listar apps Dev
npm run list-apps

# Logs por correlationId (janela em minutos a partir de agora)
node bin/ch2-logs.js logs \
  --app management-payments-receipts-s-api \
  --correlation-id a43dbe60-67fe-11f1-bf7d-46ac77a38af2 \
  --minutes 60 \
  --format text
```

Opções: `--format json|text`, `--output arquivo.json`, `--length 500`, `--env DEV`.

Nome curto da app (`management-payments-receipts-s-api`) → CLI acrescenta `-dev` quando `ANYPOINT_ENV=DEV`.

Integração **flow-visual-hub:** `lib/anypoint-client.js` usa a mesma API AMC (`FLOW_VISUAL_LOG_SOURCE=platform` ou `auto`). Parser, mapa nó→log, UI e dedupe: skill **`prodesp-flow-visual-hub`** (não duplicar aqui).

## MCP MuleSoft (`user-mulesoft-prodesp`)

| Tool | Log |
|------|-----|
| `list_applications` + `includeLogs` | Até 500 entradas; pode falhar com **Titanium Monitoring** na org Dev — **não** substitui API AMC |
| `update_mule_application` | **Sem** `scopeLoggingConfig`; não muda nível de log |
| `deploy_mule_application` | **Sem** opções de logging no schema |

## CLI `anypoint-cli-v4` (CH2)

Autenticação: `ANYPOINT_CLIENT_ID`, `ANYPOINT_CLIENT_SECRET`, `ANYPOINT_ORG`, `ANYPOINT_ENV=DEV`.

```bash
# Listar / descrever
anypoint-cli-v4 runtime-mgr application list --environment DEV -o json
anypoint-cli-v4 runtime-mgr application describe <APP_ID> --environment DEV -o json

# Ativar DEBUG por pacote (reinicia app — rolling padrão)
anypoint-cli-v4 runtime-mgr application modify <APP_ID> --environment DEV \
  --scopeLoggingConfig "org.mule.runtime.core.internal.processor.LoggerMessageProcessor:DEBUG" \
  --updateStrategy rolling

# Arquivo de scopes (uma tupla por linha)
# {scope: org.mule.service.http, logLevel: WARN}
anypoint-cli-v4 runtime-mgr application modify <APP_ID> --environment DEV \
  --scopeLoggingConfigFile scopes.txt

# Forwarding para plataforma (default: ligado)
anypoint-cli-v4 runtime-mgr application modify <APP_ID> --environment DEV --no-disableAmLogForwarding

# Consumir logs
anypoint-cli-v4 runtime-mgr application logs <APP_ID> <SPEC_ID> --environment DEV
anypoint-cli-v4 runtime-mgr application download-logs <APP_ID> <SPEC_ID> --environment DEV
```

Formato `--scopeLoggingConfig`: `pacote:NIVEL,pacote2:NIVEL` — **sem espaços**. Níveis: `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`.

Doc CLI: [CLI for Cloudhub 2.0](https://docs.mulesoft.com/anypoint-cli/latest/cloudhub2-apps).

## Consultar config ativa no servidor (preferido)

Script (OAuth via env; não imprimir secrets de properties):

```bash
python .cursor/skills/prodesp-mule-runtime-logging/scripts/get-scope-logging.py \
  management-payments-receipts-s-api-dev DEV
```

Saída: `scopeLoggingConfigurations`, `disableAmLogForwarding`, `tracingEnabled`, versão do artefato.

API direta (Application Manager v2):

```
GET /amc/application-manager/api/v2/organizations/{orgId}/environments/{envId}/deployments/{deploymentId}
```

Campo: `application.configuration.mule.agent.logging.service.scopeLoggingConfigurations[]` → `{ scope, logLevel }`.

Forwarding: `target.deploymentSettings.disableAmLogForwarding` (`false` = coleta ativa).

## Pacotes úteis PRODESP

| Pacote / classe | Uso |
|-----------------|-----|
| `org.mule.runtime.core.internal.processor.LoggerMessageProcessor` | Componentes `<logger>` |
| `org.mule.service.http.impl.service.HttpMessageLogger` | Wire HTTP |
| `org.mule.service.http` / `org.mule.extension.http` | Stack HTTP (geralmente WARN) |
| `br.gov.sp.prodesp.api.*` | Loggers DW/Java customizados |

## Relatório ao usuário

Ao listar config ativa, separar:

1. **Scope logging (plataforma)** — da API/script.
2. **log4j2.xml (artefato `{artifactId-app}` versão X)** — do repo/Exchange se for a versão implantada; indicar entradas **só no JAR** e **só na plataforma**.

Nunca expor `secureProperties` da resposta da API.
