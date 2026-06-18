#!/usr/bin/env python3
"""
preToolUse: redireciona Read para cópia redigida em .cursor/redacted/.
Bloqueia Grep direto em YAML sob src/main/resources (use Read na cópia redigida).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from redact_yaml import (
    ensure_redacted_copy,
    is_mule_resources_yaml,
    is_redacted_cache_path,
)

DENY_GREP_MSG = (
    "Grep bloqueado em YAML de src/main/resources. "
    "Use Read no arquivo; o proxy entrega versão redigida em .cursor/redacted/."
)


def allow() -> None:
    print(json.dumps({"permission": "allow"}))
    sys.exit(0)


def deny(message: str, agent_message: str | None = None) -> None:
    out: dict[str, str] = {"permission": "deny", "user_message": message}
    if agent_message:
        out["agent_message"] = agent_message
    print(json.dumps(out))
    sys.exit(0)


def allow_with_updated_input(updated: dict) -> None:
    print(json.dumps({"permission": "allow", "updated_input": updated}))
    sys.exit(0)


def parse_tool_input(payload: dict) -> dict:
    raw = payload.get("tool_input")
    if isinstance(raw, dict):
        return raw
    if isinstance(raw, str) and raw.strip():
        return json.loads(raw)
    return {}


def resolve_path(path_str: str, cwd: str) -> Path | None:
    if not path_str:
        return None
    p = Path(path_str)
    if not p.is_absolute() and cwd:
        p = Path(cwd) / p
    return p.resolve()


def read_path_from_input(tool_input: dict) -> str | None:
    for key in ("path", "file_path", "target_file"):
        val = tool_input.get(key)
        if val:
            return str(val)
    return None


def grep_targets_mule_yaml(tool_input: dict, cwd: str) -> bool:
    path_str = read_path_from_input(tool_input)
    if path_str and is_mule_resources_yaml(path_str):
        return True
    glob_pat = tool_input.get("glob") or tool_input.get("include") or ""
    if glob_pat and is_mule_resources_yaml("x/src/main/resources/x.yaml"):
        g = str(glob_pat).lower()
        if "src/main/resources" in g.replace("\\", "/") and (
            ".yaml" in g or ".yml" in g or "properties" in g or "config" in g
        ):
            return True
    pattern = str(tool_input.get("pattern") or "")
    for token in pattern.split():
        if is_mule_resources_yaml(token):
            return True
    return False


def handle_read(tool_input: dict, cwd: str, workspace_roots: list | None = None) -> None:
    path_str = read_path_from_input(tool_input)
    if not path_str:
        allow()
    if is_redacted_cache_path(path_str) or not is_mule_resources_yaml(path_str):
        allow()

    original = resolve_path(path_str, cwd)
    if original is None or not original.is_file():
        allow()

    try:
        cache = ensure_redacted_copy(original, Path(cwd) if cwd else None, workspace_roots)
    except OSError as exc:
        deny(f"Proxy YAML: falha ao gerar cópia redigida ({exc}).")

    updated = dict(tool_input)
    updated["path"] = str(cache)
    if "file_path" in updated:
        updated["file_path"] = str(cache)
    allow_with_updated_input(updated)


def handle_grep(tool_input: dict, cwd: str) -> None:
    if grep_targets_mule_yaml(tool_input, cwd):
        deny(DENY_GREP_MSG, DENY_GREP_MSG)
    allow()


def main() -> None:
    try:
        raw = sys.stdin.read()
        if not raw.strip():
            allow()
        payload = json.loads(raw)
    except json.JSONDecodeError:
        allow()

    tool_name = payload.get("tool_name") or ""
    cwd = payload.get("cwd") or ""
    tool_input = parse_tool_input(payload)

    if tool_name == "Read":
        handle_read(tool_input, cwd, payload.get("workspace_roots"))
    elif tool_name == "Grep":
        handle_grep(tool_input, cwd)
    allow()


if __name__ == "__main__":
    main()
