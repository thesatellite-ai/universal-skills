# Cookbook

Real tasks, start to finish: every file in full, and exactly what comes out.

## Check a project before deploying

**Goal:** a new project, one schema, one check.

```text title="files"
env.schema.yaml
.env.production
```

::: pair
```yaml title="env.schema.yaml"
PORT: {type: int, default: 8080}
DATABASE_URL: {type: url, required: true}
API_KEY: {secret: true, required: true}
```

```text title=".env.production"
DATABASE_URL=postgres://db.internal/app
API_KEY=example-key-not-a-real-one
```
:::

**What you get:**

```text title="terminal"
$ envcheck .env.production
✓ DATABASE_URL
✓ API_KEY
✓ PORT uses its default, 8080
0 problems
```

**What this used:** [declaring variables](guide.html#declaring-variables), [defaults](guide.html#defaults), [secrets](guide.html#secrets-never-print).

## Stop a bad deploy in GitHub Actions

**Goal:** the deploy job fails before anything ships if the production file is wrong.

```yaml title=".github/workflows/deploy.yml"
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: envcheck .env.production --json > envcheck.json
      - run: ./deploy.sh
```

**What you get** when `PORT=eighty` slipped in:

```json title="envcheck.json"
{"ok": false, "problems": [{"var": "PORT", "rule": "type", "message": "must be an int"}]}
```

The `envcheck` step exits 1, so `./deploy.sh` never runs.

**What this used:** [JSON output](guide.html#json-output), [exit codes](guide.html#exit-codes).
