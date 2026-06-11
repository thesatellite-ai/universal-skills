// Full module catalog for IFPG Hub — used by /module/$slug routes and
// surfaced from section 03 of the main deck.
//
// 19 modules total: 11 in v1, 4 in v1.5, 4 in v2. Content density varies —
// v1 modules get the full template, v1.5 / v2 modules get summaries.

export type Phase = "v1" | "v1.5" | "v2"

export type IconKey =
	| "dash"
	| "growth"
	| "leads"
	| "pipeline"
	| "activity"
	| "book"
	| "wallet"
	| "messages"
	| "chapter"
	| "events"
	| "resources"
	| "brand"
	| "marketing"
	| "performance"
	| "territory"
	| "resale"
	| "crm"
	| "billing"
	| "data"

export type Flow = { title: string; body: string }
export type SchemaEntity = { name: string; fields: string[] }
export type Integration = { name: string; role: string }
export type CrossProduct = { trigger: string; effect: string }

export type Module = {
	slug: string
	name: string
	tagline: string
	description: string
	icon: IconKey
	accent: "navy" | "royal" | "orange" | "green" | "gold" | "purple"
	phase: Phase
	when: string
	hero: string
	flows: Flow[]
	dataShape: SchemaEntity[]
	integrations: Integration[]
	crossProduct: CrossProduct[]
	ifpgBenefit: string
	mockType: "dash" | "list" | "calendar" | "wallet" | "table" | "form" | "feed"
	base44Page?: string // matching surface name in the IFPG client's base44 prototype
}

export const base44Url = "https://franchisor-growth-hub.base44.app"

