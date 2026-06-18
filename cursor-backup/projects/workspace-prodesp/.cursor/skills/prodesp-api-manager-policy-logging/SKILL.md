---
name: prodesp-api-manager-policy-logging
description: >-
  Habilitar, atualizar ou consultar Message Logging (policy de troubleshooting) em
  instâncias de API no Anypoint API Manager PRODESP via MCP user-mulesoft-prodesp.
  Use ao pedir log de policy, message logging, habilitar log na API Manager, link
  apimanager com /apis/{id}, ou troubleshooting de policies em APIs autodiscovery CH2.
disable-model-invocation: true
---

# PRODESP — Message Logging no API Manager

Skill complementar (não substituir): **`prodesp-mule-runtime-logging`** — scope logging e logs CH2 no runtime.

| Camada | O quê | Onde configurar |
|--------|-------|-----------------|
| **API Manager policy** | Message Logging entre policies e flow | Esta skill — MCP `manage_api_instance_policy` |
| **Runtime CH2** | Nível por pacote/classe (`log4j2`, scope logging) | Skill `prodesp-mule-runtime-logging` |

Org PRODESP: `1c8711d7-2135-4686-89f0-fb014e1662ac`.

Ambientes Anypoint (nome no MCP): **`DEV`**, **`QA`**, **`Production`** (confirmar nome exato se falhar).

| Ambiente | environmentId (referência) |
|----------|---------------------------|
| DEV | `aecde9e6-c027-4354-b490-2894dcbe68c2` |

MCP server: **`user-mulesoft-prodesp`**.

