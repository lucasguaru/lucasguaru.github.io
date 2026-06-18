#!/usr/bin/env python3
"""Validação mecânica do padrão PRODESP CloudHub 2 (pom.xml + mule-artifact.json).

Uso:
  python validate-ch2.py <caminho-da-app>
  python validate-ch2.py workspace-prodesp-app/management-payments-receipts-s-api
  python validate-ch2.py --check-env <caminho-da-app>

Exit code: 0 = sem FAIL; 1 = pelo menos um FAIL.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import xml.etree.ElementTree as ET
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Literal

Status = Literal["pass", "fail", "warn", "skip"]

POM_NS = {"m": "http://maven.apache.org/POM/4.0.0"}
EXPECTED_SECURE_RUNTIME_KEYS = {
    "anypoint.platform.client_secret",
    "request.clientSecret",
    "encrypt.key",
}
EXPECTED_ENV_BINDINGS = {
    "connectedAppClientId": "${env.ANYPOINT_CLIENT_ID}",
    "connectedAppClientSecret": "${env.ANYPOINT_CLIENT_SECRET}",
    "anypointPlatformClientId": "${env.ANYPOINT_PLATFORM_CLIENT_ID}",
    "anypointPlatformClientSecret": "${env.ANYPOINT_PLATFORM_CLIENT_SECRET}",
    "requestClientId": "${env.REQUEST_CLIENT_ID}",
    "requestClientSecret": "${env.REQUEST_CLIENT_SECRET}",
}
NONPROD_MULE_ENVS = frozenset({"dev", "local", "qa"})
NONPROD_TARGET_NAME = "ps-nonprod-connectivity"
LEGACY_NONPROD_TARGET_NAME = "ps-nonprod"
ENCRYPT_KEY_ENV_BY_MULE_ENV = {
    "dev": "ENCRYPT_KEY_DEV_QA",
    "local": "ENCRYPT_KEY_DEV_QA",
    "qa": "ENCRYPT_KEY_DEV_QA",
    "prod": "ENCRYPT_KEY_PROD",
}
ENV_VARS_FOR_DEPLOY = [
    "ANYPOINT_CLIENT_ID",
    "ANYPOINT_CLIENT_SECRET",
    "ANYPOINT_PLATFORM_CLIENT_ID",
    "ANYPOINT_PLATFORM_CLIENT_SECRET",
    "REQUEST_CLIENT_ID",
    "REQUEST_CLIENT_SECRET",
]
PLATFORM_ENV_BY_DEPLOY_TARGET = {
    "dev": ("ANYPOINT_PLATFORM_CLIENT_ID", "ANYPOINT_PLATFORM_CLIENT_SECRET"),
    "local": ("ANYPOINT_PLATFORM_CLIENT_ID", "ANYPOINT_PLATFORM_CLIENT_SECRET"),
    "qa": ("ANYPOINT_PLATFORM_CLIENT_ID_QA", "ANYPOINT_PLATFORM_CLIENT_SECRET_QA"),
    "prod": ("ANYPOINT_PLATFORM_CLIENT_ID", "ANYPOINT_PLATFORM_CLIENT_SECRET"),
}
SECRET_KEY_FRAGMENTS = ("secret", "Secret", "password", "Password")


@dataclass
class Check:
    id: str
    status: Status
    message: str
    fix: str = ""
    evidence: str = ""


@dataclass
class Report:
    app: str
    path: str
    checks: list[Check] = field(default_factory=list)

    def add(self, check: Check) -> None:
        self.checks.append(check)

    def summary(self) -> dict[str, int]:
        counts = {"pass": 0, "fail": 0, "warn": 0, "skip": 0}
        for c in self.checks:
            counts[c.status] += 1
        return counts

    def ready(self) -> bool:
        return all(c.status != "fail" for c in self.checks)


def _pom_text(elem: ET.Element | None) -> str:
    if elem is None or elem.text is None:
        return ""
    return elem.text.strip()


def _find_pom_child(root: ET.Element, tag: str) -> ET.Element | None:
    return root.find(f"m:{tag}", POM_NS)


def _find_properties(root: ET.Element) -> dict[str, str]:
    props: dict[str, str] = {}
    properties = _find_pom_child(root, "properties")
    if properties is None:
        return props
    for child in properties:
        tag = child.tag.split("}")[-1] if "}" in child.tag else child.tag
        props[tag] = _pom_text(child)
    return props


def _find_mule_plugin_config(root: ET.Element) -> ET.Element | None:
    for plugin in root.findall(".//m:plugin", POM_NS):
        artifact = plugin.find("m:artifactId", POM_NS)
        if _pom_text(artifact) == "mule-maven-plugin":
            return plugin.find("m:configuration", POM_NS)
    return None


def _find_cloudhub2(config: ET.Element | None) -> ET.Element | None:
    if config is None:
        return None
    for child in config:
        tag = child.tag.split("}")[-1] if "}" in child.tag else child.tag
        if tag == "cloudhub2Deployment":
            return child
    return None


def _child_map(parent: ET.Element | None) -> dict[str, str]:
    result: dict[str, str] = {}
    if parent is None:
        return result
    for child in parent:
        tag = child.tag.split("}")[-1] if "}" in child.tag else child.tag
        result[tag] = _pom_text(child)
    return result


def _nested_child_map(parent: ET.Element | None, container_tag: str) -> dict[str, str]:
    if parent is None:
        return {}
    for child in parent:
        tag = child.tag.split("}")[-1] if "}" in child.tag else child.tag
        if tag == container_tag:
            return _child_map(child)
    return {}


def _looks_hardcoded(value: str) -> bool:
    if not value:
        return False
    if "${" in value:
        return False
    if re.fullmatch(r"[0-9a-fA-F-]{32,}", value):
        return True
    if len(value) >= 16 and value.isalnum():
        return True
    return False


def _repo_ids(root: ET.Element) -> list[str]:
    ids: list[str] = []
    for repo in root.findall(".//m:repository", POM_NS):
        repo_id = _find_pom_child(repo, "id")
        if repo_id is not None:
            ids.append(_pom_text(repo_id))
    return ids


def _distribution_repo_id(root: ET.Element) -> str:
    dist = _find_pom_child(root, "distributionManagement")
    if dist is None:
        return ""
    repo = dist.find("m:repository", POM_NS)
    if repo is None:
        return ""
    return _pom_text(repo.find("m:id", POM_NS))


def _resolve_app_path(raw: str) -> Path:
    path = Path(raw).resolve()
    if not path.is_dir():
        raise FileNotFoundError(f"Diretório não encontrado: {path}")
    pom = path / "pom.xml"
    if not pom.is_file():
        raise FileNotFoundError(f"pom.xml não encontrado em: {path}")
    return path


CANONICAL_API_SPEC_TEMPLATE = (
    "resource::${project.groupId}:${api.name}:${api.version}:raml:zip:${api.name}.raml"
)


def _parse_config_yaml_api_section(config_path: Path) -> dict[str, str]:
    if not config_path.is_file():
        return {}
    api_fields: dict[str, str] = {}
    in_api = False
    for line in config_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped == "api:":
            in_api = True
            continue
        if in_api:
            if line and not line[0].isspace() and ":" in stripped:
                break
            match = re.match(r"^\s+(\w+):\s*(.+)$", line)
            if match:
                key, raw_value = match.group(1), match.group(2).strip()
                if (raw_value.startswith('"') and raw_value.endswith('"')) or (
                    raw_value.startswith("'") and raw_value.endswith("'")
                ):
                    raw_value = raw_value[1:-1]
                api_fields[key] = raw_value
    return api_fields


def _find_apikit_api_attr(app_dir: Path) -> tuple[str | None, str]:
    zgc = app_dir / "src/main/mule/common/z-global-config.xml"
    if not zgc.is_file():
        return None, ""
    text = zgc.read_text(encoding="utf-8")
    match = re.search(r"<apikit:config\b[\s\S]*?\bapi=\"([^\"]+)\"", text)
    if match is None:
        return None, zgc.as_posix()
    return match.group(1), zgc.as_posix()


def _env_vars_for_deploy(deploy_target: str) -> list[str]:
    target = deploy_target.lower()
    platform_id, platform_secret = PLATFORM_ENV_BY_DEPLOY_TARGET.get(
        target, PLATFORM_ENV_BY_DEPLOY_TARGET["dev"]
    )
    return [
        "ANYPOINT_CLIENT_ID",
        "ANYPOINT_CLIENT_SECRET",
        platform_id,
        platform_secret,
        "REQUEST_CLIENT_ID",
        "REQUEST_CLIENT_SECRET",
    ]


def validate_app(app_dir: Path, check_env: bool, deploy_target: str | None = None) -> Report:
    pom_path = app_dir / "pom.xml"
    artifact_path = app_dir / "mule-artifact.json"
    root = ET.parse(pom_path).getroot()

    artifact_id = _pom_text(_find_pom_child(root, "artifactId"))
    project_name = _pom_text(_find_pom_child(root, "name"))
    version = _pom_text(_find_pom_child(root, "version"))
    props = _find_properties(root)
    api_name = props.get("api.name", "")

    report = Report(app=project_name or artifact_id, path=str(app_dir))

    # 1 — artifactId -app
    if artifact_id.endswith("-app"):
        report.add(Check("artifact-id-app", "pass", "artifactId termina em -app", evidence=artifact_id))
    elif artifact_id.endswith("-api"):
        report.add(
            Check(
                "artifact-id-app",
                "fail",
                f"artifactId '{artifact_id}' usa sufixo -api (deve ser -app no Exchange)",
                fix="Renomear artifactId para {base}-app; manter <name> e api.name com -api",
                evidence=artifact_id,
            )
        )
    else:
        report.add(
            Check(
                "artifact-id-app",
                "warn",
                f"artifactId '{artifact_id}' não termina em -app",
                fix="Padronizar artifactId com sufixo -app",
                evidence=artifact_id,
            )
        )

    # 2 — name / api.name distintos do artifactId
    if project_name and artifact_id and project_name != artifact_id:
        report.add(Check("name-distinct", "pass", "<name> distinto de artifactId", evidence=project_name))
    else:
        report.add(
            Check(
                "name-distinct",
                "fail",
                "<name> deve ser distinto de artifactId (tipicamente -api)",
                fix=f"Definir <name> como api lógica (ex.: {api_name or '…-api'})",
                evidence=project_name or "(vazio)",
            )
        )

    if api_name:
        if api_name.endswith("-api") or api_name == project_name:
            report.add(Check("api-name", "pass", "api.name definido", evidence=api_name))
        else:
            report.add(
                Check(
                    "api-name",
                    "warn",
                    f"api.name '{api_name}' fora do padrão -api",
                    fix="Alinhar api.name ao asset RAML",
                    evidence=api_name,
                )
            )
    else:
        report.add(
            Check(
                "api-name",
                "warn",
                "Propriedade api.name ausente no pom",
                fix="Adicionar <api.name> com nome do asset RAML",
            )
        )

    # 3 — versão SNAPSHOT (deploy local)
    if version.endswith("-SNAPSHOT"):
        report.add(Check("version-snapshot", "pass", "Versão em SNAPSHOT", evidence=version))
    else:
        report.add(
            Check(
                "version-snapshot",
                "warn",
                f"Versão '{version}' sem -SNAPSHOT (deploy local costuma usar SNAPSHOT)",
                fix="Incrementar patch e usar -SNAPSHOT, ou confirmar release intencional",
                evidence=version,
            )
        )

    config = _find_mule_plugin_config(root)
    ch2 = _find_cloudhub2(config)
    if ch2 is None:
        report.add(
            Check(
                "cloudhub2-block",
                "fail",
                "cloudhub2Deployment ausente no mule-maven-plugin",
                fix="Adicionar bloco cloudhub2Deployment conforme referência canônica",
            )
        )
        return report

    ch2_map = _child_map(ch2)
    mule_env = props.get("mule.env", "dev").lower()

    # 4 — classifier
    classifier = _pom_text(config.find("m:classifier", POM_NS)) if config is not None else ""
    if classifier == "mule-application":
        report.add(Check("classifier", "pass", "classifier mule-application", evidence=classifier))
    else:
        report.add(
            Check(
                "classifier",
                "fail",
                f"classifier '{classifier or '(vazio)'}' incorreto",
                fix="Definir <classifier>mule-application</classifier>",
                evidence=classifier,
            )
        )

    # 5 — targetName (private space CH2 nonprod)
    target_name = props.get("targetName", "")
    ch2_target = ch2_map.get("target", "")
    if ch2_target == "${targetName}":
        report.add(
            Check(
                "deploy-ref-target",
                "pass",
                "cloudhub2 target referencia ${targetName}",
                evidence=ch2_target,
            )
        )
    else:
        report.add(
            Check(
                "deploy-ref-target",
                "fail",
                "cloudhub2 target deve referenciar property Maven targetName",
                fix="Usar <target>${targetName}</target>",
                evidence=ch2_target,
            )
        )

    if mule_env in NONPROD_MULE_ENVS:
        if target_name == NONPROD_TARGET_NAME:
            report.add(
                Check(
                    "target-name",
                    "pass",
                    "targetName nonprod no padrão",
                    evidence=target_name,
                )
            )
        elif target_name == LEGACY_NONPROD_TARGET_NAME:
            report.add(
                Check(
                    "target-name",
                    "fail",
                    f"targetName legado '{LEGACY_NONPROD_TARGET_NAME}'",
                    fix=f"Usar <targetName>{NONPROD_TARGET_NAME}</targetName>",
                    evidence=target_name,
                )
            )
        elif target_name:
            report.add(
                Check(
                    "target-name",
                    "warn",
                    f"targetName '{target_name}' fora do padrão nonprod usual",
                    fix=f"Confirmar no Runtime Manager; padrão PRODESP: {NONPROD_TARGET_NAME}",
                    evidence=target_name,
                )
            )
        else:
            report.add(
                Check(
                    "target-name",
                    "fail",
                    "targetName ausente nas properties do pom",
                    fix=f"Adicionar <targetName>{NONPROD_TARGET_NAME}</targetName>",
                )
            )
    else:
        report.add(
            Check(
                "target-name",
                "skip",
                "Checagem de targetName nonprod omitida (mule.env prod)",
                evidence=target_name or "(vazio)",
            )
        )

    # 6 — applicationName
    app_name = ch2_map.get("applicationName", "")
    expected_app_name = "${project.name}-${mule.env}"
    if app_name == expected_app_name:
        report.add(Check("application-name", "pass", "applicationName no padrão", evidence=app_name))
    else:
        report.add(
            Check(
                "application-name",
                "fail",
                f"applicationName '{app_name or '(vazio)'}' incorreto",
                fix=f"Usar <applicationName>{expected_app_name}</applicationName>",
                evidence=app_name,
            )
        )

    # 6b — pom default Dev (QA/Prod só via -D no mule:deploy)
    pom_mule_env = props.get("mule.env", "dev").lower()
    pom_environment = props.get("environment", "")
    pom_path_rewrite = props.get("pathRewrite", "")
    if pom_mule_env == "dev" and pom_environment.upper() == "DEV" and pom_path_rewrite == "/dev":
        report.add(
            Check(
                "pom-default-dev",
                "pass",
                "pom.xml com default Dev (mule.env/environment/pathRewrite)",
                evidence=f"mule.env={pom_mule_env}, environment={pom_environment}, pathRewrite={pom_path_rewrite}",
            )
        )
    else:
        report.add(
            Check(
                "pom-default-dev",
                "fail",
                "pom.xml deve manter default Dev no repositório",
                fix="Usar <environment>DEV</environment>, <mule.env>dev</mule.env>, <pathRewrite>/dev</pathRewrite>; deploy QA via -D no mvn mule:deploy (skill deploy §5)",
                evidence=f"mule.env={pom_mule_env or '(vazio)'}, environment={pom_environment or '(vazio)'}, pathRewrite={pom_path_rewrite or '(vazio)'}",
            )
        )

    encrypt_key_env = ENCRYPT_KEY_ENV_BY_MULE_ENV.get(mule_env, "ENCRYPT_KEY_DEV_QA")
    expected_encrypt_key_binding = f"${{env.{encrypt_key_env}}}"
    encrypt_env_bindings = {
        **EXPECTED_ENV_BINDINGS,
        "encryptKey": expected_encrypt_key_binding,
    }

    # 6 — credenciais via env nas properties do pom
    for prop_name, expected in encrypt_env_bindings.items():
        actual = props.get(prop_name, "")
        if actual == expected:
            report.add(Check(f"env-binding-{prop_name}", "pass", f"{prop_name} via env", evidence=actual))
        elif not actual:
            report.add(
                Check(
                    f"env-binding-{prop_name}",
                    "fail",
                    f"Propriedade {prop_name} ausente",
                    fix=f"Adicionar <{prop_name}>{expected}</{prop_name}>",
                )
            )
        elif _looks_hardcoded(actual):
            report.add(
                Check(
                    f"env-binding-{prop_name}",
                    "fail",
                    f"{prop_name} com valor hardcoded",
                    fix=f"Substituir por {expected}",
                    evidence="(valor omitido — hardcoded detectado)",
                )
            )
        else:
            report.add(
                Check(
                    f"env-binding-{prop_name}",
                    "fail",
                    f"{prop_name} não referencia env esperada",
                    fix=f"Usar {expected}",
                    evidence=actual,
                )
            )

    # 7 — deployment referencia properties camelCase, não env direto
    for dep_key, expected in (
        ("connectedAppClientId", "${connectedAppClientId}"),
        ("connectedAppClientSecret", "${connectedAppClientSecret}"),
        ("connectedAppGrantType", "${connectedAppGrantType}"),
    ):
        actual = ch2_map.get(dep_key, "")
        if actual == expected:
            report.add(Check(f"deploy-ref-{dep_key}", "pass", f"cloudhub2 {dep_key} correto", evidence=actual))
        else:
            report.add(
                Check(
                    f"deploy-ref-{dep_key}",
                    "fail",
                    f"cloudhub2 {dep_key} deve referenciar property Maven",
                    fix=f"Usar <{dep_key}>{expected}</{dep_key}>",
                    evidence=actual,
                )
            )

    # 8 — runtime properties vs secureProperties
    runtime_props = _nested_child_map(ch2, "properties")
    secure_props = _nested_child_map(ch2, "secureProperties")

    forbidden_in_runtime = [k for k in runtime_props if any(s in k for s in SECRET_KEY_FRAGMENTS)]
    if forbidden_in_runtime:
        report.add(
            Check(
                "runtime-secrets",
                "fail",
                "Secrets encontrados em cloudhub2Deployment/properties",
                fix="Mover para <secureProperties>",
                evidence=", ".join(forbidden_in_runtime),
            )
        )
    else:
        report.add(Check("runtime-secrets", "pass", "Sem secrets em runtime properties"))

    for key in ("anypoint.platform.client_id", "request.clientId"):
        if key in runtime_props:
            report.add(Check(f"runtime-{key}", "pass", f"{key} em properties", evidence=runtime_props[key]))
        else:
            report.add(
                Check(
                    f"runtime-{key}",
                    "fail",
                    f"{key} ausente em cloudhub2Deployment/properties",
                    fix=f"Adicionar <{key}> com property Maven correspondente",
                )
            )

    for key in EXPECTED_SECURE_RUNTIME_KEYS:
        if key in secure_props:
            report.add(Check(f"secure-{key}", "pass", f"{key} em secureProperties"))
        else:
            report.add(
                Check(
                    f"secure-{key}",
                    "fail",
                    f"{key} ausente em cloudhub2Deployment/secureProperties",
                    fix=f"Adicionar <{key}> em secureProperties",
                )
            )

    encrypt_key_ref = secure_props.get("encrypt.key", "")
    if encrypt_key_ref == "${encryptKey}":
        report.add(
            Check(
                "secure-encrypt-key-ref",
                "pass",
                "encrypt.key referencia property Maven encryptKey",
                evidence=encrypt_key_ref,
            )
        )
    elif "encrypt.key" in secure_props:
        report.add(
            Check(
                "secure-encrypt-key-ref",
                "fail",
                "encrypt.key deve referenciar ${encryptKey}, não valor direto",
                fix="<encrypt.key>${encryptKey}</encrypt.key>",
                evidence=encrypt_key_ref,
            )
        )

    # 9 — mule-artifact.json
    if artifact_path.is_file():
        artifact_json = json.loads(artifact_path.read_text(encoding="utf-8"))
        registered = set(artifact_json.get("secureProperties", []))
        missing = EXPECTED_SECURE_RUNTIME_KEYS - registered
        extra_ok = registered >= EXPECTED_SECURE_RUNTIME_KEYS
        if not missing:
            report.add(
                Check(
                    "mule-artifact-secure",
                    "pass",
                    "mule-artifact.json registra secureProperties",
                    evidence=", ".join(sorted(registered)),
                )
            )
        else:
            report.add(
                Check(
                    "mule-artifact-secure",
                    "fail",
                    "mule-artifact.json sem secureProperties esperadas",
                    fix=f"Incluir em secureProperties: {', '.join(sorted(missing))}",
                    evidence=", ".join(sorted(registered)) if registered else "(vazio)",
                )
            )
        if not extra_ok and not missing:
            pass
    else:
        report.add(
            Check(
                "mule-artifact-secure",
                "fail",
                "mule-artifact.json ausente",
                fix="Criar mule-artifact.json com secureProperties de runtime",
            )
        )

    # 10 — distributionManagement / repository id
    dist_id = _distribution_repo_id(root)
    if dist_id == "anypoint-exchange-v3":
        report.add(Check("distribution-id", "pass", "distributionManagement id correto", evidence=dist_id))
    elif dist_id:
        report.add(
            Check(
                "distribution-id",
                "fail",
                f"distributionManagement id '{dist_id}'",
                fix="Usar <id>anypoint-exchange-v3</id>",
                evidence=dist_id,
            )
        )
    else:
        report.add(
            Check(
                "distribution-id",
                "fail",
                "distributionManagement ausente ou sem repository id",
                fix="Adicionar distributionManagement com id anypoint-exchange-v3",
            )
        )

    repo_ids = _repo_ids(root)
    if "anypoint-exchange-v3" in repo_ids:
        report.add(Check("repository-id", "pass", "Repository anypoint-exchange-v3 presente"))
    else:
        report.add(
            Check(
                "repository-id",
                "fail",
                "Repository anypoint-exchange-v3 ausente",
                fix="Adicionar repository com id anypoint-exchange-v3",
                evidence=", ".join(repo_ids) if repo_ids else "(nenhum)",
            )
        )

    # 11 — env vars (opcional)
    if check_env:
        effective_target = (deploy_target or mule_env).lower()
        env_vars_to_check = [
            *_env_vars_for_deploy(effective_target),
            encrypt_key_env,
        ]
        missing_env = [v for v in env_vars_to_check if not os.environ.get(v)]
        if missing_env:
            report.add(
                Check(
                    "env-vars",
                    "warn",
                    "Variáveis de ambiente ausentes para deploy",
                    fix="Exportar: " + ", ".join(missing_env),
                    evidence=", ".join(missing_env),
                )
            )
        else:
            report.add(
                Check(
                    "env-vars",
                    "pass",
                    f"Variáveis de ambiente de deploy presentes (incl. {encrypt_key_env}; valores não inspecionados)",
                )
            )
    else:
        report.add(
            Check(
                "env-vars",
                "skip",
                "Checagem de env vars omitida (use --check-env)",
            )
        )

    # 12 — config.yaml: identidade RAML (não confundir com artifactId -app)
    config_yaml_path = app_dir / "src/main/resources/properties/config.yaml"
    api_cfg = _parse_config_yaml_api_section(config_yaml_path)
    if not api_cfg:
        report.add(
            Check(
                "config-api-block",
                "warn",
                "Bloco api ausente ou config.yaml não encontrado",
                fix="Adicionar bloco api em src/main/resources/properties/config.yaml",
                evidence=str(config_yaml_path.relative_to(app_dir)),
            )
        )
    else:
        report.add(
            Check(
                "config-api-block",
                "pass",
                "Bloco api presente em config.yaml",
                evidence=str(config_yaml_path.relative_to(app_dir)),
            )
        )
        cfg_artifact = api_cfg.get("artifactId", "")
        if cfg_artifact == "${api.name}":
            report.add(
                Check(
                    "config-api-artifact-id",
                    "pass",
                    "config.yaml api.artifactId referencia api.name (RAML)",
                    evidence=cfg_artifact,
                )
            )
        elif "${project.artifactId}" in cfg_artifact:
            report.add(
                Check(
                    "config-api-artifact-id",
                    "fail",
                    "config.yaml api.artifactId usa ${project.artifactId} (vira -app após migração CH2)",
                    fix='Trocar para artifactId: "${api.name}"',
                    evidence=cfg_artifact,
                )
            )
        else:
            report.add(
                Check(
                    "config-api-artifact-id",
                    "warn",
                    "config.yaml api.artifactId fora do padrão ${api.name}",
                    fix='Usar artifactId: "${api.name}"',
                    evidence=cfg_artifact or "(vazio)",
                )
            )

        cfg_spec = api_cfg.get("spec", "")
        if cfg_spec == CANONICAL_API_SPEC_TEMPLATE:
            report.add(
                Check(
                    "config-api-spec",
                    "pass",
                    "config.yaml api.spec no padrão canônico",
                    evidence=cfg_spec,
                )
            )
        elif not cfg_spec:
            report.add(
                Check(
                    "config-api-spec",
                    "fail",
                    "config.yaml sem api.spec",
                    fix=f'Adicionar spec: "{CANONICAL_API_SPEC_TEMPLATE}"',
                )
            )
        elif "${project.artifactId}" in cfg_spec:
            report.add(
                Check(
                    "config-api-spec",
                    "fail",
                    "config.yaml api.spec referencia ${project.artifactId}",
                    fix=f'Usar spec: "{CANONICAL_API_SPEC_TEMPLATE}"',
                    evidence=cfg_spec,
                )
            )
        elif "${project.name}" in cfg_spec and "${api.name}" not in cfg_spec:
            report.add(
                Check(
                    "config-api-spec",
                    "warn",
                    "config.yaml api.spec usa ${project.name} em vez de ${api.name}",
                    fix=f'Preferir spec: "{CANONICAL_API_SPEC_TEMPLATE}"',
                    evidence=cfg_spec,
                )
            )
        elif "${api.name}" in cfg_spec and "resource::" in cfg_spec:
            report.add(
                Check(
                    "config-api-spec",
                    "pass",
                    "config.yaml api.spec referencia api.name",
                    evidence=cfg_spec,
                )
            )
        else:
            report.add(
                Check(
                    "config-api-spec",
                    "warn",
                    "config.yaml api.spec fora do padrão canônico",
                    fix=f'Usar spec: "{CANONICAL_API_SPEC_TEMPLATE}"',
                    evidence=cfg_spec,
                )
            )

    # 13 — apikit:config deve consumir ${api.spec} (evita URI RAML hardcoded)
    apikit_api, apikit_path = _find_apikit_api_attr(app_dir)
    if apikit_api is None:
        report.add(
            Check(
                "apikit-api-spec-ref",
                "skip",
                "apikit:config não encontrado em common/z-global-config.xml",
                evidence=apikit_path or "src/main/mule/common/z-global-config.xml",
            )
        )
    elif apikit_api == "${api.spec}":
        report.add(
            Check(
                "apikit-api-spec-ref",
                "pass",
                "apikit:config referencia ${api.spec}",
                evidence=apikit_api,
            )
        )
    elif apikit_api.startswith("resource::") and "${" not in apikit_api:
        report.add(
            Check(
                "apikit-api-spec-ref",
                "fail",
                "apikit:config com URI RAML hardcoded (desalinha ao publicar nova api.version)",
                fix='Trocar api="${api.spec}" e definir api.spec em config.yaml',
                evidence=apikit_api[:80] + ("…" if len(apikit_api) > 80 else ""),
            )
        )
    else:
        report.add(
            Check(
                "apikit-api-spec-ref",
                "warn",
                "apikit:config api fora do padrão ${api.spec}",
                fix='Usar api="${api.spec}" em common/z-global-config.xml',
                evidence=apikit_api,
            )
        )

    return report


def main() -> int:
    parser = argparse.ArgumentParser(description="Valida padrão PRODESP CloudHub 2")
    parser.add_argument("app_path", help="Caminho da app Mule (diretório com pom.xml)")
    parser.add_argument(
        "--check-env",
        action="store_true",
        help="Verificar presença das env vars de deploy + encrypt key (sem exibir valores)",
    )
    parser.add_argument(
        "--deploy-target",
        choices=("dev", "local", "qa", "prod"),
        default=None,
        help="Ambiente alvo do deploy (default: mule.env do pom). QA exige ANYPOINT_PLATFORM_*_QA.",
    )
    parser.add_argument(
        "--format",
        choices=("json", "text"),
        default="json",
        help="Formato de saída (default: json)",
    )
    args = parser.parse_args()

    try:
        app_dir = _resolve_app_path(args.app_path)
        report = validate_app(
            app_dir, check_env=args.check_env, deploy_target=args.deploy_target
        )
    except (FileNotFoundError, ET.ParseError, json.JSONDecodeError) as exc:
        print(json.dumps({"error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 1

    summary = report.summary()
    payload = {
        "app": report.app,
        "path": report.path,
        "ready": report.ready(),
        "summary": summary,
        "checks": [asdict(c) for c in report.checks],
    }

    if args.format == "json":
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    else:
        print(f"CH2 Deploy Readiness — {report.app}")
        print(f"Path: {report.path}")
        print(f"Ready: {'sim' if report.ready() else 'não'} ({summary['pass']} pass, {summary['fail']} fail, {summary['warn']} warn)")
        print()
        for c in report.checks:
            icon = {"pass": "OK", "fail": "FAIL", "warn": "WARN", "skip": "SKIP"}[c.status]
            print(f"[{icon}] {c.id}: {c.message}")
            if c.evidence:
                print(f"      evidência: {c.evidence}")
            if c.fix and c.status != "pass":
                print(f"      correção: {c.fix}")

    return 0 if report.ready() else 1


if __name__ == "__main__":
    raise SystemExit(main())
