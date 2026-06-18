#!/usr/bin/env python3
"""Fetch active scope logging config for a CH2 deployment (PRODESP)."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

DEFAULT_ORG = "1c8711d7-2135-4686-89f0-fb014e1662ac"
BASE = "https://anypoint.mulesoft.com"


def _post_json(url: str, payload: dict) -> dict:
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def _get_json(url: str, token: str) -> dict:
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"bearer {token}", "Accept": "application/json"},
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def token_from_env() -> str:
    client_id = os.environ.get("ANYPOINT_CLIENT_ID")
    client_secret = os.environ.get("ANYPOINT_CLIENT_SECRET")
    if not client_id or not client_secret:
        sys.exit("Defina ANYPOINT_CLIENT_ID e ANYPOINT_CLIENT_SECRET.")
    data = _post_json(
        f"{BASE}/accounts/api/v2/oauth2/token",
        {
            "client_id": client_id,
            "client_secret": client_secret,
            "grant_type": "client_credentials",
        },
    )
    return data["access_token"]


def resolve_env_id(token: str, org_id: str, env_name: str) -> str:
    url = f"{BASE}/accounts/api/organizations/{org_id}/environments"
    for env in _get_json(url, token).get("data", []):
        if env.get("name") == env_name:
            return env["id"]
    sys.exit(f"Ambiente '{env_name}' não encontrado na org {org_id}.")


def find_deployment(token: str, org_id: str, env_id: str, app_name: str) -> dict:
    url = (
        f"{BASE}/amc/application-manager/api/v2/organizations/{org_id}"
        f"/environments/{env_id}/deployments"
    )
    data = _get_json(url, token)
    items = data if isinstance(data, list) else data.get("items", data.get("data", []))
    for dep in items:
        if dep.get("name") == app_name:
            dep_id = dep["id"]
            detail_url = (
                f"{BASE}/amc/application-manager/api/v2/organizations/{org_id}"
                f"/environments/{env_id}/deployments/{dep_id}"
            )
            return _get_json(detail_url, token)
    sys.exit(f"App '{app_name}' não encontrada no ambiente.")


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit("Uso: get-scope-logging.py <app-name> [environment-name] [org-id]")

    app_name = sys.argv[1]
    env_name = sys.argv[2] if len(sys.argv) > 2 else os.environ.get("ANYPOINT_ENV", "DEV")
    org_id = sys.argv[3] if len(sys.argv) > 3 else os.environ.get("ANYPOINT_ORG", DEFAULT_ORG)

    token = token_from_env()
    env_id = resolve_env_id(token, org_id, env_name)
    dep = find_deployment(token, org_id, env_id, app_name)

    logging_svc = (
        dep.get("application", {})
        .get("configuration", {})
        .get("mule.agent.logging.service", {})
    )
    deploy_settings = dep.get("target", {}).get("deploymentSettings", {})
    ref = dep.get("application", {}).get("ref", {})

    out = {
        "appName": dep.get("name"),
        "deploymentId": dep.get("id"),
        "environment": env_name,
        "environmentId": env_id,
        "status": dep.get("application", {}).get("status"),
        "artifact": {
            "groupId": ref.get("groupId"),
            "artifactId": ref.get("artifactId"),
            "version": ref.get("version"),
        },
        "disableAmLogForwarding": deploy_settings.get("disableAmLogForwarding"),
        "tracingEnabled": deploy_settings.get("tracingEnabled"),
        "scopeLoggingConfigurations": logging_svc.get("scopeLoggingConfigurations", []),
    }
    print(json.dumps(out, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
