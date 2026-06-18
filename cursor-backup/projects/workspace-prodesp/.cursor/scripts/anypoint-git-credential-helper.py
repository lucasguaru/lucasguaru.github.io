#!/usr/bin/env python3
"""Compat: use anypoint_git_credential_helper.py"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from anypoint_git_credential_helper import main

if __name__ == "__main__":
    raise SystemExit(main())
