#!/usr/bin/env bash
# Configura git credential helper nos projetos RAML (Design Center Git) em workspace-prodesp-api/.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HELPER="$ROOT/.cursor/scripts/anypoint_git_credential_helper.py"
API_DIR="$ROOT/workspace-prodesp-api"

if [[ ! -f "$HELPER" ]]; then
  echo "Helper não encontrado: $HELPER" >&2
  exit 1
fi

if [[ -z "${ANYPOINT_CLIENT_ID:-}" || -z "${ANYPOINT_CLIENT_SECRET:-}" ]]; then
  echo "AVISO: ANYPOINT_CLIENT_ID / ANYPOINT_CLIENT_SECRET não definidos no ambiente." >&2
  echo "O helper só funcionará após definir as variáveis (IDE reiniciada se necessário)." >&2
fi

# Windows: py -3; Linux/macOS: python3
if command -v py >/dev/null 2>&1; then
  PYTHON_RUNNER="py -3"
else
  PYTHON_RUNNER="python3"
fi

# Git no Windows grava aspas escapadas e quebra o helper; path sem espaços → sem aspas.
HELPER_CFG="!$PYTHON_RUNNER $HELPER"

echo "Configurando credential helper para anypoint.mulesoft.com"
echo "Helper: $HELPER"
echo

configured=0
for dir in "$API_DIR"/*; do
  [[ -d "$dir/.git" ]] || continue
  name="$(basename "$dir")"
  (
    cd "$dir"
    # Desliga credential-manager global (evita diálogo/uiHelper que trava antes do nosso helper)
    git config --local --replace-all credential.helper ""
    git config --local --add credential.helper "$HELPER_CFG"
    git config --local credential.https://anypoint.mulesoft.com.useHttpPath true
    echo "  OK  $name"
  )
  configured=$((configured + 1))
done

if [[ "$configured" -eq 0 ]]; then
  echo "Nenhum repositório .git encontrado em $API_DIR" >&2
  exit 1
fi

echo
echo "Testando ls-remote (data-wallet-integrator-s-api)..."
TEST_DIR="$API_DIR/data-wallet-integrator-s-api"
if [[ -d "$TEST_DIR/.git" ]]; then
  (
    cd "$TEST_DIR"
    GIT_TERMINAL_PROMPT=0 git ls-remote origin HEAD | head -1
  ) && echo "Teste OK." || echo "Teste FALHOU — verifique scopes (Design Center Developer) e env vars." >&2
fi

echo
echo "Concluído. $configured repositório(s) configurado(s)."
