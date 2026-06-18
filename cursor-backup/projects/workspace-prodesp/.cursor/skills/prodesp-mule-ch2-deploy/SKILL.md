---
name: prodesp-mule-ch2-deploy
description: >-
  Corrige e executa deploy local CloudHub 2 de apps Mule PRODESP: artifactId
  -app vs name -api, credenciais via env (Connected App, Platform, Request),
  settings.xml parametrizado (~/.m2) com -DANYPOINT_* no publish, gate publish→deploy,
  secureProperties, deploy em dois passos (mvn clean deploy + mvn mule:deploy). QA/Prod:
  override só via parâmetros `-D` no Maven — nunca alterar pom/config no repo. Use após
  validação (skill prodesp-mule-ch2-validate), ao aplicar melhorias CH2, corrigir
  401/conflito Exchange, ou quando o usuário pedir deploy local (Dev ou QA).
---

# PRODESP — Deploy CloudHub 2 (local / pipeline)

Referência canônica: `workspace-prodesp-app/management-payments-receipts-s-api`.

Complementa `mulesoft-workspace` (`api.version` é regra separada).

**Validação read-only:** skill `prodesp-mule-ch2-validate` ou command `/validate-ch2-deploy`.

## Quando usar

- Usuário confirmou aplicar melhorias após `/validate-ch2-deploy`
- Usuário pede deploy local CH2 (`mvn clean deploy` + `mvn mule:deploy`) — Dev **ou QA**
- `pom.xml` com credenciais hardcoded ou conflito app × API no Exchange
- Ajustar runtime properties (Platform / Request) sem expor secrets na UI

**Deploy QA:** passar ambiente e Platform via **`-D` no `mvn mule:deploy`** (§5). **Nunca** editar `pom.xml`, `config*.yaml` nem outros arquivos para “preparar” QA.

## Antes de corrigir ou fazer deploy

1. Preferir rodar `prodesp-mule-ch2-validate` (script + checagens manuais).
2. Corrigir apenas itens reportados como fail/warn relevantes.
3. Revalidar com o script até `ready: true` (sem fail).

## 1. Identidade Exchange (evitar conflito)

| Campo | Sufixo | Função |
|-------|--------|--------|
| `artifactId` | `-app` | Artefato Maven no Exchange |
| `<name>` | `-api` (ou já existente) | Nome lógico; `${project.name}` |
| `api.name` | `-api` | Dependência RAML — **não alterar** |

`applicationName` no CH2: `${project.name}-${mule.env}` (ex.: `…-s-api-dev`).

**Versão da app** (`<version>`): usar `-SNAPSHOT` em deploy local. Se não for SNAPSHOT, perguntar ao usuário se incrementa patch (ex.: `1.0.4` → `1.0.5-SNAPSHOT`). Independente de `api.version`.

### E) `config.yaml` + `z-global-config.xml` (identidade RAML)

Ao migrar `artifactId` para `-app`, o Maven resource filtering faz `${project.artifactId}` virar o sufixo **`-app`** — incorreto para metadados do contrato RAML. Separar identidades:

| Onde | Valor | Função |
|------|-------|--------|
| `pom.xml` `<artifactId>` | `…-app` | Artefato publicado no Exchange |
| `pom.xml` `<name>` / `api.name` | `…-api` | Nome lógico / dependência RAML |
| `config.yaml` `api.artifactId` | `"${api.name}"` | Metadado runtime do asset RAML |
| `config.yaml` `api.spec` | ver abaixo | URI APIKit filtrada no build |
| `z-global-config.xml` `apikit:config` | `api="${api.spec}"` | Evita URI hardcoded que desalinha ao publicar nova `api.version` |

Bloco canônico em `src/main/resources/properties/config.yaml`:

```yaml
api:
  groupId: "${project.groupId}"
  artifactId: "${api.name}"
  version: "${api.version}"
  spec: "resource::${project.groupId}:${api.name}:${api.version}:raml:zip:${api.name}.raml"
  majorVersion: "v1"
```

