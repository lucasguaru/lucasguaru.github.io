# Validar deploy CloudHub 2 (PRODESP)

Valide a app Mule atual contra o padrão PRODESP de deploy no CloudHub 2.

## Regras desta execução

1. **Modo read-only na validação** — não altere `pom.xml`, `mule-artifact.json` nem outros arquivos até o usuário confirmar.
2. Siga a skill **`prodesp-mule-ch2-validate`** (fluxo completo + formato do relatório).
3. Resolva o asset em `workspace-prodesp-app/{asset}/` (regra `mulesoft-workspace`). Se não estiver claro qual app, pergunte.

## Passos

1. Rodar o script mecânico:

```bash
python .cursor/skills/prodesp-mule-ch2-validate/scripts/validate-ch2.py workspace-prodesp-app/{asset} --check-env
```

2. Completar checagens manuais da skill (settings.xml, `api.version` vs `.exchange.xml`).
3. Apresentar o relatório em tabela (✅ ❌ ⚠️).
4. **Ao final, perguntar ao usuário:**

> Encontrei **{N}** item(ns) para corrigir. **Deseja que eu aplique as melhorias agora?** (sim / não)

5. **Se o usuário responder sim:** aplicar correções com a skill **`prodesp-mule-ch2-deploy`** e, ao terminar, rodar o script novamente para confirmar.
6. **Se responder não:** listar itens pendentes e encerrar.
7. **Se 0 fail:** informar que a app está no padrão CH2; perguntar se deseja prosseguir com deploy local (`mvn clean deploy` + `mvn mule:deploy` — skill `prodesp-mule-ch2-deploy` §5).

**Nunca** exibir secrets, valores de env ou conteúdo de `<password>` no `settings.xml`.
