---
name: prodesp-deploy-registry
description: Registra deploys CH2 e publicações Exchange em tarefas/deploy-log/ (horário, versão, app, ambiente, canal). Usar após mvn clean deploy, mvn mule:deploy, api-catalog publish-asset ou publish Studio confirmado; e quando o usuário perguntar quando/onde/qual versão foi publicada ou deployada.
---

# Registro de deploys e publicações (PRODESP)

Regra: `.cursor/rules/prodesp-deploy-registry.mdc`

## Estrutura

```
tarefas/deploy-log/
├── README.md
├── registry.yaml          # índice — fonte da verdade para consultas
└── entries/
    └── {timestamp}-{asset}-{type}.md   # detalhe opcional
```

## Quando registrar

Imediatamente após **sucesso**:

| Passo | type | environment | channel |
|-------|------|-------------|---------|
| `api-catalog publish-asset` / Studio RAML | `exchange-raml` | `Exchange` | `api-catalog-cli` ou `studio` |
| `mvn clean deploy` (app) | `exchange-app` | `Exchange` | `mvn-deploy` |
| `mvn mule:deploy` dev | `ch2` | `Dev` | `mvn-mule-deploy` |
| `mvn mule:deploy` qa | `ch2` | `QA` | `mvn-mule-deploy` |
| `mvn mule:deploy` prod | `ch2` | `Prod` | `mvn-mule-deploy` |

Publicação Exchange + CH2 no mesmo fluxo → **duas entradas** (ou uma entrada `ch2` com `exchange_app_version` em notes se foi o mesmo comando de entrega).

## Entrada em `registry.yaml`

Adicionar no **topo** de `entries:` (mais recente primeiro):

```yaml
- id: "2026-06-15T123048Z-data-integrator-p-api-exchange-raml"
  timestamp: "2026-06-15T12:30:48Z"
  asset: data-integrator-p-api
  type: exchange-raml
  version: "1.0.36"
  api_version: "1.0.36"
  app_version: null
  environment: Exchange
  channel: studio
  success: true
  work_item: null
  notes: ""
  recorded_by: agent
  recorded_at: "2026-06-16T..."
```

Campos:

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `id` | sim | `{timestamp}-{asset}-{type}` |
| `timestamp` | sim | Momento do deploy/publish (UTC, do Maven/Exchange se disponível) |
| `asset` | sim | Nome lógico `-api` |
| `type` | sim | `exchange-raml` \| `exchange-app` \| `ch2` |
| `version` | sim | Versão RAML ou `<artifactId>-app` |
| `api_version` | se aplicável | `${api.version}` no pom |
| `app_version` | se aplicável | `<version>` do pom da app |
| `environment` | sim | `Dev` \| `QA` \| `Prod` \| `Exchange` |
| `channel` | sim | Ver tabela acima |
| `success` | sim | `true` / `false` |
| `work_item` | não | ID Azure DevOps |
| `notes` | não | PR, branch, task |
| `recorded_by` | sim | `agent` ou `user` |
| `recorded_at` | sim | Quando o registro foi escrito (UTC) |

## Arquivo em `entries/` (opcional)

Usar quando o deploy tiver contexto extra (comandos, PR, work item):

```markdown
# {asset} — {type} — {environment}

- **Quando:** 2026-06-15T12:30:48Z
- **Versão:** 1.0.36
- **Canal:** api-catalog-cli
- **Comando:** `api-catalog publish-asset -d catalog.yaml`
- **Work item:** #21822
```

## Consulta ("publicamos ontem?")

1. Ler `registry.yaml`
2. Filtrar por `asset`, `environment`, data (`timestamp` ou `recorded_at`)
3. Se vazio ou antigo: MCP `search_asset` no Exchange
4. Responder: registro local + Exchange; destacar divergências (ex. local `api.version` desatualizado)

## Integração com outras skills

- **`prodesp-mule-ch2-deploy`:** após passo 1 e passo 2 com sucesso → registrar
- **`prodesp-raml-commit-publish-gate`:** após publish RAML confirmado → registrar
- **`prodesp-exchange-publish-api-catalog`:** passo pós-publish inclui registro

## Não substituir

- Comentários `[PRODESP-PR]` / tags `deploy-*` no Azure DevOps — complementar, não duplicar obrigatoriamente