**Não usar** `${project.artifactId}` no bloco `api:` após migração CH2.

## 2. Três credenciais — não misturar

| Papel | Env vars | Property Maven | Destino |
|-------|----------|----------------|---------|
| Connected App (auth deploy) | `ANYPOINT_CLIENT_ID`, `ANYPOINT_CLIENT_SECRET` | `connectedAppClientId/Secret` | Só `cloudhub2Deployment` |
| Platform (runtime Anypoint) | **Dev/local:** `ANYPOINT_PLATFORM_CLIENT_ID`, `ANYPOINT_PLATFORM_CLIENT_SECRET` · **QA:** `ANYPOINT_PLATFORM_CLIENT_ID_QA`, `ANYPOINT_PLATFORM_CLIENT_SECRET_QA` | `anypointPlatformClientId/Secret` | `anypoint.platform.client_id` / `_secret` |
| Request (intra-Mule) | `REQUEST_CLIENT_ID`, `REQUEST_CLIENT_SECRET` | `requestClientId/Secret` | `request.clientId` / `clientSecret` |
| Encrypt key (secure-properties) | `ENCRYPT_KEY_DEV_QA` (dev/local/qa) ou `ENCRYPT_KEY_PROD` (prod) | `encryptKey` | `encrypt.key` |

## 3. Padrão `pom.xml`

### A) Properties (`<!-- Deployments properties -->`)

Maven não lê env com `${VAR}` — usar `${env.VAR}` e expor camelCase:

```xml
<targetName>ps-nonprod-connectivity</targetName>
<connectedAppClientId>${env.ANYPOINT_CLIENT_ID}</connectedAppClientId>
<connectedAppClientSecret>${env.ANYPOINT_CLIENT_SECRET}</connectedAppClientSecret>
<connectedAppGrantType>client_credentials</connectedAppGrantType>
<anypointPlatformClientId>${env.ANYPOINT_PLATFORM_CLIENT_ID}</anypointPlatformClientId>
<anypointPlatformClientSecret>${env.ANYPOINT_PLATFORM_CLIENT_SECRET}</anypointPlatformClientSecret>
<requestClientId>${env.REQUEST_CLIENT_ID}</requestClientId>
<requestClientSecret>${env.REQUEST_CLIENT_SECRET}</requestClientSecret>
<encryptKey>${env.ENCRYPT_KEY_DEV_QA}</encryptKey>
<environment>DEV</environment>
<replicas>1</replicas>
<vCores>0.1</vCores>
<mule.env>dev</mule.env>
<pathRewrite>/dev</pathRewrite>
```

`encryptKey`: usar `${env.ENCRYPT_KEY_DEV_QA}` quando `mule.env` for `dev`, `local` ou `qa`; `${env.ENCRYPT_KEY_PROD}` em produção. Sobrescreve o placeholder de `z-global-secured-config.xml` no runtime CH2.

Deployment referencia `${connectedAppClientId}`, não `${env.*}` direto.

### A.1) Default de ambiente no repositório (fixo — Dev)

O `pom.xml` **versionado** mantém sempre o trio acima: `DEV` / `dev` / `/dev`. Isso vale para **todas** as apps PRODESP.

| Situação | Comportamento do agente |
|----------|-------------------------|
| Usuário pede **deploy Dev** | `mvn mule:deploy` sem `-D` de ambiente (usa default do pom) |
| Usuário pede **deploy QA** | `mvn mule:deploy` **com** `-Dmule.env=qa`, `-Denvironment=QA`, `-DpathRewrite=/qa` e Platform `_QA` (§5) |
| Usuário pede **deploy QA** | **Proibido** alterar arquivos do repo (`pom.xml`, YAML, XML) para gravar `qa`, `Qa` ou `QA` no código |
| Após deploy QA | Working tree deve permanecer **limpa** — nenhum commit de “ajuste de ambiente” |

