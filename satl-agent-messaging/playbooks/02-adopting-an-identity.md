# Playbook 2 — Adopting an identity in a Claude session

This is the real workflow: **two Claude Code windows** talking to each other while you drive both. One window "is bob", the other "is alice". You type instructions in plain English; each Claude runs the `agentmsg` commands for you.

## The setup

Open two Claude Code sessions — call them **Terminal A** and **Terminal B**. They can be two terminal tabs, two IDE windows, whatever. Both must be on the same machine (they share `~/agent-messages/`).

## Step 1 — give each session an identity

In **Terminal A**, tell Claude:

> You are **bob** in the agent-messaging room **lobby**. Take that identity for this session.

The skill fires on "you are bob" / "behave as bob" / "take identity bob". Claude will run `init lobby` and `join lobby bob`, then confirm: *"Acting as bob in room lobby."* From now on this session sends as `bob` and reads as `bob`.

In **Terminal B**, tell Claude:

> You are **alice** in room **lobby**.

Same thing — Claude joins as `alice`.

> Tip: if you don't name a room, the skill defaults to `lobby` and tells you so. Name one (`room deploychat`) when you want an isolated conversation.

## Step 2 — send from one session

In **Terminal A** (bob), just say what you want to send:

> Tell alice the migration is done and she can start the smoke tests.

Claude translates that to `agentmsg send lobby bob alice "the migration is done — you can start the smoke tests"` and confirms it's queued. Nothing happens in Terminal B yet — the note is sitting in alice's queue on disk.

## Step 3 — receive in the other session

Switch to **Terminal B** (alice) and say:

> Check my messages.

Claude runs `agentmsg read lobby alice`, reads bob's note aloud (relaying the full text to you), and the note is deleted from disk. Because `read` consumes, Claude reports the contents in that same reply — that's your only copy, so act on it.

If you want alice to *look without clearing* (e.g. "did anything come in?" without committing to process it), tell her:

> Peek at my messages but don't clear them.

Claude uses `peek` instead of `read`.

## Step 4 — reply back

Still in **Terminal B** (alice):

> Reply to bob: smoke tests green, shipping now.

Claude sends `alice → bob`. Switch to Terminal A and tell bob to check messages. That's a full round trip.

## Step 5 — keep the conversation going

The pattern repeats: **send in one window, "check my messages" in the other.** Since it's a mailbox (not a live feed), the receiving session only sees a note when *you* ask it to read. A natural rhythm is:

- Bob does some work, sends a note.
- You switch to alice's window: "check messages" → she reacts, sends back.
- You switch to bob's window: "check messages" → he reacts.

## Handy things to say

| You say (to the session that is `X`) | Claude runs |
|---|---|
| "you are bob" / "behave as bob" | `init` + `join lobby bob`, remembers identity |
| "tell alice <something>" | `send lobby bob alice "<something>"` |
| "check my messages" / "anything from bob?" | `read lobby bob` (consumes) |
| "peek, don't clear" | `peek lobby bob` |
| "how many are waiting?" | `count lobby bob` |
| "who's in the room?" | `agents lobby` |
| "switch me to room deploychat as bob" | `init deploychat` + `join deploychat bob` |

## Gotchas

- **`read` deletes.** If a session reads a note, it's gone from disk. The Claude that read it should surface the full contents to you immediately (the skill instructs it to). Use `peek` when you're not ready to consume.
- **No auto-delivery.** The other session won't magically announce a new note. You have to tell it to "check messages." (If you want polling, see [playbook 4](04-reference-and-troubleshooting.md).)
- **Same machine only.** Both sessions read the same `~/agent-messages/` folder. This isn't networked.

Next: [coordinate three agents in one room](03-three-agent-room.md).
