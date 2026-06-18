---
name: prodesp-mule-intra-mule-http
description: >-
  Padrão PRODESP para rastreio intra-Mule (vars.context, x-transaction-id,
  x-global-correlation-id), rastreio por item em jobs scheduler (foreach +
  tracing:with-correlation-id), client_id em http:default-headers, chamadas HTTP
  entre apps (alternativa ao mule-plugin) e run local com mule.env. Use ao
  implementar propagacao de headers, piloto http:request para s-api, logs de
  contexto na entrada, job credenciais ou rodar data-integrator-p-api local.
---

# PRODESP — Rastreio intra-Mule + HTTP outbound

Complementa `mulesoft-app-implementation`, `prodesp-client-credentials-muleapps` e Task 21890.

## Headers (contrato common-data-types 1.0.2)

| Header | Papel |
|--------|--------|
| `x-transaction-id` | Mesma transacao de negocio em varias chamadas |
| `x-global-correlation-id` | Id da cadeia; manter estavel entre hops |
| `x-parent-correlation-id` | Elo imediato (quem chamou **esta** API agora) |
| `x-source-system` | App que **envia** o request outbound deste hop |
| `client_id` / `client_secret` | Somente intra-Mule; ver regra client credentials |

Nomes com **underscore** (`client_id`), nao `client-id`, para enforcement.

## vars.context na entrada (antes do APIKit)

Implementação e rollout app a app: skill **`mulesoft-app-implementation`** (seção *Rastreabilidade na entrada*). Pré-requisito APIKit; sem APIKit → avisar o usuário.

**Onde:** flow main → `flow-ref` `c-inbound-tracking-context` → `apikit:router` (ex. `data-integrator-p-api-main`).

**Arquivos:**
- `src/main/mule/common/c-inbound-tracking-context.xml`
- `src/main/resources/dwl/variables/context/inbound-tracking-context.dwl`
- Logger INFO no sub-flow (mensagem inline ou DWL opcional em `dwl/log/`)

**Regras de negocio (implementacao de referencia):**

1. `x-transaction-id` e `x-global-correlation-id`: valor do inbound; se vazio, **UUID** com origem `p('api.name')`.
2. `x-parent-correlation-id` no outbound: **sempre** o `x-global-correlation-id` ja resolvido (nao repassar parent inbound isolado).
3. `x-source-system` no outbound: **sempre** `p('api.name')` (app corrente), nao repassar source do caller.
4. Log **INFO** na entrada com JSON contendo **apenas** `x-transaction-id` e `x-global-correlation-id`; se UUID gerado, mencionar no texto do log.

Nao usar `attributes.headers` nos default-headers depois do router — dados podem se perder. Usar `vars.context`.

## Rastreio por item — jobs scheduler (`foreach`)

Para entrypoints **sem APIKit** (scheduler, batch), aplicar rastreio em **dois niveis**: execucao do job e item processado. Referencia canonica: `management-payments-receipts-s-api` → `credenciais-event_flow.xml` + `common/c-credenciais-scheduler-context.xml`.

### Nivel scheduler (container do `foreach`)

1. Sub-flow `c-credenciais-scheduler-context` (ou equivalente por dominio):
   - `ee:transform` → `vars.context` via DWL de dominio (ex.: `credenciais-scheduler-tracking-context.dwl`)
   - `vars.credenciaisJobCorrelationId` = `correlationId` da execucao (preserva id do job para o `foreach`)
   - Logger **INFO** com faixa/categoria de negocio + `correlationId` (`category` dedicada, ex.: `br.gov.sp.prodesp.api.credenciais`)

**DWL scheduler (exemplo):**

```dw
%dw 2.0
output application/java
---
{
	"correlationId": correlationId,
	"x-transaction-id": correlationId,
	"x-global-correlation-id": correlationId,
	"x-parent-correlation-id": null,
	"x-source-system": p('application.name')
}
```

### Nivel item (`foreach`)

Ordem obrigatoria dentro de cada iteracao:

