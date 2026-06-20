---
name: satl-homepage-positioning
description: >-
  Diagnose and rewrite a product homepage / landing page for conversion using
  the Fletch PMM positioning method (distilled from ~18 of their before/after
  teardowns). Triggers when the user says: "rewrite my homepage", "improve my
  landing page", "my hero is weak/vague", "why isn't my landing converting",
  "critique my homepage", "make people sign up / install / subscribe", "write
  the hero copy", "positioning", "messaging", "value proposition", "before and
  after my homepage", or is building a new product/SaaS/extension landing page
  and wants it to convert. Produces a diagnosis against a fixed rubric, new
  hero copy options, a section-by-section spec, and before→after annotations.
  NOT for: pure visual/UI design (use a frontend skill), interactive pitch
  decks (use satl-frontend-pitch), blog/SEO article writing, or app UI copy.
---

# satl-homepage-positioning

Diagnose and rewrite a product homepage so a cold visitor immediately gets *what it is, who it's for, why it's different,* and *why to act now*. This skill encodes the Fletch PMM (Anthony Pierri / Brendan Hufford) method, distilled from ~18 of their public before/after homepage teardowns plus their published framework.

**Read this whole doc before writing copy.** Then run the discovery Q&A, then diagnose, then rewrite. Default to *clear over clever* every single time.

## When to invoke

Invoke when ANY of these:

- User asks to rewrite / critique / improve a homepage, landing page, or hero.
- User says their page "isn't converting", is "vague", "too broad", or "feature-heavy".
- User is launching a product and needs the landing copy + structure.
- User asks for "positioning", "messaging", "value proposition", or a "before/after" of their page.

