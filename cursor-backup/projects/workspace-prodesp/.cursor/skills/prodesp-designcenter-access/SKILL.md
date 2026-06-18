---
name: prodesp-designcenter-access
description: >-
  Acessa projetos RAML do Design Center PRODESP via Git (credential helper),
  API Designer Experience API e anypoint-cli-v4. Usar ao ler/sincronizar
  workspace-prodesp-api sem Studio, configurar git do Design Center, ou
  troubleshooting 401/403 no remote anypoint.mulesoft.com/git.
---

# Design Center PRODESP — acesso programático

## Quando usar

- `git fetch` / `git pull` em `workspace-prodesp-api/{asset}/` sem diálogo de credenciais
- Ler RAML **draft** no Design Center (não só versão publicada no Exchange)
- Automatizar listagem/download via API ou CLI

## Credenciais (não commitar)

| Variável | Valor PRODESP |
|----------|----------------|
| `ANYPOINT_CLIENT_ID` | Connected App local |
| `ANYPOINT_CLIENT_SECRET` | Client secret local |
| `ANYPOINT_ORG` | `1c8711d7-2135-4686-89f0-fb014e1662ac` |

**x-owner-id** (API Designer): `a1651c01-f9c1-422b-abd5-ee207ae60afd` — usuário host da Connected App. Confirmar com:

```bash
curl -s -H "Authorization: Bearer $(py -3 .cursor/scripts/anypoint_oauth_token.py)" \
  https://anypoint.mulesoft.com/accounts/api/me
```

## Connected App — scopes

Obrigatório para Design Center:

- **Design Center Developer**

Complementares (já usados no fluxo Exchange):

- API Catalog Contributor, View Organization, View Environment, Exchange Contributor

## Project IDs (Git remote)

Extraídos do `origin` em cada asset:

| Asset | project-id |
|-------|------------|
| `portal-ecom-tech-e-api` | `b776be17-1a50-47be-abf0-d02dce83c182` |
| `data-integrator-p-api` | `09c89bb0-b891-4495-a484-f918dddd313a` |
| `data-wallet-integrator-s-api` | `dc0b4760-d7d9-4a79-9ab6-0d7e9beec35d` |

## 1) Git — credential helper (recomendado)

### Setup

```bash
bash .cursor/scripts/setup-designcenter-git.sh
```

Se o teste falhar com 401 após o setup, reconfigurar **sem aspas** no path (bug do `git config` no Windows):

```bash
cd workspace-prodesp-api/data-wallet-integrator-s-api
git config --local --unset-all credential.https://anypoint.mulesoft.com.helper
git config --local credential.https://anypoint.mulesoft.com.helper \
  "!py -3 /c/workspace-orange/workspace-prodesp/.cursor/scripts/anypoint_git_credential_helper.py"
```

Configura em cada repo `workspace-prodesp-api/*/.git` (substitui `credential.helper=manager` global — evita Git Credential Manager abrir diálogo antes do helper OAuth):

```ini
credential.helper=
credential.helper=!py -3 /c/workspace-orange/workspace-prodesp/.cursor/scripts/anypoint_git_credential_helper.py
credential.https://anypoint.mulesoft.com.useHttpPath=true
```

O helper obtém token fresco via `ANYPOINT_CLIENT_ID` / `ANYPOINT_CLIENT_SECRET` e responde ao Git com `username=oauth2` e `password=<access_token>`.

### Validar

```bash
cd workspace-prodesp-api/data-wallet-integrator-s-api
GIT_TERMINAL_PROMPT=0 git ls-remote origin HEAD
```

Sucesso: linha `hash  HEAD`.

### O que NÃO funciona no Git do Design Center

- `~~~Client~~~` + `clientId~?~clientSecret` (formato Exchange/Maven)
- `client_id:client_secret` na URL
- Credencial salva no Windows Credential Manager sem o helper (diálogo ou 401)

## 2) API Designer Experience API

Doc: [API designer Experience API](https://anypoint.mulesoft.com/exchange/portals/anypoint-platform/f1e97bc6-315a-4490-82a7-23abe036327a.anypoint-platform/api-designer-experience-api/minor/1.1/pages/home/)

Headers em toda requisição:

```
Authorization: Bearer <access_token>
x-organization-id: 1c8711d7-2135-4686-89f0-fb014e1662ac
x-owner-id: a1651c01-f9c1-422b-abd5-ee207ae60afd
```

Endpoints úteis:

```bash
TOKEN=$(py -3 .cursor/scripts/anypoint_oauth_token.py)
ORG=1c8711d7-2135-4686-89f0-fb014e1662ac
OWNER=a1651c01-f9c1-422b-abd5-ee207ae60afd

# Listar projetos
curl -s -H "Authorization: Bearer $TOKEN" -H "x-organization-id: $ORG" -H "x-owner-id: $OWNER" \
  https://anypoint.mulesoft.com/designcenter/api-designer/projects

# Listar arquivos (branch master)
curl -s -H "Authorization: Bearer $TOKEN" -H "x-organization-id: $ORG" -H "x-owner-id: $OWNER" \
  "https://anypoint.mulesoft.com/designcenter/api-designer/projects/<project-id>/branches/master/files"
```

## 3) CLI

```bash
export ANYPOINT_ORG=1c8711d7-2135-4686-89f0-fb014e1662ac
anypoint-cli-v4 designcenter project list portal-ecom-tech-e-api -o json
anypoint-cli-v4 designcenter project download portal-ecom-tech-e-api ./tmp-download
```

Instalação: `npm install -g anypoint-cli-v4` (plugin designcenter embutido no v4).

Alias multi-cliente: não há profiles nativos — usar env vars ou `anypoint-cli-v4 conf client_id …` em `%APPDATA%\anypoint-cli-v4-nodejs\Config\config.json` por máquina.

## 4) MCP (user-mulesoft-prodesp)

- `search_asset` — metadados/versão no **Exchange** (publicado)
- Não há tool para ler draft do Design Center; usar Git/API/CLI acima

## Troubleshooting

| Sintoma | Causa |
|---------|--------|
| Diálogo de credenciais repetido | `credential.helper=manager` sem helper Anypoint; rodar `setup-designcenter-git.sh` |
| Git 401 `Invalid Login` | Scope Design Center Developer ausente ou token antigo |
| API 403 / CLI 401 | Idem |
| `~~~Client~~~` não aparece no Credential Manager | Normal — Git do Design Center não usa esse formato |
| Exchange OK, Design Center falha | Scopes diferentes; adicionar Design Center Developer |

## Scripts do workspace

| Script | Função |
|--------|--------|
| `.cursor/scripts/anypoint_oauth_token.py` | Emite `access_token` (stdout) |
| `.cursor/scripts/anypoint_git_credential_helper.py` | Git credential helper |
| `.cursor/scripts/setup-designcenter-git.sh` | Aplica config nos repos API |

Conhecimento genérico (sem credenciais PRODESP): skill global `mulesoft-designcenter-git`.