**Referência canônica (DEV):** instância `portal-ecom-tech-e-api` — API `20249159` ([policies](https://anypoint.mulesoft.com/apimanager/prodesp/#/organizations/1c8711d7-2135-4686-89f0-fb014e1662ac/environments/aecde9e6-c027-4354-b490-2894dcbe68c2/apis/20249159/api-policies)).

## Quando usar

- Usuário pede **log de policy**, **message logging**, **habilitar log na API** (link API Manager).
- Troubleshooting de request/response **na camada de policies** (antes/depois do flow Mule).
- **Não** usar para DEBUG de pacote HTTP ou `<logger>` no app — ver `prodesp-mule-runtime-logging`.

## Extrair IDs do link API Manager

```
https://anypoint.mulesoft.com/apimanager/prodesp/#/organizations/{orgId}/environments/{environmentId}/apis/{apiInstanceId}/...
```

- **`apiInstanceId`** → parâmetro `apiInstanceId` do MCP.
- **`orgId`** → `organizationId` (PRODESP: `1c8711d7-2135-4686-89f0-fb014e1662ac`).
- **`environmentId`** `aecde9e6-...` → `environmentName`: **`DEV`**.

## Fluxo padrão

### 1. Preferir copiar de API de referência

Antes de inventar expressão DataWeave:

1. MCP **`list_api_instances`** na instância **referência** `20249159` (ou outra API PRODESP já configurada) com `includeAppliedPolicies: true`.
2. Copiar `configurationData.loggingConfiguration` da policy `message-logging`.
3. Aplicar (`apply`) ou atualizar (`update`) na instância alvo.

Preset versionado no repo: **`presets/message-logging-prodesp.json`** (mesmo conteúdo da referência).

### 2. Inspecionar instância alvo

```json
{
  "page": 1,
  "organizationId": "1c8711d7-2135-4686-89f0-fb014e1662ac",
  "environmentName": "DEV",
  "apiInstanceId": "<ID>",
  "includeAppliedPolicies": true
}
```

Policy asset:

| Campo | Valor |
|-------|-------|
| groupId | `68ef9520-24e9-4cf2-b2f5-620025690913` |
| assetId | `message-logging` |
| assetVersion | versão em `availablePolicies` (ex.: `2.0.2`) |

### 3. Aplicar ou atualizar

| Situação | `operation` | Extra |
|----------|-------------|-------|
| Sem Message Logging | `apply` | `groupId`, `assetId`, `assetVersion`, `policyConfiguration` |
| Já existe | `update` | `policyId` (= `id` em `appliedPolicies`) + `policyConfiguration` |

`policyConfiguration` = **string JSON** (conteúdo de `presets/message-logging-prodesp.json` escapado).

### 4. Preset PRODESP (padrão obrigatório)

Duas entradas, **INFO**, category **`br.gov.sp.prodesp.api.gateway`**:

| itemName | When | Conteúdo |
|----------|------|----------|
| **PRODESP - APIKit entrada HTTP** | Before Calling API | JSON: method, path, queryParams, uriParams, headers (redact `authorization` / `client_secret`), body |
| **PRODESP - APIKit saida HTTP** | After Calling API | JSON: correlationId, httpStatus, response body |

Entrada — redação de headers sensíveis + payload estruturado:

```dataweave
#[%dw 2.0
output text/plain
var sensitiveKeys = ["authorization", "client_secret"]
fun redactHeader(k, v) = if (sensitiveKeys contains lower(k as String)) (if (v == null) null else "***REDACTED***") else v
fun headersForLog(h) = (h default {}) mapObject ((v, k) -> (k): redactHeader(k, v))
---
(attributes.method default "") ++ " " ++ (attributes.relativePath default "") ++ " - APIKit Request - " ++ write({ titulo: "APIKit - entrada HTTP", fase: "antes", correlationId: correlationId, request: { method: attributes.method, path: attributes.relativePath, queryParams: attributes.queryParams, uriParams: attributes.uriParams default {}, headers: headersForLog(attributes.headers), body: if (isEmpty(payload.^raw)) null else payload } }, "application/json")]
```

Saída:

```dataweave
#[%dw 2.0
output text/plain
---
(attributes.method default "") ++ " " ++ (attributes.relativePath default "") ++ " - APIKit Response - " ++ write({ titulo: "APIKit - saida HTTP", fase: "depois", correlationId: correlationId, httpStatus: attributes.statusCode, response: if (isEmpty(payload.^raw)) null else payload }, "application/json")]
```

### ASCII em `itemName` e strings DWL (obrigatório)

**Não usar acentos** em `itemName` nem em strings literais do DataWeave (`titulo`, etc.).

Motivo: no **runtime standalone local** (Mule DX / CLI), o `policy.xml` baixado do API Manager pode gravar bytes Latin-1 com `encoding="UTF-8"` — o `í` de *saída* quebra o deploy da policy (`Invalid byte 2 of 3-byte UTF-8 sequence`). Em CH2 o problema não aparece; no local sim.

| Evitar | Usar |
|--------|------|
| `PRODESP - APIKit saída HTTP` | `PRODESP - APIKit saida HTTP` |
| `titulo: "APIKit - saída HTTP"` | `titulo: "APIKit - saida HTTP"` |

`entrada` permanece sem acento. Preset versionado: **`presets/message-logging-prodesp.json`** (somente ASCII).

**Atualizar em massa (DEV):** paginar `list_api_instances` + `includeAppliedPolicies: true`; para cada instância com policy `message-logging` e category `br.gov.sp.prodesp.api.gateway`, `manage_api_instance_policy` `operation: update` com o preset do repo.

**Não usar** preset genérico (method + headers em DEBUG sem category/redação) — não é o padrão PRODESP.

Variações só se o usuário pedir explicitamente (pointcut por path, nível DEBUG, body omitido).

### 5. Validar

`list_api_instances` + `includeAppliedPolicies: true` — conferir nomes `PRODESP - APIKit *`, category e level INFO.

### 6. Onde ver logs

| Onde | Conteúdo |
|------|----------|
| API Manager → **Message Log** | Logs da policy |
| Runtime Manager → `{assetId}-dev` → Logs | `br.gov.sp.prodesp.api.gateway` / `org.mule.runtime.logging.policy-*` |

## Relatório ao usuário

Tabela: API, ambiente, policy ID, link `/api-policies`. Confirmar alinhamento com preset PRODESP.

## Referências

- Preset: `presets/message-logging-prodesp.json`
- Referência live: API `20249159` (`portal-ecom-tech-e-api`)
- [Message Logging Policy](https://docs.mulesoft.com/mule-gateway/policies-included-message-logging)
- Skill CH2: `.cursor/skills/prodesp-mule-runtime-logging/SKILL.md`
