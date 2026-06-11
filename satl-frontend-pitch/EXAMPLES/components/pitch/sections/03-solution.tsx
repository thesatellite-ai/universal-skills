import { Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import {
	BarChart3,
	BookOpen,
	Building2,
	CalendarClock,
	Filter,
	Inbox,
	LayoutDashboard,
	MapPin,
	MessageSquare,
	Sparkles,
	Users,
	Wallet,
} from "lucide-react"
import { Eyebrow, Headline, Lede, Section } from "../section"

const surfaces = [
	{ slug: "the-dash", icon: LayoutDashboard, label: "The Dash", caption: "Morning command center" },
	{ slug: "growth-opportunities", icon: Sparkles, label: "Growth Opportunities", caption: "Ranked next-best actions" },
	{ slug: "lead-feed", icon: Inbox, label: "Lead Feed", caption: "Consultant-vetted candidates" },
	{ slug: "candidate-pipeline", icon: Filter, label: "Candidate Pipeline", caption: "Funnel view, drag to advance" },
	{ slug: "consultant-activity", icon: Users, label: "Consultant Activity", caption: "Who's working your brand" },
	{ slug: "direct-book", icon: CalendarClock, label: "Direct Book", caption: "Credit-capped, calendar-synced" },
	{ slug: "points-wallet", icon: Wallet, label: "Points & Wallet", caption: "Spend on growth, not gifts" },
	{ slug: "messages", icon: MessageSquare, label: "Messages", caption: "Direct line to consultants" },
	{ slug: "my-local-chapter", icon: MapPin, label: "My Local Chapter", caption: "Regional network" },
	{ slug: "resources", icon: BookOpen, label: "Resources", caption: "IFPG-curated docs" },
	{ slug: "brand-profile", icon: Building2, label: "Brand Profile", caption: "Self-service brand metadata" },
]

export function Solution() {
	return (
		<Section id="solution">
			<Eyebrow>Hub surfaces</Eyebrow>
			<Headline>
				11 v1 modules,{" "}
				<span className="text-[#ed8936]">one franchisor-facing app</span>.
			</Headline>
			<Lede>
				Hub is a franchisor-facing application built on the IFPG central database.
				It exposes 11 modules in v1 covering lead pipeline, consultant bookings,
				points wallet, messaging, brand profile, resources, and chapter info.
				Each module reads from (and writes to) the same central DB that Atlas
				uses, with Hub-specific tables added for franchisor workflows. Click any
				tile to see flows, data shape, integration points, and the relationship
				to the original base44 prototype.
			</Lede>

			<div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
				{surfaces.map((s, i) => {
					const Icon = s.icon
					return (
						<motion.div
							key={s.label}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.05 + i * 0.03 }}
						>
							<Link
								to="/module/$slug"
								params={{ slug: s.slug }}
								className="group block rounded-xl bg-white border border-[rgba(26,54,93,0.08)] p-4 shadow-[var(--shadow-ifpg-card)] hover-lift h-full"
							>
								<div className="size-9 rounded-[10px] bg-gradient-to-br from-[#3182ce] to-[#4299e1] grid place-items-center text-white">
									<Icon className="size-4" strokeWidth={1.75} />
								</div>
								<div className="mt-3 text-sm font-semibold text-[#1a365d] leading-tight">
									{s.label}
								</div>
								<div className="mt-1 text-[11px] text-[#718096] leading-snug">
									{s.caption}
								</div>
								<div className="mt-3 pt-2 border-t border-[#edf2f7] flex items-center justify-between text-[10px]">
									<span className="text-[#a0aec0] uppercase tracking-wider font-semibold">
										v1
									</span>
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

			<div className="mt-10 flex flex-wrap items-center justify-between gap-3 text-sm text-[#4a5568]">
				<div>
					<span className="font-semibold text-[#1a365d]">11 surfaces in v1.</span>{" "}
					4 more in v1.5. 4 more in v2.
				</div>
				<Link
					to="/modules"
					className="inline-flex items-center gap-1.5 text-[#3182ce] hover:text-[#1a365d] font-medium transition-colors"
				>
					See all 19 modules
					<ArrowRight className="size-4" />
				</Link>
			</div>
		</Section>
	)
}
