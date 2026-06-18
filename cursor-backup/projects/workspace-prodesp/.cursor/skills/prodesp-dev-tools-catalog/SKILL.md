---
name: prodesp-dev-tools-catalog
description: >-
  Catálogo de ferramentas locais do workspace-prodesp (Flow Visual Hub, CLIs,
  diagramas). Use quando o usuário perguntar quais ferramentas existem no projeto,
  como subir uma tool, URL/porta, o que compartilhar, ou pedir para registrar
  ferramenta nova criada em outro chat.
---

# Catálogo de ferramentas locais — PRODESP

## Fonte da verdade

**Arquivo:** [`.ia/dev-tools.yaml`](../../.ia/dev-tools.yaml)

Toda pergunta do tipo *“quais ferramentas criamos?”*, *“como subo o Flow?”*, *“o que enviar para alguém?”* → **ler esse YAML primeiro** e responder a partir dele.

Pontes relacionadas:

| Assunto | Onde |
|---------|------|
| Mapping integrações / produto | `.ia/workspace-links.yaml` → `product-definition` |
| Backlog / tasks | Azure DevOps + `tarefas/` (specs) |
| **Ferramentas dev locais** | **`.ia/dev-tools.yaml`** |

## Quando o usuário pergunta (ou fala por alias)

1. Ler `.ia/dev-tools.yaml`.
2. **Resolver a tool por match** (antes de pedir esclarecimento):
   - `id`, `name`, `summary`, `path`
   - campo **`aliases`** (ex.: "playwright", "gerar massa", "portal de apis")
   - campo **`intents[].phrases`** (ex.: "gerar pagamentos do pré-pago")
   - Match case-insensitive; aceitar typos próximos (pre pago / pré-pago).
3. Listar ferramentas em tabela ou bullets: **nome**, **o que faz**, **como subir**, **URL/porta** (se houver), **path**, **skill** (se houver).
4. Se citar uma tool específica (ex. Flow Visual Hub), incluir `start.command`, `env`, `depends_on`, `related`.
5. Se um **intent** bater, incluir o `action` sugerido no YAML.
6. Não inventar ferramentas que não estão no YAML.

### Formato de resposta sugerido

```markdown
## Ferramentas locais (workspace-prodesp)

| Ferramenta | Subir | URL / uso |
|------------|-------|-----------|
| Flow Visual Hub | `cd tarefas/flow-visual-hub && npm run start:platform` | http://127.0.0.1:8790 |
| … | … | … |

Detalhes: `.ia/dev-tools.yaml`
```

## Registrar ferramenta nova (outro chat)

Quando o usuário disser que criou uma tool e quer que fique catalogada:

1. Abrir `.ia/dev-tools.yaml`.
2. Adicionar entrada em `tools:` com campos mínimos:

```yaml
  - id: kebab-case-unico
    name: Nome legível
    summary: Uma frase do que faz
    path: tarefas/caminho-da-pasta
    type: server | cli | static | combo
    url: http://127.0.0.1:PORT   # se server
    port: 8790                   # opcional
    start:
      cwd: tarefas/...
      command: npm run ...
    env:
      required: [...]              # se aplicável
    skill: .cursor/skills/....md   # se existir skill dedicada
    readme: tarefas/.../README.md  # opcional
    aliases:                       # opcional — como o usuário chama sem lembrar o id
      - playwright
      - gerar massa
    intents:                       # opcional — frase → o que fazer
      - phrases:
          - gerar massa no portal
        action: Descrição curta do fluxo/comando
```

3. Se a tool for complexa, criar skill em `.cursor/skills/` e referenciar no YAML.
4. **Sempre** preencher `aliases` e `intents` quando o usuário pedir registro “para achar depois sem lembrar o nome”.
5. **Não** duplicar o catálogo inteiro na skill — só apontar para o YAML.

## Exemplo — Flow Visual Hub (resumo)

| Campo | Valor |
|-------|--------|
| Subir | `cd tarefas/flow-visual-hub && npm run start:platform` |
| URL | http://127.0.0.1:8790 |
| Diagrama + logs | http://127.0.0.1:8790/flows/pagamentos/?session=… (sessão in-memory) |
| Compartilhar | Pastas `flow-visual-hub` + `pagamentos-job-recente-visual` + Node + credenciais AMC |
| Skill | `prodesp-flow-visual-hub` |

Sessão `?session=` **não** sobrevive restart do hub — ver skill flow-visual-hub.

## AGENTS.md

Manter [AGENTS.md](../../AGENTS.md) com link para `.ia/dev-tools.yaml` (índice do monorepo).
