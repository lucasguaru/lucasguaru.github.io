# Diagrama swimlane vertical — fluxo Mule (PRODESP)

Crie ou atualize um diagrama **swimlane vertical** (CSV de colunas → HTML) para um flow Mule do workspace PRODESP.

## Parâmetros

O usuário pode informar após o comando (ou na mesma mensagem):

| Parâmetro | Exemplo | Obrigatório |
|-----------|---------|-------------|
| **Flow** | `credenciais-job-recente_flow`, `pagamentos-job-recente_flow` | Sim — se omitido, **perguntar** |
| **App Mule** | `management-payments-receipts-s-api` | Inferir do flow ou perguntar |
| **Modo** | `novo` (pasta ainda não existe) · `continuar` (já existe em `tarefas/`) | Inferir |

**Não** usar este comando para diagrama **horizontal** (board) — nesse caso, skill `mulesoft-flow-visual-diagram` em `tarefas/mapeamento-visual-flows/`.

## Regras desta execução

1. Siga a skill **`prodesp-flow-visual-csv-first`** (fluxo completo + regras de colunas).
2. Regras de layout: `tarefas/mapeamento-visual-flows/regras-layout-colunas-choice.md`.
3. Referência implementada: `tarefas/pagamentos-job-recente-visual/`.
4. **Gate CSV:** pare e peça validação no Excel **antes** de tratar o layout como final (salvo protótipo descartável).
5. App Mule: resolver em `workspace-prodesp-app/{asset}/` (regra `mulesoft-workspace`).

## Passos

### A. Pasta nova (`tarefas/{slug}-visual/` não existe)

1. Rodar scaffold (substituir `{slug}` pelo slug curto, ex. `credenciais-job-recente`):

```bash
node .cursor/skills/prodesp-flow-visual-csv-first/scripts/scaffold-flow-visual.js \
  --slug {slug} \
  --flow {nome-do-flow}
```

2. Ler XML do flow + subflows (`flow-ref`), README e `sequencia.puml` se existir em `workspace-prodesp-app/{asset}/docs/fluxos/`.
3. Montar **`data/{flow}_flow.json`** (nós mgmt, links, `muleApp` onde aplicável).
4. Montar **rascunho** de **`data/{flow}_flow-layout-comma.csv`** a partir do template `tarefas/mapeamento-visual-flows/templates/flow-layout-colunas-template.csv`.
5. **Parar** e pedir ao usuário validar o CSV no Excel (UTF-8 BOM, vírgula — regra `csv-utf8-excel`).

### B. Pasta existente ou CSV já aprovado

1. Editar CSV / `flow.json` / `layout-node-aliases.json` conforme pedido.
2. Gerar posições:

```bash
cd tarefas/{slug}-visual
node scripts/apply-layout-from-csv.js
```

3. Corrigir `unresolved` no stdout (aliases ou CSV).
4. Indicar abrir `index.html` (Live Server).

### C. Encerramento

- Resumir: pasta criada/alterada, arquivos tocados, pendências (CSV para validar, títulos para alinhar `doc:name` no XML).
- Se o usuário aprovar títulos de negócio: alinhar `doc:name` no XML Mule correspondente.

## Exemplos de invocação

```
/fluxo-visual credenciais-job-recente_flow
/fluxo-visual pagamentos-job-recente_flow continuar
/fluxo-visual
```

## Nunca

- Publicar layout definitivo sem CSV validado pelo usuário (salvo protótipo explícito).
- Incluir request **proxy** mgmt→outra Mule app no diagrama quando a lógica está na app destino (expandir nós internos + `muleApp`).
- Confundir com diagrama horizontal em `mapeamento-visual-flows/`.
