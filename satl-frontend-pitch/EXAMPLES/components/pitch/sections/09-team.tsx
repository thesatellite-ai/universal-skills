import { motion } from "motion/react"
import {
	Briefcase,
	ClipboardList,
	Code2,
	Compass,
	Palette,
	Server,
	ShieldCheck,
} from "lucide-react"
import { BigStat, Eyebrow, Headline, Lede, Section } from "../section"
import { navigatorImpact, squad } from "@/lib/pitch-data"

// Icons in squad order: Go BE, FE, PO, Designer, QA, PM, CTO
const roleIcons = [
	Server,
	Code2,
	Compass,
	Palette,
	ShieldCheck,
	ClipboardList,
	Briefcase,
]

export function Team() {
	const totalFTE = squad.reduce((acc, s) => acc + s.fte, 0)

	return (
		<Section id="team" tone="light">
			<Eyebrow>Team</Eyebrow>
			<Headline>
				One dedicated team,{" "}
				<span className="text-[#ed8936]">assigned from Solverhood</span>.
			</Headline>
			<Lede>
				The Atlas v1 engagement IFPG already approved (2 engineers) wraps in
				the next 2-3 weeks. Those engineers stay on Atlas for ongoing
				improvements; management and CTO time becomes more available for Hub.
				Solverhood assigns the Hub team below. Designer and QA are shared
				with Atlas so the two products stay aligned.
			</Lede>

			<div className="mt-12 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
				{/* Squad cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{squad.map((member, i) => {
						const Icon = roleIcons[i]
						return (
							<motion.div
								key={member.role}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: i * 0.06 }}
								className="rounded-xl bg-white border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] p-5"
							>
								<div className="flex items-start justify-between mb-3">
									<div
										className="size-10 rounded-[10px] grid place-items-center text-white"
										style={{ background: member.color }}
									>
										<Icon className="size-5" strokeWidth={1.75} />
									</div>
									<div className="text-right">
										<div className="text-2xl font-bold text-[#1a365d] leading-none">
											{member.fte === 1
												? member.count
												: `${Math.round(member.fte * 100)}%`}
										</div>
										<div className="text-[10px] text-[#718096] uppercase tracking-wider mt-0.5">
											{member.fte === 1 ? "FTE" : "of an FTE"}
										</div>
									</div>
								</div>
								<div className="font-semibold text-[#1a365d]">
									{member.role}
								</div>
								<div className="text-xs text-[#718096] mt-0.5">
									{member.source}
								</div>
							</motion.div>
						)
					})}
				</div>

				{/* Right column callouts */}
				<div className="space-y-4">
					<motion.div
						initial={false}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						className="rounded-2xl navy-gradient text-white p-6"
					>
						<div className="text-xs uppercase tracking-[0.14em] text-white/60 font-semibold">
							Total Hub team
						</div>
						<div className="text-5xl font-bold mt-2 tracking-tight leading-none">
							{totalFTE.toFixed(1)}
							<span className="text-2xl text-white/60 ml-1">FTE</span>
						</div>
						<div className="text-sm text-white/70 mt-3">
							{squad.length} people, weighted for actual time on Hub.
							Designer and QA are shared with Atlas.
						</div>
					</motion.div>

					<motion.div
						initial={false}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
						className="rounded-2xl bg-white border-2 border-[#38a169] p-6 relative"
					>
						<div className="absolute -top-2.5 left-5 px-2.5 py-0.5 rounded-full bg-[#38a169] text-white text-[10px] uppercase tracking-[0.14em] font-bold">
							Coordination with Atlas
						</div>
						<BigStat
							value="0"
							label="Atlas engineers pulled off"
							tone="green"
						/>
						<div className="text-xs text-[#4a5568] mt-4 leading-relaxed">
							{navigatorImpact.sharedBackend}{" "}
							<span className="font-semibold text-[#1a365d]">
								{navigatorImpact.verdict}
							</span>
						</div>
					</motion.div>
				</div>
			</div>
		</Section>
	)
}
