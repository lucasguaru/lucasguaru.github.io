---
name: prodesp-azure-ticket-comment-response
description: >-
  Responder comentários de work items no Azure DevOps (OrangeDoor Global Projects)
  com rascunho colaborativo em tarefas/, menções padronizadas e publicação via MCP.
  Usar quando o usuário pedir para responder comentário de ticket, PBI, bloqueio da
  Amazing (Bruno/João), link com #commentId, ou ajuda para montar retorno técnico
  MuleSoft antes de postar no Azure.
---

# Azure DevOps — Responder comentário de ticket

Projeto: **OrangeDoor Global Projects** (`https://dev.azure.com/orangedoorit`).

Skill complementar: **Description** de work item → `prodesp-azure-work-item-markdown` (não confundir com **comentários**).

## Fluxo padrão

### 1. Ler o comentário alvo

- Link com `#<commentId>` → esse é o comentário a responder.
- MCP `wit_list_work_item_comments` (`workItemId`, `project`: `OrangeDoor Global Projects`).
- Opcional: `wit_get_work_item` (`expand: all`) para título, parent, anexos e contexto.

### 2. Criar rascunho local

Path:

```
tarefas/PBI {workItemId}-{slug-curto}/respostas-comentario-{commentId}.md
```

Estrutura do arquivo:

```markdown
# PBI {id} — Rascunho de resposta ao comentário #{commentId}

**Ticket:** <url com #commentId>

**Convenção:** respostas Amazing → @Bruno + @Joao no início; Leila em CC no final.

**Publicação:** rascunho em Markdown legível; no Azure, menções via HTML `data-vss-mention` (§4–5).

<!-- azure-comment-id: (preencher após postar) -->

---

## Comentário para colar no Azure

(corpo do comentário — só o que vai no ticket)
```

**Regra de conteúdo:** o bloco "Comentário para colar" é **enxuto** — respostas diretas, sem documentação longa, sem análise de codebase no rascunho. Contexto técnico fica na conversa ou em `spec.md` separado.

### 3. Montar resposta com o usuário (item a item)

- Quebrar o comentário original em **itens numerados** (espelhar a estrutura de quem perguntou).
- Para cada item: usuário define a resposta; agente redige no tom do ticket.
- Quando precisar de fatos técnicos, consultar **workspace** (`pom.xml`, RAML, properties redigidas, flows) — não inventar versões nem scopes.
- Se houver dependência externa (Prodesp, RHSSO, acesso QA): marcar **WIP / retorno parcial** no início, indicando qual item ainda aguarda terceiro — não dizer "item faltando" se a resposta textual já existe.

Exemplo de abertura WIP:

```markdown
Olá, seguem os retornos sobre os N pontos. **Retorno parcial (WIP):** itens 1 e 2 fechados; no **item 3** a liberação do scope X ainda depende da Prodesp — atualizamos o ticket assim que tivermos confirmação.
```

### 4. Menções (Amazing / OrangeDoor)

**Importante:** `@Nome` em comentário com `format: "Markdown"` vira **texto plano** — sem link clicável e **sem notificação**. Para menções que funcionam, usar HTML com `data-vss-mention` na publicação (§5).

| Papel | Display | GUID (`data-vss-mention`) |
|-------|---------|---------------------------|
| **To** | `@Bruno Almeida` | `6a2c9fef-1546-6447-9fbc-8c941de87362` |
| **To** | `@Joao Moura` | `48b8c1d8-9aeb-4faf-a1fe-16b6b7008ae1` |
| **CC** | `@Leila Mesquita de Oliveira` | `c5284842-11e9-6a52-bec8-ceb72e79fa8b` |

Mesmo que só um deles tenha escrito o comentário original, marcar **os dois** no início.

Template de menção (uma pessoa):

```html
<a href="#" data-vss-mention="version:2.0,{guid}">@Display Name</a>
```

Abertura típica (To):

```html
<div><a href="#" data-vss-mention="version:2.0,6a2c9fef-1546-6447-9fbc-8c941de87362">@Bruno Almeida</a>&nbsp;<a href="#" data-vss-mention="version:2.0,48b8c1d8-9aeb-4faf-a1fe-16b6b7008ae1">@Joao Moura</a></div>
```

CC no final:

```html
<p>CC: <a href="#" data-vss-mention="version:2.0,c5284842-11e9-6a52-bec8-ceb72e79fa8b">@Leila Mesquita de Oliveira</a></p>
```

Para outras pessoas: extrair o GUID de comentários existentes no ticket (`wit_list_work_item_comments` → campo `text` com `data-vss-mention`).

### 5. Publicar no Azure

Somente quando o usuário pedir explicitamente ("pode postar", "publica no ticket").

MCP `user-azure-devops` → `wit_add_work_item_comment`:

```json
{
  "project": "OrangeDoor Global Projects",
  "workItemId": <id>,
  "format": "Html",
  "comment": "<corpo HTML — menções via data-vss-mention; ver §4>"
}
```

- **`format: "Html"`** quando o comentário tiver menções (padrão deste fluxo).
- Corpo: HTML (`<p>`, `<h3>`, `<ul>`, `<table border=1 style=\"border-collapse:collapse;\">`, `<code>`, links `<a href=\"...\">`).
- Rascunho local pode permanecer em Markdown com `@Nome` legível; na publicação, **converter menções** para HTML §4.
- Não usar `az boards work-item update` para comentários.
- Após postar: preencher `<!-- azure-comment-id: N -->` no rascunho local.
- Validar no ticket: menções aparecem como links azuis clicáveis (confirma notificação).

### 6. Follow-up parcial

Se o WIP era por pendência externa e ela for resolvida: **novo comentário** (não editar o anterior) com atualização só do item pendente.

## Enriquecimento técnico (quando o ticket pedir)

Consultar conforme o assunto — exemplos deste workspace:

| Pergunta típica | Onde olhar |
|-----------------|------------|
| Versões Exchange / `pom.xml` | `api.version` e `mule-plugin-*` nos `pom.xml` das apps; ordem s-api → p-api → e-api |
| Contrato RAML | `workspace-prodesp-api/{asset}/` |
| Flow / integração | `workspace-prodesp-app/{asset}/src/main/mule/` |
| Scope RHSSO | `tokenIdp.scope` em `config-{env}.yaml` da s-api (via proxy redigido) |
| Listener `/v1` vs `/*` | `config.yaml` → `http.path` de cada app |

Tabela de versões no comentário: versão atual (repo) + versão sugerida (patch) + regra "igual à publicada no Exchange".

## O que não fazer

- Não postar sem confirmação do usuário.
- Não encher o rascunho com explicações que não vão no ticket.
- **Não** publicar comentário com menções usando `format: "Markdown"` — não notifica destinatários.
- Não usar `[PRODESP-PR]` neste fluxo — esse prefixo é só para comentários de PR (ver regra `prodesp-azure-task-tracking`).

## Referência

| Rascunho | Comentário Azure | Notas |
|----------|------------------|-------|
| `respostas-comentario-14831099.md` | #14833171 | conteúdo ok; menções em Markdown (sem notificação) |
| `respostas-comentario-14841809.md` | #14846854 | menções HTML + review PRs `/v2/acessos` |
