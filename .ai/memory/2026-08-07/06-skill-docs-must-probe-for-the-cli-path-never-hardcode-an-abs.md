---
id: 2026-08-07-06
date: 2026-08-07
type: convention
title: Skill docs must probe for the CLI path, never hardcode an absolute one
tags: [conventions, skills, docs, cli, public-repo]
files: [satl-agent-messaging/SKILL.md, satl-agent-messaging/playbooks/README.md]
status: active
confidence: high
supersedes:
until:
---

**What** — When a `SKILL.md` or playbook tells an agent where to find the skill's executable, it must give a *probe* (check a couple of known install locations plus `command -v`, first hit wins, explicit "not installed" message if none) — never a bare absolute path, and never the author's machine path.

**Why** — Two separate failures. (1) This is a **public** repo: `satl-agent-messaging/SKILL.md` and `playbooks/README.md` both shipped `/Volumes/D/www/projects/khanakia/…` as a commented "canonical source location", which is meaningless to every other user and leaks the author's directory layout. (2) An agent handed two candidate paths *guesses*, and a wrong `$AGENTMSG` makes every subsequent command fail in a way that looks like the CLI is broken rather than unfound. Probing turns a confusing cascade into one clear answer.

**How** — The probe in `satl-agent-messaging/SKILL.md` ("Cold start", step 1) is the reference implementation: try `~/.claude/skills/<skill>/<cli>`, then `~/.config/claude/skills/<skill>/<cli>`, then `command -v <cli>`; if all miss, fall back to the directory the `SKILL.md` was loaded from, and if that misses too, stop and tell the user to run `task install`. Write it as an `if`/`elif` chain inside a `$( … )`, **not** a `for` loop — see the session note that the user's interactive zsh aliases `do`, which makes any `for … do … done` a parse error in an agent's one-off shell command.

**Evidence** — `grep -rn "Volumes/D/www" satl-agent-messaging/` found the leak in two files, both fixed 2026-08-07. The replacement probe was run in the live shell and resolved to `/Volumes/D/khanakia/.claude/skills/satl-agent-messaging/agentmsg` (`agentmsg 0.2.0`).

**Don't** — Don't "helpfully" add the repo checkout path back as a comment for local convenience; that is exactly what leaked. Don't assume `~/.claude/skills` exists — `SKILLS_DIR` overrides the install target in this repo's `Taskfile.yml`, so a user's install can legitimately live elsewhere.
