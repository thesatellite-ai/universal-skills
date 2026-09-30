# The guide

Every envcheck feature, taught with a small example: **the problem**, **the fix**, then a few things worth knowing.

<!-- group: The schema -->
## Declaring variables

**The problem:** nobody knows the full list of variables the app needs.

**The fix:** list them in `env.schema.yaml`, one line each.

::: pair
```yaml title="env.schema.yaml"
PORT: {type: int, default: 8080}
DATABASE_URL: {type: url, required: true}
LOG_LEVEL: {oneof: [debug, info, warn], default: info}
```

```text title="envcheck --list"
PORT          int    default 8080
DATABASE_URL  url    required
LOG_LEVEL     text   one of debug, info, warn
```
:::

- A variable with no rules is still listed, so it is known to exist.
- Unknown variables in `.env` are a warning, not an error.

<!-- group: The schema -->
## Types

**The problem:** `PORT=eighty` is a valid line in a `.env` file and a crash in the app.

**The fix:** give a variable a type, and envcheck checks the value has that shape.

::: pair
```text title=".env"
PORT=eighty
```

```text title="envcheck .env"
✗ PORT must be an int, got "eighty"
```
:::

- Types: `text` (the default), `int`, `bool`, `url`, `email`, `duration`.

<!-- group: The schema -->
## Defaults

**The problem:** optional settings still need a value.

**The fix:** `default:` says what the app uses when the variable is absent, and envcheck reports it.

```text title="envcheck .env"
✓ LOG_LEVEL uses its default, info
```

- A variable cannot be both `required` and have a `default`; that is a schema error.

<!-- group: Checking -->
## Running a check

**The problem:** you want to know, in one command, whether a `.env` file is ready.

**The fix:** `envcheck FILE` reads the schema next to it and reports every problem at once.

```text title="terminal"
$ envcheck .env.production
✗ DATABASE_URL is required but missing
✗ PORT must be an int, got "eighty"
2 problems
```

- It reports all problems, not the first, so one run fixes everything.
- `--schema PATH` points at a schema somewhere else.

<!-- group: Checking -->
## Secrets never print

**The problem:** error messages that echo values leak passwords into logs.

**The fix:** mark a variable `secret`, and its value never appears in any output.

::: pair
```yaml title="env.schema.yaml"
API_KEY: {type: text, secret: true, required: true}
```

```text title="envcheck .env (API_KEY=abc)"
✗ API_KEY is too short (3 characters, needs 32)
```
:::

- The message says what is wrong without saying what the value was.

<!-- group: In CI -->
## JSON output

**The problem:** a CI step or a bot needs the result as data.

**The fix:** `--json` prints one object with every problem.

```json title="envcheck .env --json"
{"ok": false, "problems": [{"var": "PORT", "rule": "type", "message": "must be an int"}]}
```

<!-- group: In CI -->
## Exit codes

**The problem:** CI needs a pass or fail, not text.

**The fix:** envcheck exits 0 when the file is valid and 1 when it is not.

```text title="terminal"
$ envcheck .env.production; echo $?
✗ PORT must be an int, got "eighty"
1 problem
1
```

| Exit | Meaning |
|---|---|
| 0 | valid |
| 1 | problems found |
| 2 | the schema itself is broken |

<!-- group: none -->
## What comes later

Per-environment overrides and a vault loader are on the [roadmap](picture.html#roadmap).
