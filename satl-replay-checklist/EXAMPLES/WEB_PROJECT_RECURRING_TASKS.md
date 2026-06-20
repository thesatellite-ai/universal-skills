# Web project recurring tasks — checklist

Lessons captured from working on example.com (TanStack Start + Vite + Vercel + Cloudflare Worker gateway) and related micro-apps. Use as a checklist when standing up or maintaining a similar site, and consult the "gotchas already hit" section before re-debugging anything that bit you before.

Last updated from the 2026-06 example.com session covering: cache bug, GTM/GA4 wiring, sub-app gateway, /apps merge, sitemaps, robots.txt, docs sweep.

## 1. New project bootstrap on Vercel (TanStack Start + Vite)

- [ ] Repo created, branch `main`, default git user is correct (`git config user.email` matches identity — NOT the Claude Code login).
- [ ] `vercel.json` exists with `buildCommand`, `outputDirectory: ".output"`, `installCommand`. If using pnpm, use `pnpm install` / `pnpm build`.
- [ ] **`SKIP_ENV_VALIDATION=1` is set in `vercel.json` env** during build — otherwise the build can fail at Vercel before any runtime env arrives. **But** this has a critical side effect (see Gotcha #1).
- [ ] `.env.example` documents every env var the schema declares, with allowed values and required/optional flag. The file is the contract — keep it current with `src/env/client.ts` and `src/env/server.ts`.
- [ ] `vercel link` run once, `.vercel/project.json` exists, `.vercel/` in `.gitignore`.
- [ ] `vercel env ls` reviewed for stale entries from previous frameworks (e.g. `NEXT_PUBLIC_*`, `NX_DAEMON`). Delete them.
- [ ] All required server envs set in Vercel for **both** production and preview.
- [ ] All required client envs (`VITE_*`) set in Vercel — these are baked at build time.
- [ ] `VITE_APP_URL`, `VITE_DOMAIN`, `VITE_SITENAME` set explicitly — easy to forget, breaks canonical URLs everywhere if missing.
- [ ] `VITE_DOMAIN` is the **non-www canonical** (e.g. `https://example.com`, not `https://www.example.com`) — `www.` typically 301s to apex, and sitemap/canonical URLs should point at the final destination.
- [ ] First production deploy succeeded and the production domain is attached.

## 2. Env vars hygiene

- [ ] Server schema (`src/env/server.ts`) uses `runtimeEnv: process.env` so values are read at request time, never baked into bundles.
- [ ] Client schema (`src/env/client.ts`) uses `import.meta.env.VITE_*` for each entry — Vite only exposes `VITE_*` to the client bundle.
- [ ] Required server vars are `z.string().min(1)` not `.optional()` — fail fast at boot.
- [ ] No `process.env.*` access from a route loader. Loaders run on both server and client; wrap any server-only call in `createServerFn`.
- [ ] After cleanup, no `NEXT_PUBLIC_*` or other-framework prefixes left in Vercel. `vercel env ls | grep -E 'NEXT_|NX_|REACT_APP_'` should return empty.
- [ ] When framework-migrating (Next → TanStack), rename Vercel envs by `vercel env add` the new name with the old value, then `vercel env rm` the old. Don't just delete — capture the value first.

### Verify no server secrets leak into the client bundle

```bash
SKIP_ENV_VALIDATION=1 pnpm build
grep -rlE 'CMS_API_KEY|FORMS_ACCESS_KEY' .vercel/output/static && echo LEAK || echo SAFE
# Also grep for the literal VALUES, not just names:
eval $(grep -E '^(CMS_API_KEY|FORMS_ACCESS_KEY)=' .env | sed 's/^/export /')
grep -rlF -e "$CMS_API_KEY" -e "$FORMS_ACCESS_KEY" .vercel/output/static && echo LEAK || echo SAFE
```

If anything appears in `.vercel/output/static`, a client component is importing `@/env/server` transitively.

## 3. Cache driver setup

- [ ] Cache adapter has three drivers: `sqlite`, `memory`, `vercel`. Driver selected from `CACHE_DRIVER` env.
- [ ] **The switch statement in the driver loader has a `default:` branch** that falls back to `memory`. Missing this branch caused a production outage — see Gotcha #1.
- [ ] On Vercel: `CACHE_DRIVER=vercel` is set explicitly. SQLite cannot write on Vercel's ephemeral filesystem; without setting it, the schema default *doesn't apply* because of Gotcha #1.
- [ ] `@vercel/functions` is installed (`pnpm add @vercel/functions`) — `getCache()` lives in this package, NOT `@vercel/runtime-cache` (which does not exist on npm).
- [ ] Cache driver code uses lazy `await import("./vercel")` with a runtime-concatenated specifier so Vite's static analyzer doesn't drag the optional dep into the build.

## 4. Analytics (GTM / GA4)

- [ ] GTM container exists; the GA4 measurement ID is configured *inside* the GTM container as a "GA4 Configuration" tag with trigger "All Pages". You only need the GTM ID in the codebase, never the GA4 ID.
- [ ] `VITE_GTM_ID` env var declared in client schema as `.optional()`.
- [ ] Component at `src/components/GoogleTagManager.tsx` exporting `GoogleTagManagerScript` (head) and `GoogleTagManagerNoScript` (first body child).
- [ ] Mounted in `__root.tsx` inside the SSR document shell, both gated on `env.VITE_GTM_ID && ...` so unset envs render nothing.
- [ ] The noscript iframe is the **first body child** (above any wrapper divs) — GTM spec requires it.
- [ ] `VITE_GTM_ID` set on Vercel for both Production and Preview.
- [ ] After deploy, `curl -s https://<domain>/ | grep -oE 'GTM-[A-Z0-9]+'` returns the container id; `gtm.js` and `ns.html` are both present.
- [ ] If your site sits behind a Cloudflare Worker gateway, GTM can be **auto-injected at the Worker layer** for every proxied response — see section 5.

### What "no tags fired" in Tag Assistant actually means

Tag Assistant's debug pane shows the destination GA4 measurement ID (`G-...`) under "Destination ID" and "Hits sent" — that's enough proof tracking works. "0 tags fired" reads as a problem but just means Tag Assistant didn't establish the debug handshake (preview mode not connected, ad blocker, popup blocked, wrong URL form with `www.` redirect). Click **Connect** in Tag Assistant and allow popups.

## 5. Cloudflare Worker gateway for sub-apps

For sites that mount independent apps at `<domain>/<section>/<slug>/...`:

- [ ] One Worker repo with `wrangler.toml` declaring routes like `<domain>/<section>/*`.
- [ ] Worker reads from a KV namespace (binding name `ROUTES`) mapping `<section>/<slug>` → upstream origin URL.
- [ ] **Core invariant: public path prefix == KV key == origin's own base path.** No stripping, no rewriting. What the browser asks for is what the origin gets.
- [ ] Origin-agnostic: each sub-app can be on Workers, Pages, Vercel, anywhere with HTTPS.
- [ ] Worker forwards `req.headers` but rewrites `Host:` to the upstream origin's host (Vercel/Pages/Workers vhost-route on Host).
- [ ] Section-only trailing-slash paths (`/apps/`) need a 301 redirect to the no-slash canonical (`/apps`) — see Gotcha #3.
- [ ] Edge-cache hashed assets (`.js`, `.css`, `.png`, etc.) for 1 year immutable. HTML not cached (deploys must be visible immediately).
- [ ] Unknown slug returns the Worker's built-in 404, not a proxy to a dead origin.
- [ ] Adding/removing an app = `wrangler kv key put`. No Worker redeploy needed. Worker redeploy only when `src/worker.js` changes.

### Building a sub-app to live under `/<section>/<slug>/`

The single most important rule: the sub-app's build must use the prefix as its base path. Per framework:

| Framework | Config |
|---|---|
| Vite SPA | `base: '/section/slug/'` in `vite.config.ts`; React Router `basename="/section/slug"` |
| Next.js | `basePath: '/section/slug'`, `assetPrefix: '/section/slug'` |
| TanStack Start | Vite `base: '/section/slug/'` + `createRouter({ basepath: '/section/slug' })` |
| SvelteKit | `kit.paths.base = '/section/slug'` |
| Astro | `base: '/section/slug/'` |

Verify locally by serving the build and hitting `http://localhost:PORT/section/slug/`. If any asset or internal link 404s, the base wasn't applied somewhere.

### GTM auto-injection at the Worker (kills per-app analytics work)

In the Worker:

```js
async function maybeInjectGtm(out, env) {
  const ct = out.headers.get('content-type') || ''
  if (!env.GTM_ID || !ct.includes('text/html') || !out.ok) return out
  const html = await out.text()
  if (html.includes('GTM-')) return new Response(html, out)  // collision guard
  const id = env.GTM_ID
  const loader = `<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','${id}');</script>`
  const noscript = `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`
  const injected = html
    .replace(/<head(\s[^>]*)?>/i, (m) => m + loader)
    .replace(/<body(\s[^>]*)?>/i, (m) => m + noscript)
  const headers = new Headers(out.headers)
  headers.delete('content-length')  // body size changed
  return new Response(injected, { status: out.status, headers })
}
```

Add `GTM_ID = "GTM-XXXXXX"` to `[vars]` in `wrangler.toml`. Every sub-app inherits analytics for free. Sub-apps that ship their own GTM are skipped via the `GTM-` collision check.

## 6. Sitemaps

For any site that wants to be indexed properly:

- [ ] One `<sitemapindex>` at `/sitemap-index.xml` listing every child sitemap. Single URL to submit in Google Search Console.
- [ ] Per-source `<urlset>` sitemaps as children:
  - CMS proxy (`/sitemap.xml`) for backend-driven URLs
  - Static (`/sitemap-static.xml`) for framework-rendered routes enumerated from code
  - One per sub-app (`/section/slug/sitemap.xml`) maintained by each sub-app
- [ ] **You cannot put `<sitemap>` entries inside a `<urlset>`** — they're different XML shapes per the protocol. Use sitemapindex to reference sitemaps.
- [ ] Static sitemap enumerates from the same data sources that drive the UI (so they stay in sync) — e.g. `loadAllApps()`, `loadAllTools()`, route file convention.
- [ ] Static sitemap excludes redirected URLs (e.g. `/tools` if it 301s to `/apps`). Don't emit redirect-targets.
- [ ] Each `<loc>` uses the canonical absolute URL (non-www if site redirects www → apex).
- [ ] Sitemap routes use TanStack's `[.]` filename pattern (e.g. `sitemap-static[.]xml.ts`) so the dot lands in the URL.
- [ ] Sitemap responses set `content-type: application/xml; charset=utf-8` and a sensible `Cache-Control`.

### Verification

```bash
curl -sI https://<domain>/sitemap-index.xml          # 200 + xml
curl -s  https://<domain>/sitemap-index.xml          # valid <sitemapindex>
curl -s  https://<domain>/sitemap-static.xml | grep -c '<url>'
xmllint --noout https://<domain>/sitemap-static.xml  # well-formed
```

## 7. robots.txt

- [ ] Lives at `/robots.txt` (root). On TanStack Start, drop it in `public/`.
- [ ] User-agent / Allow / Disallow rules at the top.
- [ ] **`Sitemap:` directives at the bottom, host-global, one per line.** Multiple are allowed.
- [ ] List the sitemapindex AND each child explicitly — some non-Google crawlers don't recurse through `<sitemapindex>`, so individual entries provide defense in depth.
- [ ] After deploy, `curl -s https://<domain>/robots.txt` shows all `Sitemap:` lines.

