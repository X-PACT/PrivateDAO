#!/usr/bin/env python3

from __future__ import annotations

import sys
from html.parser import HTMLParser
from typing import Optional

import requests

CORE_URLS = [
    "https://privatedao.org/",
    "https://privatedao.org/start/",
    "https://privatedao.org/learn/",
    "https://privatedao.org/services/",
    "https://privatedao.org/proof/",
    "https://privatedao.org/documents/reviewer-fast-path/",
    "https://privatedao.org/judge/",
]


class HeadParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.robots: Optional[str] = None
        self.canonical: Optional[str] = None
        self.title: Optional[str] = None
        self._capture_title = False

    def handle_starttag(self, tag: str, attrs):
        attrs = dict(attrs)
        if tag == "meta" and attrs.get("name", "").lower() == "robots":
            self.robots = attrs.get("content")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs.get("href")
        if tag == "title":
            self._capture_title = True

    def handle_endtag(self, tag: str):
        if tag == "title":
            self._capture_title = False

    def handle_data(self, data: str):
        if self._capture_title:
            value = data.strip()
            if value:
                self.title = value


def inspect(url: str):
    response = requests.get(url, timeout=20, headers={"User-Agent": "PrivateDAO Indexability Verifier/1.0"})
    parser = HeadParser()
    parser.feed(response.text)
    return {
        "url": url,
        "status": response.status_code,
        "robots": parser.robots,
        "canonical": parser.canonical,
        "title": parser.title,
    }


def main() -> int:
    failures = 0
    for url in CORE_URLS:
        result = inspect(url)
        print(f"{result['url']}")
        print(f"  status: {result['status']}")
        print(f"  robots: {result['robots']}")
        print(f"  canonical: {result['canonical']}")
        print(f"  title: {result['title']}")
        if result["status"] != 200:
            failures += 1
        if result["robots"] != "index, follow":
            failures += 1
        if result["canonical"] != url:
            failures += 1
    if failures:
        print(f"\n{failures} indexability issue(s) detected.")
        return 2
    print("\nCore indexability verification: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
