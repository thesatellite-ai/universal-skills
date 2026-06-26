# satl-save-verbatim — purpose & use case

## Why this skill exists

When the user wants the previous response saved to a file, the agent tends to "help" — reformat it, trim whitespace, wrap it in a code fence, add frontmatter or a summary. All of that corrupts the one thing the user asked for: the exact bytes. Sometimes the response *is* a file's intended content (a config, a doc, a snippet) and any edit breaks it.

`satl-save-verbatim` exists to save the previous assistant message **exactly as written** — byte-for-byte, no edits.

## What it does

- Uses the Write tool to save the prior message with **no** edits, summary, added commentary, frontmatter, or code-fence wrapping.
- Writes to the path the user gave; if no path was given, it **asks** rather than guessing.
- Does not clean up, reformat, or trim whitespace — the bytes of the prior message are the bytes of the file.
- Confirms with the path written and the byte/line count.

## When to use it

- "Save your last message to a file" / "write that verbatim."
- "Save the previous response as-is" / "dump that to `<path>`."
