// universal-skills brand kit generator — single source of truth for the identity.
// Run: node gen-brand.mjs  → writes all SVG marks + design tokens here.
// Rasterize with the sibling Taskfile (`task raster`). Values mirror brand.json.
import { writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const OUT = dirname(fileURLToPath(import.meta.url))

// ── Manifest (from brand.json) ───────────────────────────────────────────────
const M = {
  name: "universal-skills",
  tile: ["#3B82F6", "#1D4ED8"],
  fg: "#FFFFFF",
  accent: "#FBBF24",
  radius: 112,
  fonts: { display: "'Space Grotesk', 'Geist', ui-sans-serif, system-ui, sans-serif" },
  dark: ["#1E40AF", "#172554"], darkFg: "#DBEAFE",
  light: ["#EFF6FF", "#DBEAFE"], lightFg: "#1D4ED8", lightAccent: "#D97706",
  glyphAccent: "#F59E0B",
}

// ── GLYPH: 2×2 module grid — a library of skills, one "active" (accent) ───────
function GLYPH(fg, accent, _opts = {}) {
  return `<g fill="${fg}">
    <rect x="84" y="84" width="150" height="150" rx="30"/>
    <rect x="278" y="84" width="150" height="150" rx="30"/>
    <rect x="84" y="278" width="150" height="150" rx="30"/>
  </g>
  <rect x="278" y="278" width="150" height="150" rx="30" fill="${accent}"/>`
}

// ── Generic machinery ────────────────────────────────────────────────────────
const grad = (id, a, b, x2 = 512, y2 = 512) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`
const open = (w, h, label) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">`
const W = (f, s) => writeFileSync(`${OUT}/${f}`, s)
const iconFile = (id, a, b, fg, accent, opts) =>
  `${open(512, 512, M.name)}
  <defs>${grad(id, a, b)}</defs>
  <rect width="512" height="512" rx="${M.radius}" fill="url(#${id})"/>
  ${GLYPH(fg, accent, opts)}
</svg>
`

const n = M.name
W(`${n}-icon.svg`,       iconFile("g-color", M.tile[0], M.tile[1], M.fg, M.accent))
W("icon.svg",            iconFile("g-c2",    M.tile[0], M.tile[1], M.fg, M.accent))
W(`${n}-icon-dark.svg`,  iconFile("g-dark",  M.dark[0], M.dark[1], M.darkFg, M.accent))
W(`${n}-icon-light.svg`, iconFile("g-light", M.light[0], M.light[1], M.lightFg, M.lightAccent))
W("favicon.svg",         iconFile("g-fav",   M.tile[0], M.tile[1], M.fg, M.accent))
W(`${n}-glyph.svg`,      `${open(512, 512, `${n} glyph`)}\n  ${GLYPH(M.lightFg, M.glyphAccent)}\n</svg>\n`)
W(`${n}-mono.svg`,       `${open(512, 512, n)}\n  ${GLYPH("currentColor", "currentColor")}\n</svg>\n`)

const FONT = M.fonts.display
W(`${n}-wordmark.svg`, `${open(560, 140, n)}\n  <text x="0" y="100" font-family="${FONT}" font-size="108" font-weight="600" letter-spacing="-5" fill="#0B0B12">${n}</text>\n</svg>\n`)

const lockup = (id, textFill) =>
  `${open(900, 200, n)}
  <defs>${grad(id, M.tile[0], M.tile[1])}</defs>
  <g transform="translate(20,36) scale(0.25)"><rect width="512" height="512" rx="${M.radius}" fill="url(#${id})"/>${GLYPH(M.fg, M.accent)}</g>
  <text x="176" y="126" font-family="${FONT}" font-size="92" font-weight="600" letter-spacing="-4" fill="${textFill}">${n}</text>
</svg>
`
W(`${n}-lockup.svg`,      lockup("l-color", "#0B0B12"))
W(`${n}-lockup-dark.svg`, lockup("l-dark", M.light[0]))

const TAGLINE = "An open-source library of portable agent skills."
const SUBLINE = "Claude Code · Cursor · Codex · Copilot · Gemini · Cline."
const og = (file, bgA, bgB, main, sub1, sub2, line) =>
  W(file, `${open(1200, 630, n)}
  <defs>${grad("og-bg", bgA, bgB, 1200, 630)}${grad("og-ic", M.tile[0], M.tile[1])}</defs>
  <rect width="1200" height="630" fill="url(#og-bg)"/>
  <g transform="translate(96,180) scale(0.52)"><rect width="512" height="512" rx="${M.radius}" fill="url(#og-ic)"/>${GLYPH(M.fg, M.accent)}</g>
  <text x="412" y="280" font-family="${FONT}" font-size="84" font-weight="600" letter-spacing="-3" fill="${main}">${n}</text>
  <rect x="416" y="312" width="86" height="8" rx="4" fill="${line}"/>
  <text x="414" y="380" font-family="${FONT}" font-size="36" font-weight="500" fill="${sub1}">${TAGLINE}</text>
  <text x="414" y="430" font-family="${FONT}" font-size="26" font-weight="400" fill="${sub2}">${SUBLINE}</text>
</svg>
`)
og("og-cover.svg",       M.dark[0], M.dark[1], "#FFFFFF", M.light[1], "#93C5FD", M.accent)
og("og-cover-light.svg", M.light[0], M.light[1], M.dark[1], M.dark[0], M.lightFg, M.lightFg)

W("tokens.css",
`:root{
  --us-tile-a:${M.tile[0]}; --us-tile-b:${M.tile[1]};
  --us-accent:${M.accent}; --us-fg:${M.fg};
  --us-font-display:${FONT};
  --us-font-sans:'Inter', ui-sans-serif, system-ui, sans-serif;
  --us-font-mono:'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  --us-radius:16px;
}
[data-theme="dark"], .dark{ --us-bg:${M.dark[1]}; --us-fg:${M.light[0]}; }
`)
W("palette.json", `${JSON.stringify({ name: n, tile: M.tile, accent: M.accent, fg: M.fg, dark: M.dark, light: M.light, glyphAccent: M.glyphAccent }, null, 2)}\n`)
W("tokens.json", `${JSON.stringify({ name: n, color: { tile: M.tile, accent: M.accent }, font: { display: "Space Grotesk", sans: "Inter", mono: "JetBrains Mono" }, radius: { tile: `${M.radius}@512` }, icon: { favicon: [16, 32, 48, 180, 512], og: [1200, 630] } }, null, 2)}\n`)

console.log(`✓ ${n} brand kit written to ${OUT}`)
