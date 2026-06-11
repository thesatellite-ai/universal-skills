import { createFileRoute, Link } from "@tanstack/react-router"
import {
	ArrowLeft,
	ArrowRight,
	BarChart3,
	BookOpen,
	Building2,
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
import { motion } from "motion/react"
import {
	type IconKey,
	type Module,
	v1Modules,
	v15Modules,
	v2Modules,
} from "@/lib/module-data"
import { cn } from "@/lib/utils"

const iconMap: Record<IconKey, typeof Sparkles> = {
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
}

const accentGrad: Record<Module["accent"], string> = {
	navy: "from-[#1a365d] to-[#2c5282]",
	royal: "from-[#3182ce] to-[#4299e1]",
	orange: "from-[#ed8936] to-[#f6ad55]",
	green: "from-[#38a169] to-[#48bb78]",
	gold: "from-[#d69e2e] to-[#ecc94b]",
	purple: "from-[#6b46c1] to-[#9f7aea]",
}

export const Route = createFileRoute("/modules")({ component: ModulesIndex })

function ModulesIndex() {
	return (
		<div className="min-h-screen bg-[#f7f9fc]">
			<header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-[rgba(26,54,93,0.08)] h-14 flex items-center px-6">
				<Link
					to="/"
					className="flex items-center gap-2 text-sm text-[#4a5568] hover:text-[#1a365d] transition-colors"
				>
					<ArrowLeft className="size-4" />
					<span>Back to the plan</span>
				</Link>
				<div className="flex-1" />
				<div className="text-xs text-[#718096]">
					{v1Modules.length + v15Modules.length + v2Modules.length} modules total
				</div>
			</header>

			<section className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
				<div className="text-xs uppercase tracking-[0.18em] text-[#3182ce] font-semibold mb-3">
					Module catalog
				</div>
				<h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-tight text-[#1a365d]">
					Every surface in IFPG Hub, in one place.
				</h1>
				<p className="text-lg text-[#4a5568] mt-4 max-w-2xl leading-relaxed">
					Click any module for the deep dive — flows, data shape, integration
					points, cross-product behavior, and the IFPG-business framing.
				</p>
			</section>

			<PhaseGroup label="v1" when="Sept 30, 2026" tone="blue" modules={v1Modules} />
			<PhaseGroup
				label="v1.5"
				when="Q4 2026"
				tone="orange"
				modules={v15Modules}
			/>
			<PhaseGroup label="v2" when="2027" tone="neutral" modules={v2Modules} />

			<div className="h-16" />
		</div>
	)
}

function PhaseGroup({
	label,
	when,
	tone,
	modules,
}: {
	label: string
	when: string
	tone: "blue" | "orange" | "neutral"
	modules: Module[]
}) {
	const headerTone =
		tone === "blue"
			? "bg-[#bee3f8] text-[#2b6cb0]"
			: tone === "orange"
				? "bg-[#feebc8] text-[#7b341e]"
				: "bg-[#e2e8f0] text-[#4a5568]"
	return (
		<section className="max-w-6xl mx-auto px-6 lg:px-8 pb-12">
			<div className="flex items-center gap-3 mb-5">
				<span
					className={cn(
						"inline-flex items-center px-3 py-1 rounded-full text-xs uppercase tracking-[0.14em] font-bold",
						headerTone,
					)}
				>
					{label}
				</span>
				<span className="text-sm text-[#718096]">{when}</span>
				<div className="flex-1 h-px bg-[#e2e8f0] ml-3" />
				<span className="text-xs text-[#a0aec0]">{modules.length} modules</span>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{modules.map((m, i) => {
					const Icon = iconMap[m.icon]
					return (
						<motion.div
							key={m.slug}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: i * 0.04 }}
						>
							<Link
								to="/module/$slug"
								params={{ slug: m.slug }}
								className="group block rounded-xl bg-white border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] p-5 hover-lift h-full"
							>
								<div
									className={cn(
										"size-10 rounded-[10px] grid place-items-center text-white bg-gradient-to-br",
										accentGrad[m.accent],
									)}
								>
									<Icon className="size-5" strokeWidth={1.75} />
								</div>
								<div className="mt-4 font-bold text-[#1a365d] leading-tight">
									{m.name}
								</div>
								<p className="text-xs text-[#718096] mt-1 leading-snug line-clamp-2">
									{m.tagline}
								</p>
								<div className="mt-4 pt-3 border-t border-[#edf2f7] flex items-center justify-between text-xs">
									<span className="text-[#a0aec0]">{m.when}</span>
									<span className="flex items-center gap-1 text-[#3182ce] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
										Open
										<ArrowRight className="size-3" />
									</span>
								</div>
							</Link>
						</motion.div>
					)
				})}
			</div>
		</section>
	)
}
