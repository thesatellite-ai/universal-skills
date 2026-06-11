import { createFileRoute, Link } from "@tanstack/react-router"
import { AnimatePresence, motion } from "motion/react"
import {
	ArrowLeft,
	ArrowRight,
	CalendarClock,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Pause,
	Play,
	UserPlus,
	Wallet,
} from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type Step = { label: string; body: string }

type Scenario = {
	id: string
	icon: typeof UserPlus
	number: string
	title: string
	subtitle: string
	hubSteps: Step[]
	navigatorSteps: Step[]
	dataExchanged: string
	flowAnimation: { from: "hub" | "nav"; to: "hub" | "nav"; label: string }[]
}

const scenarios: Scenario[] = [
	{
		id: "lead",
		number: "01",
		icon: UserPlus,
		title: "A consultant assigns a lead",
		subtitle: "Navigator action → Hub surface in under 60 seconds",
		flowAnimation: [
			{ from: "nav", to: "hub", label: "lead.created" },
			{ from: "hub", to: "nav", label: "ack" },
		],
		hubSteps: [
			{ label: "Lead Feed", body: "New lead appears at top with 'New' badge and a sparkle." },
			{ label: "The Dash", body: "Action card surfaces: '3 new leads from MN region · review now'" },
			{ label: "Growth Opportunities", body: "Hot-lead opportunity tile created if the lead's score is high enough." },
			{ label: "Notification badge", body: "Top-bar bell ticks up to (1). Email sent if franchisor opted in." },
		],
		navigatorSteps: [
			{ label: "Brand assignment", body: "Consultant uses Navigator's existing assignment UI." },
			{ label: "Note + financial profile", body: "Consultant attaches qualification notes the franchisor will see." },
			{ label: "Notification: 'sent to brand'", body: "Consultant sees a confirmation that the lead landed in Hub." },
		],
		dataExchanged:
			"Lead reference + financial profile + consultant note. Hub stores its own row keyed by the IFPG lead_id. Stage = 'new'.",
	},
	{
		id: "booking",
		number: "02",
		icon: CalendarClock,
		title: "A franchisor books a consultant call",
		subtitle: "Both apps reflect the booking instantly via Nylas",
		flowAnimation: [
			{ from: "hub", to: "nav", label: "booking.requested" },
			{ from: "nav", to: "hub", label: "calendar.confirmed" },
			{ from: "hub", to: "nav", label: "credit.consumed" },
		],
		hubSteps: [
			{ label: "Direct Book modal", body: "Franchisor picks Wed 10:00, confirms 1 credit cost, clicks Confirm." },
			{ label: "Wallet balance", body: "1 booking credit deducted instantly (separate from points)." },
			{ label: "Dash calendar strip", body: "Wednesday's row gets a new entry with consultant + topic." },
			{ label: "Confirmation toast", body: "Booking confirmed — calendar invite sent to both calendars." },
		],
		navigatorSteps: [
			{ label: "Nylas creates event", body: "Google or Outlook event appears on the consultant's calendar immediately." },
			{ label: "In-app notification", body: "Navigator shows 'New booking from Pizzaboli's' in inbox." },
			{ label: "Availability adjusted", body: "That slot is no longer offered to other franchisors browsing Hub." },
		],
		dataExchanged:
			"Booking row in Hub Postgres + Nylas event ID. Navigator subscribes to Hub's booking-created webhook for in-app notifications.",
	},
	{
		id: "deal",
		number: "03",
		icon: CheckCircle2,
		title: "A deal closes",
		subtitle: "Pipeline stage change drives both products simultaneously",
		flowAnimation: [
			{ from: "hub", to: "nav", label: "lead.signed" },
			{ from: "nav", to: "hub", label: "commission.calc" },
			{ from: "hub", to: "nav", label: "metrics.updated" },
		],
		hubSteps: [
			{ label: "Pipeline → Signed", body: "Franchisor drags the lead into the Signed column on the Pipeline board." },
			{ label: "Performance KPI", body: "Conversion rate recalculates; dashboard tile ticks up." },
			{ label: "Milestone bonus", body: "Optional: points credit fires for hitting a placement milestone (configurable)." },
		],
		navigatorSteps: [
			{ label: "userBrand.signedAmount", body: "Navigator's userBrand record updates with the deal value." },
			{ label: "Commission calc", body: "Consultant commission fires per Navigator's existing logic." },
			{ label: "Activity feed", body: "Closed deal logged in Navigator for visibility to other consultants." },
		],
		dataExchanged:
			"Signed flag + deal value. Hub's lead stage update calls a Navigator HTTP endpoint to trigger the commission flow.",
	},
	{
		id: "points",
		number: "04",
		icon: Wallet,
		title: "A magazine cover purchase is denied",
		subtitle: "Points held → IFPG decides → auto-refund",
		flowAnimation: [
			{ from: "hub", to: "nav", label: "purchase.pending" },
			{ from: "nav", to: "hub", label: "purchase.denied" },
			{ from: "hub", to: "hub", label: "points.refunded" },
		],
		hubSteps: [
			{ label: "Catalog click", body: "Franchisor clicks Magazine Cover (Front), 500 pts. Modal confirms approval requirement." },
			{ label: "Points held", body: "Wallet shows 'Pending approval — 500 pts held'. Ledger entry created with status: pending." },
			{ label: "Auto-refund on deny", body: "When IFPG denies, points return immediately + denial reason logged + email sent." },
			{ label: "Final state", body: "Ledger shows two rows: -500 (denied) + +500 (refund). Balance net zero. Forever-auditable." },
		],
		navigatorSteps: [
			{ label: "IFPG admin queue", body: "Super-admin sees the pending request in their approvals queue (lives in Hub's admin panel, not Navigator)." },
			{ label: "One-click decide", body: "Approve or Deny + reason. Decision fires the auto-refund logic if denied." },
		],
		dataExchanged:
			"Purchase row goes from pending → denied. Triggers an idempotent refund event. Both rows visible to franchisor + IFPG forever.",
	},
]

