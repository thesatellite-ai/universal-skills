# satl-no-hardwire — purpose & use case

## Why this skill exists

The fastest way to build a feature is to wire it to the one model you have in mind: one role system, one storage engine, one delivery channel, one error format. It works for you and quietly locks out everyone whose setup differs, and the lock-out is invisible until a user asks "how do I plug in my own?" and the honest answer is "fork it".

This skill turns that into a habit: list the models real users bring before writing the first type, put a small interface in front of the decision, and keep your implementation as the default. It also gives a repeatable audit for code that is already hard-wired.

## What it does

- **adopt:** writes the rule into the project's agent rules, adapted to its codebase.
- **audit:** a read-only sweep that reports every hard-wire as file:line, who it blocks, severity and a suggested seam, plus the seams that already exist and the security floors deliberately left fixed.
- **fix:** builds only the findings the user picks, with default behaviour unchanged, fail-closed errors, tests proven by breaking the code, and the full suite green.

## When to use it

- Designing anything with a policy in it: permissions, storage, identity, delivery, encryption, rate limiting, formats, templates.
- Reviewing a library or app meant for many kinds of users.
- The user notices one hard-wire; sweep for the whole class.

## NOT for

- Values with exactly one sane implementation; a seam with no realistic second model is over-engineering.
- Security floors such as constant-time comparison; those stay fixed on purpose.
