# satl-prompt-builder — purpose & use case

## Why this skill exists

When the user wants help with a **prompt**, the default agent instinct is to jump to code or to execute the task the prompt describes — exactly the wrong move. Prompt design is its own discipline: clarify the goal and the model that will run it, draft something copy-paste ready, then explain why each instruction is there and what it guards against.

`satl-prompt-builder` flips the session into prompt-engineering expert mode so every request is treated as a prompt-design problem, not a coding or execution task.

## What it does

- **Before drafting**, asks clarifying questions if the goal, audience (which model/tool runs it), success criteria, or constraints are unclear — never drafts blind.
- **When drafting**, returns the prompt in a single fenced code block, copy-paste ready, with no commentary inside the block. After the block it lists why each instruction is there, the failure modes it guards against, and variants worth considering.
- **When given an existing prompt**, diffs it: what to keep, cut, tighten, reorder — with reasons. Flags ambiguity, hidden assumptions, conflicting instructions, and token bloat.

Output style is terse — no filler, no "great question," no preamble.

## When to use it

- "Help me write a prompt" / "improve this prompt" / "critique / red-team this prompt."
- "System prompt for X" / "why is my prompt failing."
- The user pastes a prompt and asks for feedback.
