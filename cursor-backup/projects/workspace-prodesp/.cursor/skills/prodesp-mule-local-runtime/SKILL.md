---
name: prodesp-mule-local-runtime
description: >-
  Rodar apps Mule PRODESP localmente via CLI (sem Studio): runtime Mule DX,
  stack multi-app, mule.env=local, API Platform credentials, api.id Dev,
  log4j2, stop/start. Use ao testar alterações localmente, subir portal +
  integrator + wallet, ou troubleshooting HTTP 500 / policy / Metaspace.
---

# PRODESP — Mule local runtime (CLI, sem Studio)

Skill canônica para **testar alterações** em apps `workspace-prodesp-app/` sem Anypoint Studio.

Script principal: `workspace-prodesp-app/scripts/run-local-v2-acessos-stack.sh`  
README: `workspace-prodesp-app/scripts/README-run-local-v2-acessos.md`

## Quando usar

- Testar endpoint local (ex.: `GET /v2/acessos` — e-api → p-api → s-api → Wallet HML)
- Validar alteração antes de deploy CH2
- Usuário pede "rodar mule local", "subir stack", "ver log local"

**Não usar** `mvn mule:run` — goal inexistente no `mule-maven-plugin` 4.3.0 deste repo.

**Não usar** MCP `run_local_mule_application` — falha com `spawn EINVAL` neste ambiente; preferir o script bash.

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| JDK | **17** (ex.: `AnypointCodeBuilder/java/jdk-17.0.13+11`) |
| Maven | `settings.xml` com Exchange Anypoint |
| Runtime | **Mule DX** (extensão Cursor/VS Code) — **não** standalone em `AnypointCodeBuilder/runtime/` (`LicenseException`) |
| Segredos | `config-secure-local.yaml` em cada app do stack (Blowfish; `encrypt.key` no XML) |

### `MULE_HOME` (ordem de preferência)

1. **Mule DX** (padrão do script, licença embutida):
   `~/.cursor/extensions/salesforce.mule-dx-runtime-*/build/runtime/mule-enterprise-standalone-4.11.2`
2. **Studio** (alternativa, se usuário informar path):
   `AnypointStudio/plugins/org.mule.tooling.server.4.11.ee_*/mule`

## `mule.env=local` — já no código

Não exige VM options no Studio para portas padrão:

- `z-global-config.xml`: `<global-property name="mule.env" value="local" />`
- `properties/config-local.yaml` por app
- `wrapper.conf` do Mule DX: `-Dmule.env=local`

### Portas do stack `/v2/acessos`

| App | Porta HTTP |
|-----|------------|
| `portal-ecom-tech-e-api` | **8081** |
| `data-integrator-p-api` | **8082** → wallet `localhost:8085` |
| `data-wallet-integrator-s-api` | **8085** |

Cada app tem `README.md` com mapa; intra-Mule usa `config-local.yaml` (`requestDataIntegrator.port`, etc.).

## Comandos do script

```bash
export JAVA_HOME="/c/Users/lucas/AnypointCodeBuilder/java/jdk-17.0.13+11"

cd workspace-prodesp-app/scripts
./run-local-v2-acessos-stack.sh start    # build + deploy + console
./run-local-v2-acessos-stack.sh stop
./run-local-v2-acessos-stack.sh status
./run-local-v2-acessos-stack.sh logs
SKIP_BUILD=1 ./run-local-v2-acessos-stack.sh start   # só redeploy
```

## Subir o runtime — `mule.bat console`

| Comando | Resultado |
|---------|-----------|
| `mule.bat start` | ❌ Exige **serviço Windows** → `0x424` + *Press any key* |
| `mule.bat stop` | ❌ Mesmo problema |
| `mule.bat console` | ✅ Foreground, sem serviço — **usar este** |

O script chama `mule.bat console` em background.

## Deploy de JARs

1. `mvn clean package -Dmaven.test.skip=true` por app
2. Copiar `target/*-mule-application.jar` → `$MULE_HOME/apps/`
3. **Não** `rm -rf apps/*` (pastas exploded → *Device or resource busy*)
4. Substituir só `*.jar`; Mule faz hot-deploy

## API Platform (autodiscovery / policy) — obrigatório local

Sem credenciais → HTTP **500**, log *API Platform client is DISABLED* ou falha em `DefaultPolicyDeployer`.

### Arquivo local (não commitar)

```bash
cp workspace-prodesp-app/scripts/.anypoint-local.env.example \
   workspace-prodesp-app/scripts/.anypoint-local.env
# ANYPOINT_PLATFORM_CLIENT_ID / ANYPOINT_PLATFORM_CLIENT_SECRET (Connected App)
```

O script gera `$MULE_HOME/conf/wrapper-prodesp-local.conf`:

```properties
-Danypoint.platform.client_id=...
-Danypoint.platform.client_secret=...
-Danypoint.platform.base_uri=https://anypoint.mulesoft.com/
-Danypoint.platform.gatekeeper=disabled
```

`gatekeeper=disabled` + credenciais espelham o que o Studio passa em debug.