Branch Git (`develop`, `qa`, `main`) **≠** ambiente Anypoint. O runtime alvo é escolhido **somente na linha de comando Maven**, não no código commitado.

### B) `mule-maven-plugin`

```xml
<classifier>mule-application</classifier>
<applicationName>${project.name}-${mule.env}</applicationName>
<connectedAppClientId>${connectedAppClientId}</connectedAppClientId>
<connectedAppClientSecret>${connectedAppClientSecret}</connectedAppClientSecret>
<connectedAppGrantType>${connectedAppGrantType}</connectedAppGrantType>
```

**Runtime CH2 LTS:** `<app.runtime>4.9.18</app.runtime>` (último LTS no servidor PRODESP; manter alinhado com `releaseChannel` LTS no deploy). Apps novas ou em manutenção CH2 devem usar essa versão salvo exceção documentada no ticket.

**MUnit (`munit-maven-plugin`):** espelhar o mesmo runtime — evita o embedded runner resolver BOM em `repo.maven.apache.org` (Maven Central padrão do super-POM, **não** listado no `<repositories>` do pom):

```xml
<runtimeVersion>${app.runtime}</runtimeVersion>
<runtimeProduct>MULE_EE</runtimeProduct>
```

Repositórios Mule no pom (`anypoint-exchange-v3`, `mulesoft-releases`) valem para o build Maven; o MUnit remote runner usa o BOM do runtime via `runtimeVersion` + `settings.xml` (`~/.m2`).

### C) Runtime CH2

IDs em `<properties>`; secrets em `<secureProperties>`:

```xml
<properties>
    <mule.env>${mule.env}</mule.env>
    <anypoint.platform.client_id>${anypointPlatformClientId}</anypoint.platform.client_id>
    <request.clientId>${requestClientId}</request.clientId>
</properties>
<secureProperties>
    <anypoint.platform.client_secret>${anypointPlatformClientSecret}</anypoint.platform.client_secret>
    <request.clientSecret>${requestClientSecret}</request.clientSecret>
    <encrypt.key>${encryptKey}</encrypt.key>
</secureProperties>
```

### D) `mule-artifact.json`

Registrar os mesmos nomes em `secureProperties` (oculta na UI do Runtime Manager), incluindo `encrypt.key`.

Deploy properties sobrescrevem placeholders vazios do `config.yaml`; app consome via `z-global-config.xml` (mule-plugin: `property_client-id` / `property_client-secret`).

## 4. `settings.xml` (~/.m2)

- `<id>anypoint-exchange-v3</id>` — **mesmo id** em `<repositories>` e `<distributionManagement>` do pom
- `<username>~~~Client~~~</username>` — obrigatório para Connected Apps
- **Nunca** ler, exibir ou logar `<password>` nem secrets de env

### Publish Exchange — password parametrizado (padrão local PRODESP)

O passo `mvn clean deploy` autentica no Exchange via **`~/.m2/settings.xml`**, não via `${env.*}` do `pom.xml`. Para reutilizar a **mesma** Connected App PRODESP das env vars (e evitar credencial hardcoded de outro projeto), usar interpolação Maven no password:

```xml
<server>
  <id>anypoint-exchange-v3</id>
  <username>~~~Client~~~</username>
  <password>${ANYPOINT_CLIENT_ID}~?~${ANYPOINT_CLIENT_SECRET}</password>
</server>
```

Maven **não** lê `${env.VAR}` no `settings.xml`. Os placeholders `${ANYPOINT_CLIENT_ID}` e `${ANYPOINT_CLIENT_SECRET}` são resolvidos com **`-D` na linha de comando** do passo 1 (valores vindos das env vars no shell — mesmo padrão da pipeline Azure):

