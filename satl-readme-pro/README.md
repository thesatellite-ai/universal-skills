# satl-readme-pro — purpose & use case

## Why this skill exists

For a small open-source project, the README *is* the product's landing page, its SEO surface, and the text that AI assistants quote when someone asks "what's a good tool for X". Yet we kept writing them inconsistently — some repos had badges, most had no pitch, none had a FAQ, and the SEO was accidental. A weak README means the project is invisible even when the code is great.

`satl-readme-pro` encodes a single, repeatable README structure that does three jobs at once: look professional, rank/get-cited, and convert.

## What it adds

- **Logo header + badges** — centered mark, tagline, shields (release, license, platform, language, USP, stars).
- **SEO intro** — one keyword-dense paragraph naming the category and every integration the project works with.
- **"Why <name>?" pitch** — the core wedge in one sharp paragraph, differentiator bullets, and a comparison table vs alternative *categories*.
- **FAQ** — 6-8 question-shaped Q&As that match what people and AI actually ask (privacy, API keys, "how is this different from X", bloat). This is what wins featured snippets and AI-answer citations.
- **TOC + keyword footer.**

…all while **preserving every existing section** (Install, Usage, Command reference, etc.). It augments; it never throws away content.

## When to use it

- **"Update / polish the README"**, **"make it SEO-ready"**, **"add the logo and badges"**.
- **"Write the why-use-this / comparison / FAQ section."**
- A repo whose README is just a title and an install command and needs to become a real landing page.

## How it relates to the other pitch skills

This skill owns README *structure* and *SEO*. The deep positioning copy — the hero line, the audience/wedge/differentiation thesis — is the job of `satl-homepage-positioning` (and `satl-frontend-pitch` for decks). `satl-readme-pro` calls those when the positioning inputs in `brand.json` are thin, then assembles their output into the README layout.

## The one rule that matters most

**Lossy-diff: never drop an existing section.** The skill enumerates the current README's headings first and verifies parity at the end. Augment, don't replace.
