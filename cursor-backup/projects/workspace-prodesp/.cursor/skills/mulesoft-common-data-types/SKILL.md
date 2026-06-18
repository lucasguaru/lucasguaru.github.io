---
name: mulesoft-common-data-types
description: Usar fragmento Exchange common-data-types (1.0.2+) em RAML PRODESP — errorResponse, collectionType e clientCredentials via exchange_modules. Use ao migrar de 1.0.1 ou atualizar dependência no exchange.json. Rastreio de headers é runtime Mule (não no contrato RAML).
---

# common-data-types — PRODESP (workspace-prodesp-api)

## Escopo

- **Local (este repo):** org PRODESP, paths `exchange_modules`, asset `common-data-types` no monorepo em `workspace-prodesp-api/common-data-types/`.
- **Não** criar cópias locais de traits que já existem no fragmento.
- Traits de domínio (query params, authorization por API) continuam locais em `{asset}/traits/`.

## Versão mínima: 1.0.2

| Recurso | 1.0.1 | 1.0.2 |
|---------|-------|-------|
| `errorResponse`, `collectionType` | sim | sim |
| `transaction-id-trait`, `x-source-system-trait` | sim | sim |
| **`global-parent-correlation-trait`** | **não** | **sim** |

Fonte canônica dos traits: `workspace-prodesp-api/common-data-types/traits/` (publicar no Exchange como **1.0.2** antes de consumir nas APIs).

Headers reais expostos pelos traits (não inventar nomes):

| Trait | Headers |
|-------|---------|
| `transaction-id-trait` | `x-transaction-id` |
| `global-parent-correlation-trait` | `x-global-correlation-id`, `x-parent-correlation-id` |
| `x-source-system-trait` | `x-source-system` |