```bash
mvn clean deploy \
  -DANYPOINT_CLIENT_ID="$ANYPOINT_CLIENT_ID" \
  -DANYPOINT_CLIENT_SECRET="$ANYPOINT_CLIENT_SECRET"
```

**Alinhamento obrigatório:** `ANYPOINT_CLIENT_ID` / `ANYPOINT_CLIENT_SECRET` (env + `-D` do publish) devem ser a **mesma** Connected App usada no CH2 deploy (`connectedAppClientId/Secret` no `pom.xml` via `${env.*}`). Credencial de outro projeto no settings (hardcoded) causa `User is not authorized to create an asset in this organization` mesmo com permissões Exchange corretas na app PRODESP.

**Exceção ao “sem `-D` de credencial”:** permitido **somente** no passo 1 (`mvn clean deploy`) para interpolar o `settings.xml`. O passo 2 (`mvn mule:deploy`) continua **sem** `-DANYPOINT_*` — usa só env vars já configuradas no `pom.xml`.

## 5. Deploy

**Pré-validação:** skill `prodesp-mule-ch2-validate` (script + checklist). Opcional: `echo $ANYPOINT_CLIENT_ID` (nunca secret).

**Diretório:** `workspace-prodesp-app/{asset}/` (ex.: `management-payments-receipts-s-api`).

**Comandos locais — Dev** (default do `pom.xml`: `mule.env=dev`) — sempre **dois passos**, nesta ordem:

```bash
cd workspace-prodesp-app/{asset}
mvn clean deploy \
  -DANYPOINT_CLIENT_ID="$ANYPOINT_CLIENT_ID" \
  -DANYPOINT_CLIENT_SECRET="$ANYPOINT_CLIENT_SECRET"
mvn mule:deploy
```

**Comandos locais — QA** — **somente parâmetros Maven no passo 2; pom permanece com default Dev:**

Platform Anypoint em QA usa env vars **com sufixo `_QA`** (não reutilizar as de dev). Connected App, Request e `ENCRYPT_KEY_DEV_QA` seguem iguais.

Nome do ambiente Anypoint Runtime Manager: **`QA`** (maiúsculas — não `Qa`).

**Antes de rodar:** confirmar que `pom.xml` no disco ainda tem `DEV`/`dev`/`/dev`. Se estiver `Qa`/`qa`, **reverter** o arquivo — não “consertar” commitando QA no pom.

```bash
cd workspace-prodesp-app/{asset}
mvn clean deploy \
  -DANYPOINT_CLIENT_ID="$ANYPOINT_CLIENT_ID" \
  -DANYPOINT_CLIENT_SECRET="$ANYPOINT_CLIENT_SECRET"
mvn mule:deploy \
  -Dmule.env=qa \
  -Denvironment=QA \
  -DpathRewrite=/qa \
  -DanypointPlatformClientId="$ANYPOINT_PLATFORM_CLIENT_ID_QA" \
  -DanypointPlatformClientSecret="$ANYPOINT_PLATFORM_CLIENT_SECRET_QA"
```

App implantada: `{asset}-qa` (ex.: `data-integrator-p-api-qa`). Validar env QA: `validate-ch2.py {asset} --check-env --deploy-target qa`.

| Passo | Comando | Credencial | Efeito |
|-------|---------|------------|--------|
| 1 | `mvn clean deploy` + `-DANYPOINT_*` | `settings.xml` (`anypoint-exchange-v3`) | Publica artefato no Exchange (**sem** deploy no CH2) |
| 2 Dev | `mvn mule:deploy` | Env vars → `${env.*}` no `pom.xml` | Deploy CH2 dev |
| 2 QA | `mvn mule:deploy` + `-Dmule.env=qa` + `-Denvironment=QA` + `-DanypointPlatform*` de `_QA` | Connected App/Request/encrypt via env; Platform via `-D` `_QA` | Deploy CH2 qa |

