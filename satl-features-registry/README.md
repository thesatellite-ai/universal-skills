# satl-features-registry — purpose & use case

## Why this skill exists

Repos that maintain a features list/page (a `features.tsx`/`features.json` registry) drift the moment code and registry are updated in separate passes. You ship a feature, mean to add the registry entry "later," and later never comes — so the public features page lies about what the product does. The reverse happens too: a `planned` entry stays `planned` long after it shipped.

`satl-features-registry` makes the code change and the registry patch **one atomic turn**, so the two never diverge.

## What it does

When you build, ship, or change a feature in a repo with a feature registry, in the **same turn** it:

1. Locates the registry (the `features.*` file).
2. Finds the right group (creates one only if none fit).
3. Adds/updates the entry — `{ title, description, status }`, where `status` is `live` / `in-progress` / `planned`. Title ≤ 4 words; description is one sentence (including a gesture/shortcut like `⌘K` if relevant).
4. Flips `planned → live` on ship; deletes stale entries.

The registry page re-derives totals/counts, so no other file needs touching.

## When to use it

- Building, shipping, or changing a feature in a repo that maintains a features registry.
- The user prepends a task with `[features] — <task>`.

## The one rule

The build and the registry patch are atomic. Shipping code without the registry entry (or vice versa) is exactly the failure mode this guards against.
