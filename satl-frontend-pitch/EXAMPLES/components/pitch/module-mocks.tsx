/**
 * Pure-CSS UI mockups embedded in module deep-dive pages.
 * No images, no real data — just composed shapes that read as "the product".
 * Each mock matches one of the `mockType` values from module-data.ts.
 */

import { motion } from "motion/react"
import {
	ArrowDownLeft,
	ArrowUpRight,
	Calendar,
	CalendarClock,
	CheckCircle2,
	Clock,
	FileText,
	Inbox,
	MapPin,
	MessageSquare,
	Sparkles,
	Star,
	Wallet,
} from "lucide-react"
import type { Module } from "@/lib/module-data"
import { cn } from "@/lib/utils"

type MockProps = { accent: Module["accent"] }

const accentBg: Record<Module["accent"], string> = {
	navy: "from-[#1a365d] to-[#2c5282]",
	royal: "from-[#3182ce] to-[#4299e1]",
	orange: "from-[#ed8936] to-[#f6ad55]",
	green: "from-[#38a169] to-[#48bb78]",
	gold: "from-[#d69e2e] to-[#ecc94b]",
	purple: "from-[#6b46c1] to-[#9f7aea]",
}

const accentText: Record<Module["accent"], string> = {
	navy: "text-[#1a365d]",
	royal: "text-[#3182ce]",
	orange: "text-[#ed8936]",
	green: "text-[#38a169]",
	gold: "text-[#d69e2e]",
	purple: "text-[#6b46c1]",
}

export function ModuleMock({
	type,
	accent,
}: {
	type: Module["mockType"]
	accent: Module["accent"]
}) {
	const Component = {
		dash: DashMock,
		list: ListMock,
		calendar: CalendarMock,
		wallet: WalletMock,
		table: TableMock,
		form: FormMock,
		feed: FeedMock,
	}[type]

	return (
		<div className="relative rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-[var(--shadow-ifpg-pop)] bg-[#f7f9fc]">
			{/* Faux browser chrome */}
			<div className="bg-white border-b border-[#e2e8f0] h-9 flex items-center px-3 gap-2">
				<div className="flex gap-1.5">
					<span className="size-2.5 rounded-full bg-[#fed7d7]" />
					<span className="size-2.5 rounded-full bg-[#feebc8]" />
					<span className="size-2.5 rounded-full bg-[#c6f6d5]" />
				</div>
				<div className="flex-1 flex justify-center">
					<div className="text-[10px] text-[#a0aec0] font-mono">
						hub.ifpg.com
					</div>
				</div>
			</div>
			<div className="p-4 md:p-6 max-h-[420px] overflow-hidden relative">
				<Component accent={accent} />
				<div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f7f9fc] to-transparent pointer-events-none" />
			</div>
		</div>
	)
}

function DashMock({ accent }: MockProps) {
	return (
		<div>
			<div className="flex items-center justify-between mb-3">
				<div>
					<div className="text-[10px] uppercase tracking-wider text-[#3182ce] font-semibold">
						The Dash
					</div>
					<div className="font-bold text-[#1a365d] text-base">Good morning, Sarah</div>
				</div>
				<div className={cn("text-xs px-2 py-0.5 rounded-full text-white font-semibold bg-gradient-to-r", accentBg[accent])}>
					Elite Plus
				</div>
			</div>
			<div className="grid grid-cols-4 gap-2 mb-3">
				{[
					{ v: "47", l: "Leads", c: "#ed8936" },
					{ v: "12/20", l: "Bookings", c: "#3182ce" },
					{ v: "1,243", l: "Views", c: "#38a169" },
					{ v: "1,847", l: "Points", c: "#1a365d" },
				].map((k) => (
					<div
						key={k.l}
						className="bg-white rounded-lg p-2 border-l-2"
						style={{ borderLeftColor: k.c }}
					>
						<div className="text-xs font-bold text-[#1a365d]">{k.v}</div>
						<div className="text-[9px] text-[#718096]">{k.l}</div>
					</div>
				))}
			</div>
			<div className="bg-white rounded-lg p-3 border border-[#e2e8f0]">
				<div className="text-xs font-semibold text-[#1a365d] mb-2">Today's actions</div>
				{["Review 3 new leads from MN", "Approve booking from Tara M.", "Magazine cover slot — closes in 2d"].map((t, i) => (
					<motion.div
						key={t}
						initial={false}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: i * 0.1 }}
						className="flex items-center gap-2 py-1.5 border-b border-[#edf2f7] last:border-0"
					>
						<span
							className={cn(
								"size-1.5 rounded-full",
								i === 2 ? "bg-[#ed8936] animate-pulse-subtle" : "bg-[#3182ce]",
							)}
						/>
						<span className="text-[11px] text-[#4a5568] flex-1">{t}</span>
						<span className="text-[10px] text-[#3182ce]">→</span>
					</motion.div>
				))}
			</div>
		</div>
	)
}

