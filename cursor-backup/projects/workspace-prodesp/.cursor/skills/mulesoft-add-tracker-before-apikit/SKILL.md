---
name: mulesoft-add-tracker-before-apikit
description: >-
  Adiciona rastreabilidade na entrada (vars.context) antes do APIKit e, opcionalmente,
  propaga headers de transação em chamadas outbound e aplica logs de request/response onde não existir.
---

# MuleSoft — tracker antes do APIKit (com opções de outbound + log)

Use esta skill quando o usuário pedir para:

- “colocar tracker no início da requisição”, “antes do apikit”, “vars.context”, “c-inbound-tracking-context”
- e/ou pedir para propagar headers `x-*` em chamadas para outra app Mule / s-api
- e/ou pedir para “colocar log nas que não existem”
- e/ou pedir log **antes/depois do apikit** (entrada/saída HTTP na borda APIKit)

## Pré-requisitos e referências

- Referência de implementação: `data-integrator-p-api`
- Padrão de entrada (antes do APIKit) e `doc:id`: skill `mulesoft-app-implementation`
- Padrão de propagação outbound (headers + regras): skill `prodesp-mule-intra-mule-http`

## Perguntas obrigatórias (usar `AskQuestion`)

1) **Onde aplicar o tracker (vars.context)?**
- `apenas no main antes do apikit:router` (recomendado)
- `também em entrypoints não-APIKit` (somente se o usuário confirmar que existe outro entrypoint e onde encaixar)

2) **Propagar headers de transação nas requests outbound?**
- `sim, em todas as chamadas Mule→Mule (mule-plugin ou http:request)`
- `sim, apenas em operações específicas` (o usuário deve indicar quais)
- `não`

Se “sim”, usar exatamente estes pares (quando aplicável no tipo de chamada):

```xml
x-source-system="${application.name}"
x-transaction-id="#[vars.context['x-transaction-id']]"
x-global-correlation-id="#[vars.context['x-global-correlation-id']]"
x-parent-correlation-id="#[correlationId]"
```

> Observação: o `prodesp-mule-intra-mule-http` tem regras adicionais para `x-source-system` e `x-parent-correlation-id`.
> Se houver conflito com o pedido do usuário, priorize o que o usuário pediu e registre a divergência na entrega.

3) **Aplicar logs (request/response) nas chamadas que ainda não têm?**
- `sim`
- `não`

Se “sim”, reutilizar o padrão “Log DEBUG outbound (mule-plugin)” da skill `mulesoft-app-implementation`:
- Dois `logger level="DEBUG"` imediatamente antes e depois da chamada outbound (connector/operação).
- Não logar `Authorization`/tokens em claro (logar apenas flags booleanas).

## Execução — tracker antes do APIKit

### 1) Validar se a app tem APIKit

1. Abrir `src/main/mule/{app}.xml` e localizar o flow main com `<apikit:router ... />`.
2. Se não existir APIKit no entrypoint, parar e avisar que o padrão “antes do APIKit” não se aplica até definir onde inserir o tracker.

### 2) Garantir os arquivos de rastreio

Garantir a existência (ou copiar da referência) destes arquivos:

- `src/main/mule/common/c-inbound-tracking-context.xml`
- `src/main/resources/dwl/variables/context/inbound-tracking-context.dwl` — **único** DWL de contexto na entrada

**Não criar / remover se existir:**

- `inbound-tracking-context-input.dwl` — legado sem `flow-ref`; o sub-flow usa só `inbound-tracking-context.dwl`.
- `dwl/log/inbound-tracking-context-log.dwl` — não usar nas apps de referência; log INFO via `write(vars.context, ...)`.

Checklist de qualidade:
- O `sub-flow name="c-inbound-tracking-context"` deve existir.
- Todos os componentes novos devem ter `doc:id` **UUID v4** (não aceitar IDs sem hífens/UUID, nem IDs de task).

**Padrão do `dwl/variables/context/inbound-tracking-context.dwl` (obrigatório — `vars.context`):**

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

- `correlationId`: binding do **evento Mule** (não é header inbound). Alinha com `%X{correlationId}` no `log4j2` e com `x-parent-correlation-id="#[correlationId]"` no outbound.
- Headers `x-*`: `attributes.headers[...]` (traits **common-data-types 1.0.2**).

**Log INFO na entrada (padrão recomendado):**

```xml
message='#["Contexto de rastreio na entrada: " ++ write(vars.context, "application/json")]'
```

