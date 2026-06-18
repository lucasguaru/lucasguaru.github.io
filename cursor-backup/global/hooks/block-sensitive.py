#!/usr/bin/env python3
"""
Controle de leitura de arquivos sensíveis (Mule properties, .env).
Complementa .cursorignore — cobre Tab, Agent e terminal.

Leitura de YAML em src/main/resources: bloqueia original; o proxy (yaml-read-proxy.py)
redireciona Read para .cursor/redacted/. Shell (cat, head, …) reescreve para a mesma cópia.

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
    is_mule_resources_yaml,
    is_product_definition_path,
    is_redacted_cache_path,
)

DENY_READ_MULE_YAML = (
    "Leitura bloqueada: YAML em src/main/resources (valores sensíveis). "
    "Use Read no arquivo — o proxy entrega cópia em .cursor/redacted/."
)
DENY_READ_ENV = "Leitura bloqueada: arquivo .env (use .cursorignore e não exponha credenciais)."
DENY_SHELL_ENV = "Comando bloqueado: não exibir .env via terminal."
DENY_SHELL_NO_REDACT = (
    "Comando bloqueado: não foi possível gerar cópia redigida do YAML em src/main/resources."
)
AGENT_SHELL_REDACT_HINT = (
    "O comando foi reescrito para ler a cópia em .cursor/redacted/ (chaves sensíveis como "
    "***REDACTED***). Não tente contornar para o arquivo original."
)

SHELL_READ_CMD = re.compile(
    r"(?i)\b(cat|type|more|less|head|tail|Get-Content|Select-String|rg|grep|findstr)\b",
)

PATH_TOKEN_RE = re.compile(r'"([^"]+)"|\'([^\']+)\'|(\S+)')


def should_deny_read(file_path: str) -> tuple[bool, str]:
    if is_redacted_cache_path(file_path) or is_product_definition_path(file_path):
        return False, ""
    if is_env_path(file_path):
        return True, DENY_READ_ENV
    if is_mule_resources_yaml(file_path):
        return True, DENY_READ_MULE_YAML
    return False, ""


def shell_has_read_command(command: str) -> bool:
    return bool(command and SHELL_READ_CMD.search(command))


def iter_path_tokens(command: str) -> list[tuple[str, str]]:
    found: list[tuple[str, str]] = []
    for match in PATH_TOKEN_RE.finditer(command):
        inner = match.group(1) or match.group(2) or match.group(3)
        if not inner or inner.startswith("-"):
            continue
        found.append((match.group(0), inner))
    return found


def resolve_path_token(path_str: str, cwd: Path | None) -> Path | None:
    path = Path(path_str)
    try:
        if not path.is_absolute():
            if cwd is None:
                return None
            path = (cwd / path).resolve()
        else:
            path = path.resolve()
    except OSError:
        return None
    return path


def shell_targets_env(command: str) -> bool:
    if not shell_has_read_command(command):
        return False
    for _span, inner in iter_path_tokens(command):
        p = resolve_path_token(inner, None)
        if p and is_env_path(str(p)):
            return True
    return False


def shell_targets_mule_yaml(command: str, cwd: Path | None) -> bool:
    if not shell_has_read_command(command):
        return False
    for _span, inner in iter_path_tokens(command):
        p = resolve_path_token(inner, cwd)
        if p is None:
            continue
        if is_redacted_cache_path(str(p)):
            continue
        if is_mule_resources_yaml(str(p)):
            return True
    return False


def rewrite_shell_command(command: str, payload: dict) -> tuple[str, bool]:
    workspace_roots = payload.get("workspace_roots")
    cwd_str = payload.get("cwd") or ""
    cwd = Path(cwd_str).resolve() if cwd_str else None
    if not shell_targets_mule_yaml(command, cwd):
        return command, False

    result = command
    changed = False
    for span, inner in iter_path_tokens(command):
        path = resolve_path_token(inner, cwd)
        if path is None or not is_mule_resources_yaml(str(path)):
            continue
        if is_redacted_cache_path(str(path)):
            continue
        try:
            cache = ensure_redacted_copy(path, cwd, workspace_roots)
        except OSError:
            continue
        quoted = span[0] in "\"'" and span[-1] == span[0]
        new_span = f'"{cache}"' if quoted else str(cache)
        if span in result:
            result = result.replace(span, new_span, 1)
            changed = True
    return result, changed


def deny_read(message: str) -> None:
    print(json.dumps({"permission": "deny", "user_message": message}))
    sys.exit(0)


def deny_shell(message: str, agent_message: str | None = None) -> None:
    out: dict[str, str] = {"permission": "deny", "user_message": message}
    if agent_message:
        out["agent_message"] = agent_message
    print(json.dumps(out))
    sys.exit(0)


def allow() -> None:
    print(json.dumps({"permission": "allow"}))
    sys.exit(0)


def allow_shell_updated(command: str) -> None:
    print(
        json.dumps(
            {
                "permission": "allow",
                "updated_input": {"command": command},
                "agent_message": AGENT_SHELL_REDACT_HINT,
            }
        )
    )
    sys.exit(0)


def handle_read(payload: dict) -> None:
    workspace_roots = payload.get("workspace_roots")
    file_path = payload.get("file_path") or ""
    deny, msg = should_deny_read(file_path)
    if deny:
        if is_mule_resources_yaml(file_path):
            try:
                src = Path(file_path)
                if src.is_file():
                    ensure_redacted_copy(src.resolve(), None, workspace_roots)
            except OSError:
                pass
        deny_read(msg)
    allow()


def handle_shell(payload: dict) -> None:
    command = payload.get("command") or ""
    if shell_targets_env(command):
        deny_shell(DENY_SHELL_ENV)
    cwd = Path(payload["cwd"]).resolve() if payload.get("cwd") else None
    if shell_targets_mule_yaml(command, cwd):
        rewritten, ok = rewrite_shell_command(command, payload)
        if ok:
            allow_shell_updated(rewritten)
        deny_shell(DENY_SHELL_NO_REDACT)
    allow()


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
    mode = args.mode
    raw = sys.stdin.read()

    if not raw.strip():
        allow()

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        allow()

    if mode == "auto":
        if "file_path" in payload:
            mode = "read"
        elif "command" in payload and "tool_name" not in payload:
            mode = "shell"
        else:
            allow()

    try:
        if mode == "read":
            handle_read(payload)
        elif mode == "shell":
            handle_shell(payload)
        allow()
    except Exception as exc:  # noqa: BLE001
        if mode == "shell":
            deny_shell(f"Hook: erro interno ({exc}).")
        allow()


if __name__ == "__main__":
    main()
