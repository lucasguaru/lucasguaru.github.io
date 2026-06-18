# User hooks — proxy YAML Mule (global)

Aplicam-se a **todos** os workspaces do Cursor neste usuário.

## Arquivos

- `redact_yaml.py` — chaves sensíveis e redação
- `yaml-read-proxy.py` — preToolUse Read/Grep
- `block-sensitive.py` — beforeReadFile / shell

## Por workspace

Cada repo deve ter `.cursorignore` alinhado (ver rule `mule-yaml-proxy` em `~/.cursor/rules/`).

Cache: `<workspace>/.cursor/redacted/`

## Teste (a partir de um repo Mule)

```bash
py -3 ~/.cursor/hooks/run-tests.py
```

(ajuste `WORKSPACE` em run-tests se necessário)
