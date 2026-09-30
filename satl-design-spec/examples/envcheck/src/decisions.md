# Decisions

What was decided, by whom, and why — plus what was rejected.

## The rules every decision follows

::: cards c3
::: item
### Read only
envcheck never writes to a `.env` file.
:::
::: item
### All problems at once
One run reports everything.
:::
::: item
### Never print a secret
Safety beats a helpful message.
:::
:::

## The big decisions

### The schema is YAML, not code

**The problem:** the list of variables must be readable by people who do not write the app.

**The decision:** a plain YAML file, one line per variable.

**Why:** it is reviewable in a pull request by anyone. **The cost:** complex rules (one variable depends on another) are not expressible; see the rejected list.

## Decided by the owner

| Decision | When |
|---|---|
| The tool only checks; it never edits | example |
| Exit 1 for problems, 2 for a broken schema | example |

## Decided for the owner — not yet reviewed

| Topic | Decision | Why |
|---|---|---|
| Unknown variables | Warning, not error | Old variables linger; failing on them blocks deploys for no gain |

## Rejected — do not propose again

| Idea | Why it died |
|---|---|
| Auto-fixing the `.env` file | A tool that writes secrets files is a tool people stop trusting |
| Rules between variables (`if A then B`) | Turns a list into a programming language |
