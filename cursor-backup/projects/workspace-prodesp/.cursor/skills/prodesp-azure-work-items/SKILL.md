---
name: prodesp-azure-work-items
description: Criar e gerenciar work items (Task/PBI) no Azure DevOps para o PRODESP usando MCP `user-azure-devops`, garantindo AreaPath/IterationPath corretos e vínculo de parent/child. Use quando o usuário pedir para criar tasks no Azure, vincular ao PBI parent, comentar/atualizar work item, ou quando houver erro TF237111 de permissão de area path.
disable-model-invocation: true
---

# PRODESP — Azure DevOps Work Items (MCP)

## Escopo

Este skill padroniza como criar/atualizar **work items** (especialmente **Task**) no Azure DevOps, no projeto:

- `OrangeDoor Global Projects`

Usa o MCP:

- server: `user-azure-devops`

## Regra crítica — TF237111 (permissão de AreaPath)

Se ao criar work item aparecer:

`TF237111: The current user does not have permissions to save work items under the specified area path.`

Então **não** crie sem setar `areaPath/iterationPath`. Faça assim:

1) Leia o parent (ex.: PBI) com `wit_get_work_item` e copie:

- `System.AreaPath`
- `System.IterationPath`

2) Crie o work item/child explicitando `areaPath` e `iterationPath` com os mesmos valores do parent.

## Criar Task filha de um PBI (recomendado)

Preferir `wit_add_child_work_items` porque já cria o vínculo parent/child.

Passos:

1) `wit_get_work_item` no parent id (ex.: PBI #21304).
2) `wit_add_child_work_items` com:
   - `project`: `OrangeDoor Global Projects`
   - `parentId`: ID do PBI
   - `workItemType`: `Task`
   - `items[0].title`: título
   - `items[0].description`: descrição em Markdown (com links e paths)
   - `items[0].areaPath`: `System.AreaPath` do parent
   - `items[0].iterationPath`: `System.IterationPath` do parent

## Atualizar descrição/campos do work item

Usar `wit_update_work_item` para:

- ajustar título/descrição
- adicionar tags (`System.Tags`)
- mudanças de estado (se aplicável)

## Linkar work items (fallback)

Se o child já existir e precisar vincular:

- `wit_work_items_link` com `type: parent` ou `child` conforme necessidade.

## Convenções PRODESP (tarefas/)

Se a task for criada e houver pasta em `tarefas/`, renomear pasta local para o padrão:

`TASK <id>-<slug>/`

Ex.: `TASK 21890-seguranca-client-credentials/`

