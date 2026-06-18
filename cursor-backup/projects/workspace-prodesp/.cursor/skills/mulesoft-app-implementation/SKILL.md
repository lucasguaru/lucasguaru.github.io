---
name: mulesoft-app-implementation
description: Implementar ou alterar aplicações MuleSoft em workspace-prodesp-app (APIKit, flows, DWL, HTTP, plugins, properties, rastreabilidade na entrada, log DEBUG APIKit com prefixo METHOD path + c-apikit-inbound-request-context, módulo ApikitInboundLogHeaders, log DEBUG outbound mule-plugin). Use para novos endpoints, integrações, subflows, c-inbound-tracking-context ou correções em apps s-api, p-api ou e-api.
---

# MuleSoft App Implementation — workspace-prodesp-app

## Aderência à spec do backend (obrigatório)

Antes de implementar ou alterar `http:request` / `http:headers` / `http:query-params` em **s-api**:

1. Conferir Swagger ou doc original (skill **`prodesp-backend-spec-alignment`**).
2. Outbound deve espelhar **`in`** da spec (header ≠ query).
3. Wallet v2: filtros em header no Swagger → mapear query RAML → `http:headers` (referência: `get:\v2\pedidos\compra`).
4. Não reutilizar params de outro path (ex.: `mes`/`ano` de `/v2/acessos/consolidado` em `/v2/acessos`).

Regra: **`prodesp-backend-spec-alignment`**.

## Quando usar

- Implementar endpoint já definido (ou em definição) no RAML
- Novo flow, subflow, transformação DWL ou config HTTP
- Ajuste de error handling, token, health check
- Habilitar **rastreabilidade na entrada** (`vars.context` + log) antes do APIKit

## Apps existentes (referência por camada)

| App | Camada | Papel |
|-----|--------|-------|
| `data-wallet-integrator-s-api` | s-api | Wallet Dados + CEP Correios |
| `data-adobe-sign-s-api` | s-api | Adobe Sign |
| `data-integrator-p-api` | p-api | Orquestração Gov.br, Wallet, ERP, ITSM |
| `data-documents-p-api` | p-api | Documentos / Adobe |
| `management-payments-receipts-s-api` | s-api | Pagamentos, Salesforce |
| `portal-ecom-tech-e-api` | e-api | BFF portal |

**Referência principal s-api:** `data-wallet-integrator-s-api`

## Estrutura de pastas

```
{app-name}/
├── pom.xml
├── mule-artifact.json
└── src/main/
    ├── mule/
    │   ├── {app-name}.xml              # Router APIKit + flows por operação
    │   ├── common/
    │   │   ├── z-global-config.xml     # Listener, APIKit, properties, plugins
    │   │   ├── z-common-error.xml      # cf-error::api_kit, erros-http_commons
    │   │   ├── z-health-common.xml
    │   │   ├── c-inbound-tracking-context.xml  # vars.context + log na entrada (quando pedido)
    │   │   ├── c-apikit-inbound-request-context.xml  # vars.httpMethod/httpPath para log APIKit
    │   │   └── c-get-access-token.xml  # Token RHSSO (quando aplicável)
    │   └── implementation/
    │       └── {domínio}_flow.xml      # Agrupamento opcional de operações
    └── resources/
        ├── properties/
        │   ├── config.yaml
        │   ├── config-{local|dev|qa|prod}.yaml
        │   └── config-secure-{env}.yaml
        └── dwl/
            ├── variables/context/           # só inbound-tracking-context.dwl (sem *-input.dwl)
            ├── variables/queryParams|uriParams|headers/
            ├── variables/httpStatus/
            ├── error/ e error/httpStatus/
            ├── health/
            └── {op}-{backend}-{request|response}-transformation.dwl
```

## pom.xml (padrões)

