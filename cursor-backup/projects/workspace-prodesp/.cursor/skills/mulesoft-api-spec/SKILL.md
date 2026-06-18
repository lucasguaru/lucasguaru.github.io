---
name: mulesoft-api-spec
description: Implementar ou alterar contratos RAML em workspace-prodesp-api seguindo padrões PRODESP (library, traits, collectionType, Exchange). Use quando o pedido envolver API spec, RAML, endpoint, traits, dataTypes ou exchange.json. Para common-data-types 1.0.2 e traits globais de rastreabilidade, usar também mulesoft-common-data-types.
---

# MuleSoft API Spec (RAML) — workspace-prodesp-api

## Quando usar

- Novo endpoint ou alteração de contrato (métodos, query params, bodies, responses)
- Criação de novo asset RAML no workspace
- Alinhamento com implementação em `workspace-prodesp-app`

## Projeto de referência

`workspace-prodesp-api/data-wallet-integrator-s-api/`

## Estrutura do asset

```
{asset-id}/
├── {asset-id}.raml          # Recursos e métodos
├── exchange.json            # Metadados Exchange (version, dependencies)
├── library/library.raml     # Agregador types + traits + resourceTypes
├── traits/
│   ├── headers/authorization.raml
│   └── queryParams/{domínio}/{nome}.raml
└── dataTypes/
    ├── commons/{domínio}/{entidade}.raml
    └── {domínio}/{operacao}.raml
```

**Domínios** usados hoje: `walletDados`, `cepCorreios` — criar pasta por backend integrado.

## Root RAML

```raml
#%RAML 1.0
title: {asset-id}
mediaType: application/json
version: v1
protocols: [HTTPS]

uses:
  lib: library/library.raml
```

- `title` = nome do asset (igual à pasta)
- Alias da library sempre `lib`

## library.raml

1. **types:** cada data type com alias camelCase e `!include` relativo
2. **traits:** headers e query params reutilizáveis
3. **resourceTypes:** apenas `collectionType` do Exchange

```raml
resourceTypes:
  collectionType: !include ../exchange_modules/{groupId}/common-data-types/1.0.2/collections/default-collection.raml
```

`errorResponse` também vem de `common-data-types` — não criar tipo de erro local.

### common-data-types 1.0.2 e rastreabilidade

Seguir skill **`mulesoft-common-data-types`** (`.cursor/skills/mulesoft-common-data-types/SKILL.md`):

- `errorResponse`, `collectionType` e dependência **1.0.2** via `exchange_modules`.
- Traits de rastreio (`transaction-id-trait`, etc.) **não** entram no contrato — manter bloco `globalTrackingHeaders` comentado na library (referência: `data-wallet-integrator-s-api`).
- Rastreio em runtime: skill **`prodesp-mule-intra-mule-http`** (`c-inbound-tracking-context`, `vars.context`).

## Naming

| Artefato | Convenção | Exemplo |
|----------|-----------|---------|
| Pasta/asset | `data-{domínio}-s-api` | `data-wallet-integrator-s-api` |
| Arquivo RAML | kebab-case | `consultar-aplicacao.raml` |
| Alias na library | camelCase | `consultarAplicacao` |
| Path REST | português | `/pedidos/compra`, `/aliquotas/{id}` |
| Propriedades | camelCase + `?` se opcional | `idEmpresa?`, `numeroPedido?` |

Toda propriedade deve ter `description` e `example`.

## Traits

### Authorization (padrão)

Arquivo: `traits/headers/authorization.raml`  
Uso no recurso: `is: [lib.headerAuthorization]`

### Query parameters

Arquivo por conjunto reutilizável: `traits/queryParams/walletDados/cnpj.raml`

```raml
#%RAML 1.0 Trait
queryParameters:
  cnpj?:
    description: CNPJ da empresa.
    type: string
    example: "22896431000110"
```

- Parâmetro opcional: sufixo `?` no nome (`cnpj?`)
- Parâmetro obrigatório: sem `?`
- Método referencia trait: `is: [lib.cnpj]` no GET/POST

**Inline** só para params usados em um único endpoint (ex.: `ano`, `mes`, `size` em `/pedidos/compra/{id}/acessos`).

