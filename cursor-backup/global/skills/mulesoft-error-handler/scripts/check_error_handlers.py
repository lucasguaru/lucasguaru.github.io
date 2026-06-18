#!/usr/bin/env python3
"""Valida on-error-propagate / on-error-continue em XML Mule."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

HANDLER_OPEN = re.compile(
    r"<on-error-(?P<kind>propagate|continue)\b(?P<attrs>[^>]*)>",
    re.IGNORECASE,
)
HANDLER_CLOSE = re.compile(
    r"</on-error-(?P<kind>propagate|continue)\s*>",
    re.IGNORECASE,
)
LOG_COMPONENT = re.compile(r"<(?:logger|json-logger):?\w*\b", re.IGNORECASE)
ATTR = re.compile(r'(\w+)\s*=\s*"([^"]*)"')

SKIP_DIRS = {
    ".tooling-apps-cache",
    "META-INF",
    "target",
    ".git",
}


def iter_mule_xml(root: Path) -> list[Path]:
    mule_dir = root / "src/main/mule"
    if not mule_dir.is_dir():
        return []
    files: list[Path] = []
    for path in mule_dir.rglob("*.xml"):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        files.append(path)
    return sorted(files)


def extract_handlers(content: str) -> list[dict]:
    handlers: list[dict] = []
    pos = 0
    while True:
        match = HANDLER_OPEN.search(content, pos)
        if not match:
            break
        kind = match.group("kind").lower()
        attrs_raw = match.group("attrs") or ""
        attrs = {k: v for k, v in ATTR.findall(attrs_raw)}
        start = match.start()
        depth = 1
        scan = match.end()
        while depth > 0 and scan < len(content):
            next_open = HANDLER_OPEN.search(content, scan)
            next_close = HANDLER_CLOSE.search(content, scan)
            if next_close and (not next_open or next_close.start() < next_open.start()):
                if next_close.group("kind").lower() == kind:
                    depth -= 1
                    if depth == 0:
                        end = next_close.end()
                        body = content[match.end() : next_close.start()]
                        handlers.append(
                            {
                                "kind": kind,
                                "attrs": attrs,
                                "body": body,
                                "start": start,
                                "end": end,
                            }
                        )
                        scan = end
                        break
                scan = next_close.end()
            elif next_open:
                depth += 1
                scan = next_open.end()
            else:
                break
        pos = scan if depth == 0 else match.end() + 1
    return handlers


def line_number(content: str, index: int) -> int:
    return content.count("\n", 0, index) + 1


def check_handler(handler: dict, rel_path: str, content: str) -> list[dict]:
    issues: list[dict] = []
    attrs = handler["attrs"]
    body = handler["body"]
    line = line_number(content, handler["start"])
    err_type = attrs.get("type", "?")
    tag = f"on-error-{handler['kind']}"

    log_exception = attrs.get("logException", "true").lower()
    has_log = bool(LOG_COMPONENT.search(body))

    if log_exception == "false" and not has_log:
        issues.append(
            {
                "severity": "error",
                "file": rel_path,
                "line": line,
                "handler": tag,
                "type": err_type,
                "message": (
                    'logException="false" sem <logger> ou json-logger no handler '
                    "(risco de erro sem diagnóstico no log)"
                ),
            }
        )

    enable_notifications = attrs.get("enableNotifications")
    if enable_notifications and enable_notifications.lower() not in {"true", "false"}:
        issues.append(
            {
                "severity": "warning",
                "file": rel_path,
                "line": line,
                "handler": tag,
                "type": err_type,
                "message": f'enableNotifications="{enable_notifications}" inválido',
            }
        )

    return issues


def git_changed_xml(app_root: Path) -> set[Path] | None:
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD", "--", "src/main/mule"],
            cwd=app_root,
            capture_output=True,
            text=True,
            check=False,
        )
        unstaged = subprocess.run(
            ["git", "diff", "--name-only", "--", "src/main/mule"],
            cwd=app_root,
            capture_output=True,
            text=True,
            check=False,
        )
    except OSError:
        return None

    names = {*result.stdout.splitlines(), *unstaged.stdout.splitlines()}
    paths: set[Path] = set()
    for name in names:
        if name.strip().endswith(".xml"):
            paths.add((app_root / name.strip()).resolve())
    return paths


def check_file(path: Path, app_root: Path) -> list[dict]:
    content = path.read_text(encoding="utf-8", errors="ignore")
    rel = str(path.relative_to(app_root)).replace("\\", "/")
    issues: list[dict] = []
    for handler in extract_handlers(content):
        issues.extend(check_handler(handler, rel, content))
    return issues


def resolve_app_roots(target: Path) -> list[Path]:
    target = target.resolve()
    if (target / "src/main/mule").is_dir():
        return [target]
    if (target / "workspace-prodesp-app").is_dir():
        target = target / "workspace-prodesp-app"
    apps: list[Path] = []
    for child in sorted(target.iterdir()):
        if child.is_dir() and (child / "src/main/mule").is_dir():
            apps.append(child)
    return apps


def main() -> int:
    parser = argparse.ArgumentParser(description="Valida on-error-* em apps Mule")
    parser.add_argument(
        "path",
        nargs="?",
        default=".",
        help="App Mule, workspace-prodesp-app ou monorepo",
    )
    parser.add_argument(
        "--git-diff",
        action="store_true",
        help="Somente XML alterados (git diff) por app",
    )
    parser.add_argument("--json", action="store_true", help="Saída JSON")
    args = parser.parse_args()

    roots = resolve_app_roots(Path(args.path))
    if not roots:
        print("Nenhuma app Mule encontrada (src/main/mule).", file=sys.stderr)
        return 2

    all_issues: list[dict] = []
    summary = {"apps": len(roots), "files_checked": 0, "errors": 0, "warnings": 0}

    for app_root in roots:
        xml_files = iter_mule_xml(app_root)
        if args.git_diff:
            changed = git_changed_xml(app_root)
            if changed is not None:
                xml_files = [p for p in xml_files if p.resolve() in changed]
            else:
                print("git indisponível; ignorando --git-diff", file=sys.stderr)

        for xml_path in xml_files:
            summary["files_checked"] += 1
            all_issues.extend(check_file(xml_path, app_root))

    for issue in all_issues:
        if issue["severity"] == "error":
            summary["errors"] += 1
        elif issue["severity"] == "warning":
            summary["warnings"] += 1

    if args.json:
        print(json.dumps({"summary": summary, "issues": all_issues}, indent=2, ensure_ascii=False))
    else:
        if not all_issues:
            print(f"OK — {summary['files_checked']} arquivo(s), nenhum problema.")
        else:
            for issue in all_issues:
                prefix = issue["severity"].upper()
                loc = f"{issue['file']}:{issue['line']}"
                print(
                    f"{prefix} {loc} [{issue['handler']} type={issue['type']}] "
                    f"{issue['message']}"
                )
            print(
                f"\n{summary['errors']} erro(s), {summary['warnings']} aviso(s) "
                f"em {summary['files_checked']} arquivo(s)."
            )

    return 1 if summary["errors"] else 0


if __name__ == "__main__":
    sys.exit(main())