- `packaging`: `mule-application`
- `groupId`: `1c8711d7-2135-4686-89f0-fb014e1662ac`
- Propriedades `api.name` / `api.version` — versão do RAML no Exchange
- Dependência RAML: `${project.groupId}` + artifact = nome da app + `${api.version}`
- **`app.runtime`**: alinhar ao **último LTS** do CloudHub 2 do ambiente (PRODESP: **`4.9.18`** com `releaseChannel` LTS). Referência canônica: `management-payments-receipts-s-api/pom.xml`
- MUnit: cobertura mínima **85%** (application, resource, flow); no `munit-maven-plugin` declarar `<runtimeVersion>${app.runtime}</runtimeVersion>` e `<runtimeProduct>MULE_EE</runtimeProduct>` — sem isso o runner pode buscar BOM antigo (ex. `4.6.0`) no Maven Central
- Deploy: `mule.env`, `targetName`

### Sincronizar `api.version` (obrigatório)

Quando RAML + app do **mesmo asset** forem alterados:

1. Usuário publica no Exchange (Studio)
2. Ler `workspace-prodesp-api/{asset}/.exchange.xml` → `<version>`
3. Atualizar `<api.version>` no `pom.xml` da app com o **mesmo** valor
4. Não incrementar versão no `exchange.json` nem chutar semver — fonte é `.exchange.xml` após publicação

## Componentes XML — `doc:id`

Todo elemento Mule novo ou substituído no XML (`flow`, `sub-flow`, `flow-ref`, `ee:transform`, `http:request`, `logger`, etc.) deve ter **`doc:id` com UUID v4 novo e aleatório** (formato com hífens, minúsculas).

**Correto:**

```xml
<flow-ref doc:name="c-inbound-tracking-context"
    doc:id="359ed5c6-7a8b-4862-b2c1-a951456c9982"
    name="c-inbound-tracking-context" />
```

**Proibido** — IDs derivados de task, nome do flow, sufixos semânticos ou sequenciais:

```xml
<flow-ref doc:name="c-inbound-tracking-context"
    doc:id="21890-inbound-tracking-context-ref"
    name="c-inbound-tracking-context" />
```

Regras:

- Gerar um UUID **por componente** ao criar ou ao inserir um nó novo (ex.: `uuidgen` no shell).
- **Nunca** usar ID de work item/task Azure (`21890`, `TASK-21580`, etc.).
- **Nunca** montar `doc:id` a partir de `doc:name`, `name` do flow-ref ou path do recurso.
- Em edições pontuais de um componente **já existente**, manter o `doc:id` original; só atribuir UUID novo quando o nó for **criado** ou **substituído** por outro elemento.

## Rastreabilidade na entrada (`vars.context`)

Aplicar **somente quando o usuário pedir** (rollout app a app). Referência canônica: `data-integrator-p-api`.

### Pré-requisito — APIKit

1. Confirmar em `{app-name}.xml` que existe flow **main** com `<apikit:router ... />` (ex. `{app}-main`, `*-api-main`).
2. **Se a app não tiver APIKit** (só listener, scheduler, VM, etc.): **avisar o usuário** e **não** aplicar este padrão até alinhar arquitetura (onde encaixar `vars.context` depende do entrypoint).

### Onde encaixar

| Flow | Ação |
|------|------|
| **Main** (API) | `http:listener` → **`flow-ref` `c-inbound-tracking-context`** → `apikit:router` |
| **Console** | **Não** incluir `flow-ref` de rastreio |

Ordem obrigatória: rastreio **antes** do router para que `vars.context` exista em todos os flows de operação.

### Arquivos a criar/copiar

| Arquivo | Função |
|---------|--------|
| `common/c-inbound-tracking-context.xml` | Sub-flow: `ee:transform` + `logger` |
| `dwl/variables/context/inbound-tracking-context.dwl` | **Único** arquivo: `vars.context` com `correlationId` + headers `x-*` |

**Não usar:** `inbound-tracking-context-input.dwl` (legado, sem referência no XML). **Não criar** `dwl/log/inbound-tracking-context-log.dwl` nas apps de referência.

**Sub-flow `c-inbound-tracking-context`:**

1. `ee:transform` — variável `context` via `resource="dwl/variables/context/inbound-tracking-context.dwl"` (um transform apenas).
2. `logger` nível **INFO** — `message='#["Contexto de rastreio na entrada: " ++ write(vars.context, "application/json")]'` (referência: `data-integrator-p-api`, `data-wallet-integrator-s-api`).

