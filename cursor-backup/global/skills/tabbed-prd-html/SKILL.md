---
name: tabbed-prd-html
description: >-
  Cria documentos HTML tipo PRD com layout 2 colunas (texto à esquerda, diagramas à
  direita), navegação por abas sincronizada com o painel visual, e estilo escuro
  autocontido. Usar quando o usuário pedir PRD em HTML, documento de processo
  interativo, alinhamento antes de implementar, ou diagrama de fluxo em abas para
  monitor largo.
---

# Tabbed PRD HTML

Gera um único arquivo `.html` autocontido para alinhar processo/escopo **antes** de implementar código.

## Quando usar

- Usuário quer **entender o processo** antes de codar
- Feature complexa com múltiplas fases (import, parse, match, UI)
- Monitor largo: layout **2 colunas** explícito
- Documento reutilizável: abrir no navegador, compartilhar, versionar em `docs/`

## Estrutura obrigatória

```
docs/{feature}-prd.html   (ou caminho que o usuário indicar)
```

**Um único arquivo** — sem CDN, sem build, sem fetch. CSS e JS inline.

### Layout

| Zona | Conteúdo |
|------|----------|
| Header | Título + meta (projeto, data, status) |
| Nav tabs | Abas horizontais — uma por seção |
| Coluna esquerda (~52%) | Texto: objetivo, passos, tabelas, callouts, decisões |
| Coluna direita (~48%) | Visual **sincronizado** com a aba ativa |

### Comportamento das abas

- Clicar na aba troca **seção esquerda** e **diagrama direito** juntos
- Cada seção: `article.section` com `id` = `data-tab` do botão
- Cada visual: `div.visual` com `data-visual` = mesmo id
- JS mínimo: `activate(tabId)` alterna classes `.active`
- `aria-selected` e `role="tabpanel"` para acessibilidade básica

### Seções típicas (adaptar ao domínio)

1. **Visão geral** — contexto, o que existe, o que falta
2. **Fluxo hoje** — processo manual atual do usuário
3. **Fluxo proposto** — ciclo v1 passo a passo
4. **Técnico A** — ex.: importação, parsing, modelo de dados
5. **Técnico B** — ex.: matching, regras, estados
6. **UI** — wireframe ou estados visuais
7. **Dados e segurança** — gitignore, PII, onde ficam arquivos
8. **Decisões em aberto** — perguntas interativas estilo AskQuestion (ver abaixo)

Nem toda feature precisa das 8; manter 5–8 abas é o ideal.

## Decisões interativas (obrigatório quando houver perguntas)

Substituir tabela estática de decisões por UI interativa na aba **Decisões**. Mesmo tema escuro do PRD; comportamento inspirado no AskQuestion do Cursor.

### Estrutura HTML/JS

- `<body data-prd-id="{slug}">` — slug único para chave de storage
- Array `QUESTIONS` no `<script>` inline (não fetch externo)
- Container `#question-list` renderizado via JS
- Cada pergunta: `.question-card` com `.question-id`, `.question-prompt`, `.option-list`
- Opções como `.option-btn` com `role="radio"` e indicador circular
- **Sempre** incluir opção final `"Outra resposta"` (`optionId: "other"`) com campo `.custom-answer` (input ou textarea)

### Persistência

```javascript
const STORAGE_KEY = "tabbed-prd-decisions:" + PRD_ID;
// Formato: { "D1": { optionId: "a"|"other", customText: "..." }, ... }
localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
```

Carregar ao abrir a página; salvar a cada seleção ou digitação.

### Painel copiar para o Cursor

Ao final da lista de perguntas, bloco `.copy-panel` com:

1. Barra de progresso (`N/M respondidas`)
2. Textarea readonly `#copy-preview` — atualiza em tempo real
3. Botão `#copy-decisions-btn` com ícone SVG de clipboard (sem emoji)
4. Texto copiado em markdown estruturado para colar no chat:

```
Decisões do PRD — {slug}

**D1 — Pergunta?**
Resposta escolhida

**D2 — ...**
(não respondida)

---
7/7 decisões respondidas.
Documento: docs/{slug}-prd.html
```

