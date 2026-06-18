#!/usr/bin/env python3
"""Testes locais dos hooks (rodar: py -3 .cursor/hooks/run-tests.py)."""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

HOOKS_DIR = Path(__file__).resolve().parent
WORKSPACE = HOOKS_DIR.parent.parent
BLOCK = HOOKS_DIR / "block-sensitive.py"
PROXY = HOOKS_DIR / "yaml-read-proxy.py"

CONFIG_PROD = (
    WORKSPACE
    / "workspace-prodesp-app/data-wallet-integrator-s-api/src/main/resources/properties/config-prod.yaml"
)
MAPPING = WORKSPACE.parent / "product-definition/mappings/mulesoft-integrations.yaml"


def run_script(script: Path, payload: dict, extra_args: list[str] | None = None) -> dict:
    cmd = [sys.executable, str(script)]
    if extra_args:
        cmd.extend(extra_args)
    proc = subprocess.run(
        cmd,
        input=json.dumps(payload),
        capture_output=True,
        text=True,
        check=False,
        cwd=str(WORKSPACE),
    )
    if proc.returncode != 0:
        raise RuntimeError(f"{script.name}: {proc.stderr or proc.stdout}")
    return json.loads(proc.stdout)


def test_redact_module() -> None:
    from redact_yaml import is_mule_resources_yaml, redact_yaml_content

    sample = (
        "api:\n"
        '  key: "secret-api-key"\n'
        '  id: "20260997"\n'
        "tokenIdp:\n"
        '  clientId: "my-client"\n'
        '  clientSecret: "uuid-here"\n'
        '  grantType: "client_credentials"\n'
    )
    out = redact_yaml_content(sample)
    assert "***REDACTED***" in out
    assert "secret-api-key" not in out
    assert "uuid-here" not in out
    assert "20260997" in out
    assert "client_credentials" in out

    assert is_mule_resources_yaml(str(CONFIG_PROD))
    if MAPPING.exists():
        assert not is_mule_resources_yaml(str(MAPPING))


def test_block_sensitive() -> None:
    assert (
        run_script(BLOCK, {"file_path": str(CONFIG_PROD), "content": ""}, ["--mode", "read"])[
            "permission"
        ]
        == "deny"
    )
    assert (
        run_script(
            BLOCK,
            {"file_path": str(WORKSPACE / "tarefas/foo.md"), "content": "ok"},
            ["--mode", "read"],
        )["permission"]
        == "allow"
    )
    redacted = (
        WORKSPACE
        / ".cursor/redacted/workspace-prodesp-app/data-wallet-integrator-s-api/"
        "src/main/resources/properties/config-prod.yaml"
    )
    assert (
        run_script(BLOCK, {"file_path": str(redacted), "content": ""}, ["--mode", "read"])[
            "permission"
        ]
        == "allow"
    )
    config_dev = (
        WORKSPACE
        / "workspace-prodesp-app/data-wallet-integrator-s-api/src/main/resources/properties/config-dev.yaml"
    )
    if config_dev.is_file():
        cat_out = run_script(
            BLOCK,
            {"command": f"cat {config_dev}", "cwd": str(WORKSPACE)},
            ["--mode", "shell"],
        )
        assert cat_out["permission"] == "allow"
        assert "updated_input" in cat_out
        cmd = cat_out["updated_input"]["command"].replace("\\", "/")
        assert ".cursor/redacted" in cmd
    assert (
        run_script(BLOCK, {"command": ""}, ["--mode", "read"])["permission"] == "allow"
    )
    assert (
        run_script(BLOCK, "{not-json", ["--mode", "read"])["permission"] == "allow"
    )
    assert (
        run_script(BLOCK, {"command": "git status"}, ["--mode", "shell"])["permission"] == "allow"
    )


def test_yaml_read_proxy() -> None:
    if not CONFIG_PROD.is_file():
        print("Skip proxy e2e: config-prod.yaml ausente")
        return

    out = run_script(
        PROXY,
        {
            "tool_name": "Read",
            "tool_input": {"path": str(CONFIG_PROD)},
            "cwd": str(WORKSPACE),
        },
    )
    assert out["permission"] == "allow"
    assert "updated_input" in out
    cache = Path(out["updated_input"]["path"])
    assert cache.is_file()
    text = cache.read_text(encoding="utf-8")
    assert "***REDACTED***" in text
    assert "clientSecret" in text
    assert run_script(
        PROXY,
        {
            "tool_name": "Grep",
            "tool_input": {"pattern": "clientSecret", "path": str(CONFIG_PROD)},
            "cwd": str(WORKSPACE),
        },
    )["permission"] == "deny"

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".yaml", delete=False, encoding="utf-8"
    ) as tmp:
        tmp.write("plain: true\n")
        tmp_path = tmp.name
    try:
        out_plain = run_script(
            PROXY,
            {
                "tool_name": "Read",
                "tool_input": {"path": tmp_path},
                "cwd": str(WORKSPACE),
            },
        )
        assert out_plain["permission"] == "allow"
        assert "updated_input" not in out_plain
    finally:
        Path(tmp_path).unlink(missing_ok=True)


def main() -> None:
    sys.path.insert(0, str(HOOKS_DIR))
    test_redact_module()
    test_block_sensitive()
    test_yaml_read_proxy()
    print("All hook tests passed.")


if __name__ == "__main__":
    main()
