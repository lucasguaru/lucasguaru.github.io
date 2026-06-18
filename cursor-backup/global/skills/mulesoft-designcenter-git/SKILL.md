---
name: mulesoft-designcenter-git
description: >-
  Autenticação Git e acesso programático ao Anypoint Design Center (RAML draft),
  API Designer Experience API e anypoint-cli-v4. Usar quando git pull/fetch em
  anypoint.mulesoft.com/git falhar com diálogo de credenciais ou 401, ou ao
  integrar IA/CI com projetos RAML do Design Center. Sem credenciais de org —
  usar variáveis de ambiente do usuário.
---

# MuleSoft Design Center — Git e acesso programático

## Contexto

Projetos RAML no Anypoint Studio/Design Center usam Git interno:

```
https://anypoint.mulesoft.com/git/{organizationId}/{projectId}
```

O `projectId` está no `remote origin` do clone local. **Não** é o mesmo fluxo de autenticação do Exchange/Maven.

## Connected App — scope obrigatório

Para Git, API Designer e CLI `designcenter`:

- **Design Center Developer**

Sem esse scope: HTTP 401/403 mesmo com `client_id`/`client_secret` corretos.

Complementar para publicar no Exchange: Exchange Contributor, View Organization, etc. (ver docs Exchange / API Catalog CLI).

## Autenticação Git — o que funciona

### OAuth token como HTTP Basic (recomendado para automação)

1. Obter token: `POST https://anypoint.mulesoft.com/accounts/api/v2/oauth2/token` com `grant_type=client_credentials`.
2. Git usa **username** qualquer convencionado (`oauth2`, `x-access-token`, `token`) e **password** = `access_token`.
3. Implementar **git credential helper** que, em `get`, lê `host=anypoint.mulesoft.com` e imprime username/password com token **fresco** (expira ~1h).

```ini
[credential "https://anypoint.mulesoft.com"]
    helper = !python /path/to/anypoint_git_credential_helper.py
    useHttpPath = true
```

Alternativa pontual (CI/script):

```bash
GIT_TERMINAL_PROMPT=0 git -c credential.helper= \
  -c "http.extraHeader=Authorization: Bearer $TOKEN" \
  ls-remote "$REMOTE_URL" HEAD
```

### O que NÃO funciona no Git do Design Center

| Método | Motivo |
|--------|--------|
| `~~~Client~~~` + `clientId~?~clientSecret` | Formato para **Exchange/Maven** (`settings.xml`), não para Git interno do Design Center |
| `client_id:client_secret` na URL | 401 `Invalid Login` |
| Login manual salvo no Windows Credential Manager com formato Exchange | Diálogo some mas auth continua falhando |

## API Designer Experience API

Doc: [API designer Experience API](https://anypoint.mulesoft.com/exchange/portals/anypoint-platform/f1e97bc6-315a-4490-82a7-23abe036327a.anypoint-platform/api-designer-experience-api/minor/1.1/pages/home/)

Headers:

```
Authorization: Bearer <access_token>
x-organization-id: <org-uuid>
x-owner-id: <user-uuid>
```

`x-owner-id` = ID do usuário **host** da Connected App (`client_credentials`). Obter via `GET /accounts/api/me` com o mesmo token — campo `user.id`.

Endpoints principais:

- `GET /designcenter/api-designer/projects`
- `GET /designcenter/api-designer/projects/{id}/branches/{branch}/files`
- `GET /designcenter/api-designer/projects/{id}/branches/{branch}/files/{path}`

CLI v4 usa API v2: `/designcenter/api/v2/organizations/{orgId}/projects` — mesmos requisitos de scope.

## CLI

```bash
npm install -g anypoint-cli-v4
export ANYPOINT_CLIENT_ID=...
export ANYPOINT_CLIENT_SECRET=...
export ANYPOINT_ORG=<org-uuid>

anypoint-cli-v4 designcenter project list -o json
anypoint-cli-v4 designcenter project download <project-name> <targetDir>
```

Multi-org: trocar `ANYPOINT_ORG` ou usar `anypoint-cli-v4 conf organization <uuid>` (um `config.json` por máquina).

## MCP MuleSoft

Ferramentas típicas (`search_asset`, etc.) consultam **Exchange** (versão publicada), não o draft do Design Center. Para RAML em edição, usar Git/API/CLI.

## Diagnóstico rápido

```bash
# Token OK?
curl -s -X POST .../oauth2/token -d '{"grant_type":"client_credentials",...}'

# Scope Design Center OK?
curl -s -H "Authorization: Bearer $T" -H "x-organization-id: $ORG" -H "x-owner-id: $OWNER" \
  https://anypoint.mulesoft.com/designcenter/api-designer/projects

# Git OK?
GIT_TERMINAL_PROMPT=0 git ls-remote origin HEAD
```

## Implementação de referência

Projetos com setup completo podem incluir:

- `anypoint_oauth_token.py` — lê `ANYPOINT_CLIENT_ID` / `ANYPOINT_CLIENT_SECRET`
- `anypoint_git_credential_helper.py` — protocolo `git credential get`
- `setup-designcenter-git.sh` — aplica `credential.https://anypoint.mulesoft.com.helper` em cada repo API

Nunca commitar secrets; não registrar token em logs.
