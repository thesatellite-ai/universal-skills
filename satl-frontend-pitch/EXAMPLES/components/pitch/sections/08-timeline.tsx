import { motion } from "motion/react"
import { CheckCircle2, Flag } from "lucide-react"
import { Eyebrow, Headline, Lede, Section } from "../section"
import { sprints, timelineDates } from "@/lib/pitch-data"

const TOTAL_WEEKS = 17

export function Timeline() {
	return (
		<Section id="timeline" tone="light">
			<Eyebrow>Timeline</Eyebrow>
			<Headline>
				<span className="text-[#ed8936]">17 weeks</span> · Jun 1 → Sept 30.
			</Headline>
			<Lede>
				One dedicated squad. Sprint 0 boots Go + custom auth + Postgres. Five
				feature sprints. Two-week soft-launch buffer. GA before Q4 renewal
				conversations begin.
			</Lede>

			<div className="mt-14 relative">
				{/* Date axis */}
				<div className="relative h-6 mb-2">
					{timelineDates.map((d) => (
						<div
							key={d.date}
							className="absolute -translate-x-1/2 text-xs text-[#718096] font-medium"
							style={{ left: `${(d.week / TOTAL_WEEKS) * 100}%` }}
						>
							{d.date}
						</div>
					))}
				</div>

				{/* Sprint bars */}
				<div className="relative bg-white rounded-2xl border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] p-6">
					{/* Grid lines */}
					<div className="absolute inset-x-6 top-6 bottom-6 pointer-events-none">
						{timelineDates.map((d) => (
							<div
								key={d.date}
								className="absolute top-0 bottom-0 w-px bg-[#edf2f7]"
								style={{ left: `${(d.week / TOTAL_WEEKS) * 100}%` }}
							/>
						))}
					</div>

					<ul className="space-y-2.5 relative">
						{sprints.map((s, i) => {
							const widthPct = (s.weeks / TOTAL_WEEKS) * 100
							const leftPct = (s.start / TOTAL_WEEKS) * 100
							return (
								<motion.li
									key={s.id}
									initial={false}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.4, delay: i * 0.05 }}
									className="relative h-10"
								>
									<motion.div
										initial={false}
										animate={{ width: `${widthPct}%` }}
										transition={{ duration: 0.6, delay: 0.2 + i * 0.06, ease: "easeOut" }}
										className="absolute top-0 bottom-0 rounded-[8px] flex items-center px-3 text-xs font-semibold text-white shadow-sm whitespace-nowrap overflow-hidden"
										style={{ left: `${leftPct}%`, background: s.color }}
									>
										<span>{s.label}</span>
										{widthPct > 9 && (
											<span className="ml-2 opacity-80 font-normal hidden md:inline truncate">
												{s.deliverable}
											</span>
										)}
									</motion.div>
								</motion.li>
							)
						})}
					</ul>

					{/* GA marker */}
					<motion.div
						initial={false}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.4, delay: 1 }}
						className="absolute -top-1 right-6 translate-x-1/2"
					>
						<div className="flex flex-col items-center">
							<Flag className="size-5 text-[#ed8936] -mb-0.5" fill="#ed8936" />
							<div className="text-[10px] font-bold text-[#ed8936] uppercase tracking-wider">
								GA
							</div>
						</div>
					</motion.div>
				</div>

				{/* Legend below */}
				<div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
					{sprints.map((s) => (
						<div
							key={s.id}
							className="flex items-start gap-2 p-2.5 rounded-[8px] bg-white border border-[#edf2f7]"
						>
							<span
								className="size-3 rounded-sm shrink-0 mt-0.5"
								style={{ background: s.color }}
							/>
							<div>
								<div className="text-[#1a365d] font-semibold">{s.label}</div>
								<div className="text-[10px] text-[#718096] leading-tight mt-0.5">
									{s.deliverable}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			<motion.div
				initial={false}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 1.2 }}
				className="mt-6 flex items-center gap-2 text-sm text-[#38a169] font-medium"
			>
				<CheckCircle2 className="size-4" />
				Two-week soft-launch buffer baked in before GA. If any sprint slips a
				week, the date still holds.
			</motion.div>
		</Section>
	)
}
