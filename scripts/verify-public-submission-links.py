#!/usr/bin/env python3

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Iterable
from urllib.parse import urlparse

import requests


ROOT = Path("/home/x-pact/PrivateDAO")
PRIVATE_NOTES = Path("/home/x-pact/Desktop/private-notes")

SNAPSHOT_PATHS = [
    PRIVATE_NOTES / "superteam-open-submissions-2026-04-16.final-pass.json",
    PRIVATE_NOTES / "superteam-poland-grant-2026-04-16.final.json",
]

URL_PATTERN = re.compile(r"https?://[^\s<>()`\"']+")
ALLOWED_HOSTS = {
    "privatedao.org",
    "www.privatedao.org",
    "x-pact.github.io",
    "github.com",
    "youtu.be",
    "www.youtube.com",
}


def extract_urls(value: object) -> Iterable[str]:
    if isinstance(value, str):
        yield from URL_PATTERN.findall(value)
        return
    if isinstance(value, dict):
        for nested in value.values():
            yield from extract_urls(nested)
        return
    if isinstance(value, list):
        for nested in value:
            yield from extract_urls(nested)


def normalize(url: str) -> str:
    return url.rstrip(".,);")


def should_check(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme in {"http", "https"} and parsed.netloc in ALLOWED_HOSTS


def collect_urls() -> list[str]:
    urls: list[str] = []
    for snapshot_path in SNAPSHOT_PATHS:
        if not snapshot_path.exists():
            continue
        data = json.loads(snapshot_path.read_text())
        for url in extract_urls(data):
            normalized = normalize(url)
            if should_check(normalized):
                urls.append(normalized)
    return sorted(set(urls))


def verify(url: str) -> tuple[str, int, str]:
    response = requests.get(
        url,
        allow_redirects=True,
        timeout=20,
        headers={"User-Agent": "PrivateDAO Link Verifier/1.0"},
    )
    return url, response.status_code, response.url


def main() -> int:
    urls = collect_urls()
    if not urls:
        print("No URLs found to verify.")
        return 1

    failures = 0
    for url in urls:
        try:
            source, status_code, final_url = verify(url)
        except Exception as exc:  # pragma: no cover - operational verifier
            failures += 1
            print(f"FAIL {url} -> {exc}")
            continue

        if status_code >= 400:
            failures += 1
            print(f"FAIL {source} -> {status_code} -> {final_url}")
            continue

        if source.startswith("https://x-pact.github.io/") and final_url.startswith("http://privatedao.org/"):
            failures += 1
            print(f"WARN {source} -> insecure redirect -> {final_url}")
            continue

        print(f"OK   {source} -> {status_code} -> {final_url}")

    if failures:
        print(f"\n{failures} link issue(s) detected.")
        return 2

    print(f"\nVerified {len(urls)} public submission link(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
