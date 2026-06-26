---
name: satl-oss-scaffold
description: >-
  Scaffold the standard open-source hygiene files a repo needs to be a good
  citizen: LICENSE (Apache-2.0 by default), CONTRIBUTING, CHANGELOG (Keep a
  Changelog), CODE_OF_CONDUCT (Contributor Covenant), SECURITY (disclosure
  policy), .github/ issue + PR templates, FUNDING, .editorconfig, .gitattributes,
  and llms.txt (AI discoverability). Triggers when the user says: "add a
  license / Apache license", "add CONTRIBUTING / CHANGELOG / code of conduct /
  SECURITY.md", "set up the .github templates", "make this repo open-source
  ready", "add the community files", or "scaffold the OSS files". Fills
  placeholders from brand.json. NOT for source code scaffolding or CI pipelines.
argument-hint: "[all|<file>] — scaffold every community file, or one (license, contributing, changelog, coc, security, github, llms)"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
---

# satl-oss-scaffold

Drop the boring-but-required open-source files into a repo, correctly filled out, every time — so no project ships without a license, a changelog, or a disclosure policy.

**Why this exists:** these files are table stakes for any public repo (GitHub literally scores a repo's "community profile" on them), but writing them by hand is tedious and error-prone — the license ends up with the wrong year/owner, the CHANGELOG is missing, the CoC has a placeholder email left in. This skill ships correct, consistent versions filled from `brand.json`.

## Inputs (from brand.json)

`name`, `repo` (owner/name), `license` (default `Apache-2.0`), `author` (`name`, `email`, `github`), `homepage`, `description`. Substitute these into the placeholders below. If `author.email` is missing, ask — the CoC and SECURITY files need a real contact.

## Files it writes

| File | Template | Notes |
|---|---|---|
| `LICENSE` | `templates/LICENSE-Apache-2.0.txt` | Default Apache-2.0; fill `[yyyy]`→year, `[name of copyright owner]`→author. For MIT/other, generate the matching text. |
| `CONTRIBUTING.md` | `templates/CONTRIBUTING.md` | Dev setup, branch/commit conventions, PR checklist. |
| `CHANGELOG.md` | `templates/CHANGELOG.md` | Keep a Changelog + SemVer; seed `[Unreleased]`. |
| `CODE_OF_CONDUCT.md` | `templates/CODE_OF_CONDUCT.md` | Contributor Covenant 2.1; fill the enforcement contact. |
| `SECURITY.md` | `templates/SECURITY.md` | Private disclosure path + supported versions. |
| `.github/ISSUE_TEMPLATE/bug_report.md` | `templates/github/ISSUE_TEMPLATE/bug_report.md` | |
| `.github/ISSUE_TEMPLATE/feature_request.md` | `templates/github/ISSUE_TEMPLATE/feature_request.md` | |
| `.github/ISSUE_TEMPLATE/config.yml` | `templates/github/ISSUE_TEMPLATE/config.yml` | Links to Discussions/contact. |
| `.github/PULL_REQUEST_TEMPLATE.md` | `templates/github/PULL_REQUEST_TEMPLATE.md` | |
| `.github/FUNDING.yml` | `templates/github/FUNDING.yml` | Sponsor links (optional; skip if none). |
| `.editorconfig` | `templates/.editorconfig` | Consistent whitespace across editors. |
| `.gitattributes` | `templates/.gitattributes` | Line-ending + linguist hints. |
| `llms.txt` | `templates/llms.txt` | AI-discoverability manifest (the AI-era robots.txt for docs). |

## Placeholder substitution

Templates use `{{NAME}}`, `{{REPO}}`, `{{YEAR}}`, `{{AUTHOR}}`, `{{EMAIL}}`, `{{GITHUB}}`, `{{HOMEPAGE}}`, `{{DESCRIPTION}}`. Replace from `brand.json` before writing. Apache's own placeholders (`[yyyy]`, `[name of copyright owner]`) map to `{{YEAR}}` / `{{AUTHOR}}`.

## Rules

- **Don't clobber blindly.** If a file exists, diff it: for `CHANGELOG.md`, preserve existing entries and only ensure the structure/`[Unreleased]` header; for `LICENSE`, leave it unless the user asked to change license (warn if the existing license differs from `brand.json`).
- **No placeholder leakage.** Grep the output for `{{` and `[name of copyright owner]` before finishing — a leftover placeholder is a defect.
- **License consistency.** The SPDX id in `brand.json`, the `LICENSE` file, and any `license` field in `go.mod`/`package.json`/`Cargo.toml` must agree. Flag mismatches.
- **CoC/SECURITY need a real contact.** Never ship with a placeholder email.
- **Markdown:** these are GitHub-rendered → plain markdown, no hard-wrapping prose.

## Release tooling (pointer, not built here)

Distribution (GoReleaser, Homebrew tap formula, `install.sh`/`install.ps1`, CI release workflows) is related but separate — copy from an existing repo (lore/agentop have working versions) when the user wants it. This skill stops at community/hygiene files.