Pré-requisito: `settings.xml` com `<password>${ANYPOINT_CLIENT_ID}~?~${ANYPOINT_CLIENT_SECRET}</password>` (§4). Env vars de deploy definidas no shell antes dos comandos (QA: incluir `ANYPOINT_PLATFORM_CLIENT_ID_QA` e `ANYPOINT_PLATFORM_CLIENT_SECRET_QA`).
### Gate obrigatório (publish → deploy)

**Se `mvn clean deploy` terminar com exit code ≠ 0, NÃO executar `mvn mule:deploy`.**

Motivo: `mule:deploy` isolado pode redeployar artefato **antigo** já existente no Exchange e retornar `BUILD SUCCESS` — falsa sensação de que o código novo subiu.

| Intenção do usuário | Fluxo |
|---------------------|-------|
| **Deploy de entrega** (código novo ou versão nova) | Passo 1 **obrigatório** com sucesso → passo 2. Falha no passo 1 = **deploy não realizado**. |
| **Redeploy operacional** (restart, mesma versão, sem código novo) | Só `mvn mule:deploy` — avisar explicitamente que **não publica** código novo no Exchange. |

**Como reportar ao usuário quando o passo 1 falha:**

- Status: **falha de deploy** (não sucesso parcial).
- Informar que CH2 **não foi atualizado** com o build local.
- Se `mule:deploy` tiver sido evitado, dizer que o runtime continuaria na versão anterior do Exchange.
- Não classificar como “deploy concluído” só porque o Maven empacotou o JAR localmente.

Regra always-on: `.cursor/rules/prodesp-mule-ch2-deploy-gate.mdc`.

### Registro de deploy (obrigatório após sucesso)

Skill **`prodesp-deploy-registry`** — atualizar `tarefas/deploy-log/registry.yaml`:

| Passo concluído | Registrar |
|-----------------|-----------|
| `mvn clean deploy` exit 0 | `type: exchange-app`, `environment: Exchange`, versão do `<version>` do pom |
| `mvn mule:deploy` exit 0 | `type: ch2`, ambiente Dev/QA/Prod, nome `{project.name}-{mule.env}` |

Incluir `api.version`, branch, work item em `notes` quando souber.

**Regras obrigatórias:**

- **Nunca** alterar arquivos do repositório para deploy QA (ou Prod): ambiente vai **só** nos `-D` do passo 2 (§5, §A.1).
- **Nunca** usar `-DmuleDeploy` no deploy local — publish e deploy são comandos separados.
- **Nunca** passar `-s settings.xml` no deploy local — o `settings.xml` do usuário já está em `~/.m2/settings.xml` (Connected Apps com `~~~Client~~~`).
- Passo 1: **sempre** passar `-DANYPOINT_CLIENT_ID` e `-DANYPOINT_CLIENT_SECRET` quando o settings usar password parametrizado (§4).
- Passo 2: **nunca** passar `-DANYPOINT_CLIENT_ID` / `-DANYPOINT_CLIENT_SECRET` (Connected App) — vêm das env vars no `pom.xml`. Em **QA**, passar `-Dmule.env=qa`, `-Denvironment=QA`, `-DpathRewrite=/qa` e `-DanypointPlatformClientId/Secret` com `ANYPOINT_PLATFORM_CLIENT_ID_QA` / `ANYPOINT_PLATFORM_CLIENT_SECRET_QA` (§5).
- Executar **sempre** os dois comandos na ordem acima quando a intenção for entrega; **não pular** o passo 1; **não** rodar o passo 2 se o passo 1 falhar.

Pipeline Azure: expor as env vars de deploy + `ENCRYPT_KEY_DEV_QA` (dev/local/qa) ou `ENCRYPT_KEY_PROD` (prod) no step. Na CI, o pipeline pode usar `-s $(build.sourcesdirectory)/settings.xml` com o mesmo password parametrizado + `-DANYPOINT_*` no `mvn clean deploy` — espelhar o fluxo local (§4).

