---
id: 2026-08-07-03
date: 2026-08-07
type: convention
title: A skill CLI is named the skill name minus the satl- prefix
tags: [conventions, cli, naming, skills]
files: [satl-project-memory/project-memory, satl-agent-messaging/agentmsg]
status: active
confidence: high
supersedes:
until:
---

**What** — When a skill ships an executable helper, the executable is named after the skill with only the `satl-` namespace prefix removed: `satl-project-memory` ships `project-memory`. Invented short names are not used.

**Why** — The first version of this CLI was called `memlog`, following `satl-agent-messaging`'s `agentmsg`. It cost the user real confusion: with the skill installed as `satl-project-memory` and the command as `memlog`, there was no way to tell from either name that they were the same system, and the docs reading "run memlog" looked like a reference to some other tool entirely. Terseness in a command typed a few times a week is worth far less than the name being self-evidently connected to the skill it belongs to.

**How** — Rename the executable, then sweep every reference: `SKILL.md`, the skill `README.md`, the root `README.md` row, `Taskfile.yml`, `test.sh` (including internal variable names), the script's own comments and `help` text, and any string it writes into generated files. Re-point the `PATH` symlink and delete the old one. `grep -rn '<oldname>'` across the repo must come back empty.

**Evidence** — User feedback verbatim: "oh its project memory so why you said memlog", then "i am so confused how to run the memlog commadn you made it all so confuing". `agentmsg` predates this rule and is grandfathered.

**Don't** — Don't cite `agentmsg` as precedent for a new short name. It is the example that caused the problem, not a pattern to copy. Also don't rename with `sed` alone and stop there — the generated-file marker string and the `help` output both embed the command name and are easy to miss.
