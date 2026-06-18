# Cursor — backup de rules, skills e config

Snapshot: **2026-06-17**

Backup organizado do que o agente usa no Cursor: config **global** (usuário) e **por projeto** (`workspace-prodesp`).

## Estrutura

```text
cursor-backup/
├── README.md
├── global/                          # ~/.cursor (máquina do dev)
│   ├── rules/                       # 12 rules (.mdc)
│   ├── skills/                      # 7 skills (SKILL.md)
│   ├── skills-cursor/               # skills gerenciados pelo Cursor
│   ├── hooks/                       # hooks globais (yaml proxy, block-sensitive)
│   ├── hooks.json
│   └── mcp.json.example             # mcp.json com segredos redigidos
└── projects/
    └── workspace-prodesp/           # monorepo PRODESP
        ├── AGENTS.md
        ├── .ia/                     # dev-tools.yaml, workspace-links.yaml
        └── .cursor/
            ├── rules/               # rules do projeto
            ├── skills/              # skills do projeto
            ├── commands/
            ├── hooks/
            ├── mappings/
            └── scripts/
```

## Origem

| Destino no backup | Caminho original |
|-------------------|------------------|
| `global/` | `C:\Users\lucas\.cursor\` |
| `projects/workspace-prodesp/` | `C:\workspace-orange\workspace-prodesp\` |

## Excluído de propósito

- `.cursor/redacted/` (YAML proxy com dados sensíveis)
- Artefatos temporários Azure (`wi*.json`, `pbi*.json`, `patch-*.json`)
- `mcp.json` original — só `mcp.json.example` com `***REDACTED***` em client_id/secret e Bearer tokens

## Restaurar

Copiar de volta para os paths originais (revisar `mcp.json` manualmente com credenciais reais).

```bash
# Exemplo — projeto PRODESP
cp -r projects/workspace-prodesp/.cursor/* /c/workspace-orange/workspace-prodesp/.cursor/
cp projects/workspace-prodesp/AGENTS.md /c/workspace-orange/workspace-prodesp/
```
