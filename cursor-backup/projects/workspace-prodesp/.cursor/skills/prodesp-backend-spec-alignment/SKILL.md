---
name: prodesp-backend-spec-alignment
description: >-
  Validar obrigatoriamente parâmetros, tipos, query vs header e schemas de resposta
  contra Swagger ou documentação original do backend antes de implementar ou revisar
  integração Mule (RAML + s-api outbound). Usar em novos endpoints, PRs de integração,
  Wallet Dados, ou quando houver dúvida se mes/ano/query/header estão corretos.
---

# Aderência à spec do backend — PRODESP

Regra Cursor: **`prodesp-backend-spec-alignment`**

## Objetivo

Evitar contratos e flows Mule com campos inventados, parâmetros no lugar errado (query vs header) ou endpoints misturados — problema observado em **`GET /v2/acessos`** (#22039).

## Checklist obrigatório (antes de implementar)

### 1. Localizar a spec oficial

- OpenAPI/Swagger publicado pelo fornecedor
- Cópia em `tarefas/` do PBI, se existir
- Mapping em `../product-definition/mappings/mulesoft-integrations.yaml`

### 2. Ler a operação exata

- Path e método corretos (ex.: `/v2/acessos` ≠ `/v2/acessos/consolidado`)
- Lista completa de parâmetros com **`in`**: `query`, `header`, `path`, `body`
- Schemas de request/response (incl. paginação)

### 3. Montar matriz de aderência

Preencher e manter no rascunho da task ou comentário de PR:

| Conceito negócio | Spec (nome + in) | RAML Mule (query camelCase) | s-api outbound |
|------------------|------------------|-------------------------------|----------------|
| Ex.: número pedido | header `numero-pedido` | `numeroPedido?` | header `numero-pedido` |
| Ex.: página | header `page` | `page?` | header `page` |

Marcar **❌** qualquer campo presente na implementação que **não** exista na spec daquele path.

### 4. Borda Mule vs chamada backend

| Camada | Regra |
|--------|-------|
| e-api / p-api / s-api RAML | Query params camelCase (padrão PRODESP), salvo exigência explícita de header no contrato público |
| s-api HTTP outbound | **Replicar a spec**: se Swagger diz header, usar `http:headers`; se query, `http:query-params`; se path, URI template |
| Wallet v2 paginado | Filtros em **header** no Swagger → mapear de query RAML para headers (referência: `get:\v2\pedidos\compra` em `data-wallet-integrator-s-api`) |

### 5. Resposta

- Data type RAML deve cobrir o schema de sucesso (ou pass-through documentado)
- Não reduzir resposta (ex.: só `totalElements`) se consumidor ou spec exigem `page`, `size`, `content`

### 6. Conflito com desenho de solução / C4

Se product-definition ou C4 pedir campos que **não** existem na spec:

1. Identificar endpoint alternativo na spec (ex.: consolidado vs paginado)
2. Propor transformação explícita (ex.: `mes`/`ano` → `data-inicio`/`data-fim`)
3. Registrar no ticket **antes** do merge — não implementar silenciosamente

## Wallet Dados — referência rápida

| Endpoint | Filtros na spec |
|----------|-----------------|
| `GET /v2/acessos` | **Headers** (paginação + filtros); **sem** `mes`/`ano` |
| `GET /v2/acessos/consolidado` | **Query** obrigatória: `numero-pedido`, `mes`, `ano` |
| `GET /v2/pedidos-compra` | **Headers** (padrão v2) |
| `GET /pedidos-compra/{id}/acessos` (v1) | **Query** `page`, `size`, `mes`, `ano` |

OpenAPI: https://openapi.api.rota.sp.gov.br/wallet-dados-app

## Integração com outras skills

| Fase | Skill |
|------|-------|
| Contrato RAML | `mulesoft-api-spec` |
| Flow / HTTP outbound | `mulesoft-app-implementation` |
| Comentário Amazing | `prodesp-azure-ticket-comment-response` |
| Revisão PR | incluir tabela spec vs PR no comentário |

## O que não fazer

- Copiar params do endpoint v1 ou de **outro** path v2 sem ler o Swagger
- Assumir que “Mule sempre usa query” no outbound Wallet v2
- Expor `mes`/`ano` em `/v2/acessos` porque constam no C4 — validar endpoint correto primeiro
