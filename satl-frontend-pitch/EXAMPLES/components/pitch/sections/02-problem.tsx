import { motion } from "motion/react"
import { AlertTriangle, FileSpreadsheet, Link2Off, ShoppingCart } from "lucide-react"
import { Eyebrow, Headline, Lede, Section } from "../section"
import { currentSystems, problemStats } from "@/lib/pitch-data"

const icons = [ShoppingCart, FileSpreadsheet, Link2Off]
const colors = [
	"from-[#6b46c1] to-[#9f7aea]",
	"from-[#38a169] to-[#48bb78]",
	"from-[#dd6b20] to-[#ed8936]",
]

export function Problem() {
	return (
		<Section id="problem">
			<Eyebrow>Today</Eyebrow>
			<Headline>
				Every franchisor lives in <span className="text-[#ed8936]">three</span>{" "}
				places.
			</Headline>
			<Lede>
				None of them talk to each other. Your team spends hours every week keeping
				them in sync. The franchisor never feels IFPG's value between renewals.
			</Lede>

			<div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
				{currentSystems.map((sys, i) => {
					const Icon = icons[i]
					return (
						<motion.div
							key={sys.name}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: i * 0.1 }}
							className="relative rounded-2xl bg-white p-6 border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)]"
						>
							<div
								className={`size-12 rounded-[12px] grid place-items-center bg-gradient-to-br ${colors[i]} text-white`}
							>
								<Icon className="size-6" strokeWidth={1.5} />
							</div>
							<div className="mt-5 font-bold text-lg text-[#1a365d]">{sys.name}</div>
							<div className="mt-1.5 text-sm text-[#4a5568] leading-relaxed">
								{sys.role}
							</div>
							<div className="mt-4 pt-4 border-t border-[#edf2f7] flex items-start gap-2">
								<AlertTriangle className="size-4 text-[#dd6b20] shrink-0 mt-0.5" />
								<div className="text-xs text-[#c53030] font-medium leading-relaxed">
									{sys.pain}
								</div>
							</div>
						</motion.div>
					)
				})}
			</div>

			<motion.div
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.4 }}
				className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4"
			>
				{problemStats.map((s) => (
					<div
						key={s.label}
						className="rounded-xl bg-gradient-to-br from-[#fed7d7]/30 to-transparent border border-[#fed7d7] p-5"
					>
						<div className="text-3xl font-bold text-[#c53030] tracking-tight">
							{s.stat}
						</div>
						<div className="text-sm text-[#742a2a] mt-1 font-medium">{s.label}</div>
					</div>
				))}
			</motion.div>
		</Section>
	)
}