function ListMock({ accent }: MockProps) {
	const items = [
		{ t: "5 high-intent leads from Twin Cities", tag: "Free", icon: Sparkles },
		{ t: "June magazine cover — 1 slot left", tag: "500 pts", icon: FileText, urgent: true },
		{ t: "Open territory: Phoenix metro", tag: "Free", icon: MapPin },
		{ t: "Featured Brand of the Week", tag: "750 pts", icon: Star },
	]
	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2 mb-2">
				<div className="text-[10px] uppercase tracking-wider text-[#3182ce] font-semibold">
					Growth Opportunities
				</div>
				<div className="flex-1 h-px bg-[#e2e8f0]" />
			</div>
			{items.map((item, i) => {
				const Icon = item.icon
				return (
					<motion.div
						key={item.t}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: i * 0.08 }}
						className={cn(
							"bg-white rounded-lg p-2.5 border border-[#e2e8f0] flex items-center gap-2.5",
							item.urgent && "border-l-2 border-l-[#ed8936]",
						)}
					>
						<div
							className={cn(
								"size-7 rounded-md grid place-items-center bg-gradient-to-br text-white shrink-0",
								accentBg[accent],
							)}
						>
							<Icon className="size-3.5" strokeWidth={1.75} />
						</div>
						<div className="flex-1 text-xs font-medium text-[#1a365d] truncate">
							{item.t}
						</div>
						<span
							className={cn(
								"text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
								item.tag === "Free"
									? "bg-[#c6f6d5] text-[#276749]"
									: "bg-[#fed7d7] text-[#c53030]",
							)}
						>
							{item.tag}
						</span>
					</motion.div>
				)
			})}
		</div>
	)
}

