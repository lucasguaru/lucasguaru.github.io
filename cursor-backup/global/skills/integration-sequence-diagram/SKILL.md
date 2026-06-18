---
name: integration-sequence-diagram
description: Criar diagramas de sequência PlantUML em nível integração (apps + HTTP endpoints). Classifica pedido genérico (OAuth, SAML) vs projeto; resolve mapping via product-definition ou workspace-links.yaml. Usar quando pedir diagrama de sequência, documentação de fluxo, integração entre sistemas ou sequencia.puml.
---

# Diagramas de sequência — integração

## Níveis de detalhe

| Nível | Default | Conteúdo | Omitir |
|-------|---------|----------|--------|
| **integração** | Sim | Apps, backends externos, `METHOD /path`, gatilhos, `alt`/`opt` de negócio | Subflows, `flow-ref`, APIKit, DWL, `c-get-access-token`, setas `App -> App` internas |
| **implementação** | Só se pedir | Tudo acima + subflows, transforms | — |

Palavras-chave para implementação: "nível implementação", "com subflows", "detalhe Mule".

---

## Passo 0 — Classificar pedido

### Modo genérico (sem mapping)

Pedidos educacionais ou padrões conhecidos **sem** apps/endpoints do projeto:

- Ex.: "diagrama OAuth 2.0 authorization code", "fluxo SAML", "login JWT"

→ Gerar PlantUML direto. **Não** procurar mapping.

### Modo projeto

Acionar quando houver: nomes de apps Mule (`*-s-api`, `*-p-api`), endpoints `/v1/...`, referência a `product-definition`, domínio/regra BR-*, PBI PRODESP, ou `@product-definition`.

→ Seguir resolução de mapping (passo 1).

---

## Passo 1 — Resolver mapping (modo projeto)

Ordem de resolução:

1. **`workspace-links.yaml`** em qualquer root do workspace:
   - `.ia/workspace-links.yaml`
   - Campos: `productDefinition.path`, `productDefinition.mappings`
2. **Pasta `product-definition/`** no workspace:
   - Ler `.ia/project.md`
   - Mapping: `mappings/mulesoft-integrations.yaml` (ou path em `project.md`)
3. **Path explícito** do usuário
4. **Não encontrado** → mensagem:

```
Não encontrei mapping de integração.

Opções:
a) Informar caminho do YAML de mapping
b) Adicionar repo product-definition ao workspace (recomendado)
c) Gerar bootstrap do mapping (scan único no código) — confirmar?
d) Criar repo product-definition para regras, telas e integrações versionadas
```

Se `product-definition` existir mas mapping ausente → ler `.ia/project.md` para path canônico e oferecer bootstrap.

---

## Passo 2 — Usar mapping

1. Localizar integração por `id`, endpoint, app alvo ou `entryPoint.id`
2. **Exibir** tabela Relacionamento (primeira app → backend) antes de gerar arquivos
3. Múltiplos `entryPoints` → avisar N origens; sugerir um `.puml` por origem; aguardar confirmação
4. Validar no código **somente** se: mapping incompleto, refresh solicitado, ou nível implementação

---

## Passo 3 — PlantUML (nível integração)

### Participantes

Apps Mule, schedulers/gateways na borda, backends (`Salesforce`, `Wallet Dados`, etc.).

### Setas

- Entre apps: **`GET /v1/empresas`**, **`POST /v1/pedidos/compra`** — incluir prefixo de versão do contrato
- Para backend externo: path real (ex. `POST /pedidos-compra` no Wallet — ler properties da s-api se necessário)
- **Proibido** no nível integração: `Mgmt -> Mgmt : subflow`, tags plugin Exchange

### Gatilhos de entrada

| type | Label exemplo |
|------|----------------|
| rest | `POST /v1/pagamentos/callback` |
| scheduler | `job credenciais (2 min)` |

### Respostas

`response` ou `JSON pedido` — sem `HTTP response`.

---

## Passo 4 — Onde salvar (modo projeto)

Default: app de entrada, no repo Git da app:

```
{repo-app}/docs/fluxos/{caso}/{origem}/
├── README.md
└── sequencia.puml
```

Rascunhos de dev: `tarefas/` no workspace de dev — não em product-definition.

README: cadeia por endpoints HTTP; links Git relativos ou Azure DevOps (`git remote get-url`). **Nunca** `workspace-prodesp-app/` em docs commitados.

---

## Exportar PNG para Markdown / Azure DevOps

Repositórios Git (ex.: `product-definition`) **não renderizam** `.puml` no browser. Gerar PNG (ou SVG) e referenciar no README com `![legenda](arquivo.png)`.

### Instalação PlantUML (máquina do dev)

**Não** baixar `plantuml.jar` do GitHub em `/tmp` nem procurar jar no projeto. Usar, nesta ordem:

1. Comando **`plantuml`** no `PATH` (wrapper em `~/bin/plantuml` no Windows do Lucas)
2. Variável **`PLANTUML_JAR`** apontando para o jar
3. JAR canônico fixo: **`C:\workspace\plantuml\plantuml.jar`** (versão atual do time: 1.2026.2)