Após alterar env no Windows: reiniciar terminal/IDE.

## 6. Erros comuns

| Erro | Correção |
|------|----------|
| `artifactId` = nome API (`-api`) | `artifactId` → `-app`; manter `<name>` `-api` |
| `config.yaml` `api.artifactId` = `${project.artifactId}` | Trocar para `"${api.name}"`; adicionar `api.spec`; `apikit:config` → `api="${api.spec}"` |
| URI RAML hardcoded no `apikit:config` | Usar `api="${api.spec}"` + bloco `api:` em `config.yaml` (§1.E) |
| `${ANYPOINT_CLIENT_ID}` sem `env.` | `${env.ANYPOINT_CLIENT_ID}` |
| Connected App trocado por Platform | Separar papéis (tabela §2) |
| Secret em `<properties>` | Mover para `<secureProperties>` + `mule-artifact.json` |
| `encrypt.key` ausente ou hardcoded | `encryptKey` via `${env.ENCRYPT_KEY_DEV_QA}` (dev/local/qa) + `<encrypt.key>${encryptKey}</encrypt.key>` em `secureProperties` |
| `-D` de credencial no `mule:deploy` | Passo 2 sem `-DANYPOINT_*`; só env vars no `pom.xml` |
| Publish sem `-D` com settings parametrizado | Passo 1 exige `-DANYPOINT_CLIENT_ID` e `-DANYPOINT_CLIENT_SECRET` (§4) |
| `distributionManagement` id ≠ `anypoint-exchange-v3` | Alinhar com `settings.xml` |
| `applicationName` = `${project.artifactId}` | Usar `${project.name}-${mule.env}` |
| `targetName` = `ps-nonprod` | Usar `ps-nonprod-connectivity` (private space com conectividade outbound) |
| 401 no deploy | Connected App + `~~~Client~~~` no settings |
| `mvn clean deploy` falhou e agente rodou `mule:deploy` | **Não fazer.** CH2 ficou com artefato antigo; corrigir publish no Exchange e repetir os dois passos (§5 gate). |
| `User is not authorized to create an asset in this organization` | Credencial do **publish** errada: settings hardcoded de outro projeto, ou `-D`/`env` desalinhados do CH2. Usar password parametrizado (§4) + mesma Connected App PRODESP. |
| `Couldn't find environmentName named [Qa]` | Ambiente Anypoint é **`QA`** (maiúsculas), não `Qa`. Usar `-Denvironment=QA` no passo 2 — **não** gravar `Qa` no `pom.xml`. |
| Agente alterou `pom`/YAML para QA antes do deploy | Reverter arquivos. QA **só** via `-Dmule.env=qa -Denvironment=QA -DpathRewrite=/qa` + Platform `_QA` (§5, §A.1). |
| `mule.env` / `environment` no pom ≠ dev / DEV | Corrigir pom para default Dev no repo (§A.1); deploy QA continua exclusivamente via `-D`. |

## 7. Checklist pós-correção (antes do deploy)

Após aplicar melhorias, revalidar com `prodesp-mule-ch2-validate` e confirmar:

1. Script retorna `ready: true` (0 fail)
2. `~/.m2/settings.xml`: id `anypoint-exchange-v3`, username `~~~Client~~~`, password `${ANYPOINT_CLIENT_ID}~?~${ANYPOINT_CLIENT_SECRET}` (§4)
3. Env vars presentes (deploy + encrypt key conforme `mule.env`; nunca logar valores)
4. `mvn clean deploy` com `-DANYPOINT_CLIENT_ID` e `-DANYPOINT_CLIENT_SECRET` — **exit 0 obrigatório**
5. Só então `mvn mule:deploy` — Dev sem `-D` de ambiente; QA com `-D` do §5 — **não executar se o passo 4 falhou**; **não editar arquivos para QA**
