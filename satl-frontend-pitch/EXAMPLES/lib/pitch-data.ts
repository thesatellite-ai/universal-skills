// All content for the IFPG Hub interactive pitch deck.
// Source: the markdown plan docs in ../../../ (01_SUMMARY → 11_NAVIGATOR_REUSE_SPIKE).

export const sections = [
	{ id: "cover", number: 0, label: "Cover" },
	{ id: "solution", number: 1, label: "Hub surfaces" },
	{ id: "ecosystem", number: 2, label: "Hub + Atlas" },
	{ id: "architecture", number: 3, label: "Architecture" },
	{ id: "scope", number: 4, label: "Phasing" },
	{ id: "features", number: 5, label: "Clarifications" },
	{ id: "timeline", number: 6, label: "Timeline" },
	{ id: "team", number: 7, label: "Team" },
	{ id: "risks", number: 8, label: "Risks" },
	{ id: "fomo", number: 9, label: "Timing rationale" },
	{ id: "ask", number: 10, label: "Next steps" },
	{ id: "close", number: 11, label: "Close" },
] as const

export type SectionId = (typeof sections)[number]["id"]

// === Section 2 — Problem ===
export const currentSystems = [
	{
		name: "X-Cart member portal",
		role: "Account, billing, basic profile",
		pain: "Old UI, no real-time data",
	},
	{
		name: "Google Sheets",
		role: "Points balance, magazine slots, manual entries",
		pain: "Manual approvals, no audit trail",
	},
	{
		name: "Calendly links",
		role: "Per-consultant scheduling",
		pain: "No credit control, no caps, double-bookings happen",
	},
]

export const problemStats = [
	{ stat: "0", label: "unified views" },
	{ stat: "~12h", label: "weekly manual sync (IFPG staff)" },
	{ stat: "Quarterly PDF", label: "is the franchisor's only feedback loop today" },
]

// === Section 4 — Architecture ===
// Hub is its own service. Go backend, TanStack Start frontend, custom auth,
// separate Postgres. Atlas/Navigator unaffected. Cross-product reuse is in
// design language and domain knowledge — not code.
export const huBuildingBlocks = [
	{ name: "Go backend (custom service)", tone: "new" },
	{ name: "TanStack Start frontend", tone: "new" },
	{ name: "Custom auth (sessions + JWT)", tone: "new" },
	{ name: "Dedicated Postgres instance", tone: "new" },
	{ name: "IFPG design tokens (lifted from Navigator)", tone: "ported" },
	{ name: "Nylas (calendar + email)", tone: "vendor" },
	{ name: "S3 file storage", tone: "vendor" },
	{ name: "Stream Chat (messaging)", tone: "vendor" },
]

// Kept for backwards compat with section 04 imports — used as the "shared
// language" bands below the architecture diagram.
export const platformLayers = [
	{ name: "Design tokens + Tailwind theme", reuse: 100 },
	{ name: "UI component patterns (shadcn-shaped)", reuse: 80 },
	{ name: "Page IA + interaction patterns", reuse: 70 },
	{ name: "IFPG brand-sync logic (rewritten in Go)", reuse: 60 },
	{ name: "Domain schema (entities, relations)", reuse: 55 },
	{ name: "Integration playbook (Nylas, S3, Stream Chat)", reuse: 50 },
	{ name: "Atlas team domain knowledge (since Oct 2025)", reuse: 100 },
	{ name: "Code (Navigator's TypeScript → Hub's Go)", reuse: 0 },
	{ name: "Auth layer (custom for Hub, not WorkOS)", reuse: 0 },
	{ name: "Database (separate Postgres instance)", reuse: 0 },
	{ name: "API layer (Go endpoints, not tRPC)", reuse: 0 },
]

// === Section 5 — Reuse donut ===
// New honest split: design + domain reuse only. Code/infra is purpose-built.
export const reuseSplit = [
	{ name: "Reused (design + domain)", value: 40, color: "#1a365d" },
	{ name: "Purpose-built for Hub", value: 60, color: "#ed8936" },
]

// === Section 6 — Scope phasing ===
export const scopePhases = {
	v1: {
		label: "v1",
		when: "Sept 30, 2026",
		caption: "Members in hand before Q4 renewals",
		features: [
			"The Dash",
			"Brand Profile",
			"Growth Opportunities",
			"Lead Feed",
			"Candidate Pipeline",
			"Consultant Activity",
			"Direct Book (Nylas)",
			"Points Wallet + approvals",
			"Resources CMS",
			"My Local Chapter",
			"Messages (franchisor-side)",
		],
	},
	v15: {
		label: "v1.5",
		when: "Q4 2026",
		caption: "Post-launch deepening, integrations begin",
		features: [
			"X-Cart resale sync",
			"Messages (consultant-side)",
			"HubSpot CRM",
			"Email (Gmail / Outlook via Nylas)",
		],
	},
	v2: {
		label: "v2",
		when: "2027",
		caption: "Platform expansion, third-party ecosystem",
		features: [
			"Unified hub for all IFPG elements",
			"Centralized membership and billing",
			"IFPG-owned content platforms and marketing empowerment",
			"FDD and data enrichment",
		],
	},
}

