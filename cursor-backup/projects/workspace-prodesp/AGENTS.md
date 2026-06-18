# AGENTS.md — workspace-prodesp

Monorepo local de desenvolvimento MuleSoft (organização de apps e APIs).

## Definição de produto

Regras, telas, cenários e **mapping de integrações** ficam no repositório irmão:

- Path: [`../product-definition/`](../product-definition/)
- Ponte: [`.ia/workspace-links.yaml`](.ia/workspace-links.yaml)

Leia [product-definition/AGENTS.md](../product-definition/AGENTS.md) para escopo de negócio e mapping.

## Neste repo

| Pasta | Conteúdo |
|-------|----------|
| `workspace-prodesp-app/` | Apps Mule |
| `workspace-prodesp-api/` | RAML / contratos |
| `tarefas/` | Mesa de trabalho do dev (planos, rascunhos, insumos) — **não** é backlog oficial |
| `tarefas/deploy-log/` | Registro local de deploys CH2 e publicações Exchange (`registry.yaml`) |
| `.cursor/rules/` | Regras Mule PRODESP |
| `.cursor/skills/` | Skills de implementação (diagramas → skill global; Design Center → `prodesp-designcenter-access`; **run local CLI** → `prodesp-mule-local-runtime`; logs CH2 → `prodesp-mule-runtime-logging`; log de policy API Manager → `prodesp-api-manager-policy-logging`; logs no swimlane → `prodesp-flow-visual-hub`) |

## Gates operacionais

- **RAML commit/publish:** validação explícita do usuário — rule/skill **`prodesp-raml-commit-publish-gate`**
- **Aderência backend (Swagger/doc):** obrigatório antes de fechar contrato ou outbound — rule/skill **`prodesp-backend-spec-alignment`**
- **Deploy CH2 + histórico:** skill **`prodesp-deploy-registry`** → `tarefas/deploy-log/registry.yaml`

## Ferramentas locais (dev)

Catálogo: [`.ia/dev-tools.yaml`](.ia/dev-tools.yaml) — Flow Visual Hub (`npm run start:platform` → http://127.0.0.1:8790), stack Mule local (`run-local-v2-acessos-stack`), CLIs, diagramas.  
Consulta/atualização: skill **`prodesp-dev-tools-catalog`**. Run local sem Studio: skill **`prodesp-mule-local-runtime`** + rule **`prodesp-mule-local-runtime`**.

## Diagramas de sequência

Usar skill global `integration-sequence-diagram` — resolve mapping via `workspace-links.yaml`.

## Backlog oficial

Azure DevOps (OrangeDoor Global Projects / PRODESP).
