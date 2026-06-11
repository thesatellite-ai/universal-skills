"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { Eyebrow, Headline, Lede, Section } from "../section"
import { risks } from "@/lib/pitch-data"
import { cn } from "@/lib/utils"

function riskColor(score: number) {
	if (score >= 8) return "bg-[#fed7d7] border-[#fc8181] text-[#c53030]"
	if (score >= 5) return "bg-[#feebc8] border-[#f6ad55] text-[#7b341e]"
	if (score >= 3) return "bg-[#fefcbf] border-[#ecc94b] text-[#744210]"
	return "bg-[#c6f6d5] border-[#9ae6b4] text-[#22543d]"
}

export function Risks() {
	const [hovered, setHovered] = useState<string | null>(risks[0].id)
	const focus = risks.find((r) => r.id === hovered) ?? risks[0]

	return (
		<Section id="risks" tone="light">
			<Eyebrow>Risk register</Eyebrow>
			<Headline>
				10 risks tracked.{" "}
				<span className="text-[#ed8936]">Every one</span> has a mitigation in
				writing.
			</Headline>
			<Lede>
				Nothing in v1 is on the critical path without a documented fallback. Hover
				any chip to see the mitigation.
			</Lede>

			<div className="mt-12 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
				{/* Heatmap grid */}
				<div className="bg-white rounded-2xl border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] p-5">
					<div className="text-xs uppercase tracking-[0.14em] text-[#718096] font-semibold mb-4">
						Likelihood × Impact
					</div>
					<div className="flex gap-4">
						{/* Y axis label */}
						<div className="flex items-center justify-center">
							<div className="text-[10px] uppercase tracking-[0.14em] text-[#718096] font-semibold -rotate-90 whitespace-nowrap">
								Impact →
							</div>
						</div>

						<div className="flex-1 grid grid-cols-3 grid-rows-3 gap-1.5 aspect-[1.4/1]">
							{[3, 2, 1].map((impact) =>
								[1, 2, 3].map((likelihood) => {
									const cellRisks = risks.filter(
										(r) => r.likelihood === likelihood && r.impact === impact,
									)
									const score = likelihood * impact
									return (
										<div
											key={`${likelihood}-${impact}`}
											className={cn(
												"rounded-[10px] border p-2 min-h-[70px] flex flex-wrap gap-1 content-start",
												riskColor(score),
											)}
										>
											{cellRisks.map((r) => (
												<button
													key={r.id}
													type="button"
													onClick={() => setHovered(r.id)}
													onMouseEnter={() => setHovered(r.id)}
													className={cn(
														"text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-all",
														hovered === r.id
															? "bg-[#1a365d] text-white scale-110"
															: "bg-white/80 hover:bg-white",
													)}
												>
													{r.id}
												</button>
											))}
										</div>
									)
								}),
							)}
						</div>
					</div>
					<div className="ml-12 mt-2 text-center text-[10px] uppercase tracking-[0.14em] text-[#718096] font-semibold">
						Likelihood →
					</div>
				</div>

				{/* Detail card */}
				<motion.div
					key={focus.id}
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.25 }}
					className="rounded-2xl bg-white border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] p-6"
				>
					<div className="flex items-center gap-2 mb-3">
						<span
							className={cn(
								"text-xs px-2 py-0.5 rounded font-mono font-bold border",
								riskColor(focus.likelihood * focus.impact),
							)}
						>
							{focus.id}
						</span>
						<span className="text-xs uppercase tracking-wider text-[#718096] font-semibold">
							L{focus.likelihood} · I{focus.impact}
						</span>
					</div>
					<div className="font-bold text-lg text-[#1a365d] leading-snug">
						{focus.title}
					</div>
					<div className="mt-4 pt-4 border-t border-[#edf2f7]">
						<div className="text-xs uppercase tracking-[0.14em] text-[#3182ce] font-semibold mb-1">
							Mitigation
						</div>
						<div className="text-sm text-[#4a5568] leading-relaxed">
							{focus.mitigation}
						</div>
					</div>
				</motion.div>
			</div>
		</Section>
	)
}
