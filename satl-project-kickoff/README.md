# satl-project-kickoff — purpose & use case

## Why this skill exists

Starting a new reusable library well takes the same session every time: set up the repo and its tracking, survey every comparable library in every ecosystem, list what real applications need from it, study the owner's earlier attempts, write down the mission and the agent context, and only then argue about architecture. Done by hand, each new project re-learns the steps, the research comes out shallow (famous libraries only, links from memory), and design starts before anyone has looked at what already exists.

`satl-project-kickoff` makes that session repeatable. Say "our mission is to build the one X library every app needs, explore first" in a fresh repo and the same artifacts come out, in the same places, to the same bar.

## What it does

1. **Bootstraps the repo**: `git init` with a remote (so repolink can identify it), repolinks `CLAUDE.md`, `MISSION.md` and a private `docsi/` docs dir, initialises lore with a mission whose body keeps the original request verbatim, and points agent memory at an in-repo index.
2. **Runs three research agents in parallel**, visible as named subagents: a cross-ecosystem **landscape** with every library's verified GitHub link, stars and status; a **feature catalogue** ranked P0 to P4 by how many real products ship each feature, with a core / adapter / plugin home per feature and an app-archetype table; and a study of the owner's **local reference code** and template project.
3. **Writes `CLAUDE.md` and `MISSION.md`**, then folds the research evidence back into them.
4. **Writes the architecture brainstorm** on request: one question per section, options with trade-offs, a recommendation each, disagreements between research docs shown side by side, and the riskiest idea named with a spike.
5. **Verifies and tracks**: fact-checks its own claims, runs a formatting gate, files every open decision as a proposed lore task, and records the non-obvious findings in project memory.

## When to use it

- "Our mission is to build a pluggable, batteries-included X library."
- "Research every X package in Node, PHP, Python… with GitHub links, then brainstorm."
- "Write CLAUDE.md and MISSION.md first; we are only exploring."

Not for adding a feature to an existing project, and not for the readable design site that follows an accepted brainstorm (that is `satl-design-spec`).

## What it needs

`git`. Optional but expected: [lore](https://github.com/thesatellite-ai/lore) for tasks and decisions, [repolink](https://github.com/thesatellite-ai/repolink-go) for the private docs dir, and the filemark skill for internal docs. Missing tools are skipped with a one-line note; tasks are never written into markdown as a fallback.

## Files

| File | Purpose |
|---|---|
| `SKILL.md` | The five phases and the rules |
| `templates/agent-landscape.md` | Prompt for the landscape agent |
| `templates/agent-features.md` | Prompt for the feature-catalogue agent |
| `templates/agent-local-refs.md` | Prompt for the local-references agent |
| `templates/CLAUDE.md.tmpl` | Agent context skeleton |
| `templates/MISSION.md.tmpl` | Mission skeleton |
| `templates/ARCHITECTURE_BRAINSTORM.md.tmpl` | Brainstorm skeleton with the questions every library kickoff should answer |
