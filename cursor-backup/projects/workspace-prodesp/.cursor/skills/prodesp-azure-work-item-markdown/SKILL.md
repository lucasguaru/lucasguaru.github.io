---
name: prodesp-azure-work-item-markdown
description: >-
  Criar ou atualizar work items no Azure DevOps (OrangeDoor Global Projects)
  com Description em Markdown renderizado — não HTML/raw. Usar ao criar tasks,
  PBIs, atualizar descrição de ticket ou quando o usuário reportar "text raw"
  / "convert this field" no Azure.
---

# Azure DevOps — Description em Markdown

## Problema

Por padrão, campos grandes (`System.Description`, Acceptance Criteria, etc.) são **HTML**. Se o conteúdo for enviado só como texto via `az boards work-item create/update --description @arquivo.md`, o Azure mostra **raw text** e oferece "Convert this field".

## Solução obrigatória

No **mesmo** JSON Patch, enviar **valor** + **`multilineFieldsFormat`**:

```json
[
  {
    "op": "replace",
    "path": "/fields/System.Description",
    "value": "<conteúdo markdown>"
  },
  {
    "op": "replace",
    "path": "/multilineFieldsFormat/System.Description",
    "value": "Markdown"
  }
]
```

Regras:

- Conteúdo em **Markdown** (tabelas, links, `##` headings) — não HTML.
- Evitar tags XML no texto (`<cron ...>`) — o editor pode interpretar mal; usar texto plano ou backticks.
- Após salvar como Markdown, **não reverte** para HTML na UI.

## Ferramentas (ordem de preferência)

### 1. MCP `user-azure-devops` — batch com `format`

Preferir **`wit_update_work_items_batch`** (não `wit_update_work_item` nem só `az`):

```json
{
  "updates": [
    {
      "op": "Replace",
      "id": 22003,
      "path": "/fields/System.Description",
      "value": "<markdown>",
      "format": "Markdown"
    }
  ]
}
```

Se a resposta ainda trouxer `"multilineFieldsFormat": { "System.Description": "html" }`, usar REST (passo 2).

**Criar work item:** `wit_create_work_item` ou `wit_add_child_work_items` com campo:

```json
{
  "name": "System.Description",
  "value": "<markdown>",
  "format": "Markdown"
}
```

### 2. REST API (garantia)

Gerar patch com Node (UTF-8) e `curl`:

```bash
node -e "
const fs=require('fs');
const body=fs.readFileSync('C:/caminho/descricao-azure-body.md','utf8');
const patch=[
  {op:'replace', path:'/fields/System.Description', value: body},
  {op:'replace', path:'/multilineFieldsFormat/System.Description', value:'Markdown'}
];
fs.writeFileSync('C:/caminho/patch.json', JSON.stringify(patch));
"

TOKEN=$(az account get-access-token --resource 499b84ac-1321-427f-aa17-267ca6975798 --query accessToken -o tsv)
curl -s -X PATCH \
  "https://dev.azure.com/orangedoorit/_apis/wit/workitems/<ID>?api-version=7.1" \
  -H "Content-Type: application/json-patch+json" \
  -H "Authorization: Bearer $TOKEN" \
  --data-binary "@/c/caminho/patch.json"
```

Validar: resposta com `"multilineFieldsFormat": { "System.Description": "markdown" }`.

### 3. Não usar (sozinho)

| Método | Motivo |
|--------|--------|
| `az boards work-item update --description @file` | Não define `multilineFieldsFormat` → raw/HTML |
| `wit_update_work_item` sem `format` | Idem |
| Patch só em `/multilineFieldsFormat/...` sem valor | Erro 400: "type changed without a value" |

## Fluxo PRODESP (tasks)

1. Redigir em `tarefas/.../descricao-azure.md` (fonte no repo).
2. Copiar corpo (sem cabeçalho meta) para `descricao-azure-body.md` se necessário.
3. Publicar no Azure com MCP batch **`format: Markdown`** ou REST patch acima.
4. Projeto: **OrangeDoor Global Projects** · org: `https://dev.azure.com/orangedoorit`

## Referência

- [Markdown em work items (Microsoft)](https://learn.microsoft.com/en-us/rest/api/azure/devops/wit/work-items/update?view=azure-devops-rest-7.1) — `multilineFieldsFormat`
- Regra complementar: `.cursor/rules/prodesp-azure-task-tracking.mdc`
