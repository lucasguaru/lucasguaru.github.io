# Run local — data-integrator-p-api

> **Atualizado:** ver skill canônica **`prodesp-mule-local-runtime`** (`.cursor/skills/prodesp-mule-local-runtime/SKILL.md`) e script `workspace-prodesp-app/scripts/run-local-v2-acessos-stack.sh`.

## Pre-requisitos

- JDK **17** (ex.: `C:\Users\lucas\AnypointCodeBuilder\java\jdk-17.0.13+11`)
- Maven + dependencias Exchange resolvidas (settings.xml com servidor Anypoint)
- Runtime **Mule DX** (extensão Cursor) — **nao** standalone `AnypointCodeBuilder/runtime/` (`LicenseException`)

## Variavel de ambiente `mule.env`

Padrao no repo: **`local`** (`z-global-config.xml` + `config-local.yaml`). Wallet local em `localhost:8085`.

## Passos — stack CLI (recomendado)

```bash
export JAVA_HOME="/c/Users/lucas/AnypointCodeBuilder/java/jdk-17.0.13+11"
cd workspace-prodesp-app/scripts
cp .anypoint-local.env.example .anypoint-local.env   # credenciais API Platform
./run-local-v2-acessos-stack.sh start
```

**Nao usar:** `mvn mule:run` nem `mule.bat start` (servico Windows `0x424`).

## Passos — Anypoint Studio

1. Importar projeto `data-integrator-p-api`.
2. Run As → Mule Application.
3. VM options: `-Dmule.env=dev`.
4. Confirmar `config-dev.yaml` com host HTTPS da wallet.

## Teste POST empresa (piloto HTTP)

```http
POST http://localhost:8081/empresas
Authorization: Bearer <token>
client_id: <se aplicavel>
client_secret: <se aplicavel>
x-global-correlation-id: <opcional>
x-transaction-id: <opcional>
Content-Type: application/json

{ ... body empresa ... }
```

**Verificar nos logs:**

- Linha `Contexto de rastreio na entrada:` com `vars.context`.
- Chamada a wallet com `x-source-system` = `data-integrator-p-api`.
- `x-parent-correlation-id` = mesmo valor de `x-global-correlation-id` do context.

## Troubleshooting

| Problema | Acao |
|----------|------|
| BUILD FAILURE `Could not find goal 'run'` | Usar `package` + standalone, nao `mule:run` |
| Carrega `config-local.yaml` | `-Dmule.env=dev` nao aplicado |
| 401 na wallet | `Authorization` / client_id no `config-dev` |
| SSL/host | Conferir `protocol`/`port`/`host` em `requestDataWallet` |