**Padrão do `dwl/variables/context/inbound-tracking-context.dwl`:**

```dw
%dw 2.0

var transactionId = attributes.headers['x-transaction-id']
var globalCorrelationId = attributes.headers['x-global-correlation-id']
var parentCorrelationId = attributes.headers['x-parent-correlation-id']
var sourceSystem = attributes.headers['x-source-system']
---
{
	"correlationId": correlationId,
	"x-transaction-id": transactionId,
	"x-global-correlation-id": globalCorrelationId,
	"x-parent-correlation-id": parentCorrelationId,
	"x-source-system": sourceSystem,
}
```

- `correlationId`: evento Mule (não header). Outbound `x-parent-correlation-id` continua `#[correlationId]` no hop da chamada.
- Headers `x-*` (traits **common-data-types 1.0.2**): `attributes.headers[...]`.

### `flow-ref` no main (`{app-name}.xml`)

```xml
<http:listener path="${http.path}" config-ref="data-integrator_http-listener_config">
  ...
</http:listener>
<flow-ref doc:name="c-inbound-tracking-context"
    doc:id="<uuid-v4-novo>"
    name="c-inbound-tracking-context" />
<apikit:router config-ref="data-integrator_apikit_config" />
```

### Propagação outbound

Depois da entrada, usar `vars.context` em chamadas HTTP ou default-headers — ver skill **`prodesp-mule-intra-mule-http`** (não repetuir `attributes.headers` após o router).

### Jobs scheduler (`foreach`) — rastreio por item

Apps **sem APIKit** (ex.: job credenciais em `management-payments-receipts-s-api`): não usar `c-inbound-tracking-context`. Seguir skill **`prodesp-mule-intra-mule-http`** (seção *Rastreio por item — jobs scheduler*):

- Contexto no scheduler + `vars.credenciaisJobCorrelationId` (ou equivalente)
- Por item: DWL de `vars.context` + `tracing:with-correlation-id` + log INFO **antes e dentro** do scope (prefixo `numeroPedido`/`idOrderSummary` para busca no log)

### Workflow: habilitar rastreio em uma app

1. Verificar APIKit no main (senão → avisar usuário).
2. Copiar `c-inbound-tracking-context.xml` e `inbound-tracking-context.dwl` de `data-integrator-p-api` (ajustar só se a app tiver regra extra documentada).
3. Inserir `flow-ref` no main **entre** listener e `apikit:router` (UUID novo no `flow-ref`).
4. Garantir `doc:id` UUID no sub-flow e componentes internos (ver seção **Componentes XML**).
5. Se a app propagar para outra Mule app: seguir `prodesp-mule-intra-mule-http` + regra `prodesp-client-credentials-muleapps`.

## Log DEBUG APIKit (entrada/saída do router)

Aplicar no flow **main** quando o usuário pedir log da requisição/resposta **na borda APIKit** (antes e depois do `apikit:router`). Referências: `data-integrator-p-api`, `data-wallet-integrator-s-api`.

**Padrão:** prefixo `{METHOD} {path}` (ex.: `GET /v1/empresas - APIKit Request - {...}`); JSON montado **inline** no `message` do `logger`. Funções de redação de headers em **módulo** DataWeave importado — **não** usar `readUrl` (script isolado sem bindings do evento).

### Ordem no main

`http:listener` → `c-inbound-tracking-context` → **`c-apikit-inbound-request-context`** → **logger DEBUG Request** → `apikit:router` → **logger DEBUG Response** → `error-handler`

(`vars.context` e `vars.httpMethod`/`vars.httpPath` devem existir antes do primeiro logger APIKit.)

### Sub-flow `c-apikit-inbound-request-context`

Salva método e path HTTP **antes** do router — após o `apikit:router`, `attributes.method`/`attributes.relativePath` podem não refletir a requisição original.

