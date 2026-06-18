---
name: prodesp-mule-ch2-validate
description: >-
  Valida apps Mule PRODESP contra o padrão de deploy CloudHub 2 (read-only):
  script mecânico em pom.xml/mule-artifact.json/config.yaml/apikit, checagens
  manuais de settings.xml, env vars e api.version. Use ao validar prontidão CH2,
  antes de deploy ou quando o usuário invocar /validate-ch2-deploy.
disable-model-invocation: true
---

# PRODESP — Validar deploy CloudHub 2

Referência canônica: `workspace-prodesp-app/management-payments-receipts-s-api`.

Padrão completo de correção e deploy: skill `prodesp-mule-ch2-deploy`.

## Quando usar

- Command `/validate-ch2-deploy`
- Usuário pergunta se a app está pronta para CH2
- Antes de `mvn clean deploy` + `mvn mule:deploy` (sem alterar arquivos na fase de validação)

## Fluxo do agente

1. **Resolver app** em `workspace-prodesp-app/{asset}/` (regra `mulesoft-workspace`). Se ambíguo, perguntar qual asset.
2. **Rodar script mecânico** (não alterar arquivos):

```bash
python .cursor/skills/prodesp-mule-ch2-validate/scripts/validate-ch2.py workspace-prodesp-app/{asset} --check-env

Deploy QA: acrescentar `--deploy-target qa` (valida `ANYPOINT_PLATFORM_CLIENT_ID_QA` / `_SECRET_QA` em vez das vars de dev). **Não** alterar o pom para QA — o script espera default `dev` no repositório.
```

3. **Checagens manuais** (agente — não expor secrets):

| ID | Verificação |
|----|-------------|
| `settings-xml-id` | `~/.m2/settings.xml`: server/repository com `<id>anypoint-exchange-v3</id>` |
| `settings-xml-user` | Username `~~~Client~~~` no server do Exchange (Connected Apps) |
| `settings-xml-password` | Password parametrizado `${ANYPOINT_CLIENT_ID}~?~${ANYPOINT_CLIENT_SECRET}` (skill deploy §4) — não hardcoded de outro projeto |
| `api-version` | `api.version` no pom alinhado com `workspace-prodesp-api/{asset}/.exchange.xml` (regra `mulesoft-workspace`) |
| `no-credential-flags` | Passo 2 (`mvn mule:deploy`) sem `-DANYPOINT_*`. Passo 1 (`mvn clean deploy`) **deve** usar `-DANYPOINT_CLIENT_ID` e `-DANYPOINT_CLIENT_SECRET` quando settings parametrizado (§4 deploy) |
| `pom-default-dev` | `pom.xml` com `<mule.env>dev</mule.env>`, `<environment>DEV</environment>`, `<pathRewrite>/dev</pathRewrite>` — QA/Prod **não** vão no arquivo (skill deploy §A.1) |

4. **Montar relatório** no formato abaixo.
5. **Não aplicar correções** nesta fase — só reportar.

## Formato do relatório

```markdown
## CH2 Deploy Readiness — {asset}

| # | Check | Status | Evidência / correção |
|---|-------|--------|----------------------|
| 1 | artifactId `-app` | ✅ / ❌ / ⚠️ | … |

**Script:** {pass}/{total} pass, {fail} fail, {warn} warn
**Manual:** …
**Resultado:** pronto / não pronto para deploy
```

Status: ✅ pass, ❌ fail, ⚠️ warn, ⏭️ skip.

## O que o script cobre

- `artifactId` `-app` vs `<name>` / `api.name`
- Versão `-SNAPSHOT` (warn se ausente)
- `classifier` `mule-application`
- `applicationName` `${project.name}-${mule.env}`
- `targetName` `ps-nonprod-connectivity` em nonprod (`mule.env` dev/local/qa); `${targetName}` em `<target>` do deploy
- Properties de deploy via `${env.*}` (sem hardcode)
- `cloudhub2Deployment` referencia `${connectedAppClientId}` etc.
- Secrets só em `secureProperties` (não em `properties`)
- `encrypt.key` em `secureProperties` + `mule-artifact.json` (chave Blowfish do módulo secure-properties)
- `encryptKey` no pom via `${env.ENCRYPT_KEY_DEV_QA}` quando `mule.env` é `dev`, `local` ou `qa`; `${env.ENCRYPT_KEY_PROD}` em `prod`
- `mule-artifact.json` com `secureProperties` de runtime
- `distributionManagement` e `repository` id `anypoint-exchange-v3`
- Presença das env vars de deploy + encrypt key (`--check-env`; nunca logar valores)
- **`config.yaml` bloco `api:`** — `artifactId: "${api.name}"` (não `${project.artifactId}`); `api.spec` canônico com `${api.name}`
- **`z-global-config.xml`** — `apikit:config` com `api="${api.spec}"` (sem URI RAML hardcoded)

## Após o relatório — aplicar melhorias?

Quando invocado via **command** `/validate-ch2-deploy`, ao final **perguntar explicitamente**:

> Encontrei **N** item(ns) para corrigir. Deseja que eu aplique as melhorias agora?

- **Se sim:** seguir skill `prodesp-mule-ch2-deploy` (corrigir pom, `mule-artifact.json`, `config.yaml`, `z-global-config.xml`; não commitar nem fazer deploy sem pedido).
- **Se não:** encerrar com resumo e lista de itens pendentes.
- **Se pronto (0 fail):** informar que está no padrão; oferecer deploy opcional via `prodesp-mule-ch2-deploy`.
- **Durante deploy:** se `mvn clean deploy` falhar, **não** rodar `mvn mule:deploy` (regra `prodesp-mule-ch2-deploy-gate` / skill deploy §5 gate).

## Erros comuns (referência rápida)

| Sintoma no script | Correção (skill deploy §6) |
|-------------------|----------------------------|
| `artifact-id-app` fail | `artifactId` → `-app`; manter `<name>` `-api` |
| `env-binding-*` fail | `${env.VAR}` nas properties Maven |
| `application-name` fail | `${project.name}-${mule.env}` |
| `target-name` fail | `ps-nonprod` legado → `ps-nonprod-connectivity` |
| `runtime-secrets` fail | Mover para `secureProperties` + `mule-artifact.json` |
| `secure-encrypt.key` / `env-binding-encryptKey` fail | `encryptKey` → `${env.ENCRYPT_KEY_DEV_QA}` (dev/local/qa) ou `${env.ENCRYPT_KEY_PROD}` (prod); `<encrypt.key>${encryptKey}</encrypt.key>` em `secureProperties` |
| `distribution-id` fail | Alinhar com `settings.xml` |
| `config-api-artifact-id` fail | `artifactId: "${api.name}"` no bloco `api:` de `config.yaml` |
| `config-api-spec` fail | Adicionar `spec: "resource::${project.groupId}:${api.name}:${api.version}:raml:zip:${api.name}.raml"` |
| `apikit-api-spec-ref` fail | `api="${api.spec}"` em `common/z-global-config.xml` |
