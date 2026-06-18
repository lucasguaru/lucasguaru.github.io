#!/usr/bin/env python3
"""
Git credential helper para repositórios Git do Design Center (anypoint.mulesoft.com).

Autentica com OAuth client_credentials: username oauth2 + access_token como password.
Requer ANYPOINT_CLIENT_ID / ANYPOINT_CLIENT_SECRET e scope Design Center Developer.
"""

from __future__ import annotations

import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from anypoint_oauth_token import get_access_token  # noqa: E402

ANYPOINT_HOST = "anypoint.mulesoft.com"
GIT_USERNAME = "oauth2"


def read_credential_request() -> dict[str, str]:
    context: dict[str, str] = {}
    while True:
        line = sys.stdin.readline()
        if not line:
            break
        line = line.strip()
        if not line:
            break
        if "=" in line:
            key, value = line.split("=", 1)
            context[key] = value
    return context


def handle_get(context: dict[str, str]) -> int:
    if context.get("host") != ANYPOINT_HOST:
        return 0

    try:
        token = get_access_token()
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    print(f"username={GIT_USERNAME}")
    print(f"password={token}")
    return 0


def main() -> int:
    if len(sys.argv) < 2:
        return 0

    operation = sys.argv[1]
    if operation == "get":
        return handle_get(read_credential_request())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