1. Transform de variaveis de negocio do item (ex.: `resultSetPayment`)
2. `ee:transform` → `vars.context` via DWL de item (ex.: `credenciais-item-tracking-context.dwl`)
3. Logger **INFO** *antes* de `tracing:with-correlation-id` (transicao parent → item)
4. **`tracing:with-correlation-id`** com `correlationId='#[vars.context["correlationId"]]'` envolvendo **todo** o processamento do item
5. Logger **INFO** *dentro* de `with-correlation-id` — **mesma mensagem** do passo 3 (ver abaixo)
6. `try` + subflows de integracao (HTTP outbound usa `vars.context` nos default-headers)

**Por que dois logs INFO com a mesma mensagem?** O log **dentro** de `with-correlation-id` aparece no log4j com o **novo** `%X{correlationId}` (MDC). Assim da para buscar no observability pelo correlationId do item **e** pelo prefixo de negocio `numeroPedido` / `idOrderSummary` na mesma linha.

**DWL item (exemplo credenciais):**

```dw
%dw 2.0
output application/java
var cnpj = vars.resultSetPayment.cnpjEmpresa default ""
var numeroPedido = vars.resultSetPayment.numeroPedido default ""
var itemGlobal = uuid()
---
{
	"correlationId": itemGlobal,
	"correlationIdAntigo": correlationId,
	"x-transaction-id": "cnpj:" ++ cnpj ++ "-numeroPedido:" ++ numeroPedido,
	"x-global-correlation-id": vars.credenciaisJobCorrelationId,
	"x-parent-correlation-id": vars.credenciaisJobCorrelationId,
	"x-source-system": p('application.name')
}
```

- `correlationId` (novo UUID): alimenta `tracing:with-correlation-id` — **nao** confundir com header `x-global-correlation-id`.
- `correlationIdAntigo`: `correlationId` Mule antes do switch (util no log de transicao).
- `x-transaction-id`: identificador deterministico de negocio por item (`cnpj` + `numeroPedido`).
- `x-global-correlation-id` / `x-parent-correlation-id`: mantem o id da **execucao do scheduler** (`vars.credenciaisJobCorrelationId`).

### Log INFO por pedido (busca no observability)

- `level="INFO"`, `category="br.gov.sp.prodesp.api.credenciais"` (ou package de negocio da app)
- `doc:name="INFO novo correlationId por pedido"`
- Prefixo textual **antes** do JSON: `"Credenciais - numeroPedido=" ++ ... ++ " idOrderSummary=" ++ ...`
- Corpo JSON: `correlationIdNovo`, `correlationIdAntigo`, `numeroPedido`, `idOrderSummary`, `globalCorrelation`, `parentCorrelation`, `faixaLastModified`
- Expressao com `output text/plain` + `---` (mesmo padrao dos logs DEBUG outbound)

```xml
<logger level="INFO"
	doc:name="INFO novo correlationId por pedido"
	message='#[output text/plain&#10;---&#10;"Credenciais - numeroPedido=" ++ (vars.resultSetPayment.numeroPedido default "") ++&#10;" idOrderSummary=" ++ (vars.resultSetPayment.idOrderSummary default "") ++ "\n" ++ &#10;write({&#10;	correlationIdNovo: vars.context["correlationId"] default "",&#10;	correlationIdAntigo: vars.context["correlationIdAntigo"] default "",&#10;	numeroPedido: vars.resultSetPayment.numeroPedido default "",&#10;	idOrderSummary: vars.resultSetPayment.idOrderSummary default "",&#10;	globalCorrelation: vars.context["x-global-correlation-id"] default "",&#10;	parentCorrelation: vars.context["x-parent-correlation-id"] default "",&#10;	faixaLastModified: vars.credenciaisJobFaixaLastModified default ""&#10;}, "application/json")]'
	category="br.gov.sp.prodesp.api.credenciais" />
<tracing:with-correlation-id
	doc:name='With CorrelationID vars.context["correlationId"]'
	correlationId='#[vars.context["correlationId"]]'>
	<logger level="INFO"
		doc:name="INFO novo correlationId por pedido"
		message='... mesma expressao ...'
		category="br.gov.sp.prodesp.api.credenciais" />
	<!-- try + processamento do item -->
</tracing:with-correlation-id>
```

