# Dependencies + setup commands

Exact dependency list for the satl-frontend-pitch stack. Run these after scaffolding a base TanStack Start project.

## Required deps

```bash
pnpm add motion lucide-react sonner clsx tailwind-merge class-variance-authority
```

## Already in the TanStack Start boilerplate

These come from the official scaffold and don't need re-installing:

- `@tanstack/react-router`
- `@tanstack/react-start`
- `@tanstack/router-plugin`
- `react`, `react-dom` (19.x)
- `tailwindcss`, `@tailwindcss/vite` (4.x)
- `vite` (8.x)
- `nitro` (nitro-nightly v3, for the Vercel preset)
- `typescript` (5.x or 6.x)

## Dev deps

```bash
pnpm add -D @biomejs/biome  # optional: lint/format
```

## DO NOT install

These cause specific known issues:

- **`recharts`** — breaks on React 19 + Vite 8 with `require_isUnsafeProperty is not a function`. Use inline SVG charts instead. See SKILL.md "Tech gotchas" #2.
- **`framer-motion`** (the old package name) — use the new `motion` package instead. Import is `motion/react`. Same API.

## Verify install

```bash
pnpm exec vite dev --port 3939
# → should boot in under 2s
# Open http://127.0.0.1:3939/
```

If the dev server fails to start, the most common cause is a port conflict. Pick another port.

## Build for production

```bash
VERCEL=1 pnpm build
# → outputs to .vercel/output (Vercel build output API spec)
```

## Deploy to Vercel

See SKILL.md Phase 9 for the full deploy flow. Short version:

```bash
vercel login                                          # one-time
vercel link --scope <team> --project <slug> --yes
vercel --prod --yes --scope <team>
```

## Disable Vercel SSO protection on the project

If team-wide SSO is on, deploys will return 401 even for production. Disable via API:

```bash
TOKEN=$(cat ~/Library/Application\ Support/com.vercel.cli/auth.json | jq -r .token)
PID=$(cat .vercel/project.json | jq -r .projectId)
TEAM=$(cat .vercel/project.json | jq -r .orgId)
curl -X PATCH "https://api.vercel.com/v9/projects/$PID?teamId=$TEAM" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ssoProtection":null}'
```

## Common install issues

- **`unmet peer crossws@~0.3`** — harmless warning from graphql-ws nested dep. Ignore.
- **`unmet peer typescript@^5.0.0: found 6.0.3`** — vite-tsconfig-paths warning. Ignore.
- **`workspace:*` errors** — running outside a pnpm workspace. Use `pnpm install --frozen-lockfile=false`.
