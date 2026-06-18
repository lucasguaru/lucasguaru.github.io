---
name: mulesoft-secure-properties
description: >-
  Migração e auditoria de secure properties em apps Mule PRODESP: referências
  secure:: no Mule XML, split z-global-config vs z-global-secured-config,
  hygiene de config-secure-*.yaml vs config-{env}.yaml. Usar ao mover secrets
  para config-secure, revisar PR, ou validar encrypt.key e secure-properties:config.
---

# MuleSoft — Secure Properties (PRODESP)

## Quando usar

- Usuário move credenciais para `config-secure-{env}.yaml`
- Pedido para atualizar referências `${...}` ou `p('...')` para `secure::`
- Revisão de PR com secrets em properties
- Auditoria de `z-global-config.xml` vs `z-global-secured-config.xml`

## Arquitetura alvo

| Arquivo | Conteúdo |
|---------|----------|
| `src/main/mule/common/z-global-config.xml` | HTTP listener, APIKit, autodiscovery, `configuration-properties`, HTTP request configs — **sem** `encrypt.key` nem `secure-properties:config` |
| `src/main/mule/common/z-global-secured-config.xml` | **Único** lugar para `encrypt.key` + `secure-properties:config` |
| `properties/config-{env}.yaml` | Host, port, path, protocol, timeout — **sem** secrets |
| `properties/config-secure-{env}.yaml` | `clientId`, `clientSecret`, `username`, `password`, etc. (criptografados) |

Referência de app migrado: `data-management-integrator-s-api`, `data-adobe-sign-s-api`.

## Checklist do agente

### 1. Global config split

Grep em `src/main/mule/common/`:

```bash
# z-global-config.xml NÃO deve ter:
rg "encrypt\.key|secure-properties:config" src/main/mule/common/z-global-config.xml

# z-global-secured-config.xml DEVE ter ambos:
rg "encrypt\.key|secure-properties:config" src/main/mule/common/z-global-secured-config.xml
```

**Anti-padrão:** `encrypt.key` e `secure-properties:config` duplicados nos dois arquivos.

**Padrão PRODESP (secured file):**

```xml
<global-property name="encrypt.key" value="..." />
<secure-properties:config
    name="secure-properties-config"
    key="${encrypt.key}"
    file="properties/config-secure-${mule.env}.yaml" />
```

`mule-artifact.json` deve listar `encrypt.key` em `secureProperties`.

### 2. Referências no código Mule

Buscar em `src/main/mule/` chaves que existem em `config-secure-*.yaml` **sem** prefixo `secure::`:

| Inseguro | Correto |
|----------|---------|
| `p('tokenIdp.clientId')` | `p('secure::tokenIdp.clientId')` |
| `${itsm.password}` | `${secure::itsm.password}` |
| `p("salesForce.client_secret")` | `p('secure::salesForce.client_secret')` |

```bash
# Exemplo: refs sensíveis sem secure::
rg "p\('(tokenIdp|tokenPoupa|itsm|salesForce)" src/main/mule/
rg "\$\{(tokenIdp|tokenPoupa|itsm|salesForce)\." src/main/mule/
```

**Manter sem `secure::`:** `grantType`, `scope`, `host`, `port`, `path`, `protocol`, `timeout` e demais metadados não sensíveis.

**Exemplo correto** (data-adobe-sign-s-api):

```xml
value="#[&quot;Bearer &quot; ++ p('secure::adobeSign.integrationId')]"
```

### 3. YAML hygiene

Chaves sensíveis **somente** em `config-secure-{env}.yaml`:

```yaml
tokenIdp:     clientId, clientSecret
tokenPoupa:   clientId, clientSecret
itsm:         username, password
salesForce:   client_id, client_secret
salesForce_dev: client_id, client_secret
```

```bash
# Não-secure não deve ter secrets
rg "^\s+(clientId|clientSecret|client_id|client_secret|username|password):" \
  src/main/resources/properties/config-{dev,local,qa,prod}.yaml
```

### 4. Leitura de YAML com segredos

Antes de ler `config-secure-*.yaml` ou `config-{env}.yaml`, aplicar skill **`mulesoft-cursorignore-setup`** (~/.cursor/skills/). Não expor valores criptografados ou plaintext em chat.

Edição de YAML no disco é permitida quando o usuário pede explicitamente (migração, cleanup).

### 5. Deploy CloudHub 2

Para `encrypt.key` em runtime via env, ver skill **`prodesp-mule-ch2-deploy`** (`.cursor/skills/`): `ENCRYPT_KEY_DEV_QA`, `ENCRYPT_KEY_PROD`, `secureProperties` no pom.

## Fluxo de migração

1. **Identificar** chaves movidas para `config-secure-{env}.yaml` (usuário informa ou grep no secure yaml).
2. **Grep** referências em `src/main/mule/` e atualizar para `secure::`.
3. **Consolidar** global config — remover crypto de `z-global-config.xml`; manter só em `z-global-secured-config.xml`.
4. **Limpar** chaves sensíveis dos `config-{env}.yaml` não-secure (manter metadados de conexão).
5. **Validar** com greps do checklist.

## Perguntas ao usuário (AskQuestion)

Antes de consolidar config duplicada, validar:

1. **Estrutura do secured file:** manter `secure-properties-config` (template PRODESP) vs `secure-properties_config` (legado com Blowfish)?
2. **Código comentado:** atualizar blocos `[STUDIO:...]` com refs sensíveis?
3. **Cleanup YAML:** remover duplicatas dos não-secure agora ou só XML?
4. **encrypt.key:** valor local de dev vs placeholder template vs env CH2?

## Validação final

```bash
APP=workspace-prodesp-app/<artifactId>

# Zero refs sensíveis sem secure:: no Mule
rg "p\('(tokenIdp|tokenPoupa|itsm|salesForce)[^']*'\)" "$APP/src/main/mule/" \
  | rg -v "secure::" || true

# Global config limpo
rg "encrypt\.key|secure-properties" "$APP/src/main/mule/common/z-global-config.xml" && echo FAIL || echo OK

# Secured config presente
rg "encrypt\.key|secure-properties:config" "$APP/src/main/mule/common/z-global-secured-config.xml"
```

Build opcional: `mvn clean package -Dmule.env=local` no diretório do app.
