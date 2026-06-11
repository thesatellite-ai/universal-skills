import { motion } from "motion/react"
import { Eyebrow, Headline, Lede, Section } from "../section"
import { headlineNumbers, platformLayers, reuseSplit } from "@/lib/pitch-data"

/**
 * Custom SVG donut. Avoids recharts (React 19 incompat with current Vite 8).
 */
function Donut({ percent }: { percent: number }) {
	const size = 280
	const cx = size / 2
	const cy = size / 2
	const r = 110
	const stroke = 36
	const circ = 2 * Math.PI * r
	const filled = (percent / 100) * circ

	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
			<title>{percent}% reused — design + domain knowledge</title>
			<circle cx={cx} cy={cy} r={r} fill="none" stroke="#ed8936" strokeWidth={stroke} />
			<motion.circle
				cx={cx}
				cy={cy}
				r={r}
				fill="none"
				stroke="#1a365d"
				strokeWidth={stroke}
				strokeDasharray={`${filled} ${circ}`}
				strokeDashoffset={circ / 4}
				transform={`rotate(-90 ${cx} ${cy})`}
				strokeLinecap="round"
				initial={false}
				animate={{ strokeDasharray: `${filled} ${circ}` }}
				transition={{ duration: 1.2, ease: "easeOut" }}
			/>
		</svg>
	)
}

export function Reuse() {
	const percent = headlineNumbers.reusePercent
	return (
		<Section id="reuse">
			<Eyebrow>Shared with Atlas</Eyebrow>
			<Headline>
				What carries across is{" "}
				<span className="text-[#ed8936]">design + domain</span>, not code.
			</Headline>
			<Lede>
				Hub doesn't inherit Atlas's TypeScript stack. It inherits something more
				durable: the design system, the brand-sync playbook, the schema shape,
				and the IFPG context the Atlas team has built up shipping Navigator since October 2025.
				Code is purpose-built — and that's the whole point.
			</Lede>

			<div className="mt-12 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 items-center">
				<div className="relative flex flex-col items-center">
					<div className="relative">
						<Donut percent={percent} />
						<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
							<div className="text-6xl font-bold text-[#1a365d] tracking-tight">
								{percent}%
							</div>
							<div className="text-xs text-[#718096] font-medium mt-1 text-center max-w-[140px]">
								carried across
							</div>
						</div>
					</div>

					<div className="mt-6 flex flex-col gap-2 text-xs w-full max-w-[280px]">
						{reuseSplit.map((entry) => (
							<div key={entry.name} className="flex items-center gap-2">
								<span
									className="size-3 rounded-sm shrink-0"
									style={{ background: entry.color }}
								/>
								<span className="text-[#4a5568] font-medium">{entry.name}</span>
								<span className="text-[#1a365d] font-bold ml-auto">
									{entry.value}%
								</span>
							</div>
						))}
					</div>
				</div>

				<div className="space-y-2.5">
					<div className="text-xs uppercase tracking-[0.14em] text-[#718096] font-semibold mb-2">
						Where the value carries across
					</div>
					{platformLayers.map((layer, i) => {
						const tone =
							layer.reuse === 100
								? "bg-[#38a169]"
								: layer.reuse >= 60
									? "bg-[#3182ce]"
									: layer.reuse >= 20
										? "bg-[#ed8936]"
										: "bg-[#cbd5e0]"
						return (
							<motion.div
								key={layer.name}
								initial={false}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.3, delay: i * 0.03 }}
							>
								<div className="flex items-center justify-between mb-1">
									<div className="text-sm text-[#1a365d] font-medium">
										{layer.name}
									</div>
									<div className="text-xs text-[#4a5568] font-mono tabular-nums">
										{layer.reuse}%
									</div>
								</div>
								<div className="h-1.5 rounded-full bg-[#edf2f7] overflow-hidden">
									<motion.div
										initial={false}
										animate={{ width: `${Math.max(layer.reuse, 2)}%` }}
										transition={{
											duration: 0.8,
											delay: 0.2 + i * 0.04,
											ease: "easeOut",
										}}
										className={`h-full ${tone} rounded-full`}
									/>
								</div>
							</motion.div>
						)
					})}
				</div>
			</div>

			<div className="mt-8 text-center text-xs text-[#718096] max-w-2xl mx-auto leading-relaxed">
				The "70% reuse" framing from our earlier draft assumed Hub would extend
				Navigator's codebase. We've since chosen a purpose-built Go service —
				slower to start, faster forever. This is the honest split.
			</div>
		</Section>
	)
}
