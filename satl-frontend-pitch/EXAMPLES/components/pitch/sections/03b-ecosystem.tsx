"use client"

import { motion } from "motion/react"
import {
	ArrowRight,
	CalendarClock,
	CheckCircle2,
	MessageSquare,
	UserPlus,
} from "lucide-react"
import { useState } from "react"
import { Eyebrow, Headline, Lede, Section } from "../section"
import { cn } from "@/lib/utils"

type Scenario = {
	id: string
	icon: typeof UserPlus
	title: string
	subtitle: string
	hubSide: { label: string; body: string }[]
	atlasSide: { label: string; body: string }[]
	dataExchanged: string
}

const scenarios: Scenario[] = [
	{
		id: "lead",
		icon: UserPlus,
		title: "A consultant assigns a lead",
		subtitle: "Atlas action surfaces in Hub via the central DB",
		hubSide: [
			{ label: "Lead Feed", body: "New lead appears at top with a 'New' badge" },
			{
				label: "The Dash",
				body: "Action card surfaces: '3 new leads from MN region'",
			},
			{
				label: "Growth Opportunities",
				body: "Hot-lead opportunity tile created if score is high enough",
			},
		],
		atlasSide: [
			{
				label: "Brand assignment",
				body: "Consultant uses Atlas's existing assignment UI",
			},
			{
				label: "Note + financial profile",
				body: "Consultant attaches their qualification notes",
			},
		],
		dataExchanged:
			"Lead row in the IFPG central DB. Hub reads it through the same Postgres connection Atlas writes to.",
	},
	{
		id: "booking",
		icon: CalendarClock,
		title: "A franchisor books a consultant call",
		subtitle: "Both apps stay in step through the central DB and Nylas",
		hubSide: [
			{
				label: "Direct Book",
				body: "Franchisor picks a slot, modal confirms credit cost, click to book",
			},
			{
				label: "Wallet",
				body: "1 booking credit deducted (separate from points)",
			},
			{
				label: "The Dash",
				body: "Booking appears on this week's calendar strip",
			},
		],
		atlasSide: [
			{
				label: "Calendar event",
				body: "Nylas creates the event on the consultant's Google or Outlook calendar",
			},
			{
				label: "Atlas notification",
				body: "Consultant sees 'New booking from Pizzaboli's' in Atlas inbox",
			},
			{
				label: "Availability adjusted",
				body: "Slot no longer offered to other franchisors",
			},
		],
		dataExchanged:
			"Booking row in the central DB + Nylas event ID. Atlas reads the booking from the same DB.",
	},
	{
		id: "deal",
		icon: CheckCircle2,
		title: "A deal closes",
		subtitle: "Pipeline stage change drives both products at once",
		hubSide: [
			{
				label: "Candidate Pipeline",
				body: "Franchisor drags lead into the 'Signed' column",
			},
			{
				label: "Performance",
				body: "KPI tile increments, conversion rate recalculates",
			},
			{
				label: "Wallet",
				body: "Optional milestone bonus points credited",
			},
		],
		atlasSide: [
			{
				label: "Signed amount recorded",
				body: "Atlas updates the deal record with the value",
			},
			{
				label: "Consultant commission",
				body: "Commission calc fires per Atlas's existing logic",
			},
			{
				label: "Atlas activity feed",
				body: "Closed deal logged for visibility to other consultants",
			},
		],
		dataExchanged:
			"Signed flag + deal value live in the same central DB row. Both products read the same field; no duplication.",
	},
]

