import { Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import {
	ArrowLeft,
	ArrowRight,
	BarChart3,
	BookOpen,
	Building2,
	Calendar,
	CalendarClock,
	CalendarDays,
	Compass,
	CreditCard,
	Database,
	Filter,
	Inbox,
	LayoutDashboard,
	MapPin,
	Megaphone,
	MessageSquare,
	Plug,
	RefreshCw,
	Sparkles,
	Users,
	Wallet,
} from "lucide-react"
import { base44Url, getModuleNeighbors, type Module } from "@/lib/module-data"
import { cn } from "@/lib/utils"
import { ModuleMock } from "./module-mocks"

const iconMap = {
	dash: LayoutDashboard,
	growth: Sparkles,
	leads: Inbox,
	pipeline: Filter,
	activity: Users,
	book: CalendarClock,
	wallet: Wallet,
	messages: MessageSquare,
	chapter: MapPin,
	events: CalendarDays,
	resources: BookOpen,
	brand: Building2,
	marketing: Megaphone,
	performance: BarChart3,
	territory: Compass,
	resale: RefreshCw,
	crm: Plug,
	billing: CreditCard,
	data: Database,
} as const

const accentMap = {
	navy: { grad: "from-[#1a365d] to-[#2c5282]", text: "text-[#1a365d]", chip: "bg-[#1a365d]" },
	royal: { grad: "from-[#3182ce] to-[#4299e1]", text: "text-[#3182ce]", chip: "bg-[#3182ce]" },
	orange: { grad: "from-[#ed8936] to-[#f6ad55]", text: "text-[#ed8936]", chip: "bg-[#ed8936]" },
	green: { grad: "from-[#38a169] to-[#48bb78]", text: "text-[#38a169]", chip: "bg-[#38a169]" },
	gold: { grad: "from-[#d69e2e] to-[#ecc94b]", text: "text-[#d69e2e]", chip: "bg-[#d69e2e]" },
	purple: { grad: "from-[#6b46c1] to-[#9f7aea]", text: "text-[#6b46c1]", chip: "bg-[#6b46c1]" },
} as const

const phaseClass = {
	v1: "bg-[#bee3f8] text-[#2b6cb0]",
	"v1.5": "bg-[#feebc8] text-[#7b341e]",
	v2: "bg-[#e2e8f0] text-[#4a5568]",
} as const

export function ModulePage({ module }: { module: Module }) {
	const Icon = iconMap[module.icon]
	const accent = accentMap[module.accent]
	const { prev, next } = getModuleNeighbors(module.slug)

	return (
		<div className="min-h-screen bg-[#f7f9fc]">
			{/* Top bar */}
			<header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-[rgba(26,54,93,0.08)] h-14 flex items-center px-6">
				<Link
					to="/"
					className="flex items-center gap-2 text-sm text-[#4a5568] hover:text-[#1a365d] transition-colors"
				>
					<ArrowLeft className="size-4" />
					<span>Back to the plan</span>
				</Link>
				<div className="flex-1" />
				<Link
					to="/modules"
					className="text-sm text-[#3182ce] hover:underline"
				>
					All modules
				</Link>
			</header>

			{/* Hero */}
			<section className={cn("relative overflow-hidden", "bg-gradient-to-br", accent.grad)}>
				<div className="absolute inset-0 opacity-[0.06] pointer-events-none">
					<div
						className="absolute inset-0"
						style={{
							backgroundImage:
								"linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
							backgroundSize: "44px 44px",
						}}
					/>
				</div>
				<div className="max-w-5xl mx-auto px-6 lg:px-8 py-16 md:py-20 relative">
					<div className="flex items-center gap-3 mb-5">
						<div className="size-14 rounded-2xl bg-white/15 backdrop-blur-sm grid place-items-center text-white border border-white/20">
							<Icon className="size-7" strokeWidth={1.5} />
						</div>
						<div className="flex flex-col gap-1.5">
							<span
								className={cn(
									"inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.14em] font-bold w-fit",
									phaseClass[module.phase],
								)}
							>
								{module.phase} · {module.when}
							</span>
							<div className="text-[10px] uppercase tracking-[0.16em] text-white/60 font-semibold">
								IFPG Hub · Module
							</div>
						</div>
					</div>

					<motion.h1
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.95] tracking-tight text-white"
					>
						{module.name}
					</motion.h1>
					<motion.p
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="mt-3 text-[clamp(1.1rem,2vw,1.5rem)] font-light text-white/80 leading-snug max-w-3xl"
					>
						{module.tagline}
					</motion.p>
					<motion.p
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="mt-5 text-base text-white/75 leading-relaxed max-w-3xl"
					>
						{module.description}
					</motion.p>
				</div>
			</section>

			{/* Hero callout + mock side-by-side */}
			<section className="max-w-5xl mx-auto px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8 items-center">
				<div className="border-l-4 border-[#ed8936] pl-5 py-2">
					<div className="text-xs uppercase tracking-[0.14em] text-[#3182ce] font-semibold mb-2">
						Why this matters
					</div>
					<p className="text-lg md:text-xl text-[#1a365d] font-medium leading-snug">
						{module.hero}
					</p>
				</div>
				<div>
					<div className="text-xs uppercase tracking-[0.14em] text-[#718096] font-semibold mb-2 flex items-center justify-between gap-2">
						<span>Concept mockup · not connected to live data</span>
						{module.base44Page && (
							<a
								href={`${base44Url}/${module.base44Page.replace(/\s+/g, "")}`}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 text-[#3182ce] hover:underline normal-case tracking-normal"
							>
								Compare to your prototype
								<ArrowRight className="size-3" />
							</a>
						)}
					</div>
					<ModuleMock type={module.mockType} accent={module.accent} />
					{module.base44Page && (
						<div className="mt-3 rounded-lg bg-[#ebf8ff] border border-[#bee3f8] p-3 text-xs text-[#2b6cb0] leading-relaxed">
							<strong className="font-semibold text-[#1a365d]">
								Concept lineage:
							</strong>{" "}
							This module realizes the{" "}
							<a
								href={`${base44Url}/${module.base44Page.replace(/\s+/g, "")}`}
								target="_blank"
								rel="noopener noreferrer"
								className="font-semibold underline hover:no-underline"
							>
								"{module.base44Page}"
							</a>{" "}
							surface from your base44 prototype, ported to Hub's Go +
							TanStack stack with the data shape and integration points
							below.
						</div>
					)}
				</div>
			</section>

			{/* Body grid */}
			<section className="max-w-5xl mx-auto px-6 lg:px-8 pb-16 space-y-10">
				{/* Flows */}
				{module.flows.length > 0 && (
					<div>
						<SectionHeader eyebrow="Key flows" title="How a franchisor uses it" />
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
							{module.flows.map((flow, i) => (
								<motion.div
									key={flow.title}
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4, delay: i * 0.05 }}
									className="rounded-xl bg-white border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] p-5"
								>
									<div className="flex items-start gap-3">
										<div
											className={cn(
												"size-7 rounded-full grid place-items-center text-white font-bold text-xs shrink-0",
												accent.chip,
											)}
										>
											{i + 1}
										</div>
										<div>
											<h3 className="font-semibold text-[#1a365d]">
												{flow.title}
											</h3>
											<p className="text-sm text-[#4a5568] mt-1.5 leading-relaxed">
												{flow.body}
											</p>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					</div>
				)}

				{/* Data shape + Integrations grid */}
				{(module.dataShape.length > 0 || module.integrations.length > 0) && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{module.dataShape.length > 0 && (
							<div>
								<SectionHeader eyebrow="Data shape" title="What lives in Hub's Postgres" />
								<div className="mt-6 rounded-xl bg-white border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] p-5 space-y-4">
									{module.dataShape.map((entity) => (
										<div key={entity.name} className="font-mono text-xs">
											<div className={cn("font-bold text-sm font-sans", accent.text)}>
												{entity.name}
											</div>
											<ul className="mt-1.5 space-y-0.5 text-[#4a5568] pl-4">
												{entity.fields.map((f) => (
													<li key={f} className="leading-snug">
														· {f}
													</li>
												))}
											</ul>
										</div>
									))}
								</div>
							</div>
						)}

						{module.integrations.length > 0 && (
							<div>
								<SectionHeader eyebrow="Integration points" title="What it talks to" />
								<div className="mt-6 rounded-xl bg-white border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] p-5 space-y-3">
									{module.integrations.map((it) => (
										<div
											key={it.name}
											className="flex items-start gap-3 pb-3 border-b border-[#edf2f7] last:border-0 last:pb-0"
										>
											<div
												className={cn(
													"size-2.5 rounded-full mt-1.5 shrink-0",
													accent.chip,
												)}
											/>
											<div>
												<div className="font-semibold text-[#1a365d] text-sm">
													{it.name}
												</div>
												<div className="text-xs text-[#4a5568] mt-0.5 leading-relaxed">
													{it.role}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Cross-product */}
				{module.crossProduct.length > 0 && (
					<div>
						<SectionHeader
							eyebrow="Cross-product"
							title="How it shows up in Navigator"
						/>
						<div className="mt-6 space-y-3">
							{module.crossProduct.map((cp, i) => (
								<motion.div
									key={i}
									initial={false}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.4, delay: i * 0.05 }}
									className="rounded-xl bg-gradient-to-br from-[#ebf8ff] to-[#f0f4ff] border border-[#bee3f8] p-5"
								>
									<div className="flex flex-col md:flex-row md:items-center gap-3">
										<div className="flex-1">
											<div className="text-[10px] uppercase tracking-[0.14em] text-[#3182ce] font-bold mb-1">
												When
											</div>
											<div className="text-sm text-[#1a365d] font-medium">
												{cp.trigger}
											</div>
										</div>
										<ArrowRight className="size-5 text-[#3182ce] shrink-0 hidden md:block" />
										<div className="flex-1">
											<div className="text-[10px] uppercase tracking-[0.14em] text-[#ed8936] font-bold mb-1">
												Then
											</div>
											<div className="text-sm text-[#1a365d] font-medium">
												{cp.effect}
											</div>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					</div>
				)}

				{/* IFPG benefit */}
				<div>
					<SectionHeader
						eyebrow="Why IFPG cares"
						title="What this unlocks for the business"
					/>
					<div className="mt-6 rounded-2xl navy-gradient text-white p-6 md:p-7 shadow-[var(--shadow-ifpg-pop)]">
						<p className="text-base md:text-lg leading-relaxed">
							{module.ifpgBenefit}
						</p>
					</div>
				</div>
			</section>

			{/* Prev / Next */}
			<nav className="max-w-5xl mx-auto px-6 lg:px-8 pb-20">
				<div className="grid grid-cols-2 gap-4">
					{prev ? (
						<Link
							to="/module/$slug"
							params={{ slug: prev.slug }}
							className="group rounded-xl bg-white border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] p-5 hover-lift flex items-center gap-3"
						>
							<ArrowLeft className="size-5 text-[#a0aec0] group-hover:text-[#1a365d] transition-colors shrink-0" />
							<div className="min-w-0">
								<div className="text-[10px] uppercase tracking-[0.14em] text-[#718096] font-semibold">
									Previous
								</div>
								<div className="font-semibold text-[#1a365d] truncate">
									{prev.name}
								</div>
							</div>
						</Link>
					) : (
						<div />
					)}
					{next ? (
						<Link
							to="/module/$slug"
							params={{ slug: next.slug }}
							className="group rounded-xl bg-white border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] p-5 hover-lift flex items-center justify-end gap-3 text-right"
						>
							<div className="min-w-0">
								<div className="text-[10px] uppercase tracking-[0.14em] text-[#718096] font-semibold">
									Next
								</div>
								<div className="font-semibold text-[#1a365d] truncate">
									{next.name}
								</div>
							</div>
							<ArrowRight className="size-5 text-[#a0aec0] group-hover:text-[#1a365d] transition-colors shrink-0" />
						</Link>
					) : (
						<div />
					)}
				</div>
			</nav>
		</div>
	)
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
	return (
		<div>
			<div className="text-xs uppercase tracking-[0.16em] text-[#3182ce] font-semibold">
				{eyebrow}
			</div>
			<h2 className="text-2xl md:text-3xl font-bold text-[#1a365d] tracking-tight mt-1">
				{title}
			</h2>
		</div>
	)
}