Exchange: [common-data-types 1.0.x](https://anypoint.mulesoft.com/exchange/1c8711d7-2135-4686-89f0-fb014e1662ac/common-data-types/minor/1.0/)

## Passo 1 — `exchange.json` (dependência)

Atualizar **somente** a dependência `common-data-types` para `1.0.2`. **Não** alterar o campo `version` do próprio asset.

**Padrão preferido (Design Center):**

```json
"dependencies": [{
  "groupId": "1c8711d7-2135-4686-89f0-fb014e1662ac",
  "assetId": "common-data-types",
  "version": "1.0.2",
  "packaging": "zip"
}]
```

**Studio (Update Module):** pode gerar entrada duplicada (1.0.1 + 1.0.2). **Remover** a entrada antiga e deixar **apenas 1.0.2** antes de commitar.

Depois: refresh/pull de dependências no Studio ou Design Center → pasta `exchange_modules/.../common-data-types/1.0.2/`.

## Passo 2 — `library/library.raml`

Substituir **todos** os includes `1.0.1` → `1.0.2` para tipos compartilhados:

```yaml
types:
  errorResponse: !include ../exchange_modules/1c8711d7-2135-4686-89f0-fb014e1662ac/common-data-types/1.0.2/dataTypes/error-response-data-type.raml

traits:
  transaction-id-trait: !include ../exchange_modules/1c8711d7-2135-4686-89f0-fb014e1662ac/common-data-types/1.0.2/traits/transaction-id-trait.raml
  global-parent-correlation-trait: !include ../exchange_modules/1c8711d7-2135-4686-89f0-fb014e1662ac/common-data-types/1.0.2/traits/global-parent-correlation-trait.raml
  x-source-system-trait: !include ../exchange_modules/1c8711d7-2135-4686-89f0-fb014e1662ac/common-data-types/1.0.2/traits/x-source-system-trait.raml

resourceTypes:
  collectionType: !include ../exchange_modules/1c8711d7-2135-4686-89f0-fb014e1662ac/common-data-types/1.0.2/collections/default-collection.raml
```

Manter traits locais (ex.: `headerAuthorization`, query params) com `!include ../traits/...`.

## Passo 3 — Rastreabilidade (runtime Mule, **não** no contrato)

**Não** declarar headers de rastreio (`x-transaction-id`, `x-global-correlation-id`, `x-parent-correlation-id`, `x-source-system`) nos recursos do RAML.

Os traits existem no fragmento `common-data-types` 1.0.2 e podem ficar referenciados na `library/library.raml` como bloco interno `globalTrackingHeaders` — **somente documentação**, com comentário *não aplicar nos recursos*:

```yaml
  # Referência interna dos traits de rastreabilidade. Não aplicar diretamente nos recursos do contrato;
  # os headers são injetados pelo flow de entrada via vars.context (c-inbound-tracking-context).
  globalTrackingHeaders:
    is:
      - transaction-id-trait
      - global-parent-correlation-trait
      - x-source-system-trait
```

**Contrato:** recursos usam apenas `is: [lib.headerAuthorization]` (+ traits locais de domínio, ex. `lib.campos`).

**Runtime:** rastreio na app Mule via `c-inbound-tracking-context` → `vars.context` e propagação outbound. Ver skill **`prodesp-mule-intra-mule-http`**.

## Referência implementada

- **Contrato RAML:** `workspace-prodesp-api/data-wallet-integrator-s-api/` — recursos sem traits de rastreio; library com bloco comentado.
- **Runtime Mule:** skill **`prodesp-mule-intra-mule-http`** (`vars.context`, headers outbound).

## Publicação no Exchange (API Catalog CLI)

Projetos RAML **não** usam `mvn deploy` (não há `pom.xml` de publish). Fluxo canônico: regra **`prodesp-exchange-publish-api-catalog`**.

**Pré-requisitos:** `npm install -g api-catalog-cli@latest` + env `ANYPOINT_CLIENT_ID`, `ANYPOINT_CLIENT_SECRET`, `ANYPOINT_ORG=1c8711d7-2135-4686-89f0-fb014e1662ac`.

### `catalog.yaml` no asset (obrigatório para CLI)

**Windows:** não usar só `ref: exchange.json` — o CLI resolve `main` como path **absoluto** e o AMF falha (`Error resolving path: For input string: ""`; saída truncada: `Error: undefined`).

Usar `main` **relativo** e metadados alinhados ao `exchange.json`:

```yaml
#%Catalog Descriptor 1.0
projects:
  - main: {asset-id}.raml
    assetId: {asset-id}
    version: "{versão do exchange.json}"
    apiVersion: v1
```

**Linux/macOS:** `ref: exchange.json` costuma funcionar (ver regra).

### `exchange_modules` antes do publish

Se a pasta `exchange_modules/.../common-data-types/1.0.2/` não existir (gitignored), copiar do monorepo `workspace-prodesp-api/common-data-types/` os arquivos referenciados na `library.raml` (traits, `error-response-data-type.raml`, `default-collection.raml`) para o path do include.

### Comandos (na pasta do asset)

```bash
cd workspace-prodesp-api/{asset}
api-catalog publish-asset -d catalog.yaml --dry-run --verbose
api-catalog publish-asset -d catalog.yaml
```

Após publicar: alinhar `api.version` (e plugins consumidores) no `pom.xml` de `workspace-prodesp-app/{asset}/`. **Não** fazer `git push` em `workspace-prodesp-api/` — push pelo Anypoint Studio.

## Anti-patterns

- **`is:` global na raiz** do API RAML (quebra validação AMF / Exchange).
- **`catalog.yaml` com só `ref: exchange.json` no Windows** (publish falha silenciosamente).
- Deixar `library.raml` em 1.0.1 com `exchange.json` em 1.0.2 (Design Center atualiza só JSON; **library manual**).
- Confiar no MCP `search_asset` como versão latest — pode retornar 1.0.1 por relevância/indexação; validar no Exchange ou em `common-data-types/exchange.json`.

## Novo trait no fragmento

1. Adicionar arquivo em `workspace-prodesp-api/common-data-types/traits/{nome}-trait.raml`.
2. Registrar em `common-data-types/common-data-types.raml` → `traits:`.
3. Publicar nova versão do fragmento no Exchange (ex.: 1.0.2 ou patch).
4. Atualizar dependência + includes nas APIs consumidoras.

## Checklist por API

- [ ] `exchange.json`: dependência `common-data-types` = `1.0.2` (sem duplicata 1.0.1)
- [ ] `library.raml`: `errorResponse`, `collectionType` e 3 traits → paths `1.0.2`
- [ ] Root `.raml`: **sem** `is:` na raiz; recursos com `[lib.headerAuthorization]` (ou + traits locais de domínio)
- [ ] Refresh `exchange_modules` no Studio/Design Center
- [ ] Nenhum trait duplicado localmente para os 3 headers de rastreabilidade