// === Section 7 — IFPG email Q&A ===
export const featureAnswers = [
	{
		q: "Resale Program — where do listings go?",
		a: "Hub is the input UI. v1.5 syncs back to X-Cart so consultants keep seeing them. v1 ships without the sync to protect the date.",
		phase: "v1.5",
	},
	{
		q: "Points & Balance — is this in X-Cart?",
		a: "No, it's in a Google Sheet today. Hub replaces it with a real wallet, monthly grants by tier (Elite 1k, Elite Plus 2k), approval flow for capped items, automatic refunds on denial.",
		phase: "v1",
	},
	{
		q: "Purchases & Membership — do we build billing?",
		a: "No. Hub reads membership tier from your existing IFPG API. Chargebee integrates in v2 when you're ready.",
		phase: "v2",
	},
	{
		q: "Messages — chat or tickets?",
		a: "Instant messenger, franchisor-side in v1, consultant-side in v1.5. Hosted on Stream Chat to avoid building presence/typing from scratch.",
		phase: "v1",
	},
	{
		q: "My Local Chapter — how is it derived?",
		a: "Pulled from your existing IFPG API. Read-only display. No new logic needed.",
		phase: "v1",
	},
	{
		q: "Booking — link out or build it?",
		a: "Build it. Nylas powers Google + Outlook sync. Per-consultant availability rules. Per-tier monthly credit caps. Super-admin enable/disable. Max-meetings/week ceilings.",
		phase: "v1",
	},
	{
		q: "User types — multiple roles per brand?",
		a: "Yes — Admin / User / Read-Only per IFPG's spec. Plus super-admin (IFPG staff). Consultant side stays in Navigator.",
		phase: "v1",
	},
	{
		q: "Resources — is this a CMS?",
		a: "Yes, lightweight. Notion-style markdown editor. Categories + search. IFPG team publishes; franchisors read.",
		phase: "v1",
	},
	{
		q: "Integrations — which CRMs first?",
		a: "Calendar + Email via Nylas in v1 (covers Gmail, Outlook, Google Cal, Outlook Cal in one vendor). HubSpot v1.5. Others sequenced by usage data from your top 20 brands.",
		phase: "v1 + v1.5",
	},
]

// === Section 8 — Timeline gantt ===
// 17 weeks. Sprint 0 added for Go bootstrap (custom auth + Postgres + deploy +
// CI). Tight but Aman commits to Sept 30. Feature sprints slightly tighter as a
// result; UAT folds into the soft-launch window.
export const sprints = [
	{ id: "mobilize", label: "Mobilize", start: 0, weeks: 2, color: "#cbd5e0", deliverable: "Hire 1 Go BE + 2 FE + 1 designer · stories cut" },
	{ id: "s0", label: "Sprint 0", start: 2, weeks: 2, color: "#a0aec0", deliverable: "Go service skeleton · custom auth · Postgres · deploy · CI" },
	{ id: "s1", label: "Sprint 1", start: 4, weeks: 2, color: "#3182ce", deliverable: "Domain schema · The Dash skeleton · Brand Profile" },
	{ id: "s2", label: "Sprint 2", start: 6, weeks: 2, color: "#4299e1", deliverable: "Points Wallet · Resources CMS · My Local Chapter" },
	{ id: "s3", label: "Sprint 3", start: 8, weeks: 2, color: "#38a169", deliverable: "Direct Book (Nylas) · Consultant Activity · Lead Feed" },
	{ id: "s4", label: "Sprint 4", start: 10, weeks: 2, color: "#ed8936", deliverable: "Pipeline · Performance · Territory · Messages basic" },
	{ id: "s5", label: "Sprint 5", start: 12, weeks: 2, color: "#dd6b20", deliverable: "Brand Marketing · Events · polish · pilot UAT" },
	{ id: "launch", label: "Soft launch", start: 14, weeks: 2, color: "#d69e2e", deliverable: "10-brand pilot, monitor, iterate" },
	{ id: "ga", label: "GA", start: 16, weeks: 1, color: "#1a365d", deliverable: "All IFPG members onboarded · Sept 30" },
]

export const timelineDates = [
	{ week: 0, date: "Jun 1" },
	{ week: 4, date: "Jul 1" },
	{ week: 8, date: "Aug 1" },
	{ week: 13, date: "Sept 1" },
	{ week: 17, date: "Sept 30" },
]

// === Section 9 — Team ===
// One dedicated team, assigned from Solverhood capacity. The Atlas engagement
// IFPG already approved (2 engineers) finishes its v1 round over the next 2-3
// weeks. Those engineers stay on Atlas for ongoing improvements; CTO and
// management time becomes more available for Hub.
export const squad = [
	{ role: "Go backend engineer", count: 1, fte: 1.0, source: "Assigned from Solverhood, Hub-focused", color: "#1a365d" },
	{ role: "TanStack frontend engineer", count: 1, fte: 1.0, source: "Assigned from Solverhood, Hub-focused", color: "#3182ce" },
	{ role: "Elif (Product Owner)", count: 1, fte: 0.5, source: "Product spec, sprint planning, IFPG liaison", color: "#6b46c1" },
	{ role: "Designer", count: 1, fte: 0.2, source: "Shared with Atlas, keeps both products visually aligned", color: "#ed8936" },
	{ role: "QA", count: 1, fte: 0.5, source: "Shared from the Atlas team", color: "#38a169" },
	{ role: "Erman (Project Manager, CEO)", count: 1, fte: 0.15, source: "Engagement lead and stakeholder check-ins", color: "#dd6b20" },
	{ role: "Aman (CTO)", count: 1, fte: 0.25, source: "Architecture oversight and auth design", color: "#d69e2e" },
]

