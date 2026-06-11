import { motion } from "motion/react"
import {
	Cable,
	Calendar,
	Cloud,
	Database,
	FileText,
	Globe,
	Layers,
	Lock,
	MessageSquare,
	RefreshCw,
	Server,
	Shield,
	Users,
} from "lucide-react"
import { Eyebrow, Headline, Lede, Section } from "../section"

const dbCapabilities = [
	{ icon: RefreshCw, label: "Syncs from X-Cart APIs (already running)" },
	{ icon: Shield, label: "Strong super admin (already in place)" },
	{ icon: Users, label: "Brand info + content managed here going forward" },
	{ icon: FileText, label: "Single source of truth for both products" },
]

const sharedFoundation = [
	{ icon: Layers, label: "Design tokens + UI patterns" },
	{ icon: Server, label: "Front-end stack (TanStack Start, React 19)" },
	{ icon: Database, label: "Postgres — Atlas's DB is the central DB" },
	{ icon: Globe, label: "IFPG central database (shared)" },
]

const hubExtras = [
	{ icon: Cable, label: "Go service for franchisor workflows" },
	{ icon: Lock, label: "Custom auth (session + JWT)" },
]

const vendors = [
	{ icon: Calendar, label: "Nylas: third-party API for Google + Outlook calendar and email sync" },
	{ icon: Cloud, label: "AWS S3: file and image storage" },
	{ icon: MessageSquare, label: "Stream Chat: hosted messaging primitive (presence, typing, read receipts)" },
]

export function Architecture() {
	return (
		<Section id="architecture" tone="cream">
			<Eyebrow tone="gold">Architecture</Eyebrow>
			<Headline>
				A safe, low-risk development path for{" "}
				<span className="text-[#ed8936]">Atlas and Hub</span>.
			</Headline>
			<Lede>
				Both products run on the IFPG central database that's already built and
				already syncing data from X-Cart APIs. Hub adds franchisor-facing
				surfaces on the same foundation. Atlas continues evolving in parallel.
				Same DB, same design system, same team rhythm.
			</Lede>

			<div className="mt-12 relative">
				{/* Two products row */}
				<div className="grid grid-cols-2 gap-4 md:gap-8 mb-5">
					<motion.div
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="rounded-2xl bg-white border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] p-5"
					>
						<div className="flex items-center gap-2 mb-2">
							<span className="size-2 rounded-full bg-[#3182ce] animate-pulse-subtle" />
							<span className="text-[10px] uppercase tracking-[0.14em] text-[#3182ce] font-bold">
								Final adjustments · 2-3 weeks remaining
							</span>
						</div>
						<div className="text-lg font-bold text-[#1a365d]">
							Franchise Atlas
						</div>
						<div className="text-xs text-[#718096] mt-0.5">
							Consultant + candidate workflows · current engagement
						</div>
						<div className="mt-3 text-xs text-[#4a5568] leading-relaxed">
							Wrapping the current feedback round. Powered by the IFPG
							central DB. The two engineers IFPG already approved continue
							through completion.
						</div>
					</motion.div>

					<motion.div
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="rounded-2xl bg-white border-2 border-[#ed8936] shadow-[var(--shadow-ifpg-card)] p-5 relative"
					>
						<div className="absolute -top-2.5 left-5 px-2.5 py-0.5 rounded-full bg-[#ed8936] text-white text-[10px] uppercase tracking-[0.14em] font-bold">
							Next phase · v1 by Sept 30
						</div>
						<div className="text-lg font-bold text-[#1a365d]">Hub</div>
						<div className="text-xs text-[#718096] mt-0.5">
							Franchisor-facing portal · shares Atlas's DB and design system
						</div>
						<div className="mt-3 text-xs text-[#4a5568] leading-relaxed">
							Starts as Atlas wraps. Same central DB, same shared designer,
							additional engineering assigned from Solverhood capacity.
						</div>
					</motion.div>
				</div>

				{/* IFPG central DB block (the foundation) */}
				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="rounded-2xl navy-gradient text-white p-6 md:p-8 shadow-[var(--shadow-ifpg-pop)]"
				>
					<div className="flex flex-wrap items-end justify-between gap-3 mb-5">
						<div>
							<div className="text-xs uppercase tracking-[0.16em] text-white/60 font-semibold">
								Foundation
							</div>
							<div className="text-xl font-bold mt-1">
								IFPG central database
							</div>
							<div className="text-sm text-white/75 mt-2 leading-relaxed max-w-2xl">
								Already built. Not just for Atlas, but for IFPG's longer-term
								platform. Both Atlas and Hub read from and write to this same
								database, with their own product-specific tables on top.
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
						{dbCapabilities.map((b, i) => {
							const Icon = b.icon
							return (
								<motion.div
									key={b.label}
									initial={false}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
									className="rounded-[10px] bg-white/10 backdrop-blur-sm p-3 flex items-start gap-2.5 border border-white/15"
								>
									<Icon
										className="size-4 text-[#ecc94b] shrink-0 mt-0.5"
										strokeWidth={1.75}
									/>
									<span className="text-sm font-medium leading-snug">
										{b.label}
									</span>
								</motion.div>
							)
						})}
					</div>

					<div className="text-[10px] uppercase tracking-[0.14em] text-white/50 font-semibold mb-2 pt-3 border-t border-white/10">
						During the transition
					</div>
					<div className="text-sm text-white/75 leading-relaxed">
						While the team moves brand info and content management into the
						Atlas super admin, the X-Cart sync APIs keep the legacy member
						portal in step. Nothing breaks for IFPG members during the
						handoff.
					</div>
				</motion.div>

				{/* Shared foundation strip */}
				<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="rounded-2xl bg-white border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] p-5">
						<div className="text-xs uppercase tracking-[0.14em] text-[#3182ce] font-semibold mb-3">
							Shared between Atlas and Hub
						</div>
						<ul className="space-y-2">
							{sharedFoundation.map((f) => {
								const Icon = f.icon
								return (
									<li
										key={f.label}
										className="flex items-center gap-2.5 text-sm text-[#1a365d]"
									>
										<Icon
											className="size-4 text-[#38a169] shrink-0"
											strokeWidth={1.75}
										/>
										<span>{f.label}</span>
									</li>
								)
							})}
						</ul>
					</div>
					<div className="rounded-2xl bg-white border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] p-5">
						<div className="text-xs uppercase tracking-[0.14em] text-[#ed8936] font-semibold mb-3">
							Added for Hub
						</div>
						<ul className="space-y-2">
							{hubExtras.map((f) => {
								const Icon = f.icon
								return (
									<li
										key={f.label}
										className="flex items-center gap-2.5 text-sm text-[#1a365d]"
									>
										<Icon
											className="size-4 text-[#ed8936] shrink-0"
											strokeWidth={1.75}
										/>
										<span>{f.label}</span>
									</li>
								)
							})}
						</ul>
						<div className="mt-4 pt-3 border-t border-[#edf2f7]">
							<div className="text-[10px] uppercase tracking-[0.14em] text-[#718096] font-semibold mb-2">
								Third-party services (same on both products)
							</div>
							<ul className="space-y-1.5 text-xs text-[#4a5568]">
								{vendors.map((v) => {
									const Icon = v.icon
									return (
										<li
											key={v.label}
											className="flex items-start gap-2 leading-snug"
										>
											<Icon
												className="size-3.5 text-[#718096] shrink-0 mt-0.5"
												strokeWidth={1.75}
											/>
											<span>{v.label}</span>
										</li>
									)
								})}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</Section>
	)
}