export function Ecosystem() {
	const [active, setActive] = useState<string>(scenarios[0].id)
	const current = scenarios.find((s) => s.id === active) ?? scenarios[0]
	const CurrentIcon = current.icon

	return (
		<Section id="ecosystem" tone="cream">
			<Eyebrow tone="gold">Hub + Atlas</Eyebrow>
			<Headline>
				Two surfaces,{" "}
				<span className="text-[#ed8936]">one IFPG central database</span>.
			</Headline>
			<Lede>
				Franchisors live in Hub. Consultants live in Atlas. Both read from and
				write to the same IFPG central database, so changes show up in real time
				without sync jobs or duplicated data. Same design system on both. Same
				shared designer keeping them visually aligned.
			</Lede>

			{/* Data-flow diagram */}
			<div className="mt-10 relative rounded-2xl bg-white border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] p-6 md:p-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
					{/* Hub (left) */}
					<motion.div
						initial={false}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						className="rounded-xl bg-gradient-to-br from-[#ed8936] to-[#f6ad55] text-white p-5"
					>
						<div className="text-[10px] uppercase tracking-[0.14em] text-white/70 font-bold mb-1">
							Hub
						</div>
						<div className="text-xl font-bold">Franchisor</div>
						<div className="text-xs text-white/85 mt-1.5 leading-snug">
							TanStack Start frontend, Go service for franchisor workflows
						</div>
					</motion.div>

					{/* Central DB (middle) */}
					<div className="flex flex-col items-center gap-2 py-2">
						<motion.div
							initial={false}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="rounded-xl navy-gradient text-white px-4 py-3 text-center w-full"
						>
							<div className="text-[10px] uppercase tracking-[0.14em] text-white/60 font-bold">
								Shared foundation
							</div>
							<div className="text-sm font-semibold mt-0.5">
								IFPG central database
							</div>
							<div className="text-[10px] text-white/60 mt-0.5">
								already built, already syncing X-Cart
							</div>
						</motion.div>

						<motion.svg
							initial={false}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.6, delay: 0.4 }}
							viewBox="0 0 200 32"
							className="w-full max-w-[200px]"
						>
							<title>Bidirectional reads and writes</title>
							<defs>
								<marker
									id="arrowR"
									viewBox="0 0 10 10"
									refX="8"
									refY="5"
									markerWidth="6"
									markerHeight="6"
									orient="auto"
								>
									<path d="M 0 0 L 10 5 L 0 10 z" fill="#3182ce" />
								</marker>
							</defs>
							<line
								x1="10"
								y1="10"
								x2="190"
								y2="10"
								stroke="#3182ce"
								strokeWidth="2"
								strokeDasharray="4 3"
								markerEnd="url(#arrowR)"
							/>
							<line
								x1="190"
								y1="22"
								x2="10"
								y2="22"
								stroke="#3182ce"
								strokeWidth="2"
								strokeDasharray="4 3"
								markerEnd="url(#arrowR)"
							/>
						</motion.svg>
						<div className="text-[10px] text-[#718096] text-center">
							Reads + writes from both apps
						</div>
					</div>

					{/* Atlas (right) */}
					<motion.div
						initial={false}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="rounded-xl bg-gradient-to-br from-[#3182ce] to-[#4299e1] text-white p-5"
					>
						<div className="text-[10px] uppercase tracking-[0.14em] text-white/70 font-bold mb-1">
							Franchise Atlas
						</div>
						<div className="text-xl font-bold">Consultant</div>
						<div className="text-xs text-white/85 mt-1.5 leading-snug">
							TanStack Start frontend, current engagement (2 engineers)
						</div>
					</motion.div>
				</div>

				{/* Shared vendors strip */}
				<div className="mt-6 pt-5 border-t border-[#edf2f7]">
					<div className="text-[10px] uppercase tracking-[0.14em] text-[#718096] font-semibold mb-3">
						Third-party services used by both
					</div>
					<div className="flex flex-wrap gap-2 text-xs">
						{[
							"Nylas (calendar + email API)",
							"AWS S3 (file storage)",
							"Stream Chat (messaging primitive)",
							"Shared designer (one design system)",
						].map((v) => (
							<span
								key={v}
								className="px-2.5 py-1 rounded-full bg-[#f7f9fc] border border-[#e2e8f0] text-[#4a5568] font-medium"
							>
								{v}
							</span>
						))}
					</div>
				</div>
			</div>

			{/* Scenario selector */}
			<div className="mt-10">
				<div className="text-xs uppercase tracking-[0.16em] text-[#3182ce] font-semibold mb-3">
					Three scenarios · click to expand
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
					{scenarios.map((s) => {
						const Icon = s.icon
						const isActive = s.id === active
						return (
							<button
								type="button"
								key={s.id}
								onClick={() => setActive(s.id)}
								className={cn(
									"text-left p-4 rounded-xl border transition-all",
									isActive
										? "border-[#1a365d] bg-white shadow-[var(--shadow-ifpg-card)] -translate-y-0.5"
										: "border-[#e2e8f0] bg-white/60 hover:border-[#3182ce]",
								)}
							>
								<div className="flex items-center gap-2.5">
									<div
										className={cn(
											"size-8 rounded-[8px] grid place-items-center",
											isActive
												? "navy-gradient text-white"
												: "bg-[#edf2f7] text-[#4a5568]",
										)}
									>
										<Icon className="size-4" strokeWidth={1.75} />
									</div>
									<div className="text-sm font-semibold text-[#1a365d] leading-tight">
										{s.title}
									</div>
								</div>
							</button>
						)
					})}
				</div>

				{/* Active scenario detail */}
				<motion.div
					key={current.id}
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="rounded-2xl bg-white border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] overflow-hidden"
				>
					<div className="p-6 border-b border-[#edf2f7]">
						<div className="flex items-center gap-3">
							<div className="size-10 rounded-[10px] navy-gradient grid place-items-center text-white">
								<CurrentIcon className="size-5" strokeWidth={1.75} />
							</div>
							<div>
								<h3 className="text-lg font-bold text-[#1a365d]">
									{current.title}
								</h3>
								<p className="text-xs text-[#718096]">{current.subtitle}</p>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
						{/* Hub side */}
						<div className="p-6">
							<div className="flex items-center gap-2 mb-3">
								<span className="size-2 rounded-full bg-[#ed8936]" />
								<span className="text-[10px] uppercase tracking-[0.16em] text-[#ed8936] font-bold">
									Hub · Franchisor sees
								</span>
							</div>
							<ul className="space-y-3">
								{current.hubSide.map((item) => (
									<li
										key={item.label}
										className="flex gap-2.5 text-sm"
									>
										<span className="text-[#ed8936] shrink-0 mt-0.5">●</span>
										<div>
											<div className="font-semibold text-[#1a365d]">
												{item.label}
											</div>
											<div className="text-[#4a5568] text-[13px] leading-relaxed">
												{item.body}
											</div>
										</div>
									</li>
								))}
							</ul>
						</div>

						{/* Arrow divider */}
						<div className="hidden md:flex items-center justify-center px-2">
							<div className="h-full w-px bg-[#edf2f7] relative">
								<ArrowRight className="size-5 text-[#3182ce] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-0.5 border border-[#bee3f8]" />
							</div>
						</div>

						{/* Atlas side */}
						<div className="p-6 bg-[#f7fbff]">
							<div className="flex items-center gap-2 mb-3">
								<span className="size-2 rounded-full bg-[#3182ce]" />
								<span className="text-[10px] uppercase tracking-[0.16em] text-[#3182ce] font-bold">
									Atlas · Consultant sees
								</span>
							</div>
							<ul className="space-y-3">
								{current.atlasSide.map((item) => (
									<li
										key={item.label}
										className="flex gap-2.5 text-sm"
									>
										<span className="text-[#3182ce] shrink-0 mt-0.5">●</span>
										<div>
											<div className="font-semibold text-[#1a365d]">
												{item.label}
											</div>
											<div className="text-[#4a5568] text-[13px] leading-relaxed">
												{item.body}
											</div>
										</div>
									</li>
								))}
							</ul>
						</div>
					</div>

					<div className="px-6 py-4 border-t border-[#edf2f7] bg-[#fffaf0] flex items-start gap-2.5">
						<MessageSquare
							className="size-4 text-[#dd6b20] mt-0.5 shrink-0"
							strokeWidth={1.75}
						/>
						<div className="text-xs text-[#7b341e] leading-relaxed">
							<strong className="font-semibold">Data location:</strong>{" "}
							{current.dataExchanged}
						</div>
					</div>
				</motion.div>
			</div>
		</Section>
	)
}
