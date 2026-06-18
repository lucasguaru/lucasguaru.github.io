#!/usr/bin/env python3
"""Obtém access_token OAuth (client_credentials) para Anypoint Platform."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

TOKEN_URL = "https://anypoint.mulesoft.com/accounts/api/v2/oauth2/token"


def get_access_token() -> str:
    client_id = os.environ.get("ANYPOINT_CLIENT_ID", "").strip()
    client_secret = os.environ.get("ANYPOINT_CLIENT_SECRET", "").strip()
    if not client_id or not client_secret:
        raise RuntimeError(
            "Defina ANYPOINT_CLIENT_ID e ANYPOINT_CLIENT_SECRET no ambiente."
        )

    payload = json.dumps(
        {
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        TOKEN_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as resp:
            body = json.load(resp)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Falha ao obter token OAuth (HTTP {exc.code}): {detail}") from exc

    token = body.get("access_token")
    if not token:
        raise RuntimeError("Resposta OAuth sem access_token.")
    return token


def main() -> int:
    try:
        print(get_access_token())
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