## Data types

| Tipo | Local | Exemplo |
|------|-------|---------|
| Entidade | `dataTypes/commons/{domínio}/empresa.raml` | objeto singular |
| Lista | `dataTypes/{domínio}/empresas.raml` | `type: array` + `!include` commons |
| Request POST/PUT | `{ação}-request.raml` | `cadastrar-aplicacao-request.raml` |
| Response | `{ação}-response.raml` ou nome da operação | |

Não há pasta `examples/` — exemplos ficam nas propriedades.

## Recursos e collectionType

Padrão para CRUD/listagem:

```raml
/empresas:
  type:
    lib.collectionType:
      objectResponse: lib.empresas
      createObject: lib.empresa
      createResponse: lib.empresa
      errorResponse: lib.errorResponse
  is: [lib.headerAuthorization]

  get:
    displayName: Obtem todas empresas
    description: Obtem todas empresas
    is: [lib.cnpj]
```

### Parâmetros do collectionType

| Operação | Parâmetros típicos |
|----------|-------------------|
| GET | `objectResponse`, `errorResponse` |
| POST | `createObject`, `createResponse`, `errorResponse` |
| PUT | `putRequestObject`, `putResponseObject`, `errorResponse` |
| GET-only | `objectResponse`, `errorResponse` |

Sempre incluir `errorResponse: lib.errorResponse`.

## exchange.json

- Arquivo de metadados do asset no Exchange (`classifier`, `main`, `dependencies`, etc.).
- **Não editar pelo agente** — em especial o campo `version`.
- A versão é definida na **publicação manual** no Design Center/Exchange (janela de versão); o tooling do Studio/Designer atualiza `exchange.json` e gera/atualiza `.exchange.xml`.
- Após o usuário publicar, alinhar `api.version` no `pom.xml` da app Mule com `.exchange.xml` (ver rule `mulesoft-workspace`).

## Gate commit / publicação (obrigatório)

Skill **`prodesp-raml-commit-publish-gate`** — regra **`prodesp-raml-commit-publish-gate`**.

- Implementar RAML: ✅ sem gate
- `git commit` ou publicar Exchange: ❌ só com confirmação explícita do usuário (versão + resumo + "sim")
- Ao concluir implementação **não** commitar/publicar automaticamente

## Aderência à spec do backend (obrigatório)

Antes de definir traits, query params ou data types que espelham um backend externo:

1. Ler Swagger/OpenAPI ou documentação oficial da operação (**path + método exatos**).
2. Validar cada campo: nome, **query vs header vs path**, obrigatoriedade, tipo, response.
3. Documentar matriz spec → RAML (skill **`prodesp-backend-spec-alignment`**).
4. Se desenho de produto (C4, mapping) divergir da spec → registrar no ticket; não inventar params no path errado.

Regra: **`prodesp-backend-spec-alignment`**.

## Workflow: novo endpoint

1. Validar aderência à spec do backend (§ acima)
2. Criar/ajustar data types e traits
3. Registrar types e traits em `library/library.raml`
4. Adicionar bloco de recurso no `.raml` raiz
5. Usuário valida e publica no Exchange (versão confirmada — gate **`prodesp-raml-commit-publish-gate`**)
6. Registrar em `tarefas/deploy-log/` (**`prodesp-deploy-registry`**)
7. Sincronizar `exchange_modules` no API Designer / Studio, se necessário
8. Alinhar `api.version` no `pom.xml` da app com `.exchange.xml`
9. Implementar flow correspondente na app (`mulesoft-app-implementation`)

## Query param → header no backend

Quando o backend espera headers mas o contrato expõe query params (ex.: `numero-pedido`, `id-cota`):

1. Definir trait em `traits/queryParams/walletDados/pedidos-compra-consulta.raml` (ou nome da operação)
2. No RAML, `GET` com `is: [lib.pedidosCompraConsulta]` (alias camelCase)
3. Na app Mule: DWL em `dwl/variables/queryParams/` e mapear para `http:headers` no outbound (não duplicar no RAML como header público se o contrato é query param)

## Apps no workspace

Hoje há um asset RAML; novos assets replicam a mesma estrutura e dependência `common-data-types`.