export const navigatorImpact = {
	fesReallocated: 0,
	sharedBackend: "The existing Atlas engagement (2 engineers) finishes its 2-3 week feedback round before Hub work ramps. Solverhood assigns the Hub team in parallel.",
	verdict: "No conflict with the Atlas plan IFPG already approved. Shared designer keeps both products visually aligned.",
}

// === Section 10 — Risks ===
// Risk register. Each item has a written mitigation.
export const risks = [
	{ id: "R1", title: "X-Cart writable API needs verification", likelihood: 2, impact: 2, mitigation: "Resale Program sync confirmed in Phase 1.5 once we have the API spec. v1 ships without the sync." },
	{ id: "R2", title: "Calendar/email vendor pricing surprise", likelihood: 2, impact: 2, mitigation: "Adapter pattern around Nylas. Can swap to Cal.com or self-hosted in roughly a week if pricing moves." },
	{ id: "R3", title: "Custom auth complexity", likelihood: 2, impact: 3, mitigation: "Aman owns the auth design upfront. Standard session + JWT pattern. Spec finalized before backend work starts." },
	{ id: "R4", title: "IFPG central DB rate limits", likelihood: 2, impact: 2, mitigation: "Atlas already calls the same DB; we observe usage patterns and add caching if needed." },
	{ id: "R5", title: "Atlas handoff timing", likelihood: 2, impact: 2, mitigation: "Atlas 2-3 week feedback round and Hub kickoff overlap; shared designer and QA bridge the two." },
	{ id: "R6", title: "Scope creep mid-sprint", likelihood: 3, impact: 3, mitigation: "v1 scope locked in writing. New items move to v1.5 by default." },
	{ id: "R7", title: "Consultant-side Messages demand", likelihood: 2, impact: 2, mitigation: "v1 ships franchisor-side; consultant-side in v1.5 after X-Cart unwind." },
	{ id: "R8", title: "Go ORM / DB layer choice", likelihood: 2, impact: 2, mitigation: "Decision locked early. sqlc is the default; team can pick differently if there is consensus." },
	{ id: "R9", title: "Two products diverge visually over time", likelihood: 1, impact: 2, mitigation: "Shared designer + shared design tokens. Quarterly visual audit across both products." },
	{ id: "R10", title: "Prototype confused with shipped product", likelihood: 1, impact: 3, mitigation: "Every concept screen labeled as a mockup, not connected to live data." },
]

// === Section 11 — Timing rationale ===
// Replaces the earlier "Q4 FOMO" framing with a calmer rationale, no
// fabricated numbers or charts.
export const timingPoints = [
	{
		title: "Atlas v1 wraps in 2-3 weeks",
		body: "The current Atlas engagement (2 engineers, IFPG-approved) finishes its v1 round shortly. Those engineers stay on for ongoing improvements and feedback, but management and CTO time becomes more available for Hub.",
	},
	{
		title: "Renewal conversations begin Q4",
		body: "October starts the renewal cycle for a portion of IFPG members. A working Hub in members' hands during those conversations is more useful than a quarterly report — but the date is a soft target, not a hard ultimatum.",
	},
	{
		title: "Shared foundation already exists",
		body: "The IFPG central DB is already built, already syncs from X-Cart APIs, and already has a strong super admin. Hub plugs into that same foundation rather than rebuilding it.",
	},
]

// === Section 12 — Next steps ===
export const asks = [
	{
		n: 1,
		title: "Confirm v1 scope",
		detail: "Walk through the 11 v1 features and lock the list. Anything new naturally moves to v1.5.",
	},
	{
		n: 2,
		title: "Align on kickoff timing",
		detail: "Pick a kickoff date that fits IFPG's calendar. Solverhood assigns the Hub team to that date.",
	},
]

// === Section 1 — Cover meta ===
export const meta = {
	productName: "IFPG Hub",
	tagline: "Development plan and roadmap",
	byline: "Solverhood team",
	deadline: "Walking through with the IFPG team this week",
}

// === Section 13 — Close ===
export const closeContact = {
	to: "IFPG team",
	from: "Erman and Aman, Solverhood team",
	next: "Happy to walk through any section live whenever it works for your team.",
}

// === Headline numbers used across multiple sections ===
export const headlineNumbers = {
	weeks: 17,
	v1Features: 11,
	v15Features: 4,
	v2Features: 4,
	reusePercent: 40,
	newPercent: 60,
	dedicatedFTE: 3,
	atlasBEShare: 0,
	navigatorImpact: 0,
}
