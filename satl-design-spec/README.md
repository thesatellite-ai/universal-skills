# satl-design-spec — purpose & use case

## Why this skill exists

Most designs end up as one long spec. It can be complete and still unreadable: its own author can finish it and say "I don't understand how it all works", because the pitch, the mechanism, the exact rules and the history of every decision are mixed together in one scroll. What's missing is hard to see, and so is how the pieces fit.

`satl-design-spec` splits a design by **the question each reader is asking**, keeps every piece short, and puts real snippets everywhere. It's the combination of methods good teams already use: Amazon's "write the press release first", Rust's guide-level vs reference-level RFC sections, C4's zoom-level diagrams, and Specification by Example.

## What it produces

A small static site, built from a folder of short markdown and HTML sources:

- **Overview**: every feature on one screen, grouped. Select one to see the problem it solves, the fix, and an example. It's generated from the guide, so the two can't disagree.
- **Why**: what it is and who it's for, written as if it already shipped.
- **Picture**: the system at two or three zoom levels, then the roadmap.
- **How it works**: one example followed through every step.
- **Guide**: every feature as problem → fix → example.
- **Cookbook**: real tasks, every file in full, and exactly what comes out. Writing these is where gaps in the design show up.
- **Decisions**: principles, big decisions, who decided what, and what was rejected.

Plus the `design-spec` tool: `init` scaffolds the sources, `build` writes the pages, and `check` lists anything missing (a feature without an example, a recipe without its output, a leftover TODO).

## How it differs from its neighbours

- A **design doc or RFC** argues for one change. This describes a whole system so someone can understand it.
- **Product docs** describe something that exists. This is written before the code, and says plainly what isn't decided yet.
- **`satl-context-handoff`** records a session for the next agent. This is for the human who owns the design.
- **Task trackers** (lore) hold the work. The design site never lists tasks.

## When to use it

- Before building a new library, app, API or CLI.
- When a spec has grown long enough that its owner can no longer see how it fits together.
- When someone asks "how would this actually work?" and the answer should be files and output, not paragraphs.
