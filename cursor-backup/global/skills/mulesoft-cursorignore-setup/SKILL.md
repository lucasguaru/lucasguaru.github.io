---
name: mulesoft-cursorignore-setup
description: >-
  Em workspaces MuleSoft (src/main/mule, properties/config*.yaml, mule-maven-plugin),
  verifica .cursorignore antes de ler YAML em src/main/resources e sugere criar ou
  completar padrões (config-secure, resources yaml, !.cursor/redacted, .env).
  Usar ao ler config-dev/prod/qa, properties YAML, ou quando o usuário mencionar
  cursorignore, segredos em properties ou proxy YAML/hooks globais.
---

# MuleSoft — `.cursorignore` para properties YAML

Complementa hooks globais em `~/.cursor/hooks/` (proxy de redação). O `.cursorignore` é **por repositório**; reduz indexação e leitura casual do original com segredos. **Escrita** no arquivo real no disco continua possível quando o usuário pedir edição explícita.

## Quando aplicar

1. Workspace parece Mule: `src/main/mule/`, `pom.xml` com `mule-maven-plugin`, ou `src/main/resources/properties/config*.yaml`.
2. Vai usar **Read**, **Grep** ou **@** em YAML sob `src/main/resources/` (exceto `.cursor/redacted/`).
3. Leitura falhou (ignore, hook, Permission denied) ou o usuário pergunta sobre segredos/properties.

**Não** aplicar para: RAML só em `*-api/` sem app Mule, `product-definition/**`, mappings fora de `src/main/resources`.

## Checklist (antes da primeira leitura de properties no chat)

### 1. Raiz do workspace

Pasta aberta no Cursor (monorepo ou app único). Em monorepos (ex. `workspace-prodesp` + `workspace-prodesp-app/*`), o `.cursorignore` na **raiz** cobre todos os apps — não é necessário um por app.

O script detecta `layout: "monorepo"` vs `"single-app"`.

### 2. Verificar `.cursorignore`

```bash
py -3 ~/.cursor/skills/mulesoft-cursorignore-setup/scripts/check_cursorignore.py "<caminho-workspace>"
```

| Resultado JSON | Ação |
|----------------|------|
| `is_mule: false` | Não usar esta skill |
| `ok: true` | Prosseguir com Read (hooks + `.cursor/redacted/`) |
| `suggest_create: true` | Sugerir **criar** `.cursorignore` (template: `cursorignore-template.txt` nesta skill) |
| `missing_patterns` com itens | Sugerir **adicionar** só as linhas que faltam |

### 3. Comunicar ao usuário (no máximo uma vez por conversa)

Em português, de forma curta:

- O que falta no `.cursorignore` e por quê.
- Hooks globais redigem no Read; o ignore evita bypass se o hook falhar.
- Perguntar se deve **criar ou atualizar** o arquivo — **só alterar com confirmação explícita**.

### 4. Depois do ignore alinhado

- Preferir **Read** em `config-{env}.yaml` (não `config-secure-*` sem necessidade).
- **Nunca** escrever `***REDACTED***` no YAML original.
- **Grep** em YAML resources: usar Read (hooks bloqueiam Grep no original).

## Padrões obrigatórios

- `**/src/main/resources/**/config-secure-*.yaml`
- `**/src/main/resources/**/config-secure-*.yml`
- `**/src/main/resources/**/*.yaml`
- `**/src/main/resources/**/*.yml`
- `!.cursor/redacted/**`
- `**/.env`
- `**/.env.*`

## Template completo

Ver `cursorignore-template.txt` neste diretório da skill.

## Relacionado

- Rule: `~/.cursor/rules/mule-yaml-proxy.mdc`
- Hooks: `~/.cursor/hooks.json`
- Repo PRODESP (se existir): seção *Properties YAML e hooks* em `mulesoft-workspace`

## Leitura bloqueada no chat

Se Read/Grep falhar após o ignore alinhado, seguir skill **`mule-yaml-sensitive-access`** (perguntar ao usuário; não usar shell no YAML original). Regra global: `mule-yaml-agent-policy.mdc`.
