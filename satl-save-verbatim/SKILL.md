---
name: satl-save-verbatim
description: >-
  Save the previous assistant message to a file exactly as written —
  byte-for-byte, no edits. Use when the user says "save your last message to a
  file", "write that verbatim", "save the previous response as-is", "dump that
  to <path>".
---

# satl-save-verbatim

Save the previous assistant message to a file, **exactly as written** —
verbatim, byte-for-byte. No edits, no summary, no added commentary, no
frontmatter, no code-fence wrapping.

- Use the Write tool.
- Filename: the path the user gave. **If no path was given, ask for one
  before writing.** Do not guess a path.
- Do not "clean up", reformat, or trim whitespace. The bytes of the prior
  message are the exact bytes of the file.
- Confirm with the path written and the byte/line count.
