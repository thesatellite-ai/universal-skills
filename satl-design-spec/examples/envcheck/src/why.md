# envcheck

Catch a missing or malformed environment variable before your app starts with it.

> [!note] Written as if it has already shipped
> This is an example design. Nothing here is built.

## Who it is for

Teams whose app reads its settings from environment variables, and who have shipped at least once with `DATABASE_URL` unset or `PORT=eighty`.

## The problem

- A typo in a `.env` file is found by the app, at startup, in production, as a stack trace.
- The list of variables the app needs lives in someone's head, or in a README nobody updates.

## The answer

A small file, `env.schema.yaml`, lists every variable the app needs and what it must look like. `envcheck` compares a `.env` file against it and says exactly what is wrong.

::: pair
```yaml title="env.schema.yaml"
PORT: {type: int, default: 8080}
DATABASE_URL: {type: url, required: true}
```

```text title="envcheck .env"
✗ DATABASE_URL is required but missing
✓ PORT uses its default, 8080
1 problem
```
:::

## What makes it different

::: cards c2
::: item
### One file is the contract
The schema is the list of what the app needs. It is reviewed in pull requests like code.
:::
::: item
### Secrets never print
Values of variables marked `secret` never appear in any output, even in errors.
:::
:::

## What it does not do

It does not load variables into your app, edit your `.env` file, or fetch secrets from a vault. It only checks.

## Questions a user would ask

**Does it change my `.env`?** No. It only reads it.

**Can I use it in CI?** Yes. It exits non-zero on any problem and has a `--json` mode.

## Questions we ask ourselves

**What is the biggest risk?** That teams skip writing the schema. `envcheck init` drafts one from an existing `.env` to make the first step free.

**What is not decided yet?** Whether the schema should support per-environment overrides (staging vs production).