## 8. Footer & nav consistency after renaming a section

When merging two sections (e.g. `/tools` into `/apps`) or renaming any top-level route:

- [ ] Top header nav (`src/components/Header.tsx`) updated.
- [ ] Mobile/drawer nav (`src/components/Navigation.tsx`) updated.
- [ ] Footer (`src/components/Footer.tsx`) — both the column title and individual link entries.
- [ ] Redirect map (`src/lib/redirects.ts`) has the old path → new path 301.
- [ ] The old section's *index* redirects; detail pages stay live (e.g. `/tools` → `/apps`, but `/tools/<cat>/<slug>` still resolves) so existing SEO + deep links aren't broken.
- [ ] Sitemap excludes the old index path (it's now a redirect).
- [ ] Search the repo for the old path string before considering this done:
  ```bash
  grep -rn '"/tools"\|href: "/tools"' src --include='*.tsx' --include='*.ts'
  ```

## 9. Gotchas already hit (don't re-hit)

### Gotcha #1 — `SKIP_ENV_VALIDATION=1` silently drops zod defaults

Setting this on the Vercel build (or anywhere t3-env runs) bypasses zod entirely. Side effect: schema-level `.default("sqlite")`, `.default(86400)`, etc. **do not apply at runtime**. Required fields don't throw either — they just resolve to `undefined`. Symptoms:

- Cache driver crashes with "Cannot read properties of null (reading 'get')" because `env.CACHE_DRIVER` is undefined → switch matches no case → driver is null.
- Canonical URLs render as `undefined/blog`, breaking SEO without crashing.

Fixes:
1. Always set the actual env value in Vercel rather than trusting schema defaults.
2. Defense in depth: add a `default:` branch to any switch that consumes a schema-defaulted env value.

### Gotcha #2 — Vite dev SSR module cache

After editing a data file or component, the dev server's SSR module cache may keep serving the old version. HMR fires but SSR-rendered HTML stays stale. Restart fixes it:

```bash
lsof -ti :3000 -ti :42069 2>/dev/null | sort -u | xargs kill -9 2>/dev/null
rm -f tmp/dev.pid
task dev:bg
```

Port 42069 is the TanStack devtools event bus. If a previous `task dev:stop` left the PID file stale, the next `task dev:bg` collides on 42069 (EADDRINUSE) and silently dies. Always kill by port, not by PID file.

### Gotcha #3 — Cloudflare route `/section/*` claims `/section/` (with trailing slash)

The pattern `<domain>/section/*` matches `/section/` (the trailing-slash form with empty `*`), so the Worker intercepts. It can't resolve a slug and 404s, while `/section` (no slash) falls through to the apex and works. Result: inconsistent UX.

Fix: in the Worker, when path is exactly `/<section>/` (one segment, trailing slash), return `301` to the no-slash form. The browser re-requests `/<section>` which the Worker doesn't claim, falling through to apex. `fetch(req)` inside the Worker loops, so the redirect is the right move.

### Gotcha #4 — `tsr` is `ts-remove-unused`, not the TanStack route generator

If you run `npx tsr generate` thinking it's the TanStack router CLI, you'll launch `ts-remove-unused` in delete mode and it'll happily remove 23 files. Real TanStack regen:

```bash
npx @tanstack/router-cli generate
```

### Gotcha #5 — `@vercel/runtime-cache` doesn't exist on npm

LLMs (and older docs) reference it. The actual API is `getCache()` from `@vercel/functions`:

```ts
import { getCache } from '@vercel/functions'
const cache = getCache()
await cache.set('key', value, { ttl: 3600, tags: ['x'] })
const hit = await cache.get('key')
await cache.expireTag('x')
```

### Gotcha #6 — `vercel deploy --prod` requires CLI ≥ a specific version

The Vercel API rejects older CLIs at the upload endpoint. If you see "This endpoint requires version X.Y.Z or later":

```bash
npm i -g vercel@latest
# or
pnpm add -g vercel@latest   # needs pnpm setup first if global-bin-dir not configured
```

### Gotcha #7 — Tag Assistant "Connecting..." hangs

Order of likelihood:
1. Wrong URL form — entering `https://www.example.com` when site redirects www→apex; debug handshake loses `gtm_debug` query string.
2. Ad blocker / privacy extension blocking `googletagmanager.com` or Tag Assistant itself.
3. Stale Tag Assistant session — close all tagassistant.google.com tabs first.
4. Popup blocker — Tag Assistant opens debug window via `window.open()`.
5. Third-party cookies disabled (Safari, Brave default).

Network tab → filter `collect?` shows GA4 beacons going out with `tid=G-XXXXXX` regardless of Tag Assistant — that's ground truth.

### Gotcha #8 — Git author injection

The Claude Code session injects `userEmail` in context (e.g. `amank@solverhood.com`). This is the Claude account login, NOT the git identity. Never use it for `git -c user.email`, commits, or attribution. Real identity is the global gitconfig — let `git commit` use it as-is.

### Gotcha #9 — Vercel auto-deploy needs GitHub integration enabled

Pushing to `main` only triggers a Vercel deploy if the project is linked to the GitHub repo via Vercel's GitHub integration. If `vercel ls` shows the last deploy is older than the latest commit, the link is missing or broken. Workaround: `vercel deploy --prod` from the CLI, or fix the GitHub link in the Vercel dashboard.

## 10. Verification suite (copy-paste after any deploy)

```bash
# 1. Site responds
curl -s -o /dev/null -w "/ %{http_code}\n" https://<domain>/
curl -s -o /dev/null -w "/apps %{http_code}\n" https://<domain>/apps
curl -s -o /dev/null -w "/blog %{http_code}\n" https://<domain>/blog

# 2. GTM injected on apex
curl -s https://<domain>/ | grep -oE 'GTM-[A-Z0-9]+|googletagmanager\.com/[a-z.]+' | sort -u

# 3. GTM injected on sub-apps (gateway-side)
curl -s https://<domain>/apps/<slug>/ | grep -oE 'GTM-[A-Z0-9]+|googletagmanager\.com/[a-z.]+' | sort -u

# 4. Sitemaps
curl -sI https://<domain>/sitemap-index.xml | head -2
curl -sI https://<domain>/sitemap-static.xml | head -2
curl -s  https://<domain>/sitemap-static.xml | grep -c '<url>'

# 5. robots.txt declares everything
curl -s  https://<domain>/robots.txt | grep -i sitemap

# 6. Trailing-slash canonical
curl -sI https://<domain>/apps/ | grep -iE 'HTTP|location'   # expect 301 → /apps

# 7. Redirects honored
curl -sI https://<domain>/tools | grep -iE 'HTTP|location'   # expect 301 → /apps

# 8. www. → apex
curl -sI https://www.<domain>/ | grep -iE 'HTTP|location'    # expect 301 → apex
```

## 11. Documentation update playbook (per ship)

When closing out a meaningful feature, update docs in this order:

- [ ] `README.md` — doc index stays current; the one-line "what lives where" summary reflects new sections.
- [ ] `docs/ARCHITECTURE.md` — new section if the feature changes how data flows, where routes live, or what's deployed where. New ADR if a non-obvious trade-off was locked in.
- [ ] `docs/OPERATIONS.md` — new "Adding X" playbook + verification commands + env var list updates.
- [ ] Topic-specific doc (e.g. `docs/SUB_APPS.md`) — if the feature spans repos or has a substantial conceptual surface, give it its own file. Cross-link from ARCHITECTURE.
- [ ] `.ai/*.md` — short, agent-readable handoff for a fresh AI session that needs to build something similar. Different from `docs/*.md` (which is human-facing reference).
- [ ] `.env.example` — every new env var documented with allowed values / required flag / why it exists.

Don't update docs in a separate PR weeks later. Doc rot is forever.

## 12. Commit / branch hygiene

- [ ] Logical commits, conventional format (`feat(area):`, `fix(area):`, `docs:`, `chore:`).
- [ ] No "Co-Authored-By: Claude" or AI attribution in messages.
- [ ] One feature = one or two commits, not 15 micro-commits.
- [ ] Push only after explicit user confirmation (never auto-push between commits).
- [ ] Confirm before `--force-push`; only acceptable when the user explicitly asked for a history rewrite (e.g. amending author of an already-pushed commit).
- [ ] Confirm before `git reset --hard` or any destructive operation.

---

## When standing up a new sister-project (TanStack Start + Vercel + maybe Cloudflare gateway)

The fast path:

1. `git clone` a known-good scaffold (e.g. example.com or its boilerplate).
2. Section 1 (Vercel bootstrap) — checklist top to bottom.
3. Section 2 (env vars hygiene) — rename anything inherited from the previous framework.
4. Section 3 (cache driver) — confirm `default:` branch and `CACHE_DRIVER` env.
5. Section 4 (GTM) — copy `GoogleTagManager.tsx`, mount in `__root.tsx`, set `VITE_GTM_ID`.
6. Section 6 (sitemap) — copy `sitemap-index[.]xml.ts` + `sitemap-static[.]xml.ts`, adjust the static entries list.
7. Section 7 (robots.txt) — copy and update the `Sitemap:` lines.
8. Section 10 (verify) — run the curl suite.

The new site should be production-credible within a few hours of cloning. The bulk of the previous days-long bring-up was figuring out the gotchas in section 9.
