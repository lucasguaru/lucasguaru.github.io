#!/usr/bin/env python3
"""
Controle de leitura de arquivos sensíveis (Mule properties, .env).
Complementa .cursorignore — cobre Tab, Agent e terminal.

Leitura de YAML em src/main/resources: bloqueia original; o proxy (yaml-read-proxy.py)
redireciona Read para .cursor/redacted/. Mappings em product-definition permanecem liberados.

Uso:
  py -3 block-sensitive.py --mode read   # beforeReadFile / beforeTabFileRead
  py -3 block-sensitive.py --mode shell  # beforeShellExecution
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

from redact_yaml import (
    ensure_redacted_copy,
    is_env_path,
    redact_yaml_content,
    is_mule_resources_yaml,
    is_product_definition_path,
    is_redacted_cache_path,
)

DENY_READ_MULE_YAML = (
    "Leitura bloqueada: YAML em src/main/resources (valores sensíveis). "
    "O agente deve usar Read no arquivo — o proxy entrega cópia em .cursor/redacted/."
)
DENY_READ_ENV = "Leitura bloqueada: arquivo .env (use .cursorignore e não exponha credenciais)."
DENY_SHELL = (
    "Comando bloqueado: não exibir configs YAML ou credenciais via terminal."
)
AGENT_SHELL_HINT = (
    "Não leia properties com segredos via shell. Use a ferramenta Read "
    "(proxy redige chaves sensíveis) ou descreva a estrutura sem valores."
)

SHELL_READ_CMD = re.compile(
    r"(?i)\b(cat|type|more|less|head|tail|Get-Content|Select-String|rg|grep|findstr)\b",
)



def _file_path_from_raw(raw: str) -> str:
    m = re.search(r'"file_path"\s*:\s*"((?:[^"\\]|\\.)*)"', raw)
    if m:
        return bytes(m.group(1), "utf-8").decode("unicode_escape")
    return ""


def _deny_mule_with_redacted_file(file_path: str, workspace_roots: list | None = None) -> bool:
    if not file_path or not is_mule_resources_yaml(file_path):
        return False
    src = Path(file_path)
    if not src.is_file():
        return False
    try:
        content = src.read_text(encoding="utf-8", errors="replace")
        ensure_redacted_copy(src.resolve(), None, workspace_roots)
        deny_read(DENY_READ_MULE_YAML, redact_yaml_content(content))
    except OSError as exc:
        deny_read(f"{DENY_READ_MULE_YAML} ({exc})")
    return True


def should_deny_read(file_path: str) -> tuple[bool, str]:
    if is_redacted_cache_path(file_path) or is_product_definition_path(file_path):
        return False, ""
    if is_env_path(file_path):
        return True, DENY_READ_ENV
    if is_mule_resources_yaml(file_path):
        return True, DENY_READ_MULE_YAML
    return False, ""


def shell_targets_sensitive(command: str) -> bool:
    if not command:
        return False
    norm = command.replace("\\", "/")
    if any(
        x in norm
        for x in (
            "block-sensitive.py",
            "yaml-read-proxy.py",
            "run-tests.py",
            "redact_yaml.py",
        )
    ):
        return False

    if not SHELL_READ_CMD.search(command):
        return False

    for token in re.split(r"[\s|&;><]+", command):
        t = token.strip("\"'")
        if not t or t.startswith("-"):
            continue
        if is_redacted_cache_path(t):
            continue
        if is_env_path(t) or is_mule_resources_yaml(t):
            return True
    return False


def deny_read(message: str, agent_message: str | None = None) -> None:
    out: dict[str, str] = {"permission": "deny", "user_message": message}
    if agent_message:
        out["agent_message"] = agent_message
    print(json.dumps(out))
    sys.exit(0)


def deny_shell() -> None:
    print(
        json.dumps(
            {
                "permission": "deny",
                "user_message": DENY_SHELL,
                "agent_message": AGENT_SHELL_HINT,
            }
        )
    )
    sys.exit(0)


def allow() -> None:
    print(json.dumps({"permission": "allow"}))
    sys.exit(0)


def handle_read(payload: dict) -> None:
    workspace_roots = payload.get("workspace_roots")
    file_path = payload.get("file_path") or ""
    content = payload.get("content") or ""
    deny, msg = should_deny_read(file_path)
    if deny:
        agent_msg = None
        if is_mule_resources_yaml(file_path) and content:
            try:
                src = Path(file_path)
                if src.is_file():
                    ensure_redacted_copy(src.resolve(), None, workspace_roots)
                agent_msg = redact_yaml_content(content)
            except OSError:
                agent_msg = redact_yaml_content(content)
        deny_read(msg, agent_msg)
    allow()


def handle_shell(payload: dict) -> None:
    command = payload.get("command") or ""
    if shell_targets_sensitive(command):
        deny_shell()
    allow()


def emit_deny_on_error(message: str) -> None:
    print(json.dumps({"permission": "deny", "user_message": message}))
    sys.exit(0)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--mode",
        choices=("read", "shell", "auto"),
        default="auto",
        help="read=file hooks, shell=terminal hook, auto=detect from payload",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    try:
        raw = sys.stdin.read()
        if not raw.strip():
            if args.mode == "shell":
                allow()
            emit_deny_on_error("Hook: entrada vazia (bloqueado por segurança).")
        payload = json.loads(raw)
    except json.JSONDecodeError:
        if args.mode == "shell":
            allow()
        if args.mode == "read" and _deny_mule_with_redacted_file(_file_path_from_raw(raw), None):
            pass
        else:
            emit_deny_on_error("Hook: JSON inválido (bloqueado por segurança).")

    try:
        mode = args.mode
        if mode == "auto":
            if "file_path" in payload:
                mode = "read"
            elif "command" in payload and "tool_name" not in payload:
                mode = "shell"
            else:
                allow()

        if mode == "read":
            handle_read(payload)  # workspace_roots inside
        elif mode == "shell":
            handle_shell(payload)
        allow()
    except Exception as exc:  # noqa: BLE001
        emit_deny_on_error(f"Hook: erro interno ({exc}).")


if __name__ == "__main__":
    main()