**Policy Message Logging:** o runtime **sincroniza sozinho** com o API Manager (thread `agw-policy-set-deployment`) — não precisa rebuild/restart da app para mudança só de policy. Exceção: cache local corrompido em `$MULE_HOME/policies/` (ver troubleshooting).

**Erro de policy no log ≠ stack down:** apps podem estar `DEPLOYED` e responder **200** mesmo com `PolicyRegistrationException` no `mule_ee.log` (ex.: encoding antigo). Endpoint segue testável; logs da category `br.gov.sp.prodesp.api.gateway` é que podem faltar até a policy aplicar.

### `api.id` em `config-local.yaml`

**Não usar** `99999999` — autodiscovery/policy falha.

Copiar `api.id` (e `api.key` quando existir em Dev) de `config-dev.yaml`:

| App | api.id Dev (referência) |
|-----|-------------------------|
| `portal-ecom-tech-e-api` | `20249159` |
| `data-integrator-p-api` | `20249165` |
| `data-wallet-integrator-s-api` | `20249163` |

Após alterar YAML → **rebuild** (`start` sem `SKIP_BUILD`).

## `log4j2.xml` — standalone

`${sys:app.name}` **não resolve** no standalone → arquivo literal `${sys:app.name}.log` inválido no Windows.

Padrão:

```xml
<Properties>
  <Property name="APP_LOG_NAME">nome-da-app</Property>
</Properties>
...
fileName=".../logs/${APP_LOG_NAME}.log"
```

## Logs

```text
$MULE_HOME/logs/mule_ee.log
$MULE_HOME/logs/portal-ecom-tech-e-api.log
$MULE_HOME/logs/data-integrator-p-api.log
$MULE_HOME/logs/data-wallet-integrator-s-api.log
```

## Memória — 3 apps no mesmo runtime

Portal pode falhar com **Metaspace** se JVM default for baixa. O script define em `wrapper-prodesp-local.conf`:

- `-XX:MaxMetaspaceSize=2048m`
- `-Xmx2048m`

## Parar o runtime

**Não** `mule.bat stop`. O script:

1. Mata PIDs nas portas 8081/8082/8085
2. `taskkill` em `wrapper-windows-x86-64.exe`

## Teste HTTP — `/v2/acessos`

Fluxo **validado** localmente: `GET http://localhost:8081/v2/acessos?numero-pedido=...` com `Authorization: Bearer <token>` → **200** (params `mes`/`ano` opcionais conforme contrato).

```bash
curl -s "http://localhost:8081/v2/acessos?numero-pedido=PEDIDO&mes=6&ano=2025" \
  -H "Authorization: Bearer <token>"
```

Ou:

```bash
AUTHORIZATION="Bearer ..." NUMERO_PEDIDO=... MES=6 ANO=2025 \
  ./run-local-v2-acessos-stack.sh test
```

## Troubleshooting

| Sintoma | Causa provável | Ação |
|---------|----------------|------|
| `0x424` / *Press any key* | `mule.bat start/stop` | Usar `console` ou script |
| `LicenseException` | Runtime ACB standalone | Usar Mule DX extension |
| HTTP 500 na entrada | Sem API Platform JVM | `.anypoint-local.env` + restart |
| `PolicyRegistrationException` + `Invalid byte ... UTF-8` | Acento em policy Message Logging (`saída` → Latin-1 no `policy.xml`) | Atualizar preset no API Manager: `saida` sem acento — skill **`prodesp-api-manager-policy-logging`**; limpar `$MULE_HOME/policies/message-logging-mule-*` e restart |
| `PolicyRegistrationException` | `api.id` fake `99999999` | Copiar de `config-dev.yaml` + rebuild |
| `ApiKey blocked` | Sem client_id/secret | Idem |
| `${sys:app.name}.log` | log4j2 | `APP_LOG_NAME` literal |
| Portal `FAILED` Metaspace | 3 apps pesadas | JVM no script; ou subir menos apps |
| Porta "ocupada" falso positivo | TIME_WAIT no netstat | Script usa só `LISTENING` em `0.0.0.0:PORT` |
| `rm: Device or resource busy` | Apagar pasta exploded | Só trocar JARs |

## Studio vs CLI

| | Studio | Script CLI |
|---|--------|------------|
| Credenciais Platform | Run Configuration VM options | `wrapper-prodesp-local.conf` |
| Runtime | `org.mule.tooling.server` | Mule DX extension |
| Logs | Console Studio + `mule/logs/` | `mule_ee.log` + `APP_LOG_NAME.log` |

Se Studio estiver rodando nas mesmas portas → `stop` no Studio ou `./run-local-v2-acessos-stack.sh stop` antes do `start`.

Após republicar Message Logging no API Manager, limpar cache: `rm -rf "$MULE_HOME/policies/message-logging-mule-*"` antes do próximo `start`.

## Skills relacionadas

- `prodesp-mule-intra-mule-http` — portas, headers, `config-local` entre apps
- `prodesp-api-manager-policy-logging` — preset Message Logging (ASCII; update API Manager)
- `prodesp-dev-tools-catalog` — entrada `run-local-v2-acessos-stack` em `.ia/dev-tools.yaml`
- `prodesp-mule-runtime-logging` — logs CH2 (produção); local usar arquivos acima