function CalendarMock({ accent }: MockProps) {
	const slots = ["9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "1:00", "1:30", "2:00", "2:30"]
	const states = ["a", "n", "a", "a", "u", "a", "u", "a", "a", "n"]
	return (
		<div>
			<div className="flex items-center justify-between mb-3">
				<div>
					<div className="text-[10px] uppercase tracking-wider text-[#3182ce] font-semibold">
						Direct Book
					</div>
					<div className="font-bold text-[#1a365d] text-sm flex items-center gap-1.5">
						Tara Martinez
						<Star className="size-3 text-[#d69e2e] fill-[#d69e2e]" />
					</div>
				</div>
				<div className="text-right">
					<div className="text-[9px] text-[#718096] uppercase tracking-wider">Credits</div>
					<div className="text-xs font-bold text-[#1a365d]">4 / 10</div>
				</div>
			</div>
			<div className="grid grid-cols-5 gap-1 mb-3">
				{["MON", "TUE", "WED", "THU", "FRI"].map((d, i) => (
					<div
						key={d}
						className={cn(
							"py-1.5 text-center rounded text-[10px] font-semibold",
							i === 2
								? cn("bg-gradient-to-br text-white", accentBg[accent])
								: "bg-[#edf2f7] text-[#4a5568]",
						)}
					>
						<div className="opacity-70">{d}</div>
						<div className="text-xs">{27 + i}</div>
					</div>
				))}
			</div>
			<div className="grid grid-cols-5 gap-1">
				{slots.map((s, i) => (
					<motion.div
						key={s}
						initial={false}
						animate={{ opacity: 1 }}
						transition={{ delay: i * 0.03 }}
						className={cn(
							"h-7 rounded text-[10px] font-medium grid place-items-center",
							states[i] === "a" && "bg-white border border-[#cbd5e0] text-[#1a365d]",
							states[i] === "u" && "bg-[#f7f9fc] text-[#cbd5e0]",
							states[i] === "n" && "bg-[#fed7d7] text-[#c53030] line-through opacity-50",
						)}
					>
						{s}
					</motion.div>
				))}
			</div>
		</div>
	)
}

function WalletMock({ accent }: MockProps) {
	const ledger = [
		{ d: "May 27", t: "Email blast", a: -250 },
		{ d: "May 18", t: "Podcast guest spot", a: -350 },
		{ d: "May 1", t: "Monthly grant — Elite Plus", a: 2000 },
		{ d: "Apr 22", t: "Featured Brand", a: -750 },
	]
	return (
		<div>
			<div
				className={cn(
					"rounded-xl p-4 text-white mb-3 bg-gradient-to-br relative overflow-hidden",
					accentBg[accent],
				)}
			>
				<div className="absolute -right-6 -bottom-6 size-24 rounded-full bg-white/10" />
				<div className="text-[10px] uppercase tracking-wider text-white/70 font-semibold relative">
					Available balance
				</div>
				<div className="text-3xl font-bold tracking-tight mt-1 relative">1,847</div>
				<div className="text-[10px] text-white/80 mt-1 relative">+2,000 incoming Jun 1</div>
			</div>
			<div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
				<div className="text-[10px] uppercase tracking-wider text-[#718096] font-semibold px-3 py-1.5 bg-[#f7f9fc] border-b border-[#e2e8f0]">
					Ledger
				</div>
				{ledger.map((e, i) => {
					const isCredit = e.a > 0
					return (
						<motion.div
							key={e.t}
							initial={false}
							animate={{ opacity: 1 }}
							transition={{ delay: i * 0.06 }}
							className="flex items-center gap-2 px-3 py-2 border-b border-[#edf2f7] last:border-0 text-xs"
						>
							<div
								className={cn(
									"size-5 rounded grid place-items-center shrink-0",
									isCredit
										? "bg-[#c6f6d5] text-[#276749]"
										: "bg-[#fed7d7] text-[#c53030]",
								)}
							>
								{isCredit ? <ArrowDownLeft className="size-3" /> : <ArrowUpRight className="size-3" />}
							</div>
							<span className="text-[#718096] text-[10px] w-12 shrink-0">{e.d}</span>
							<span className="text-[#1a365d] flex-1 truncate text-[11px]">{e.t}</span>
							<span
								className={cn(
									"font-mono font-bold text-[11px]",
									isCredit ? "text-[#38a169]" : "text-[#1a365d]",
								)}
							>
								{isCredit ? "+" : ""}
								{e.a}
							</span>
						</motion.div>
					)
				})}
			</div>
		</div>
	)
}

function TableMock({ accent }: MockProps) {
	const cols = [
		{ name: "New", count: 47, items: ["Mike R.", "Lisa T.", "Sam G."] },
		{ name: "Contacted", count: 31, items: ["Jane D.", "Carl P."] },
		{ name: "Discovery", count: 18, items: ["Tara M."] },
		{ name: "Signed", count: 3, items: ["Jose R."] },
	]
	return (
		<div>
			<div className="text-[10px] uppercase tracking-wider text-[#3182ce] font-semibold mb-3">
				Candidate Pipeline
			</div>
			<div className="grid grid-cols-4 gap-2">
				{cols.map((c, i) => (
					<motion.div
						key={c.name}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: i * 0.08 }}
						className="bg-white rounded-lg p-2 border border-[#e2e8f0]"
					>
						<div className="flex items-center justify-between mb-2">
							<span className="text-[10px] font-semibold text-[#1a365d]">{c.name}</span>
							<span className={cn("text-[10px] font-bold", accentText[accent])}>{c.count}</span>
						</div>
						<div className="space-y-1">
							{c.items.map((it) => (
								<div
									key={it}
									className="bg-[#f7f9fc] rounded px-1.5 py-1 text-[10px] text-[#4a5568] border border-[#edf2f7]"
								>
									{it}
								</div>
							))}
						</div>
					</motion.div>
				))}
			</div>
		</div>
	)
}