Do NOT invoke for: visual/UI design only, an interactive pitch *deck* (that's `satl-frontend-pitch`), in-app UI microcopy, or blog/SEO article drafting.

## The one thesis (memorize this)

Almost every weak homepage fails the same way — **broad + vague + feature-dump** — and the fix is always the same shape:

> **One audience · one wedge use case · an explicit named problem · a category anchor with a point of view · capabilities that make the benefit believable.**

If your rewrite doesn't move the page toward that sentence, it's not done.

## The 5 questions every homepage must answer

A visitor should be able to answer all five within ~10 seconds of landing:

1. **What does it do?** (anchored to a category they already understand)
2. **How does it work?** (the mechanism, not just the outcome)
3. **What does it look like?** (show the product — screenshot/visual above the fold)
4. **When would I use it?** (the concrete use case / trigger moment)
5. **How does it help me make progress?** (the benefit, made believable by a capability)

A homepage is not your company wiki. If a section doesn't help answer one of these for the chosen audience, cut it.

## What the hero must contain, at a glance

- **Category anchor** — an existing category + a modifier ("the *local* file viewer", "*headless* CMS"). Don't float capabilities in space; tie them to a thing people already grasp.
- **ONE primary audience** — the champion who *feels the pain daily*, not the senior budget-holder. Pick one. Targeting two audiences at once is the most common self-inflicted wound.
- **ONE wedge use case** — the single sharpest entry point, even if the product does ten things. Lead with the one with the most traction/pain.
- **Explicit differentiation vs a NAMED alternative** — a competitor, an internal DIY process, a pile of other tools, or a stale category. "Different" means nothing until you name what you're different *from*.
- **A point of view** — an opinionated stance, not a neutral feature list.
- **Credibility** — customer logos, user counts, funding, GitHub stars, "open source" — whatever real proof exists. Never fabricate.
- **One primary CTA** — repeated, unambiguous. Secondary CTA (demo) is fine; competing CTAs are not.

## Diagnostic checklist — the recurring BEFORE mistakes

Audit the current page against these (ranked by how often Fletch fixes them). Each one you find is a finding to fix:

1. **No problem stated** — the page never says what pain it removes. (Most common.)
2. **Broad / vague positioning, no anchor** — "the platform for everything", no category.
3. **Use-case / feature overload** — so many things listed the visitor is overwhelmed and bounces.
4. **Unclear what it actually does / how it works** — abstract benefits, no mechanism.
5. **Targets everyone (or two audiences)** — audience-agnostic, unprioritized.
6. **Leads with vague outcomes, not capabilities** — "increase revenue" an early-stage product can't credibly own.
7. **Weak / unstated differentiation, no POV** — no named alternative, no stance.
8. **Wrong or stale category** — anchored to an old, low-value category that undersells newer value.
9. **Language doesn't match the buyer** — internal jargon a prospect doesn't use.
10. **Page too long / poorly architected** — won't get read; info buried in sub-menus.

## The AFTER patterns — the fixes

1. **Add a dedicated problem section** so visitors instantly know they're in the right place.
2. **Anchor to a category + take an opinionated stance.**
3. **Lead with ONE primary use case / wedge.**
4. **Explain exactly how the product works** (and how someone uses it).
5. **Prioritize ONE audience / champion.**
6. **Lead with capabilities** (which make outcomes *believable*), then ladder capability → benefit.
7. **Make differentiation explicit** — positioned against a named alternative (competitor, DIY, multi-tool sprawl, stale category).
8. **Sharpen the pain** to a specific, visceral problem (bigger/sharper beats generic).
9. **Speak the buyer's language**, drop the jargon.
10. **Tighten the narrative** into a clear arc; cut length.

## Canonical section order

```
Hero  (the 5 answers begin here)
  ↓
Social proof  (logos / counts / stars — credibility before the pitch)
  ↓
Problem section  (name the pain, matched to the chosen audience)
  ↓
Solution intro  (what it is + category anchor + POV)
  ↓
Value propositions  (each: use case → capability → feature → benefit)
  ↓
Deeper product sections  (proof: screenshots of each capability)
  ↓
CTA  (one primary action)
```

Optional high-leverage inserts:

- **Before / After section** (see below) — when the product is a *transformation*.
- **Who it's for** — when 2–3 segments exist; lead with the primary, list the rest.
- **FAQ** — handles objections (price, privacy, lock-in, setup) right before the final CTA.

## Headline patterns (clear > clever)

Pick the pattern that fits; write 2–3 options. Avoid clever wordplay that hides what the product is.

- **Pain-first** — name the painful status quo: *"Stop downloading files just to read them."* Most relatable; great when the pain is universal and felt daily.
- **Category-anchor + POV** — *"The local file viewer Chrome forgot to build."* Names the category, takes a stance.
- **Outcome + mechanism** — *"Ship onboarding flows without engineering — drag-and-drop, in your app."* Benefit made believable by the how.
- **Audience + wedge** — *"The accounting API for fintech teams."* (APIdeck narrowed from "every integration" to one wedge.)
- **"Unlike X" reframe** — position against the named alternative the visitor is using today.

Subhead job: add the audience, the mechanism, and the differentiation the headline didn't carry. Never make the subhead a bare feature/format list.

## The Before / After section technique

Fletch's signature move, and a conversion powerhouse when the product is a visible transformation. Render a 3-column comparison:

```
| Thing            | Status quo (struck through, muted) | With <product> (check, bold) |
| ---------------- | ---------------------------------- | ---------------------------- |
| <trigger 1>      | what happens today (bad)           | what happens now (good)      |
| <trigger 2>      | ...                                | ...                          |
```

It works because it shows the visitor *their own daily pain* next to the fix — concrete, not abstract. Put a CTA right under it.

## Workflow

1. **Discovery Q&A first.** Do not write copy until you have answers (ask the user; infer from the product only if they say "just go"):
   - What's the **category** you want to anchor to? (existing term + modifier)
   - Who is the **ONE primary audience** — the person who feels the pain daily? (not the buyer/exec)
   - What's the **ONE wedge use case** to lead with?
   - What **named alternative** do they use today? (competitor / DIY / multiple tools / stale category)
   - What's your **opinionated POV**?
   - What **real proof** exists? (logos, counts, stars, funding, "open source")
   - What's the **one action** you want them to take?
2. **Diagnose** the current page against the BEFORE checklist — list each violation as `finding → fix` (quote the offending copy).
3. **Rewrite**: hero (2–3 headline options + subhead), problem section, solution intro, value props laddered capability→benefit, optional Before/After + Who-it's-for, FAQ.
4. **Reorder** to the canonical structure; cut anything that doesn't answer one of the 5 questions.
5. **Deliver** the output contract below.

## Output contract

Return, in this order:

1. **Diagnosis table** — `finding · severity · fix`, quoting the current copy.
2. **New hero** — 2–3 headline+subhead options with a one-line rationale each, and a recommendation.
3. **Section-by-section spec** — the new order with the copy (or copy direction) for each section.
4. **Before→after annotations** — for each major change, the old vs new and *why* (so the user can push back on the reasoning, Fletch-style).

## Do / Don't

**DO**
- State the problem explicitly, early, matched to the chosen audience.
- Pick one audience and one wedge; cut the rest from the hero.
- Anchor to a category and take a stance.
- Lead with capabilities; ladder to benefit.
- Name the alternative you're different from.
- Show the product; explain how it works.
- Use the buyer's words. Keep it concise with a clear arc.
- Repeat one primary CTA.

**DON'T**
- Be broad/vague or list every use case.
- Dump features or bury info in sub-menus ("homepage isn't your wiki").
- Lead with grand outcomes ("transform your business") a young product can't own.
- Target two audiences at once or stay audience-agnostic.
- Omit the problem section.
- Leave differentiation/POV unstated.
- Write clever headlines that hide what the product is.
- Fabricate proof (fake logos, invented ratings/reviews) — credibility must be real.

## Worked example (extension landing page)

**Before hero:** "Every file Chrome should already open. Beautifully." — subhead was a format list (`.md .mdx .json .csv …`).
Diagnosis: clever-not-clear (you can't tell what it is), no audience, no problem stated, subhead is features-not-value, no category anchor.

**After:**
- Hero (pain-first): **"Stop downloading files just to read them."** + subhead naming the wedge ("renders Markdown, JSON, CSV and SQL schemas as real interactive views, right in the tab you're already in — 100% local").
- **Trust strip** (real proof: MIT / open source / 100% local / works offline).
- **Problem section**: the 3 concrete daily failures (Chrome downloads it → shows raw text → so you paste into an online viewer that uploads your data).
- **Before/After table**: `file · Chrome today · with product` — the transformation, made literal.
- **Who it's for**: one primary audience (developers) + two segments.
- Capabilities as **proof** after the promise; FAQ handles objections (free? uploads my data? offline?); one repeated CTA.

Why it converts better: a cold visitor now self-identifies (audience), feels understood (problem), sees the transformation (before/after), and trusts it (real proof) — in the order Fletch's teardowns repeatedly prove works.