Usar `navigator.clipboard.writeText` com fallback `textarea.select()` + `execCommand("copy")`. Feedback visual no botão ("Copiado" por 2s).

### Config de pergunta (template)

```javascript
{
  id: "D1",
  prompt: "Texto da pergunta?",
  options: [
    { id: "a", label: "Opção A" },
    { id: "b", label: "Opção B" },
  ],
  customPlaceholder: "Opcional — hint do campo Outra resposta",
  customMultiline: false,  // true → textarea (perguntas abertas)
}
```

### CSS mínimo adicional

Incluir no mesmo `<style>`: `.question-card`, `.option-btn`, `.option-btn.selected`, `.custom-answer`, `.copy-panel`, `.copy-btn`, `.decisions-progress-bar`. Sem CDN.

### Workflow atualizado

```
1. Explorar codebase
2. Criar docs/{nome}-prd.html com abas + QUESTIONS + localStorage + copy
3. Usuário abre no navegador, responde, copia para o chat
4. NÃO implementar até colar decisões no chat (ou confirmar verbalmente)
5. Após feedback: mover decisões fechadas para callout "Acordado" e limpar storage se necessário
```

## Painel direito — tipos de visual

Preferir **SVG inline** (sem imagens externas):

| Aba | Visual sugerido |
|-----|-----------------|
| Visão geral | Blocos do sistema / abas do app |
| Fluxo hoje | Diagrama vertical com setas (cadeia manual) |
| Fluxo proposto | Steps numerados + caixa de saídas |
| Técnico | Pipeline (entrada → transform → modelo) |
| Matching | Duas colunas com linhas de vínculo |
| UI | Wireframe simplificado com cores de status |
| Segurança | O que entra / não entra no repo |
| Decisões | Roadmap vertical "você está aqui" |

Legenda abaixo do SVG quando houver cores de status.

## Estilo visual

- Tema escuro flat (sem gradiente, sem box-shadow, sem emoji)
- Tokens CSS em `:root` (--bg, --surface, --accent, --ok, --warn, --err, --info)
- Tipografia: system-ui; monospace só para paths/código
- Callouts: borda esquerda colorida (`info`, `warn`, accent)
- Listas numeradas estilo "steps" com círculos para processos sequenciais
- Tabelas compactas para comparar campos/regras
- `@media (max-width: 1100px)`: empilhar colunas

## Conteúdo — o que pesquisar antes de escrever

1. Estrutura real do projeto (abas, context, tipos existentes)
2. Fluxo **literal** descrito pelo usuário (pastas, ferramentas, gargalos)
3. Escopo v1 vs futuro — deixar explícito o que **não** entra
4. Decisões em aberto vs **Acordado** — mover itens resolvidos para seção "Acordado"
5. Restrições do usuário (não quebrar X, não commitar Y, local-only vs web)

## Workflow do agente

```
1. Explorar codebase (se existir) para fatos no PRD
2. Criar docs/{nome}-prd.html com todas as seções
3. Entregar link/caminho ao usuário para abrir no navegador
4. NÃO implementar código até o usuário revisar o PRD e responder decisões
5. Após feedback: atualizar o mesmo HTML ou criar versão v2 no filename
```

## Anti-padrões

- Não usar Canvas React — este skill é **HTML estático** no repo
- Não commitar dados sensíveis nos diagramas (usar valores fictícios)
- Não prometer integrações não confirmadas como fechadas
- Não criar múltiplos arquivos CSS/JS separados
- Não implementar a feature no mesmo turno em que gera o PRD (salvo pedido explícito)

## Exemplo de referência

Implementação com decisões interativas + localStorage + copiar para chat:

`sdk/agent-kanban/docs/multi-agent-orchestration-prd.html`

## Atualização pós-feedback

Quando o usuário responder decisões:

1. Atualizar seção "Decisões em aberto" → mover itens resolvidos para callout "Acordado"
2. Ajustar diagramas se o fluxo mudar
3. Só então propor escopo de implementação ou AskQuestion restante