| Arquivo | Função |
|---------|--------|
| `common/c-apikit-inbound-request-context.xml` | Sub-flow: `ee:transform` → `vars.httpMethod`, `vars.httpPath` |
| `dwl/variables/context/apikit-http-method.dwl` | `attributes.method` |
| `dwl/variables/context/apikit-http-path.dwl` | `attributes.relativePath` |

```xml
<sub-flow name="c-apikit-inbound-request-context" doc:id="<uuid-v4>">
  <ee:transform doc:name="vars.httpMethod e vars.httpPath" doc:id="<uuid-v4>">
    <ee:variables>
      <ee:set-variable resource="dwl/variables/context/apikit-http-method.dwl" variableName="httpMethod" />
      <ee:set-variable resource="dwl/variables/context/apikit-http-path.dwl" variableName="httpPath" />
    </ee:variables>
  </ee:transform>
</sub-flow>
```

No main, `flow-ref` **entre** `c-inbound-tracking-context` e o logger DEBUG Request.

### Módulo DW (copiar entre apps)

| Arquivo | Função |
|---------|--------|
| `modules/log/ApikitInboundLogHeaders.dwl` | `headersForLog(h)` — redige `authorization` e `client_secret` |

Import no logger:

```dw
import headersForLog from modules::log::ApikitInboundLogHeaders
```

### Body (obrigatório)

```dw
body: if (isEmpty(payload.^raw)) null else payload
```

Evita erro com GET + `Content-Type: application/json` e corpo vazio.

### Logger request (`message`)

Prefixo: `vars.httpMethod ++ " " ++ vars.httpPath ++ " - APIKit Request - "`. **Não** repetir `method`/`path` dentro do objeto `request`.

```xml
<logger level="DEBUG" doc:name="DEBUG APIKit request" doc:id="<uuid-v4>"
    message='#[%dw 2.0&#10;import headersForLog from modules::log::ApikitInboundLogHeaders&#10;output text/plain&#10;---&#10;vars.httpMethod ++ " " ++ vars.httpPath ++ " - APIKit Request - " ++ write({&#10;  titulo: "APIKit - entrada HTTP", fase: "antes", correlationId: correlationId, context: vars.context,&#10;  request: { queryParams: attributes.queryParams, uriParams: attributes.uriParams default {},&#10;    headers: headersForLog(attributes.headers), body: if (isEmpty(payload.^raw)) null else payload }&#10;}, "application/json")]' />
```

### Logger response (`message`)

Mesmo `import`; prefixo `vars.httpMethod ++ " " ++ vars.httpPath ++ " - APIKit Response - "`; objeto com `titulo: "APIKit - saída HTTP"`, `fase: "depois"`, `response.httpStatus`, `headers: headersForLog(vars.outboundHeaders default {})`, `body` com `payload.^raw`.

- Visível com `LoggerMessageProcessor` em **DEBUG** no `log4j2.xml`.

### Workflow: habilitar log APIKit

1. Garantir `c-inbound-tracking-context` no main.
2. Copiar `c-apikit-inbound-request-context.xml` + DWLs `apikit-http-method.dwl` / `apikit-http-path.dwl` da referência.
3. Copiar `modules/log/ApikitInboundLogHeaders.dwl` da referência.
4. Inserir `flow-ref` `c-apikit-inbound-request-context` e os dois loggers no main (copiar `message` de `data-integrator-p-api` ou `data-wallet-integrator-s-api`).
5. **Não** incluir no flow **console**.

## Router APIKit (`{app-name}.xml`)

### Main e console