Outras cópias na máquina (não usar para export/commit pelo agente):

| Local | Notas |
|-------|--------|
| `C:\workspace\plantuml\plantuml-1.2026.2.jar` | Duplicata do mesmo arquivo; pode remover ou manter só `plantuml.jar` |
| `~/.cursor/extensions/jebbs.plantuml-*/plantuml.jar` | Jar embutido na extensão VS Code/Cursor — **versão diferente** da canônica |
| `/tmp/plantuml.jar` | Download temporário de sessões anteriores — ignorar |

**Pré-requisitos:** JDK no `PATH` (`java`) e **Graphviz** (`dot` no PATH) para PNG/SVG.

**Wrapper global (Git Bash):** `~/bin/plantuml` executa:

```bash
java -Dfile.encoding=UTF-8 -jar "$PLANTUML_JAR" -charset UTF-8 "$@"
```

com `PLANTUML_JAR` default `C:/workspace/plantuml/plantuml.jar`.

**Atualizar o jar:** substituir `C:\workspace\plantuml\plantuml.jar` pelo download em [plantuml.com/download](https://plantuml.com/download); validar com `plantuml -version`.

**Cursor / VS Code (User settings, opcional mas recomendado):**

```json
"plantuml.jar": "C:\\workspace\\plantuml\\plantuml.jar",
"plantuml.render": "Local",
"plantuml.jarArgs": ["-charset", "UTF-8"],
"markdown-preview-enhanced.plantumlJarPath": "C:\\workspace\\plantuml\\plantuml.jar"
```

**Variável de ambiente (opcional):** `PLANTUML_JAR=C:\workspace\plantuml\plantuml.jar` no Windows (User ou System).

### Acentuação PT-BR (obrigatório)

- Salvar `.puml` em **UTF-8** (sem alterar para ANSI/Windows-1252).
- PlantUML usa **`windows-1252` por default** (`-charset`); sem override, `integração` vira `integraÃ§Ã£o` no PNG.
- Preferir o wrapper (já inclui charset):

```bash
plantuml -tpng caminho/diagrama.puml
```

Equivalente explícito:

```bash
java -Dfile.encoding=UTF-8 -jar "C:/workspace/plantuml/plantuml.jar" -charset UTF-8 -tpng caminho/diagrama.puml
```

**Nome do PNG:** com `@startuml sequencia` no arquivo `sequencia.puml`, a saída é `sequencia.png` na mesma pasta. Rodar o comando no diretório do `.puml` ou passar caminho completo.

### Fonte (Graphviz / PNG no Windows)

Se acentos ainda falharem no PNG (quadrados ou caracteres omitidos), definir fonte Unicode no diagrama ou include compartilhado:

```plantuml
skinparam defaultFontName "Segoe UI"
```

Em `product-definition`, C4 inclui `dominios/_shared/c4-styles.puml` após C4-PlantUML (já com `Segoe UI`).

### Validar antes de commitar

1. Abrir o PNG gerado e conferir títulos/legendas com `ç`, `ã`, `õ`, `é`.
2. Ou gerar SVG temporário (`-tsvg`) e buscar entidades corretas (`&#231;` = ç, `&#227;` = ã).
3. Após alterar `.puml`, **apagar PNG antigo** ou usar `-nometadata` se trocou charset — metadados em PNG antigo podem induzir skip incorreto.

### Onde commitar imagens

| Contexto | Pasta |
|----------|--------|
| Sequência por app | `{repo-app}/docs/fluxos/.../` |
| C4 por domínio | `product-definition/dominios/{dominio}/diagramas/` |

Commitar **`.puml` + PNG** juntos; README com embed markdown.

---

## Perfil MuleSoft (modo projeto + apps Mule)

Camadas: `-e-api`, `-p-api`, `-s-api`.

Documentação commitada: só HTTP entre apps, não operação plugin (`cadastrar-um-novo-pedido`).

Para implementação Mule: skills do projeto (`mulesoft-app-implementation`, `mulesoft-api-spec`).

Backend Wallet: paths em `config-{env}.yaml` (`wallet.*Path`); GET v2 vs POST legacy conforme properties.

---

## Bootstrap de mapping (sob confirmação)

Scan único quando mapping ausente:

1. `pom.xml` → grafo `mule-plugin-*`
2. Flows APIKit → endpoints expostos
3. Listeners/schedulers → entry points
4. `http:request` / plugin tags → arestas entre apps

Gravar em `product-definition/mappings/mulesoft-integrations.yaml` — **nível integração** (sem subflows).

Atualizar `.ia/project.md` se path diferente.

---

## Manutenção

Drift detectado (rg encontra caller novo) → atualizar mapping no **product-definition**, não no monorepo de dev.

Regras de negócio: `product-definition/dominios/` — ler frontmatter `integrations` para contexto.

---

## Referências por repo

| Repo | Arquivo |
|------|---------|
| product-definition | `.ia/project.md`, `mappings/mulesoft-integrations.yaml` |
| workspace de dev | `.ia/workspace-links.yaml`, `AGENTS.md` |
