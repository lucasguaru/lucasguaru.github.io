"""
Redação de valores em YAML Mule (somente nome da chave, case-insensitive).
Escopo: arquivos sob src/main/resources (Mule). Exclui product-definition/mappings.
"""

from __future__ import annotations

import re
from pathlib import Path

REDACTED_VALUE = '"***REDACTED***"'

# Nomes de chave (último segmento YAML) — ver spec em tarefas / conversa PRODESP hooks.
SENSITIVE_KEYS: frozenset[str] = frozenset(
    {
        "key",
        "clientid",
        "clientsecret",
        "consumerkey",
        "consumersecret",
        "password",
        "username",
        "secret",
        "apikey",
        "passphrase",
        "credential",
        "credentials",
        "accesstoken",
        "refreshtoken",
        "token",
        "privatekey",
        "storepassword",
        "keypassword",
        "truststorepassword",
        "encodedpassword",
        "encodedusername",
        "client_id",
        "client_secret",
        "api_key",
        "private_key",
        "access_token",
        "refresh_token",
    }
)

LINE_KEY_RE = re.compile(r"^(\s*)([A-Za-z_][\w-]*)\s*:(.*)$")
REDACTED_DIR_SEGMENT = "/.cursor/redacted/"
PRODUCT_DEFINITION_SEGMENT = "/product-definition/"
MULE_RESOURCES_SEGMENT = "/src/main/resources/"


def normalize_path(path: str) -> str:
    return path.replace("\\", "/").lower()


def is_redacted_cache_path(path: str) -> bool:
    return REDACTED_DIR_SEGMENT in normalize_path(path)


def is_product_definition_path(path: str) -> bool:
    p = normalize_path(path)
    return PRODUCT_DEFINITION_SEGMENT in p or p.endswith("/product-definition")


def is_mule_resources_yaml(path: str) -> bool:
    if not path:
        return False
    p = normalize_path(path)
    if not p.endswith((".yaml", ".yml")):
        return False
    if is_redacted_cache_path(path) or is_product_definition_path(path):
        return False
    return MULE_RESOURCES_SEGMENT in p


def is_env_path(path: str) -> bool:
    if not path:
        return False
    p = normalize_path(path)
    base = p.rsplit("/", 1)[-1]
    return base == ".env" or base.startswith(".env.") or "/.env" in p


def redact_yaml_content(content: str) -> str:
    if not content:
        return content
    lines: list[str] = []
    for line in content.splitlines(keepends=True):
        lines.append(_redact_line(line))
    return "".join(lines)


def _redact_line(line: str) -> str:
    m = LINE_KEY_RE.match(line)
    if not m:
        return line
    indent, key, _rest = m.group(1), m.group(2), m.group(3)
    if key.lower() not in SENSITIVE_KEYS:
        return line
    newline = "\n" if line.endswith("\n") else ""
    return f"{indent}{key}: {REDACTED_VALUE}{newline}"


def _is_workspace_marker(directory: Path) -> bool:
    return (directory / ".cursor").is_dir() or (directory / ".git").exists()


def find_workspace_root(
    file_path: Path,
    cwd: Path | None = None,
    workspace_roots: list[str] | None = None,
) -> Path:
    if workspace_roots:
        for root_str in workspace_roots:
            root = Path(root_str).resolve()
            if root.exists():
                try:
                    file_path.resolve().relative_to(root)
                    return root
                except ValueError:
                    continue

    seen: set[Path] = set()
    candidates: list[Path] = []
    if file_path:
        resolved = file_path.resolve()
        candidates.extend([resolved, *resolved.parents])
    if cwd:
        cwd_resolved = cwd.resolve()
        candidates.extend([cwd_resolved, *cwd_resolved.parents])

    for candidate in candidates:
        if candidate in seen:
            continue
        seen.add(candidate)
        if _is_workspace_marker(candidate):
            return candidate

    if file_path:
        return file_path.resolve().parent
    return (cwd or Path.cwd()).resolve()


def redacted_cache_path(original: Path, workspace_root: Path) -> Path:
    try:
        rel = original.resolve().relative_to(workspace_root.resolve())
    except ValueError:
        rel = Path(*original.parts[-6:])
    return workspace_root / ".cursor" / "redacted" / rel


def ensure_redacted_copy(
    original: Path,
    cwd: Path | None = None,
    workspace_roots: list[str] | None = None,
) -> Path:
    workspace_root = find_workspace_root(original, cwd, workspace_roots)
    cache = redacted_cache_path(original, workspace_root)
    raw = original.read_text(encoding="utf-8", errors="replace")
    cache.parent.mkdir(parents=True, exist_ok=True)
    cache.write_text(redact_yaml_content(raw), encoding="utf-8", newline="\n")
    return cache.resolve()