```xml
<flow name="data-integrator-p-api-main">
  <http:listener path="${http.path}" config-ref="data-integrator_http-listener_config">
    <http:response statusCode="#[vars.httpStatus]">
      <http:headers><![CDATA[#[vars.outboundHeaders]]]></http:headers>
    </http:response>
    <http:error-response statusCode="#[vars.httpStatus]">...</http:error-response>
  </http:listener>
  <flow-ref doc:name="c-inbound-tracking-context"
      doc:id="359ed5c6-7a8b-4862-b2c1-a951456c9982"
      name="c-inbound-tracking-context" />
  <flow-ref doc:name="c-apikit-inbound-request-context"
      doc:id="<uuid-v4>"
      name="c-apikit-inbound-request-context" />
  <logger level="DEBUG" doc:name="DEBUG APIKit request" doc:id="<uuid-v4>"
      message='#[%dw 2.0&#10;import headersForLog from modules::log::ApikitInboundLogHeaders&#10;output text/plain&#10;---&#10;vars.httpMethod ++ " " ++ vars.httpPath ++ " - APIKit Request - " ++ write({...})]' />
  <apikit:router config-ref="data-integrator_apikit_config" />
  <logger level="DEBUG" doc:name="DEBUG APIKit response" doc:id="<uuid-v4>"
      message='#[%dw 2.0&#10;import headersForLog from modules::log::ApikitInboundLogHeaders&#10;output text/plain&#10;---&#10;vars.httpMethod ++ " " ++ vars.httpPath ++ " - APIKit Response - " ++ write({...})]' />
  <error-handler ref="cf-error::api_kit" />
</flow>
```

### Nome do flow por operação

```
{method}:\{resource-path}:{apikit_config_name}
```

Exemplos:

- `get:\empresas:data-wallet-integrator_apikit_config`
- `post:\pedidos\compra:application\json:data-wallet-integrator_apikit_config`
- `get:\pedidos\compra\(id)\acessos:data-wallet-integrator_apikit_config`

`apikit_config` = `{prefixo-app}_apikit_config` (ex. `data-wallet-integrator_apikit_config`).

## Padrão s-api — flow de operação

Ordem típica (copiar de `get:\empresas` ou `post:\pedidos\compra`):

1. **Variaveis** — `ee:transform` com DWL externos:
   - Query: `dwl/variables/queryParams/{param}.dwl` → `variableName` camelCase
   - URI: `dwl/variables/uriParams/{param}.dwl`
   - Header: `dwl/variables/headers/authorization.dwl`
   - POST body: `dwl/p-payload-json.dwl` no message
2. **c-get-access-token** — `flow-ref` (Wallet, management)
3. **Logger** (opcional, operação sensível)
4. **until-successful** — `maxRetries="5"`, `millisBetweenRetries="300000"`
5. **http:request** — `config-ref` semântico (`Wallet-Dados`, `CEP-Correios`), `path="${wallet.*Path}"`, `target="payloadResponse"`
6. **http:headers** — Bearer `vars.access_token`, `Host`, `Accept`
7. **http:query-params** ou headers do backend conforme contrato downstream
8. **http:response-validator** — frequentemente `values="200, 400"`
9. **choice** "Verifica Response" — `vars.payloadResponse.messages != null` → `raise-error` `CUSTOM:REQUEST`
10. **ee:transform** sucesso — DWL `*-response-transformation.dwl`
11. **error-handler** `ref="erros-http_commons"`

### Query param → header (Wallet v2)

Quando o RAML expõe query params mas o backend espera headers (ex. GET `/v2/pedidos-compra`):

```xml
<http:headers><![CDATA[#[output application/java
---
{
  "Authorization": "Bearer " ++ vars.access_token,
  "Host": p('wallet.host'),
  "Accept": "application/json",
  "numero-pedido": vars.numeroPedido,
  "id-cota": vars.idCota
}]]]></http:headers>
```

Variáveis preenchidas por DWL em `dwl/variables/queryParams/numeroPedido.dwl` etc., lendo `attributes.queryParams`.

Paths do backend costumam usar hífen (`/pedidos-compra`) mesmo quando o RAML usa `/pedidos/compra` — conferir `${wallet.*Path}` em properties e flows existentes.

## DataWeave — convenções