O `ee:transform` do sub-flow deve referenciar **somente** `resource="dwl/variables/context/inbound-tracking-context.dwl"` (ver `c-inbound-tracking-context.xml` em `data-integrator-p-api` / `data-wallet-integrator-s-api`).

### 3) Inserir `flow-ref` no main (ordem obrigatória)

No flow main (API), inserir:

```xml
<flow-ref doc:name="c-inbound-tracking-context"
    doc:id="<uuid-v4-novo>"
    name="c-inbound-tracking-context" />
```

**Posição:** imediatamente **entre** o `http:listener` e o `<apikit:router ... />`.

**Não** inserir no flow de console.

## Execução — log DEBUG APIKit (quando pedido)

Seguir a seção **Log DEBUG APIKit** da skill `mulesoft-app-implementation`:

1. Copiar `c-apikit-inbound-request-context.xml` + DWLs `apikit-http-method.dwl` / `apikit-http-path.dwl` (referência: `data-integrator-p-api` ou `data-wallet-integrator-s-api`).
2. Copiar `modules/log/ApikitInboundLogHeaders.dwl` (referência: `data-integrator-p-api` ou `data-wallet-integrator-s-api`).
3. No main: `flow-ref` `c-apikit-inbound-request-context` entre rastreio e loggers; loggers DEBUG com JSON **inline** no `message` + `import headersForLog from modules::log::ApikitInboundLogHeaders` (prefixo `{METHOD} {path}`, **não** `readUrl`).
4. Body: `if (isEmpty(payload.^raw)) null else payload`.

## Execução — outbound headers (quando habilitado)

Aplicar somente se o usuário respondeu “sim” na pergunta (2).

### A) Chamadas via mule-plugin (p-api/e-api → s-api)

1. Localizar as operações do connector (ex.: `<data-wallet-integrator-s-api:consulta-paginada-de-pedidos-de-compra-v2 ... />`).
2. Se a operação expõe parâmetros para headers `x-*`, adicionar os quatro atributos no elemento da operação.
3. Se a operação **não** expõe esses parâmetros, não inventar atributos: seguir o padrão do plugin/config, ou propor alternativa via `http:request` (somente com confirmação explícita).

Exemplo alvo:

```xml
<data-wallet-integrator-s-api:consulta-paginada-de-pedidos-de-compra-v2
    doc:name="Consulta paginada de pedidos de compra (V2)"
    doc:id="<uuid-v4>"
    config-ref="data_wallet_integrator_s_api_Config"
    numero-pedido="#[payload.numeroPedido]" id-cota="#[payload.idCota]"
    authorization="#[vars.authorization]"
    x-source-system="${application.name}"
    x-transaction-id="#[vars.context['x-transaction-id']]"
    x-global-correlation-id="#[vars.context['x-global-correlation-id']]"
    x-parent-correlation-id="#[correlationId]" />
```

### B) Chamadas via `http:request`

Seguir a skill `prodesp-mule-intra-mule-http`:
- Preferir `http:default-headers` no `http:request-config` para rastreio + `client_id`/`client_secret` (quando intra-Mule).
- Na operação `http:request`, manter apenas `Authorization` e headers específicos do backend (evitar duplicar rastreio).

## Execução — logs outbound (quando habilitado)

Aplicar somente se o usuário respondeu “sim” na pergunta (3).

1. Para cada chamada outbound que não tenha logs, inserir:
   - `logger DEBUG` antes (Request)
   - `logger DEBUG` depois (Response)
2. Mensagem deve identificar: verbo/operação, “Request/Response”, e incluir um JSON com request/response.
3. **Obrigatório** no `message` (pré e pós): iniciar com `output text/plain` + `---` antes da concatenação com `write(..., "application/json")`. No XML: `#[output text/plain&#10;---&#10;...]`. Sem isso, a expressão pode falhar em runtime — ver skill `mulesoft-app-implementation` (Log DEBUG outbound).
4. Não logar segredos (token/authorization). Não incluir `Authorization` no objeto do log.

## Validação final (sempre)

- Confirmar que `vars.context` é criado **antes** do `apikit:router`.
- Confirmar que a app continua sem `flow-ref` no console.
- Confirmar `doc:id` UUID v4 em nós novos/substituídos.
- Se outbound headers foi habilitado, confirmar que as expressões usam `vars.context[...]` (não `attributes.headers[...]` após o router).