**Convencao DWL:** arquivos especificos de dominio/job ficam em `dwl/<dominio>/` (ex.: `dwl/credenciais/item-tracking-context.dwl`), nao em `dwl/variables/context/` — ver regra `mulesoft-dwl-externalize`.

## HTTP config + default-headers (piloto wallet)

**Config:** `data-wallet-integrator-s-api_http-config` em `z-global-config.xml`.

| Propriedade YAML | Uso no config HTTP |
|------------------|-------------------|
| `requestDataWallet.basePath` | `basePath` do `http:request-config` (ex. `/v1`) |
| `requestDataWallet.host` / `port` / `protocol` | connection |
| `requestDataWallet.empresasPath` | `path` na operacao (ex. `/empresas`) |
| `request.clientId` / `request.clientSecret` | default-header `client_id` / `client_secret` |

**Default-headers (config):** `client_id`, `client_secret`, headers de rastreio via `vars.context`.

**Na operacao `http:request`:** apenas `Authorization` (+ `Accept` / `Content-Type` se POST JSON). Nao duplicar rastreio na request.

### `http:request` — body (quando usar / quando omitir)

- **Quando o body for o `payload`**: **não** é necessário declarar a tag `<http:body>`. (Deixe o `payload` corrente seguir para o request.)
- **Quando o body for uma variável**: declarar explicitamente o body com CDATA:

```xml
<http:body><![CDATA[#[vars.context]]]></http:body>
```

## Logging (DEBUG antes/depois de `http:request`)

Em **todo** logger pré/pós de `http:request` (ou mule-plugin), a expressão do `message` deve começar com:

```dw
output text/plain
---
"<VERBO> " ++ p("...") ++ " - Request " ++ write({ ... }, "application/json")
```

No XML Mule, no atributo `message`: `#[output text/plain&#10;---&#10;...]` (quebra de linha como `&#10;`). Aplicar no logger **antes** e **depois** da request. Sem `output text/plain`, a concatenação com `write` pode gerar erro.

Ao registrar logs de request/response **na app**, incluir somente:

- `xTransactionId`: `vars.context["x-transaction-id"] default null`
- `xGlobalCorrelationId`: `vars.context["x-global-correlation-id"] default null`

Nao incluir no payload do log nada relacionado a autenticacao/segredos:

- `Authorization` (token)
- `vars.authorization` (ou qualquer variavel derivada)
- flags como `authorizationInformado` (mesmo booleano e sensivel)

Nao incluir no payload do log:

- `xSourceSystem` (ja sai no log4j)
- `xParentCorrelationId` (ja sai no log4j)

**Response validator:** lista `${api.responseValidatorCode}` no config — manter se o time ja usa; alternativa e tratar via `erros-http_commons` sem validator amplo.

## mule-plugin vs http:request

| | mule-plugin | http:request + default-headers |
|---|-------------|-------------------------------|
| Rastreio no Studio | Por operacao (traits) | Centralizado no config |
| client credentials | `property_client-id` no plugin config | default-header + `request.*` |
| Contrato | Operacoes tipadas | Paths no YAML + XML manual |
| Properties YAML | bloco legado (`requestDataIntegrator`) | bloco **separado** (`httpDataIntegrator`) enquanto conviverem |

Confirmacao explicita se trocar plugin por HTTP para outra Mule app (regra workspace).

**Referencia piloto HTTP:** `data-integrator-p-api` → `post-pedidos-compra-data-wallet_subflow.xml` (`httpDataWalletSystem`).

---

## Migração mule-plugin → http:request (checklist)

Use quando pedir para trocar connector por `http:request` em apps consumidoras.

### 1. Confirmar basePath da API alvo

1. RAML raiz: `version` (ex.: `v1` em `data-integrator-p-api.raml`).
2. App alvo: `http:listener path="${http.path}"` — em PRODESP costuma ser `/v1/*` → **basePath = `/v1`**.
3. Recursos RAML relativos a essa base (`/empresas` → URL `/v1/empresas`).