| Pasta | Uso |
|-------|-----|
| `dwl/variables/context/inbound-tracking-context.dwl` | `vars.context` — `correlationId` (evento) + headers `x-*` na entrada |
| `dwl/variables/context/apikit-http-method.dwl` | `vars.httpMethod` — método HTTP antes do APIKit router |
| `dwl/variables/context/apikit-http-path.dwl` | `vars.httpPath` — path relativo antes do APIKit router |
| `modules/log/ApikitInboundLogHeaders.dwl` | `headersForLog` — redação de headers no log DEBUG APIKit |
| `dwl/variables/queryParams/{nome}.dwl` | Um arquivo por query param |
| `dwl/variables/uriParams/{nome}.dwl` | URI template APIKit |
| `dwl/variables/headers/authorization.dwl` | Bearer do request entrante |
| `dwl/p-payload-json.dwl` | Normalizar body JSON entrada |
| `dwl/{verbo}-{recurso}-{sistema}-response-transformation.dwl` | Mapear resposta backend → contrato |
| `dwl/error/c-*.dwl` | Payloads de erro APIKit/HTTP |

Referência em XML: `resource="dwl/variables/queryParams/cnpj.dwl"`

## z-global-config.xml

- `global-property` `mule.env` (default `local`)
- `configuration-properties`: `properties/config-${mule.env}.yaml` + `properties/config.yaml`
- `secure-properties:config` → `config-secure-${mule.env}.yaml`, algoritmo Blowfish
- HTTP listener: `{app}_http-listener_config`
- APIKit: `api="${api.spec}"`, `parser="RAML"`, `httpStatusVarName="httpStatus"`, `outboundHeadersMapName="outboundHeaders"`
- `api-gateway:autodiscovery` com `apiId="${api.id}"`

### Grupos de properties (inferir por app)

| Grupo | Uso |
|-------|-----|
| `http.*` | host, port, path, console, timeout |
| `api.*` | spec, id |
| `tokenIdp.*` | RHSSO client credentials |
| `wallet.*` | Backend Wallet Dados (paths por recurso) |
| `cepCorreios.*` | CEP Correios |
| `requestData{Api}.*` | p/e-api → config `mule-plugin-*` |

## Error handling (`z-common-error.xml`)

- `cf-error::api_kit` — erros APIKIT:* → DWL `dwl/error/c-api-kit-*.dwl`
- `erros-http_commons` — HTTP:BAD_REQUEST, NOT_FOUND, MULE:RETRY_EXHAUSTED, ANY
- Anexar `erros-http_commons` em todo flow de implementação com `http:request`
- **Todo** `on-error-propagate` / `on-error-continue` novo ou alterado: skill global **`mulesoft-error-handler`** — perguntar erro esperado, `enableNotifications` e `logException` antes de editar XML

## p-api / e-api

- Router fino; lógica em `implementation/*_subflow.xml`
- Nome subflow: `{verb}-{recurso}-{backend}_subflow`
- Chamar operação do connector: `<data-wallet-integrator-s-api:obtem-todas-empresas ... />`
- Config plugin em `z-global-config.xml` com `property_host="${requestDataWallet.host}"` etc.

### Log DEBUG outbound (pré/pós request)

Quando o usuário pedir log **antes e depois** de chamadas outbound (`mule-plugin-*`, `http:request` para backend ou s-api):

1. Dois `<logger level="DEBUG">` **imediatamente antes e depois** da operação (não envolver o `ee:transform` de normalização da resposta).
2. **Obrigatório** — no início da expressão do `message`, declarar saída explícita:

```dw
output text/plain
---
"GET " ++ p("wallet.pedidosV2Path") ++ " - Response " ++ write({
  fase: "depois",
  ...
}, "application/json")
```

Sem `output text/plain` + `---`, a concatenação com `write(..., "application/json")` pode falhar em runtime.

3. No **XML** do Mule (atributo `message` em uma linha), usar quebras como entidade:

```xml
message='#[output text/plain&#10;---&#10;"GET " ++ p("...") ++ " - Request " ++ write({ ... }, "application/json")]' />
```

Aplicar o mesmo prefixo no logger **pré** (`- Request`) e **pós** (`- Response`).

4. Prefixo após o `---`: `"<VERBO> " ++ p("...Path") ++ " - Request "` / `"- Response "`.
5. Corpo: `++ write({ ... }, "application/json")` com:
   - `fase`: `"antes"` | `"depois"`
   - `apiChamada`: destino (ex. `data-wallet-integrator-s-api`, `Wallet-Dados`)
   - `request`: parâmetros enviados (body, queryParams, uri, rastreio via `vars.context`)
   - `response`: `payload` ou `vars.payloadResponse` após o request (antes do transform)
