---
name: npm-dev-menu
description: >-
  Adiciona menu interativo `npm start` com dropdown de scripts npm usando
  @clack/prompts. Use quando o usuário pedir npm start, menu de comandos,
  não decorar scripts, launcher interativo, ou lembrar a lib do dropdown estilo Vite.
---

# Menu interativo npm start

## Objetivo

Um único comando (`npm start`) abre menu no terminal para escolher o que rodar, sem decorar `dev:api`, `codegen:login`, etc.

## Lib padrão (fixa)

**Sempre `@clack/prompts`** — menu com setas ↑↓, `intro`/`outro`, cancelamento com Esc. Não usar `@inquirer/prompts` salvo pedido explícito do usuário.

Para rodar **dois serviços juntos**, use **`concurrently`**.

## Implementação padrão

1. `scripts/dev-menu.mjs` na raiz do repo
2. `"start": "node scripts/dev-menu.mjs"` em `package.json`
3. `devDependencies`: `@clack/prompts`, `concurrently` (se houver stack dupla)
4. Listar scripts reais do projeto em `OPCOES` — labels em português, `hint` curto
5. `spawn('npm', ['run', script], { stdio: 'inherit', shell: true })`
6. Guard `process.stdin.isTTY` para CI

## Template mínimo

```javascript
import { spawn } from "node:child_process";
import { cancel, intro, isCancel, outro, select } from "@clack/prompts";

const OPCOES = [
  { value: "dev", label: "Desenvolvimento", hint: "..." },
  { value: "build", label: "Build", hint: "..." },
];

// select → spawn npm run → outro
```

## Ao criar projeto novo

- Sempre adicionar `npm start` + menu quando houver **3+ scripts** de dev/automação
- Agrupar mentalmente: dev stack, automação, build/test
- Atualizar README: "Use `npm start` para escolher no menu"
- Não duplicar lógica — menu só chama scripts já existentes em `package.json`

## Este repo (nota-fiscal-automatica)

Menu em `scripts/dev-menu.mjs`. Opções: stack, API, web, login, codegen, build, teste cálculo.
