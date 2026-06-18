---
name: mulesoft-error-handler
description: >-
  Configura on-error-propagate e on-error-continue em Mule (enableNotifications,
  logException, logger). Pergunta se o erro é esperado, se deve notificar
  monitoramento e se já existe log antes de editar XML. Usar ao criar ou alterar
  error-handler, on-error-propagate, on-error-continue, enableNotifications,
  logException ou tratamento de HTTP:TIMEOUT, ANY, APIKIT.
---

# MuleSoft — error handler (`on-error-*`)

## Quando aplicar

- Criar ou alterar `<on-error-propagate>` / `<on-error-continue>` (flow, sub-flow, `try`, scope)
- Revisar PR com `error-handler` novo ou `type="..."` novo
- Dúvida sobre ruído em monitoramento ou stack trace duplicado no log

**Não** substitui `z-common-error.xml` / `cf-error::api_kit` do PRODESP — complementa decisões **por handler** ou handler local em `try`.

---

## Regra obrigatória — perguntar antes de codificar

Para **cada** `on-error-propagate` ou `on-error-continue` (novo ou alterado), obter respostas do usuário. **Não** assumir defaults sem perguntar, exceto se o usuário já tiver respondido no mesmo pedido para aquele `type`.

**Sempre usar a ferramenta AskQuestion** (modo question) — **não** perguntar só em texto no chat. Uma rodada por handler, com contexto no `prompt` (`on-error-propagate` ou `on-error-continue`, `type`, arquivo/flow).

| # | id AskQuestion | Pergunta | Opções |
|---|----------------|----------|--------|
| 1 | `erro-esperado` | É **erro esperado** de negócio ou integração (ex.: timeout tratado, 404 mapeado, validação)? | `sim` · `nao` · `incerto` |
| 2 | `notificar-monitoramento` | Deve **gerar notificação** no monitoramento de erros da plataforma (`enableNotifications`)? | `sim` · `nao` |
| 3 | `log-aplicacao` | A app **já registra** esse erro ou como tratar o log (`logException`)? | `ja-tem-log` (logException=false) · `stack-mule` (logException=true) · `adicionar-logger` (logException=false + logger no handler) |

Se `erro-esperado` = `incerto` → **parar** e pedir esclarecimento (nova rodada AskQuestion ou texto).

Registrar respostas em uma linha antes do XML, ex.: `HTTP:TIMEOUT | esperado=sim | notify=não | log=ja-tem-log`.

---

## Atributos Mule (referência rápida)

| Atributo | Default Mule | `false` significa |
|----------|--------------|-------------------|
| `enableNotifications` | `true` | Não dispara notificação de erro da runtime (menos ruído em APM/alertas) |
| `logException` | `true` | Não imprime stack trace automático da Mule no log |

**Studio / XML:** com valor default (`true`), o Studio costuma **omitir** o atributo no XML. Com `false`, o atributo **deve** aparecer.

**Convenção ao gerar XML (agente):**

- Valor **não default** (`false`) → **sempre** escrever o atributo.
- Valor **default** (`true`) → escrever `enableNotifications="true" logException="true"` em handler **novo** (revisão explícita) **ou** omitir se o arquivo vizinho só omite defaults — **seguir o estilo do mesmo `error-handler`**.

---

## Matriz de decisão (após respostas do usuário)

| Erro esperado | Notificar (`notificar-monitoramento`) | Log (`log-aplicacao`) | `enableNotifications` | `logException` | Ação no handler |
|:-------------:|:-------------------------------------:|:---------------------:|:-----------------------:|:--------------:|-----------------|
| sim | nao | ja-tem-log | `false` | `false` | Manter logger existente |
| sim | nao | adicionar-logger | `false` | `false` | Criar logger estruturado |
| sim | nao | stack-mule | `false` | `true` | Stack Mule (erro esperado, sem alerta) |
| sim | sim | ja-tem-log | `true` | `false` | Notificar; log da app existente |
| sim | sim | adicionar-logger | `true` | `false` | Notificar + logger no handler |
| sim | sim | stack-mule | `true` | `true` | Notificar + stack Mule |
| nao | sim | ja-tem-log | `true` | `false` | Notificar; log da app |
| nao | sim | adicionar-logger | `true` | `false` | Notificar + logger no handler |
| nao | sim | stack-mule | `true` | `true` | Notificar + stack Mule |
| nao | nao | ja-tem-log | `false` | `false` | Sem alerta; log da app |
| nao | nao | adicionar-logger | `false` | `false` | Sem alerta + logger no handler |
| nao | nao | stack-mule | `false` | `true` | Sem alerta + stack Mule |
| incerto | — | — | — | — | **Parar** — nova AskQuestion |

### Propagate vs continue

| Elemento | Uso típico |
|----------|------------|
| `on-error-propagate` | Erro segue para handler pai / resposta de erro da API |
| `on-error-continue` | Tratar e seguir fluxo (fallback, valor default, swallow controlado) |

A mesma matriz vale para os dois; a escolha propagate/continue é de **fluxo**, não de log/notificação.

---

## Checklist antes de gravar XML

1. Ler o `error-handler` pai e handlers irmãos no **mesmo arquivo** (estilo de atributos explícitos).
2. Verificar se `ref="cf-error::api_kit"` / `erros-http_commons` já cobre o `type` — evitar handler duplicado.
3. Procurar `<logger>` / `json-logger` no bloco do `on-error-*` ou subflow chamado.
4. Aplicar matriz; definir `type` (e `when` se necessário).
5. Novo `doc:id` UUID v4 por componente (regra PRODESP em `mulesoft-app-implementation`).
6. Se `logException="false"` → garantir **pelo menos um** log útil (mensagem + `error.errorType`, `error.description`, correlation se houver `vars.context`).

---

## PRODESP (`workspace-prodesp-app`)

- Handlers globais: `src/main/mule/common/z-common-error.xml` (`cf-error::api_kit`, `erros-http_commons`).
- Flows com `http:request` → em geral `error-handler ref="erros-http_commons"` no flow; handlers locais em `try` são exceção documentada.
- Não logar `client_secret`, tokens nem payload sensível no logger de erro.

Skill de app: `mulesoft-app-implementation` (seção Error handling).

---

## Formato de saída no chat

```text
Handler: on-error-propagate | type=HTTP:TIMEOUT
Decisão: esperado=sim, enableNotifications=false, logException=false (logger INFO no handler)
```

Em seguida o trecho XML.

---

## Exemplos XML

Ver [examples.md](examples.md).

---

## Validação (script)

Após editar handlers, rodar:

```bash
py -3 ~/.cursor/skills/mulesoft-error-handler/scripts/check_error_handlers.py workspace-prodesp-app/<app>
py -3 ~/.cursor/skills/mulesoft-error-handler/scripts/check_error_handlers.py workspace-prodesp-app/<app> --git-diff
```

| Verificação | Severidade |
|-------------|------------|
| `logException="false"` sem `<logger>` / `json-logger` no bloco | **error** (exit 1) |
| `enableNotifications` com valor inválido | warning |

Não valida “perguntas ao usuário” — isso é responsabilidade do agente (regra + skill).

Regras Cursor: global `mule-error-handler.mdc`; PRODESP `mulesoft-error-handler.mdc`.