6. **Nunca** logar token em claro — não incluir `Authorization` nem `vars.access_token`.
7. Não usar `ee:transform` só para log APIKit/outbound; no APIKit montar JSON inline no `logger` + `import` do módulo `ApikitInboundLogHeaders` (não `readUrl`).
8. Para ver no runtime: elevar temporariamente `org.mule.runtime.core.internal.processor.LoggerMessageProcessor` para `DEBUG` em `log4j2.xml`.

**Referência:** `data-integrator-p-api` → `implementation/post-pedidos-compra-data-wallet_subflow.xml`; `data-wallet-integrator-s-api` → flows POST/GET pedidos compra em `data-wallet-integrator-s-api.xml`.

### Log INFO por item no foreach (jobs scheduler)

Em jobs com `foreach` + `tracing:with-correlation-id`:

- **Preferir um único** logger INFO por item (dentro do scope `tracing:with-correlation-id`), com JSON de rastreio (`correlationIdNovo`, `numeroPedido`, etc.).
- **Evitar** duplicar o mesmo texto **antes** e **dentro** do scope — gera linha duplicada no CH2 (ex. `Pagamentos - numeroPedido=…` duas vezes).
- O **flow-visual-hub** deduplica na UI por chave semântica (`pag:numeroPedido:…`), mas logs limpos no runtime facilitam RM e extensões futuras.

Visualização por nó: skill **`prodesp-flow-visual-hub`**.

## Health

- `GET /alive` → `"UP"`
- `GET /ready` → `dwl/health/c-check-dependencies.dwl`

## Workflow: novo endpoint (s-api)

1. RAML publicado; bump `api.version` no `pom.xml`
2. Regenerar/sync APIKit no Studio (novo flow stub) ou copiar flow similar
3. Criar DWL de variáveis e transformação de resposta
4. Adicionar `${wallet.novoPath}` (ou equivalente) nos YAML de properties — copiar estrutura de `config-dev.yaml` de app irmã
5. Implementar `http:request` + choice + error handler
6. Validar com curl da tarefa / contrato RAML

## Workflow: alteração em app consumidora

Se s-api ganha operação usada por p-api:

1. Publicar s-api (Exchange + deploy)
2. Atualizar `mule-plugin-{s-api}` no `pom.xml` do p-api
3. Criar subflow com nova operação do plugin

## Anti-padrões

- Rastreio **depois** do `apikit:router` ou no flow **console**
- Implementar `c-inbound-tracking-context` em app **sem** APIKit sem avisar o usuário
- `doc:id` com ID de task, slug do flow ou padrão `{numero}-{nome}-ref` — usar **UUID v4** (ver seção acima)
- Usar `default null` em DataWeave (redundante). Ex.: `numeroPedido: payload.numeroPedido default null` → `numeroPedido: payload.numeroPedido`
- Lógica DataWeave grande inline no XML — extrair para `dwl/`
- HTTP outbound sem `target="payloadResponse"` e choice de erro
- Ignorar `erros-http_commons` no flow
- Criar pasta/arquivo fora do layout `common/` + `implementation/`
- Hardcode de host/token — usar properties e `c-get-access-token`

## Paridade RAML ↔ App

| RAML | App |
|------|-----|
| Trait query param | `dwl/variables/queryParams/*.dwl` |
| `uriParameters` | `dwl/variables/uriParams/*.dwl` |
| `lib.headerAuthorization` | `authorization.dwl` + repasse Bearer ao backend |
| Método/path | Nome do flow APIKit |
| Response type | DWL `*-response-transformation.dwl` |

### Properties YAML e segredos

- `config-{env}.yaml`: estrutura via **Read** (hooks redigem chaves em `SENSITIVE_KEYS`; ver regra `mulesoft-workspace`).
- `config-secure-{env}.yaml`: em `.cursorignore` — não ler; inferir `${...}` nos XMLs.
- Não usar Grep/shell em YAML sob `src/main/resources/`.