export const Route = createFileRoute("/scenarios")({ component: ScenariosPage })

function ScenariosPage() {
	const [activeIdx, setActiveIdx] = useState(0)
	const [playing, setPlaying] = useState(true)

	const active = scenarios[activeIdx]

	useEffect(() => {
		if (!playing) return
		const t = setTimeout(() => {
			setActiveIdx((i) => (i + 1) % scenarios.length)
		}, 9000)
		return () => clearTimeout(t)
	}, [playing, activeIdx])

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") {
				setActiveIdx((i) => (i + 1) % scenarios.length)
			} else if (e.key === "ArrowLeft") {
				setActiveIdx((i) => (i - 1 + scenarios.length) % scenarios.length)
			} else if (e.key === " ") {
				e.preventDefault()
				setPlaying((p) => !p)
			}
		}
		window.addEventListener("keydown", handler)
		return () => window.removeEventListener("keydown", handler)
	}, [])

	const ActiveIcon = active.icon

	return (
		<div className="min-h-screen bg-[#0d1b2f] text-white relative overflow-hidden">
			{/* Background glow */}
			<div className="absolute -top-40 -right-40 size-[600px] rounded-full bg-[#3182ce]/20 blur-[120px] pointer-events-none" />
			<div className="absolute -bottom-40 -left-40 size-[600px] rounded-full bg-[#ed8936]/15 blur-[120px] pointer-events-none" />

			{/* Top bar */}
			<header className="relative z-10 backdrop-blur-md bg-white/5 border-b border-white/10 h-14 flex items-center px-6">
				<Link
					to="/"
					className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
				>
					<ArrowLeft className="size-4" />
					<span>Back to the plan</span>
				</Link>
				<div className="flex-1" />
				<button
					type="button"
					onClick={() => setPlaying((p) => !p)}
					className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mr-6"
				>
					{playing ? <Pause className="size-4" /> : <Play className="size-4" />}
					<span className="hidden md:inline">
						{playing ? "Pause" : "Play"} auto-advance
					</span>
				</button>
				<div className="text-xs text-white/40 font-mono">
					<span className="text-white font-semibold">{active.number}</span>
					<span> / 0{scenarios.length}</span>
				</div>
			</header>

			<main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-10 md:py-14">
				{/* Header */}
				<AnimatePresence mode="wait">
					<motion.div
						key={active.id}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -12 }}
						transition={{ duration: 0.4 }}
					>
						<div className="flex items-center gap-3 mb-5">
							<div className="size-12 rounded-2xl bg-white/10 backdrop-blur-sm grid place-items-center border border-white/15">
								<ActiveIcon className="size-6 text-[#ecc94b]" strokeWidth={1.5} />
							</div>
							<div className="text-xs uppercase tracking-[0.18em] text-white/50 font-semibold">
								Scenario {active.number} · Hub × Navigator
							</div>
						</div>
						<h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[0.95] tracking-tight">
							{active.title}
						</h1>
						<p className="mt-3 text-[clamp(1rem,1.5vw,1.25rem)] text-white/70 leading-snug max-w-3xl">
							{active.subtitle}
						</p>
					</motion.div>
				</AnimatePresence>

				{/* Split screen */}
				<AnimatePresence mode="wait">
					<motion.div
						key={`${active.id}-split`}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -16 }}
						transition={{ duration: 0.4, delay: 0.1 }}
						className="mt-10 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-stretch"
					>
						{/* Hub side */}
						<div className="rounded-2xl bg-gradient-to-br from-[#ed8936]/20 to-[#ed8936]/5 border border-[#ed8936]/30 p-6 backdrop-blur-sm">
							<div className="flex items-center gap-2 mb-4">
								<span className="size-2.5 rounded-full bg-[#ed8936] animate-pulse-subtle" />
								<span className="text-[10px] uppercase tracking-[0.18em] text-[#fbd38d] font-bold">
									Hub · Franchisor
								</span>
							</div>
							<ul className="space-y-4">
								{active.hubSteps.map((s, i) => (
									<motion.li
										key={s.label}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
										className="flex gap-3"
									>
										<div className="size-6 rounded-full bg-[#ed8936]/30 text-[#ecc94b] grid place-items-center text-[10px] font-bold shrink-0">
											{i + 1}
										</div>
										<div>
											<div className="font-semibold text-white">{s.label}</div>
											<div className="text-xs text-white/65 mt-0.5 leading-relaxed">
												{s.body}
											</div>
										</div>
									</motion.li>
								))}
							</ul>
						</div>

						{/* Flow indicator (center) */}
						<div className="hidden md:flex items-center justify-center min-h-[200px]">
							<div className="flex flex-col items-center gap-3 py-8">
								{active.flowAnimation.map((a, i) => (
									<motion.div
										key={i}
										initial={false}
										animate={{ opacity: 1 }}
										transition={{ duration: 0.3, delay: 0.4 + i * 0.3 }}
										className="flex items-center gap-2 text-[10px] font-mono text-white/60"
									>
										{a.from === "hub" && <span className="size-1.5 rounded-full bg-[#ed8936]" />}
										{a.from === "nav" && (
											<ArrowLeft className="size-3 text-[#3182ce]" />
										)}
										{a.from === a.to ? (
											<span className="text-[#ecc94b]">↻</span>
										) : a.from === "hub" ? (
											<ArrowRight className="size-3 text-[#ed8936]" />
										) : null}
										<span className="text-white/80">{a.label}</span>
										{a.to === "nav" && a.from === "hub" && (
											<span className="size-1.5 rounded-full bg-[#3182ce]" />
										)}
										{a.from === "nav" && (
											<span className="size-1.5 rounded-full bg-[#ed8936]" />
										)}
									</motion.div>
								))}
							</div>
						</div>

						{/* Navigator side */}
						<div className="rounded-2xl bg-gradient-to-br from-[#3182ce]/20 to-[#3182ce]/5 border border-[#3182ce]/30 p-6 backdrop-blur-sm">
							<div className="flex items-center gap-2 mb-4">
								<span className="size-2.5 rounded-full bg-[#3182ce] animate-pulse-subtle" />
								<span className="text-[10px] uppercase tracking-[0.18em] text-[#bee3f8] font-bold">
									Navigator · Consultant
								</span>
							</div>
							<ul className="space-y-4">
								{active.navigatorSteps.map((s, i) => (
									<motion.li
										key={s.label}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
										className="flex gap-3"
									>
										<div className="size-6 rounded-full bg-[#3182ce]/30 text-[#bee3f8] grid place-items-center text-[10px] font-bold shrink-0">
											{i + 1}
										</div>
										<div>
											<div className="font-semibold text-white">{s.label}</div>
											<div className="text-xs text-white/65 mt-0.5 leading-relaxed">
												{s.body}
											</div>
										</div>
									</motion.li>
								))}
							</ul>
						</div>
					</motion.div>
				</AnimatePresence>

				{/* Data exchanged callout */}
				<AnimatePresence mode="wait">
					<motion.div
						key={`${active.id}-data`}
						initial={false}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3, delay: 0.4 }}
						className="mt-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 flex items-start gap-3"
					>
						<span className="text-[10px] uppercase tracking-[0.18em] text-[#ecc94b] font-bold shrink-0 mt-1">
							Wire
						</span>
						<p className="text-sm text-white/85 leading-relaxed">
							{active.dataExchanged}
						</p>
					</motion.div>
				</AnimatePresence>

				{/* Scenario tabs / progress */}
				<div className="mt-12 flex flex-col gap-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
						{scenarios.map((s, i) => {
							const isActive = i === activeIdx
							return (
								<button
									type="button"
									key={s.id}
									onClick={() => {
										setActiveIdx(i)
										setPlaying(false)
									}}
									className={cn(
										"text-left p-3 rounded-xl border transition-all",
										isActive
											? "bg-white/10 border-white/30 -translate-y-0.5"
											: "bg-white/[0.02] border-white/10 hover:bg-white/[0.05]",
									)}
								>
									<div className="text-[10px] uppercase tracking-wider text-white/40 font-mono mb-1">
										{s.number}
									</div>
									<div
										className={cn(
											"text-xs font-medium leading-snug",
											isActive ? "text-white" : "text-white/65",
										)}
									>
										{s.title}
									</div>
								</button>
							)
						})}
					</div>

					{/* Auto-play progress bar */}
					{playing && (
						<motion.div
							key={`progress-${activeIdx}`}
							initial={{ scaleX: 0 }}
							animate={{ scaleX: 1 }}
							transition={{ duration: 9, ease: "linear" }}
							className="h-0.5 bg-[#ecc94b] origin-left rounded-full"
						/>
					)}
				</div>

				{/* Prev / Next */}
				<div className="mt-8 flex items-center justify-between text-sm">
					<button
						type="button"
						onClick={() => {
							setActiveIdx((i) => (i - 1 + scenarios.length) % scenarios.length)
							setPlaying(false)
						}}
						className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
					>
						<ChevronLeft className="size-4" />
						Previous
					</button>
					<div className="text-xs text-white/40">
						<kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 font-mono text-[10px]">
							←
						</kbd>
						<kbd className="ml-1 px-1.5 py-0.5 rounded bg-white/10 border border-white/15 font-mono text-[10px]">
							→
						</kbd>{" "}
						navigate ·{" "}
						<kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 font-mono text-[10px]">
							space
						</kbd>{" "}
						play/pause
					</div>
					<button
						type="button"
						onClick={() => {
							setActiveIdx((i) => (i + 1) % scenarios.length)
							setPlaying(false)
						}}
						className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
					>
						Next
						<ChevronRight className="size-4" />
					</button>
				</div>
			</main>
		</div>
	)
}