**Nao** usar `path` no `http:request-config` onde o conector espera `basePath`.

### 2. Properties — duplicar enquanto conviver mule-plugin

Enquanto **ainda existir** operacao via `mule-plugin` na **mesma app**:

| Bloco YAML | Consumidor | Campo base | Paths por operacao |
|------------|------------|------------|--------------------|
| `requestDataIntegrator` | `data-integrator-p-api:config` | `path: "/v1"` | N/A |
| `httpDataIntegrator` | `http:request-config` | `basePath: "/v1"` | `*Path` em `config.yaml` |

- Duplicar host, port, protocol, timeout, authorization no env (`config-dev.yaml`, etc.).
- Paths de operacao **somente** no bloco HTTP, em `config.yaml` (agnostico).

Quando **todas** as operacoes do connector forem HTTP → avaliar unificar blocos.

### 3. http:request-config + operacao

Ver secao *Convenções de nomenclatura e paths* e exemplo em `management-payments-receipts-s-api` (`data-integrator-p-api_http-config` + subflows credenciais).

### 4. Inventario antes de migrar

`grep` na app pelo namespace do connector. Se sobrar operacao plugin → bloco YAML duplicado **obrigatorio**.

### 5. Anti-padroes da migracao

- `basePath="${requestDataIntegrator.path}"`
- Paths HTTP no bloco plugin
- Hardcode `/v1/...` no XML

---

## Properties YAML

```yaml
request:
  clientId: ""
  clientSecret: ""

requestDataWallet:
  protocol: "HTTPS"
  host: "<host-cloudhub-ou-local>"
  port: "443"
  basePath: "/v1"
  empresasPath: "/empresas"
  timeout: "30000"
```

Valores reais de `clientId`/`clientSecret` no runtime; nao commitar segredos de prod.

## Run local

Ver skill **`prodesp-mule-local-runtime`** (`.cursor/skills/prodesp-mule-local-runtime/SKILL.md`) — stack CLI sem Studio, API Platform, `api.id` Dev, `log4j2`.

Resumo legado single-app: [run-local.md](run-local.md).

## Convenções de nomenclatura e paths

### Nome do config
Padrão: `<nome-da-api>_<tipo>` — usar underscore antes do tipo, não hífen.
- Correto: `data-wallet-s-api_http-config`
- Errado: `data-wallet-s-api-http-config`

### Paths por operação no YAML
Cada path de operação deve ser uma propriedade YAML, **não** hardcoded no XML.
Prefixo do bloco HTTP dedicado (ex.: `httpDataIntegrator`, `httpDataWalletSystem`).

**Separacao basePath vs path:**
- `basePath` no `http:request-config` — versao/API root (ex.: `/v1`).
- `*Path` na operacao — recurso relativo ao basePath (ex.: `/empresas`).

```yaml
httpDataIntegrator:
  basePath: "/v1"                 # env-specific (config-dev.yaml)
  empresasPath: "/empresas"       # config.yaml (env-agnostico)
  aplicacoesPath: "/aplicacoes"
  pedidosCompraPath: "/pedidos/compra"
```

No XML: `basePath="${httpDataIntegrator.basePath}"` no config; `path="${httpDataIntegrator.empresasPath}"` na request.

Alternativa (wallet s-api direto): paths com versao explicita quando `basePath` vazio:

```yaml
httpDataWalletSystem:
  basePath: ""
  pedidosCompraPath: "/v1/pedidos/compra"
  pedidosCompraV2Path: "/v2/pedidos/compra"
```

## Anti-padroes

- DWL vazio em `outbound-data-wallet-s-api.dwl` com tudo no XML — preferir context + default-headers.
- `securedBy` traits + default-headers duplicando os mesmos headers.
- Repassar `x-source-system` do caller no outbound da p-api (deve ser `api.name`).
- Usar `path` (plugin) no `basePath` do `http:request-config`.
- Reutilizar bloco `requestDataIntegrator` para HTTP enquanto mule-plugin ainda estiver ativo na app.
- Paths de operacao no XML hardcoded ou no bloco errado do YAML.
