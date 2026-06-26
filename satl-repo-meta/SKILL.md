---
name: satl-repo-meta
description: >-
  Set a GitHub repo's discoverability metadata from brand.json using the gh
  CLI: the About description, topics, and homepage; and prepare the 1280×640
  social-preview image (the OG card shown when the repo link is shared). Triggers
  when the user says: "update the repo About / description", "add topics / tags
  to the repo", "set the homepage", "make the repo discoverable", "set up the
  social preview / OG image", or "fix the repo metadata". NOT for repo settings
  like branch protection or secrets.
argument-hint: "[apply|check] — apply sets About/topics/homepage; check prints current vs proposed"
allowed-tools:
  - Bash
  - Read
---

# satl-repo-meta

The GitHub-side half of repo SEO: the About blurb, topics, homepage, and social-preview image. These are what make a repo *findable* (GitHub search + topic pages) and *shareable* (the link-preview card), and they're separate from the README.

**Why this exists:** the README is only half of a repo's discoverability. The About description and topics drive GitHub's own search and topic browse pages, and the social preview is the image every Slack/X/Discord link unfurls to. We kept setting these by hand (or forgetting them). This skill sets them from the same `brand.json` the README uses, so the messaging is consistent everywhere.

## Inputs (from brand.json)

`repo` (owner/name), `description`, `topics[]`, `homepage`. The OG image comes from the brand kit (`brand/png/og-social-1280.png`).

## Preflight

```sh
gh auth status            # confirm logged in with `repo` scope to the right account
gh repo view <owner/repo> --json description,homepageUrl,repositoryTopics
```

If `gh` isn't authed or lacks access, say so and stop — don't half-apply.

## Apply

**Description** — keep it benefit-first and keyword-rich, ≤ 350 chars (GitHub's limit). Reuse `brand.json.description` (often the same sentence as the README intro):

```sh
gh repo edit <owner/repo> --description "<description>"
```

**Homepage** (only if `brand.json.homepage` is set):

```sh
gh repo edit <owner/repo> --homepage "<homepage>"
```

**Topics** — lowercase, hyphenated, ≤ 35 chars each, **max 20 total**. Merge with existing (don't blow away good ones). Add the high-value missing ones; for a coding tool that's the category, the agents/editors it integrates with, the language, and the distribution model:

```sh
gh repo edit <owner/repo> --add-topic <a> --add-topic <b> ...
```

Good topic vocabulary for AI/dev tools: `ai`, `ai-agents`, `claude`, `claude-code`, `cursor`, `llm`, `memory`, `context-management`, `cli`, `tui`, `developer-tools`, `local-first`, `open-source`, plus the language (`golang`, `rust`, `typescript`) and platform.

**Verify** afterward:

```sh
gh repo view <owner/repo> --json description,homepageUrl,repositoryTopics \
  | jq '{description, homepage: .homepageUrl, topics: [.repositoryTopics[].name]}'
```

## Social preview (manual upload — flag this clearly)

GitHub has **no API** for the social-preview image; it must be uploaded in the UI. So this skill *prepares* it and tells the user where to put it:

1. Ensure `brand/png/og-social-1280.png` exists (1280×640, 2:1) — `satl-brand-kit`'s raster task emits it. Regenerate at 1280×640 if only the 1200×630 exists.
2. Tell the user: **Settings → General → Social preview → upload `brand/png/og-social-1280.png`.**

## Rules

- **Never clobber topics.** Read existing first, merge, then add. Cap at 20.
- **Account check.** Confirm `gh` is on the correct account (org repos need org access) before editing — repo metadata is public and outward-facing.
- **One source of truth.** Description here must match `brand.json` / the README intro; if they diverge, fix `brand.json` and reuse it.
- **Outward-facing = confirm.** This mutates a public repo; surface exactly what will change and apply on the user's go-ahead.
