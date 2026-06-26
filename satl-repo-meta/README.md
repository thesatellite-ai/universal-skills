# satl-repo-meta — purpose & use case

## Why this skill exists

A polished README isn't the whole story — half of a repo's discoverability lives in GitHub's own metadata. The **About** description and **topics** power GitHub search and the topic browse pages (how people *find* a repo they weren't already looking for), and the **social preview** is the image that unfurls when the repo link is shared in Slack, X, or Discord. We kept setting these by hand, inconsistently, or forgetting them entirely — so good projects stayed invisible.

`satl-repo-meta` sets all of it from the same `brand.json` the README uses, so the messaging is identical everywhere it appears.

## What it does

- **About description** — benefit-first, keyword-rich, within GitHub's 350-char limit.
- **Topics** — merges high-value tags (category, integrations, language, distribution) without clobbering existing ones, capped at 20.
- **Homepage** — set if the manifest has one.
- **Social preview** — prepares the 1280×640 OG image from the brand kit and points the user to the one place it can be uploaded (GitHub has no API for it).

It uses the `gh` CLI, with a preflight auth/access check and a verification step after applying.

## When to use it

- **"Update the repo About / description / topics."**
- **"Set the homepage."**
- **"Set up the social preview."**
- **"Make the repo discoverable"** / "fix the repo metadata."

## Why it's a separate skill from the README

The README is content *inside* the repo; this is metadata *about* the repo, set through a different surface (the GitHub API via `gh`, plus one manual UI upload). Keeping them separate means you can refresh the GitHub metadata without touching the README, and vice versa — but both read the same manifest so they never drift.

## Safety

Repo metadata is public and outward-facing. The skill checks `gh` is on the right account, shows what will change, merges rather than overwrites topics, and applies on your go-ahead.
