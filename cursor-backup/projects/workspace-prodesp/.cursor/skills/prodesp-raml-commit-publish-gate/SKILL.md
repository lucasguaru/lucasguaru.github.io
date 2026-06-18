---
name: prodesp-raml-commit-publish-gate
description: Gate PRODESP para commit local e publicação Exchange de contratos RAML em workspace-prodesp-api — exige validação explícita do usuário (versão, diff, canal) antes de git commit, api-catalog publish-asset ou orientar Studio. Usar ao implementar RAML, ao usuário pedir commit/publicar API, ou antes de alterar version em exchange.json/catalog.yaml.
---

# Gate commit / publicação RAML (PRODESP)

## Quando usar

- Usuário pede commit em `workspace-prodesp-api/`
- Usuário pede publicar no Exchange (CLI ou Studio)
- Agente concluiu alteração de contrato e poderia "fechar" com commit/publish
- Antes de `api-catalog publish-asset` ou mudança de `version` para publish

Regra always-on: `.cursor/rules/prodesp-raml-commit-publish-gate.mdc`

## O que o agente pode fazer sem gate

- Editar RAML, traits, dataTypes, library
- Dry-run: `api-catalog publish-asset -d catalog.yaml --dry-run --verbose`
- Preparar rascunho de mensagem de commit
- Mostrar diff e versão sugerida **para o usuário decidir**

## O que exige validação explícita

| Ação | Gatilho mínimo do usuário |
|------|---------------------------|
| `git commit` | "commita", "pode commitar", "sim, commit" |
| `api-catalog publish-asset` | "publica", "pode publicar", "sim, versão X" |
| Studio / Design Center | "vou publicar no Studio" ou pedido explícito de publicar |

**Não vale:** "implementa o GET /foo" → isso **não** autoriza commit/publish.

## Checklist antes de executar

Apresentar ao usuário:

```
Asset: {asset-id}
Versão: {X.Y.Z} — confirmada por você?
Alterações: {bullets}
Canal: commit local | api-catalog | Studio
Próximo passo após publish: alinhar api.version no pom da app
```

Aguardar confirmação. Só então executar.

## Versão

- Agente **nunca** incrementa `exchange.json` / `catalog.yaml` "no chute"
- Usuário informa a versão ou confirma a proposta na validação
- Ver também `mulesoft-workspace` e `prodesp-exchange-publish-api-catalog`

## Fluxo commit local

1. Gate aprovado pelo usuário
2. `git status` / `git diff` (somente arquivos RAML do asset)
3. Commit em português (foco no porquê)
4. **Não** `git push` — push continua manual (Studio/Git Design Center)

## Fluxo publicação Exchange

1. Gate aprovado + versão confirmada
2. Alinhar `catalog.yaml` com `exchange.json` se necessário
3. `--dry-run` → mostrar resultado → confirmar de novo se dry-run OK
4. `api-catalog publish-asset -d catalog.yaml` (ou Studio pelo usuário)
5. **Registrar** deploy/publicação: skill **`prodesp-deploy-registry`**
6. Ler `.exchange.xml` → alinhar `api.version` no `pom.xml` da app

## Anti-padrões

- Commitar RAML ao final de task de implementação sem pedido
- Publicar RAML porque a app foi deployada no CH2
- Assumir que publicação ontem/automaticamente autoriza nova publicação hoje