function FormMock({ accent }: MockProps) {
	const fields = [
		{ l: "Brand name", v: "Pizzaboli's", locked: false },
		{ l: "Description", v: "Family-style pizzeria with multi-unit focus...", locked: false },
		{ l: "Industry category", v: "Food & Beverage", locked: true },
		{ l: "Investment minimum", v: "$250,000", locked: true },
	]
	return (
		<div>
			<div className="flex items-center justify-between mb-3">
				<div className="text-[10px] uppercase tracking-wider text-[#3182ce] font-semibold">
					Brand Profile
				</div>
				<div
					className={cn(
						"text-[10px] px-2 py-0.5 rounded-full text-white font-semibold bg-gradient-to-r",
						accentBg[accent],
					)}
				>
					Save
				</div>
			</div>
			<div className="space-y-2.5">
				{fields.map((f, i) => (
					<motion.div
						key={f.l}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: i * 0.06 }}
					>
						<div className="flex items-center justify-between mb-1">
							<label className="text-[10px] font-semibold text-[#4a5568]">{f.l}</label>
							{f.locked && (
								<span className="text-[9px] text-[#a0aec0]">Requires IFPG approval</span>
							)}
						</div>
						<div
							className={cn(
								"px-2.5 py-1.5 rounded border text-[11px] text-[#1a365d]",
								f.locked ? "bg-[#f7f9fc] border-[#cbd5e0]" : "bg-white border-[#cbd5e0]",
							)}
						>
							{f.v}
						</div>
					</motion.div>
				))}
			</div>
		</div>
	)
}

function FeedMock({ accent }: MockProps) {
	const items = [
		{ who: "Tara Martinez", msg: "Sending you 3 new candidates from MN", t: "2h ago", icon: Inbox },
		{ who: "Jordan Klein", msg: "Just closed $45k deal for Pizzaboli's", t: "yesterday", icon: CheckCircle2 },
		{ who: "Samira Patel", msg: "Quick call Wed at 2pm to walk through FDD?", t: "yesterday", icon: CalendarClock },
		{ who: "Marcus Bell", msg: "Hey — territory MN looks promising", t: "2 days ago", icon: MessageSquare },
	]
	return (
		<div>
			<div className="text-[10px] uppercase tracking-wider text-[#3182ce] font-semibold mb-3">
				Activity / Messages
			</div>
			<div className="space-y-2">
				{items.map((m, i) => {
					const Icon = m.icon
					return (
						<motion.div
							key={i}
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: i * 0.08 }}
							className="flex items-start gap-2.5 bg-white rounded-lg p-2 border border-[#e2e8f0]"
						>
							<div
								className={cn(
									"size-7 rounded-full grid place-items-center text-white shrink-0 bg-gradient-to-br",
									accentBg[accent],
								)}
							>
								<Icon className="size-3.5" strokeWidth={1.75} />
							</div>
							<div className="flex-1 min-w-0">
								<div className="text-[11px] font-semibold text-[#1a365d]">{m.who}</div>
								<div className="text-[10px] text-[#4a5568] truncate">{m.msg}</div>
							</div>
							<div className="text-[9px] text-[#a0aec0] shrink-0">{m.t}</div>
						</motion.div>
					)
				})}
			</div>
		</div>
	)
}
