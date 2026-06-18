---
name: mule-yaml-sensitive-access
description: >-
  Quando o agente precisa de config Mule em YAML (config-dev/qa/prod, properties em
  src/main/resources) e Read/Grep/shell estão bloqueados ou podem expor segredos.
  Não contornar hooks/.cursorignore; perguntar ao usuário antes de qualquer leitura.
  Usar ao pedir config-*.yaml, properties, valores de host/secret, ou após Permission denied.
---

# YAML Mule — acesso sensível (sem bypass)

## Objetivo

Evitar que o agente exponha credenciais ao contornar proteções. Se o arquivo não estiver acessível, **perguntar** ao usuário em vez de usar terminal ou scripts.

## Disparadores

- Pedido de `config-{env}.yaml`, `config-secure-*`, properties em `src/main/resources`
- `Read` / `Grep` retornou: Permission denied, filtered by cursorignore, hook deny, “JSON inválido”
- Dúvida se hooks globais estão ativos após reload do IDE

## Fluxo obrigatório

### 1. Tentativa permitida (uma vez)

| Ferramenta | Alvo | Esperado |
|------------|------|----------|
| Read | `config-{env}.yaml` no app | Proxy redige → `.cursor/redacted/...` **ou** bloqueio |
| Read | `config-secure-*` | Bloqueio (.cursorignore) — **não** insistir |
| Grep | YAML em `src/main/resources` | Bloqueio — usar Read ou XML |

**Não** usar Shell para ler o mesmo path.

### 2. Se bloqueado — mensagem ao usuário (modelo)

> O arquivo `…/config-*.yaml` está protegido (`.cursorignore` e/ou hooks em `~/.cursor/hooks.json`) porque pode conter **clientSecret**, senhas e hosts internos.
>
> Posso seguir **sem ler o arquivo**, inferindo chaves pelos `${...}` nos flows XML, ou você pode:
> 1. Colar aqui só as **chaves** ou um trecho **sem segredos**
> 2. Confirmar explicitamente que quer que eu leia mesmo assim (e reiniciar o Cursor se hooks falharem com “JSON inválido”)
> 3. Pedir para ajustar `.cursorignore` (skill `mulesoft-cursorignore-setup`)
>
> **Deseja que eu continue com leitura do YAML ou prefere uma das opções acima?**

Aguardar resposta. **Não** executar `cat`, `py -c open(...)`, etc. na mesma turn sem “sim, pode ler”.

### 3. Se o usuário autorizar leitura

- Preferir **Read** (cópia em `.cursor/redacted/` com chaves sensíveis como `***REDACTED***`).
- Se Read falhar com **JSON inválido** em qualquer arquivo: informar que hooks podem precisar de **reinício completo** do Cursor (reload não basta) e verificar **Cursor Settings → Hooks**.
- Nunca reproduzir valores redigidos como se fossem reais; nunca logar `clientSecret` na conversa.

### 4. Se o usuário **não** autorizar

- Listar chaves via `${property}` nos XML (`z-global-config.xml`, `*-flow.xml`).
- Para valores de negócio (timeout, path): citar nome da property e pedir valor ao usuário ou apontar o trecho no editor dele.

## Verificar hooks (diagnóstico, só se o usuário pedir)

Indícios de que proteção está ativa **nesta sessão**:

- Grep em `src/main/resources/**/*.yaml` → “filtered out by .cursorignore”
- Read no original → Permission denied ou mensagem de bloqueio Mule
- `~/.cursor/hooks.json` existe com `yaml-read-proxy.py` e `block-sensitive.py`

**Lacuna conhecida:** `beforeShellExecution` com `failClosed: false` pode não bloquear todos os comandos no terminal do agente — por isso a regra proíbe o agente de **escolher** shell para YAML, independente do hook.

## Arquivos relacionados

- Regra global: `~/.cursor/rules/mule-yaml-agent-policy.mdc`
- Regra por glob: `~/.cursor/rules/mule-yaml-proxy.mdc`
- Setup: `~/.cursor/skills/mulesoft-cursorignore-setup/`
