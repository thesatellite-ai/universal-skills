# agentmsg playbooks

Step-by-step tutorials for using `agentmsg` — the file-based mailbox that lets two or three Claude Code sessions (or any shell) pass notes to each other. Work through them in order; each builds on the last.

## The 30-second mental model

- A **room** is a shared folder. Everyone who wants to talk joins the same room (default: `lobby`).
- An **identity** is a name inside a room — `bob`, `alice`, `charlie`. Each Claude session "becomes" one identity for the duration of a chat.
- **Sending** drops one file into the recipient's queue. **Reading** prints every queued note for your identity and then *deletes* them (read-once). It's a mailbox, not a live chat — a note waits on disk until the recipient reads it.
- Storage is plain files under `~/agent-messages/`. No server, no database, no network.

## Set the CLI path once

Every example calls the `agentmsg` CLI. Point a shell variable at it so the commands are copy-pasteable:

```bash
AGENTMSG="$HOME/.claude/skills/satl-agent-messaging/agentmsg"   # if symlinked into ~/.claude/skills
# or the canonical source location:
# AGENTMSG="/Volumes/D/www/projects/khanakia/skills-ai/universal-skills/satl-agent-messaging/agentmsg"
```

## The tutorials

1. [Quickstart: two agents pass notes](01-quickstart-two-agents.md) — the whole loop in one terminal, five commands.
2. [Adopting an identity in a Claude session](02-adopting-an-identity.md) — the real workflow: two Claude Code windows, "you are bob" / "you are alice".
3. [A three-agent room](03-three-agent-room.md) — fan a message out to several identities and coordinate a small group.
4. [Command reference & troubleshooting](04-reference-and-troubleshooting.md) — every flag, every gotcha, how to inspect the raw files.

## Try it right now (no reading required)

From the skill directory:

```bash
task demo     # spins up a throwaway room, sends bob→alice, reads it, cleans up
```
