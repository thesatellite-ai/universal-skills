import { motion } from "motion/react"
import { CalendarClock, FileCheck2 } from "lucide-react"
import { Eyebrow, Headline, Lede, Section } from "../section"
import { asks } from "@/lib/pitch-data"

const icons = [FileCheck2, CalendarClock]

export function Ask() {
	return (
		<Section id="ask" tone="light">
			<Eyebrow>Next steps</Eyebrow>
			<Headline>
				Two simple things to align on{" "}
				<span className="text-[#ed8936]">whenever it works</span>.
			</Headline>
			<Lede>
				Neither needs to happen this week. The plan is ready when IFPG is.
				Below is what we'd want to confirm before assigning the Hub team to
				a specific start date.
			</Lede>

			<div className="mt-12 space-y-4">
				{asks.map((a, i) => {
					const Icon = icons[i]
					return (
						<motion.div
							key={a.n}
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: i * 0.12 }}
							className="group rounded-2xl bg-white border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] p-6 md:p-7 flex items-center gap-5 relative overflow-hidden"
						>
							<div className="relative size-14 rounded-2xl navy-gradient grid place-items-center text-white shrink-0 shadow-[0_4px_12px_rgba(26,54,93,0.25)]">
								<Icon className="size-7" strokeWidth={1.5} />
							</div>

							<div className="flex-1 min-w-0 relative">
								<div className="flex items-center gap-3 mb-1">
									<span className="text-xs uppercase tracking-[0.16em] text-[#3182ce] font-bold">
										Step {a.n}
									</span>
								</div>
								<div className="text-xl md:text-2xl font-bold text-[#1a365d] leading-tight">
									{a.title}
								</div>
								<div className="text-sm text-[#4a5568] mt-1.5 leading-relaxed">
									{a.detail}
								</div>
							</div>

							<div className="hidden md:block text-[80px] font-bold text-[#1a365d]/[0.06] leading-none tracking-tighter">
								{a.n}
							</div>
						</motion.div>
					)
				})}
			</div>

			<div className="mt-8 rounded-xl bg-[#ebf8ff] border border-[#bee3f8] p-4 text-sm text-[#2b6cb0] leading-relaxed max-w-3xl">
				<strong className="font-semibold text-[#1a365d]">
					X-Cart admin intro?
				</strong>{" "}
				Not needed up front. That conversation belongs in Phase 1.5 when we
				actually need to spec the resale sync, assuming the X-Cart APIs are
				available at that point.
			</div>
		</Section>
	)
}
