#!/usr/bin/env python3
"""Verifica .cursorignore para YAML Mule em src/main/resources."""

from __future__ import annotations

import json
import sys
from pathlib import Path

REQUIRED = [
    "**/src/main/resources/**/config-secure-*.yaml",
    "**/src/main/resources/**/config-secure-*.yml",
    "**/src/main/resources/**/*.yaml",
    "**/src/main/resources/**/*.yml",
    "!.cursor/redacted/**",
    "**/.env",
    "**/.env.*",
]


def is_mule_workspace(root: Path) -> bool:
    if (root / "src/main/mule").is_dir():
        return True
    pom = root / "pom.xml"
    if pom.is_file():
        text = pom.read_text(encoding="utf-8", errors="ignore").lower()
        if any(m in text for m in ("mule-maven-plugin", "mule.application", "mule.runtime")):
            return True
    props = root / "src/main/resources/properties"
    if props.is_dir() and list(props.glob("config*.yaml")):
        return True
    return False


def patterns_in_file(path: Path) -> set[str]:
    if not path.is_file():
        return set()
    lines: set[str] = set()
    for line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        lines.add(s)
    return lines


def find_mule_apps_under(root: Path, max_depth: int = 3) -> list[Path]:
    found: list[Path] = []
    root = root.resolve()
    for depth, directory in enumerate([root, *root.rglob("*")]):
        if directory.is_file():
            continue
        try:
            rel_parts = directory.relative_to(root).parts
        except ValueError:
            continue
        if len(rel_parts) > max_depth:
            continue
        if is_mule_workspace(directory) and directory != root:
            found.append(directory)
    return sorted(set(found))


def check_ignore_at(root: Path) -> dict:
    ci = root / ".cursorignore"
    present = patterns_in_file(ci)
    missing = [p for p in REQUIRED if p not in present]
    return {
        "path": str(root),
        "cursorignore_exists": ci.is_file(),
        "missing_patterns": missing,
        "present_patterns": [p for p in REQUIRED if p in present],
        "suggest_create": not ci.is_file(),
        "ok": ci.is_file() and len(missing) == 0,
    }


def main() -> None:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
    is_mule = is_mule_workspace(root)
    mule_apps = [] if is_mule else find_mule_apps_under(root)

    if is_mule:
        check = check_ignore_at(root)
        out = {
            "workspace": str(root),
            "is_mule": True,
            "layout": "single-app",
            **{k: v for k, v in check.items() if k != "path"},
            "ok": check["ok"],
        }
    elif mule_apps:
        root_check = check_ignore_at(root)
        out = {
            "workspace": str(root),
            "is_mule": True,
            "layout": "monorepo",
            "cursorignore_at_root": root_check,
            "mule_apps_detected": [a.name for a in mule_apps],
            "ok": root_check["ok"],
            "note": "Monorepo: preferir .cursorignore na raiz do workspace (cobre apps em subpastas).",
        }
        if not root_check["ok"]:
            out["missing_patterns"] = root_check["missing_patterns"]
            out["suggest_create"] = root_check["suggest_create"]
        else:
            out["missing_patterns"] = []
            out["suggest_create"] = False
    else:
        out = {
            "workspace": str(root),
            "is_mule": False,
            "layout": "unknown",
            "cursorignore_exists": (root / ".cursorignore").is_file(),
            "missing_patterns": [],
            "ok": True,
        }
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