export const modules: Module[] = [
	// =================== v1 ===================
	{
		slug: "the-dash",
		name: "The Dash",
		tagline: "The morning command center",
		description:
			"A single screen the franchisor opens every morning. Three actions waiting on them, four headline KPIs, the week's bookings, and consultant activity since they last logged in.",
		icon: "dash",
		accent: "navy",
		phase: "v1",
		when: "Sept 30, 2026",
		hero: "If we only ship one screen, this is it. The Dash is what makes Hub a daily habit rather than a quarterly review tool.",
		flows: [
			{
				title: "Morning open",
				body: "Franchisor logs in. Within 2 seconds: 3 ranked actions, 4 KPI tiles, week's calendar strip, recent consultant activity feed. No clicks needed to know what's happening.",
			},
			{
				title: "Single-click drill-in",
				body: "Each action card links straight to its module (Lead Feed, Direct Book, Wallet). No nested navigation. No surprise screens.",
			},
			{
				title: "Today's bookings prominently",
				body: "The week's scheduled calls render as gradient day-blocks in the right rail with consultant + topic. Click any to open the calendar app of choice.",
			},
			{
				title: "Time-sensitive callouts",
				body: "Expiring magazine slots, hot-lead refreshes, and approvals waiting get an urgent pulse animation. Franchisor never misses the deadline-driven items.",
			},
		],
		dataShape: [
			{ name: "dash_actions_view", fields: ["franchisor_org_id", "ranked actions joined from leads + bookings + opportunities + purchases (live SQL view)"] },
			{ name: "dash_kpis_view", fields: ["franchisor_org_id", "active_leads_count", "bookings_used_this_month", "profile_views_30d", "points_balance"] },
			{ name: "recent_activity_view", fields: ["franchisor_org_id", "ordered events from consultants over the past 7d"] },
		],
		integrations: [
			{ name: "Hub Postgres", role: "All metrics + activity feed source data" },
			{ name: "IFPG upstream API", role: "Brand metadata for display" },
		],
		crossProduct: [
			{
				trigger: "Consultant in Franchise Atlas assigns 2 candidates to brand",
				effect: "Within 60s, action card appears on Dash: 'Review 2 new leads from MN region'",
			},
			{
				trigger: "Consultant marks deal as signed in Franchise Atlas",
				effect: "Dash 'Funnel' KPI ticks up. Recent activity feed shows the closed deal with consultant name + fee amount.",
			},
		],
		ifpgBenefit:
			"Replaces the quarterly PDF report. Franchisor sees their growth in real time — every login is a renewal-worthy moment because the value is visible, not summarized.",
		mockType: "dash",
		base44Page: "Command Center",
	},
	{
		slug: "growth-opportunities",
		name: "Growth Opportunities",
		tagline: "Next-best actions, ranked by impact",
		description:
			"A ranked list of the most valuable things this franchisor could do right now. Free wins first (hot leads, open territories), then paid amplifiers (magazine covers, featured slots, email blasts).",
		icon: "growth",
		accent: "orange",
		phase: "v1",
		when: "Sept 30, 2026",
		hero: "The opposite of a marketplace. Hub tells franchisors what to do next — they don't have to figure it out from a catalog.",
		flows: [
			{
				title: "Ranked surfacing",
				body: "Algorithm scores opportunities by impact × urgency × cost. Hot consultant-vetted leads with no cost rank above paid magazine slots, by default.",
			},
			{
				title: "Filter by intent",
				body: "Quick filter chips: All / Free / Costs points / Time-sensitive. Lets the franchisor scan by their current budget for attention.",
			},
			{
				title: "One-click reserve",
				body: "Each opportunity has a single primary action. 'Open' for free leads, 'Reserve' for paid items. No multi-step funnels.",
			},
			{
				title: "Q4 renewal-season banner",
				body: "A persistent navy banner at the bottom calls out the seasonal Featured Brand of the Week before October. Drives Q4 conversion.",
			},
		],
		dataShape: [
			{ name: "opportunities_feed_view", fields: ["franchisor_org_id", "computed score", "type", "cost", "expires_at", "approval_required"] },
			{ name: "opportunity_actions", fields: ["franchisor_org_id", "opportunity_id", "action: viewed | reserved | dismissed", "at"] },
		],
		integrations: [
			{ name: "Points Wallet", role: "Paid opportunities deduct from balance" },
			{ name: "Lead Feed", role: "Hot-lead opportunities link straight to candidate detail" },
		],
		crossProduct: [
			{
				trigger: "Consultant network produces a high-intent lead matching brand criteria",
				effect: "New 'Hot Lead' opportunity surfaces on franchisor's Growth list within 60s",
			},
		],
		ifpgBenefit:
			"Increases purchase rate on existing IFPG inventory (magazine covers, email blasts) by surfacing them at the right moment. Also gives non-paying surface area for free wins, which compounds member retention.",
		mockType: "list",
		base44Page: "Growth Opportunities",
	},
	{
		slug: "lead-feed",
		name: "Lead Feed",
		tagline: "Inbound prospects, consultant-vetted",
		description:
			"Stream of franchisee prospects assigned to this brand by IFPG consultants. Each lead carries financial qualification, location preference, and the consultant's notes.",
		icon: "leads",
		accent: "royal",
		phase: "v1",
		when: "Sept 30, 2026",
		hero: "The pipeline starts here. Every lead a consultant sends a brand lands in Hub — not in a forwarded email.",
		flows: [
			{
				title: "Inbox triage",
				body: "New leads sort to the top with a 'New' badge. Franchisor scans header info (location, capital, timeline) without opening each card.",
			},
			{
				title: "Open detail",
				body: "Click into a lead: full financial profile, consultant's notes, suggested next steps, action buttons (Reach out / Pass / Move to Pipeline stage).",
			},
			{
				title: "Notes back to consultant",
				body: "Franchisor's notes on the lead sync back so consultants in Franchise Atlas see why a lead was passed or moved forward.",
			},
		],
		dataShape: [
			{ name: "leads", fields: ["id", "ifpg_lead_ref", "franchisor_org_id", "consultant_user_id", "stage", "financial_json", "consultant_notes", "last_touch_at"] },
			{ name: "lead_events", fields: ["id", "lead_id", "kind: assigned | viewed | passed | advanced", "by_user_id", "payload_json", "at"] },
		],
		integrations: [
			{ name: "IFPG upstream API", role: "Source of consultant-vetted leads" },
			{ name: "Candidate Pipeline", role: "Leads advance through pipeline stages from here" },
		],
		crossProduct: [
			{
				trigger: "Consultant assigns a candidate to a brand in Franchise Atlas",
				effect: "Lead lands in Hub's Lead Feed within 60s with full profile and notes",
			},
			{
				trigger: "Franchisor advances a lead to 'FDD review' stage in Hub",
				effect: "Consultant sees stage change reflected on their Franchise Atlas userBrand record",
			},
		],
		ifpgBenefit:
			"Eliminates lead leakage. Today, leads forwarded by email get lost. With Hub, every lead has a status, an owner, and a timestamp — and consultants can see exactly which of their leads converted.",
		mockType: "feed",
		base44Page: "Lead Feed Page",
	},
	{
		slug: "candidate-pipeline",
		name: "Candidate Pipeline",
		tagline: "Funnel view from lead to signed",
		description:
			"Kanban or funnel visualization of every lead the franchisor is working, grouped by stage. Drag to advance, view aggregate stage metrics, see drop-off points.",
		icon: "pipeline",
		accent: "green",
		phase: "v1",
		when: "Sept 30, 2026",
		hero: "Turn Lead Feed into a pipeline you can manage. Visualize the funnel; see where deals stall.",
		flows: [
			{
				title: "Five-stage default",
				body: "New leads / Contacted / Discovery call / FDD review / Signed. Stages configurable per brand but the default works for 90% of franchisors.",
			},
			{
				title: "Drag-to-advance",
				body: "Franchisor drags a lead from one column to the next. Stage change syncs back to consultant. Optional timestamp + note prompt on each move.",
			},
			{
				title: "Funnel analytics",
				body: "Conversion rate between each stage shown as a percentage. Drop-off warnings highlight stages where leads stall longer than median.",
			},
		],
		dataShape: [
			{ name: "leads.stage", fields: ["enum: new | contacted | discovery | fdd_review | signed | not_interested"] },
			{ name: "stage_transitions", fields: ["lead_id", "from_stage", "to_stage", "by_user_id", "note", "at"] },
		],
		integrations: [
			{ name: "Lead Feed", role: "Source of leads" },
			{ name: "Performance", role: "Pipeline metrics roll up into KPI tiles" },
		],
		crossProduct: [
			{
				trigger: "Franchisor moves a lead to 'Signed' stage",
				effect: "Consultant's Franchise Atlas dashboard reflects the signed deal + records signedAmount for commission tracking",
			},
		],
		ifpgBenefit:
			"Gives franchisors a real CRM for their IFPG-sourced leads without needing HubSpot. For IFPG, it surfaces conversion data that previously lived in spreadsheets — leverage for renewal conversations.",
		mockType: "table",
		base44Page: "Candidate Pipeline",
	},
	{
		slug: "consultant-activity",
		name: "Consultant Activity",
		tagline: "Which consultants are working your brand",
		description:
			"List of consultants engaged with this brand: how many candidates each has placed, response times, deal value to date, and recent activity.",
		icon: "activity",
		accent: "purple",
		phase: "v1",
		when: "Sept 30, 2026",
		hero: "Visibility into the consultant network. Franchisors see who's actually placing them — and can show appreciation in obvious ways.",
		flows: [
			{
				title: "Consultant leaderboard",
				body: "Sort by total deals, recent activity, or response time. Top consultants get a gold 'Top consultant' badge.",
			},
			{
				title: "One-click outreach",
				body: "From any consultant row: 'Message' (opens Messages thread) or 'Book' (opens Direct Book with this consultant pre-selected).",
			},
			{
				title: "Recent activity drill-down",
				body: "Per-consultant: chronological feed of what they've done — leads assigned, deals closed, messages sent.",
			},
		],
		dataShape: [
			{ name: "consultant_engagement_view", fields: ["consultant_user_id", "franchisor_org_id", "leads_assigned_30d", "deals_signed_lifetime", "median_response_hours", "last_activity_at"] },
		],
		integrations: [
			{ name: "Messages", role: "Direct message link" },
			{ name: "Direct Book", role: "Book a call with this consultant" },
		],
		crossProduct: [
			{
				trigger: "Consultant takes any action in Franchise Atlas (lead assignment, message, deal close)",
				effect: "Their engagement metrics on Hub update accordingly",
			},
		],
		ifpgBenefit:
			"Makes the consultant network visible to franchisors — which strengthens the IFPG flywheel (better engagement → more renewals → more consultant attention → better engagement).",
		mockType: "table",
		base44Page: "Consultant Activity",
	},
	{
		slug: "direct-book",
		name: "Direct Book",
		tagline: "Credit-capped, calendar-synced consultant booking",
		description:
			"Built-in booking system: franchisor picks an available slot on a consultant's real calendar. Credits enforce monthly limits per tier. Consultant calendars sync via Nylas (a third-party calendar + email integration API). No double-booking, ever.",
		icon: "book",
		accent: "royal",
		phase: "v1",
		when: "Sept 30, 2026",
		hero: "Replaces the Calendly free-for-all. Franchisors get a metered, intentional way to talk to consultants — and IFPG owns the meeting layer.",
		flows: [
			{
				title: "Pick a consultant",
				body: "Left rail lists consultants by engagement, specialty, and bookings used this month. Top consultants flagged with a star.",
			},
				{
				title: "Pick a slot",
				body: "Right pane shows the next 5 days, with real consultant availability (pulled live from Google + Outlook via Nylas). Unavailable slots greyed; already-booked struck through.",
			},
			{
				title: "Confirm with credit",
				body: "Modal confirms time + duration + credit cost. Franchisor sees remaining credits explicitly. Confirm fires Nylas event creation + sends invites to both calendars.",
			},
			{
				title: "Smart caps",
				body: "Consultant has a max-meetings-per-week setting. Franchisor has a tier-based monthly credit pool (Elite 5 / Elite Plus 10). Super-admin can adjust either.",
			},
		],
		dataShape: [
			{ name: "consultant_availability", fields: ["consultant_user_id", "weekday", "start_time", "end_time", "max_per_week"] },
			{ name: "booking_credits", fields: ["franchisor_org_id", "balance", "monthly_grant"] },
			{ name: "bookings", fields: ["id", "franchisor_org_id", "consultant_user_id", "slot_at", "duration_min", "status", "nylas_event_id", "credit_consumed"] },
		],
		integrations: [
			{ name: "Nylas", role: "Third-party API service that handles Google + Outlook calendar (and email) sync for us — saves us from writing CalDAV / OAuth flows from scratch" },
			{ name: "Points Wallet", role: "Different from points — uses separate booking credits" },
			{ name: "Messages", role: "Booking confirmation creates an automatic thread" },
		],
		crossProduct: [
			{
				trigger: "Consultant's Google Calendar fills up outside Hub",
				effect: "Nylas sync within 60s; Hub's available slots refresh; no double-book possible",
			},
			{
				trigger: "Franchisor books a slot",
				effect: "Consultant gets a Franchise Atlas notification + calendar invite. Booking visible in both apps.",
			},
		],
		ifpgBenefit:
			"Solves a real consultant complaint: brands hounding them through random Calendly links. Hub meters access by tier, so high-tier brands get more access. Direct upsell lever for IFPG tiers.",
		mockType: "calendar",
		base44Page: "Direct Book",
	},
	{
		slug: "points-wallet",
		name: "Points & Wallet",
		tagline: "Spend monthly points on growth, not gifts",
		description:
			"Real wallet replacing the Google Sheet IFPG runs today. Monthly grants by tier (Elite 1,000 / Elite Plus 2,000). Spend on magazine slots, email blasts, featured placements. Some purchases require IFPG approval; denials auto-refund.",
		icon: "wallet",
		accent: "gold",
		phase: "v1",
		when: "Sept 30, 2026",
		hero: "The single biggest operational win. Replaces a manual spreadsheet with a real ledger, real approvals, real refunds — and gives IFPG audit trail forever.",
		flows: [
			{
				title: "Hero balance",
				body: "Large navy card shows current balance, monthly grant amount, days until next refill. Pending approvals callout if any.",
			},
			{
				title: "Ledger",
				body: "Every credit, debit, refund, and denial in one table. Filter by date range, status, or reason. Export to CSV.",
			},
			{
				title: "Catalog purchase",
				body: "Browse catalog (magazine cover, email blast, featured brand, webinar slot, podcast, etc). Click 'Buy' → modal confirms cost + new balance + approval status.",
			},
			{
				title: "Approval workflow",
				body: "Some items (magazine cover, featured spot) require IFPG admin approval. Points are held but not deducted. Approve → deducted; deny → returned + reason logged.",
			},
			{
				title: "Negative balance toggle",
				body: "Trusted brands can be allowed to go negative (within a cap). Set per-org by super-admin. Surfaces on the wallet card for the franchisor.",
			},
		],
		dataShape: [
			{ name: "points_balances", fields: ["org_id", "balance", "allow_negative", "max_negative"] },
			{ name: "points_ledger", fields: ["id", "org_id", "delta", "reason", "ref_type", "ref_id", "by_user_id", "at"] },
			{ name: "catalog_items", fields: ["id", "name", "description", "cost", "requires_approval", "monthly_cap"] },
			{ name: "purchases", fields: ["id", "org_id", "item_id", "status: pending | approved | denied | fulfilled", "requested_by", "decided_by", "decided_at", "denial_reason"] },
		],
		integrations: [
			{ name: "Growth Opportunities", role: "Paid opportunities deduct from points" },
			{ name: "IFPG admin (super-admin)", role: "Approval workflow runs through Hub admin panel" },
			{ name: "Monthly cron", role: "Grants points on the 1st of each month per tier" },
		],
		crossProduct: [
			{
				trigger: "IFPG super-admin denies a magazine cover request",
				effect: "Points refunded automatically; franchisor notified via in-app banner + email; denial reason logged in ledger",
			},
		],
		ifpgBenefit:
			"Today IFPG spends real hours every week on points spreadsheet maintenance. Hub eliminates that work AND gives a forever-audit-trail. Plus: every points transaction is a touchpoint for franchisors, increasing engagement.",
		mockType: "wallet",
		base44Page: "My Account",
	},
	{
		slug: "messages",
		name: "Messages",
		tagline: "Direct line to consultants (franchisor-side in v1)",
		description:
			"Instant messenger between franchisors and consultants. v1 ships the franchisor-side experience (compose, threads, unread badges). v1.5 brings the consultant side after we unwind X-Cart.",
		icon: "messages",
		accent: "purple",
		phase: "v1",
		when: "Sept 30, 2026",
		hero: "Franchisors can talk to consultants without leaving Hub. Built on Stream Chat to avoid us reinventing presence + typing indicators.",
		flows: [
			{
				title: "Thread list",
				body: "Sidebar list of conversations with consultants, sorted by last message. Unread badges + consultant avatars. Search across all threads.",
			},
			{
				title: "Compose",
				body: "Standard chat experience: rich text, file attachments, @mentions of leads. Send button or Enter key.",
			},
			{
				title: "Auto-thread on events",
				body: "Booking confirmations, lead assignments, and approval decisions automatically create threaded messages. Franchisor never has to copy-paste context.",
			},
		],
		dataShape: [
			{ name: "threads", fields: ["id", "franchisor_org_id", "consultant_user_id", "last_message_at"] },
			{ name: "messages", fields: ["id", "thread_id", "sender_user_id", "body", "attachments_media_id", "read_at"] },
		],
		integrations: [
			{ name: "Stream Chat", role: "Hosted messaging primitive (presence, typing, read receipts)" },
			{ name: "Consultant Activity", role: "Quick-message from consultant row" },
		],
		crossProduct: [
			{
				trigger: "v1.5: consultant replies from Franchise Atlas",
				effect: "Reply lands in Hub thread; franchisor gets in-app notification",
			},
		],
		ifpgBenefit:
			"Today franchisors and consultants communicate over personal email — IFPG has zero visibility. Hub gives a measurable channel and prevents off-platform conversations from undermining engagement metrics.",
		mockType: "feed",
		base44Page: "Messages",
	},
	{
		slug: "my-local-chapter",
		name: "My Local Chapter",
		tagline: "Regional network at a glance",
		description:
			"Read-only display of the franchisor's assigned IFPG chapter: members, upcoming events, chapter contact. Pulled from your IFPG API.",
		icon: "chapter",
		accent: "navy",
		phase: "v1",
		when: "Sept 30, 2026",
		hero: "Surfaces an existing IFPG asset (chapters) in a place franchisors will actually look.",
		flows: [
			{
				title: "Chapter overview",
				body: "Hero block: chapter name, geography served, member count, primary contact.",
			},
			{
				title: "Member directory",
				body: "Searchable list of other franchisors and consultants in the chapter. Each row shows brand/role + a 'Connect' button (opens Messages).",
			},
			{
				title: "Upcoming events",
				body: "List of chapter events with RSVP buttons (RSVP feeds into Network Events module).",
			},
		],
		dataShape: [
			{ name: "chapter_ref", fields: ["pulled live from IFPG upstream API"] },
			{ name: "chapter_members_view", fields: ["chapter_id", "user_id", "role", "brand_or_specialty"] },
		],
		integrations: [
			{ name: "IFPG upstream API", role: "Chapter assignment + member lists" },
			{ name: "Messages", role: "Connect button opens a new thread" },
			{ name: "Network Events", role: "Chapter events live here too" },
		],
		crossProduct: [
			{
				trigger: "IFPG reassigns a franchisor to a different chapter",
				effect: "Hub picks up the change on next API sync (no manual update)",
			},
		],
		ifpgBenefit:
			"Activates an existing IFPG asset (chapter structure) that's underutilized today. Drives more peer-to-peer connections, which strengthens membership stickiness.",
		mockType: "list",
		base44Page: "Local Chapter",
	},
	{
		slug: "resources",
		name: "Resources",
		tagline: "CMS-managed docs IFPG pushes to franchisors",
		description:
			"Lightweight CMS where IFPG team publishes FAQs, playbooks, document templates, and announcements. Franchisors browse + search.",
		icon: "resources",
		accent: "green",
		phase: "v1",
		when: "Sept 30, 2026",
		hero: "Replaces 'here's a PDF, save it somewhere' with a real searchable knowledge base — and gives IFPG a publishing channel.",
		flows: [
			{
				title: "Browse by category",
				body: "Top-level categories: Onboarding, Best practices, Templates, Announcements, FAQs. Each holds 5-50 articles.",
			},
			{
				title: "Search",
				body: "Full-text search across all resources. Postgres trigram or simple LIKE; nothing fancier needed at v1 scale.",
			},
			{
				title: "Featured surfacing",
				body: "IFPG can pin 1-3 'featured' resources. These show on The Dash as a small banner when new.",
			},
			{
				title: "IFPG-side CMS",
				body: "Super-admin view: Notion-style markdown editor (BlockNote or Tiptap), categories, publish/unpublish, featured toggle.",
			},
		],
		dataShape: [
			{ name: "resource_categories", fields: ["id", "name", "slug", "order"] },
			{ name: "resources", fields: ["id", "category_id", "title", "slug", "body_markdown", "published", "featured", "author_user_id", "updated_at"] },
		],
		integrations: [
			{ name: "The Dash", role: "Featured resources surface as a small banner" },
		],
		crossProduct: [],
		ifpgBenefit:
			"Gives IFPG a publishing channel directly into franchisor workflows. Replaces email blasts + scattered Google Drives. Plus, search-driven discovery means franchisors find answers without contacting IFPG support.",
		mockType: "list",
		base44Page: "Resources",
	},
	{
		slug: "brand-profile",
		name: "Brand Profile",
		tagline: "Franchisor self-service brand metadata",
		description:
			"Where the franchisor edits their own brand details: FDD highlights, photos, specialties, target territories. Syncs to the IFPG brand catalog so consultants see fresh info.",
		icon: "brand",
		accent: "navy",
		phase: "v1",
		when: "Sept 30, 2026",
		hero: "Stops the 'email IFPG to update your brand' workflow. Franchisor owns their profile; IFPG just approves changes that touch tier or category.",
		flows: [
			{
				title: "Edit profile",
				body: "Standard form: brand name, description, FDD highlights, photo gallery, target territories. Save → publishes immediately to franchisor-visible parts.",
			},
			{
				title: "Tier-locked fields",
				body: "Some fields (industry category, investment minimums) require IFPG approval because they affect consultant matching. Edit flagged as pending until approved.",
			},
			{
				title: "Preview as consultant",
				body: "'Preview' button shows how the brand looks to a consultant browsing in Franchise Atlas. Helps franchisors understand the impression they make.",
			},
		],
		dataShape: [
			{ name: "franchisor_brand_profile", fields: ["org_id", "ifpg_brand_id_ref", "name", "description", "fdd_highlights_json", "specialties[]", "target_territories[]", "updated_at"] },
			{ name: "media_uploads", fields: ["id", "org_id", "kind: photo | logo | doc", "s3_key", "uploaded_by", "at"] },
		],
		integrations: [
			{ name: "IFPG upstream API", role: "Some fields write back to source-of-truth brand record" },
			{ name: "S3", role: "Image + document storage" },
		],
		crossProduct: [
			{
				trigger: "Franchisor updates brand description in Hub",
				effect: "Consultants in Franchise Atlas see the new copy within 60s",
			},
		],
		ifpgBenefit:
			"Reduces IFPG ops load (manual brand profile updates today). Also improves data freshness across the entire consultant network — stale brand info is a real conversion killer.",
		mockType: "form",
		base44Page: "Brand Profile",
	},
	// =================== v1.5 ===================
	{
		slug: "x-cart-resale-sync",
		name: "Resale Program",
		tagline: "Brand resales managed in Hub, synced to X-Cart",
		description:
			"Franchisor lists existing locations on sale. Hub holds the canonical record; X-Cart sync pushes them to the legacy member portal so consultants still see them in their existing workflow.",
		icon: "resale",
		accent: "orange",
		phase: "v1.5",
		when: "Q4 2026",
		hero: "Deferred from v1 because X-Cart's writable API is unknown. v1.5 spike confirms feasibility in the kickoff week.",
		flows: [
			{
				title: "List a resale",
				body: "Franchisor fills in a form: location, asking price, contact info, FDD/territory notes. Save → published in Hub + queued for X-Cart sync.",
			},
			{
				title: "Sync to X-Cart",
				body: "Background job pushes the listing to X-Cart's member portal so consultants see it where they already look. Status indicator shows sync state.",
			},
		],
		dataShape: [
			{ name: "resales", fields: ["id", "org_id", "location", "asking_price", "contact_info", "notes_md", "xcart_synced_at", "status"] },
		],
		integrations: [{ name: "X-Cart admin API", role: "Two-way sync" }],
		crossProduct: [],
		ifpgBenefit:
			"Unblocks a workflow that currently lives entirely in X-Cart. Modernizes the input UX without forcing consultants to migrate.",
		mockType: "form",
	},
	{
		slug: "messages-consultant",
		name: "Messages — consultant side",
		tagline: "Consultants reply from Franchise Atlas",
		description:
			"Consultant-facing view of the Messages module, surfaced inside Franchise Atlas (not Hub). Lets consultants reply to franchisor messages without leaving their existing workflow.",
		icon: "messages",
		accent: "purple",
		phase: "v1.5",
		when: "Q4 2026",
		hero: "Closes the conversation loop. v1 had franchisor-only; v1.5 makes it real two-way.",
		flows: [
			{
				title: "Inbox in Franchise Atlas",
				body: "Consultants see a Messages tab in Franchise Atlas with threads from franchisors. Stream Chat SDK powers the surface; same backend as Hub.",
			},
		],
		dataShape: [],
		integrations: [{ name: "Stream Chat", role: "Same hosted backend, different client" }],
		crossProduct: [],
		ifpgBenefit: "Completes the messaging value prop. Without this, franchisors can talk but consultants can't reply in-app.",
		mockType: "feed",
	},
	{
		slug: "hubspot",
		name: "HubSpot integration",
		tagline: "Push closed-won leads to franchisor's CRM",
		description:
			"When a franchisor moves a lead to 'Signed' in the Pipeline, Hub pushes the contact + deal to their HubSpot account.",
		icon: "crm",
		accent: "orange",
		phase: "v1.5",
		when: "Q4 2026",
		hero: "Most-asked-for integration based on franchisor survey. Solves the 'I need this in HubSpot anyway' workflow.",
		flows: [
			{
				title: "OAuth connect",
				body: "One-click OAuth with HubSpot from the Integrations page. Franchisor authorizes Hub to write contacts + deals.",
			},
			{
				title: "Auto-push on stage change",
				body: "Configurable: which stages push? Default: 'Discovery call' creates contact; 'Signed' creates deal.",
			},
		],
		dataShape: [{ name: "hubspot_connections", fields: ["org_id", "hub_account_id", "access_token", "refresh_token", "expires_at"] }],
		integrations: [{ name: "HubSpot API", role: "Contact + deal writes" }],
		crossProduct: [],
		ifpgBenefit: "First CRM integration unlocks the second and third. HubSpot is the most-asked-for from franchisor survey.",
		mockType: "form",
	},
	{
		slug: "email-integration",
		name: "Email integration",
		tagline: "Gmail + Outlook via Nylas",
		description:
			"Send and receive emails to leads from inside Hub. Uses the same Nylas API (third-party calendar + email service) that powers Direct Book, so the integration is incremental.",
		icon: "messages",
		accent: "royal",
		phase: "v1.5",
		when: "Q4 2026",
		hero: "Closes another off-platform escape — franchisors don't have to leave Hub to email a lead.",
		flows: [
			{
				title: "OAuth Gmail or Outlook",
				body: "Same Nylas flow as calendar. One-click connect.",
			},
			{
				title: "Send from lead detail",
				body: "From any lead's detail page: 'Send email' button. Uses franchisor's connected mailbox. Replies thread back to Hub.",
			},
		],
		dataShape: [{ name: "email_threads", fields: ["id", "lead_id", "nylas_thread_id", "last_message_at"] }],
		integrations: [{ name: "Nylas", role: "Email API + sync" }],
		crossProduct: [],
		ifpgBenefit: "Eliminates the 'jump to Gmail to email a lead' interruption. Keeps the workflow inside Hub.",
		mockType: "feed",
	},
	// =================== v2 ===================
	{
		slug: "unified-hub",
		name: "Unified hub for all IFPG elements",
		tagline: "One surface across the entire IFPG ecosystem",
		description:
			"v2 brings every IFPG element — member-facing surfaces, brand catalog, chapter management, events, lender network, resource library — under one cohesive product surface. The pieces that live in scattered tools today consolidate behind a single login and a single navigation model.",
		icon: "dash",
		accent: "navy",
		phase: "v2",
		when: "2027",
		hero: "v1 ships the franchisor command center. v2 absorbs the surrounding IFPG ecosystem into the same platform so members stop context-switching across tools.",
		flows: [],
		dataShape: [],
		integrations: [],
		crossProduct: [],
		ifpgBenefit:
			"Members log into one place for everything IFPG offers. Less drift to third-party tools, more touchpoints on IFPG's own platform.",
		mockType: "dash",
	},
	{
		slug: "centralized-billing",
		name: "Centralized membership and billing",
		tagline: "Memberships, invoices, and payment in one place",
		description:
			"All membership tier management and billing flows live inside the IFPG platform. Franchisors see their tier, invoice history, upcoming renewals, and payment methods in-app. IFPG operates the entire billing surface from the same super admin that already runs brand and content management.",
		icon: "billing",
		accent: "gold",
		phase: "v2",
		when: "2027",
		hero: "Replaces the separate billing tools with a single source of truth. Tier changes, dunning, and renewal nudges all happen inside the platform IFPG members already log into.",
		flows: [],
		dataShape: [],
		integrations: [],
		crossProduct: [],
		ifpgBenefit:
			"One billing surface for IFPG to operate. One place franchisors check their membership status. Sets up subscription-style upsells for higher tiers.",
		mockType: "wallet",
	},
	{
		slug: "ifpg-content-marketing",
		name: "IFPG-owned content platforms and marketing empowerment",
		tagline: "Content production and distribution as a first-class product",
		description:
			"IFPG owns the publishing channels that members rely on (magazine, newsletter, podcast, webinars, featured placements). v2 brings these channels into the platform as managed products with their own publishing tools, scheduling, audience analytics, and franchisor self-service for paid placements.",
		icon: "marketing",
		accent: "orange",
		phase: "v2",
		when: "2027",
		hero: "Marketing inventory that lives in spreadsheets today becomes a real product. Franchisors discover, reserve, and track paid placements without a single email back-and-forth.",
		flows: [],
		dataShape: [],
		integrations: [],
		crossProduct: [],
		ifpgBenefit:
			"Turns IFPG's owned channels into a self-service revenue surface. Increases inventory turnover, reduces ops cost per placement, and gives members a single catalog of marketing options.",
		mockType: "list",
	},
	{
		slug: "fdd-data-enrichment",
		name: "FDD and data enrichment",
		tagline: "Deeper brand and franchise data inside the platform",
		description:
			"Enrich the brand catalog with FDD data, unit-count history, royalty structures, and territory analytics. Powers smarter matching, better candidate qualification, and competitive context for franchisor decisions — all from inside the platform members already use.",
		icon: "data",
		accent: "green",
		phase: "v2",
		when: "2027",
		hero: "FDD and franchise-network data lifted into the platform so it's not a separate research project for franchisors or consultants.",
		flows: [],
		dataShape: [],
		integrations: [],
		crossProduct: [],
		ifpgBenefit:
			"Differentiates IFPG from generic consultant networks. Better matching from richer data, and a defensible data layer the rest of the platform compounds on.",
		mockType: "list",
	},
]

export function getModule(slug: string): Module | undefined {
	return modules.find((m) => m.slug === slug)
}

export function getModuleIndex(slug: string): number {
	return modules.findIndex((m) => m.slug === slug)
}

export function getModuleNeighbors(slug: string): {
	prev: Module | null
	next: Module | null
} {
	const i = getModuleIndex(slug)
	return {
		prev: i > 0 ? modules[i - 1] : null,
		next: i < modules.length - 1 ? modules[i + 1] : null,
	}
}

export const v1Modules = modules.filter((m) => m.phase === "v1")
export const v15Modules = modules.filter((m) => m.phase === "v1.5")
export const v2Modules = modules.filter((m) => m.phase === "v2")
