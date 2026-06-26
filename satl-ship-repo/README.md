# satl-ship-repo — purpose & use case

## Why this skill exists

We ship a lot of small open-source repos under `thesatellite-ai` (lore, agentop, filemark, …). Every single one needs the *same* launch checklist before it's fit to show the world: a logo and brand assets, a README with a real pitch and SEO, the standard OSS files (LICENSE, CONTRIBUTING, CHANGELOG), tidy GitHub metadata, and a card on khanakia.com/apps. Done by hand each time, the work is repetitive, slow, and drifts — every repo ends up slightly inconsistent and something always gets skipped.

`satl-ship-repo` turns that checklist into **one repeatable, manifest-driven pass**.

## What it does

It's the orchestrator. It owns a single per-repo config file — `brand.json` — and runs the focused launch skills in dependency order, each reading that same config so nothing is decided twice:

- `satl-brand-kit` → icons, favicon, wordmark, lockups, OG covers, design tokens
- `satl-readme-pro` → README with logo header, SEO structure, pitch, FAQ
- `satl-oss-scaffold` → LICENSE, CONTRIBUTING, CHANGELOG, CODE_OF_CONDUCT, SECURITY, `.github/` templates
- `satl-repo-meta` → GitHub About, topics, homepage, social-preview prep
- `satl-ship-to-khanakia` → the khanakia.com/apps card *(project-local skill in the `khanakia_com_tanstack` repo, not in this universal collection)*

## When to use it

- **"Ship/launch/polish this repo"** — you want the whole pass.
- **A brand-new repo** that needs to go from code-only to presentable.
- **An audit** — run `status` to see which launch steps a repo is missing.

For a single piece (just the README, just the license), skip the orchestrator and invoke the specific `satl-*` skill directly.

## The key idea: `brand.json`

The reason the old way was painful is that every step re-asked the basics — what's the name, the color, the tagline, the license? The manifest answers all of that once, at the repo root, and every skill reads it. Change the color in one place, re-run, and the whole identity updates. The schema lives in `brand.schema.json` next to the skill.

## What it deliberately does NOT do

- It doesn't commit or push — you review first.
- It doesn't write the deep positioning copy itself; it hands that to `satl-frontend-pitch` / `satl-homepage-positioning`.
- It isn't a CI/release pipeline (that's a separate concern; see `satl-oss-scaffold` notes on release tooling).
