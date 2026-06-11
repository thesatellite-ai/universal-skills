"use client"

import { motion } from "motion/react"
import { Check, Clock } from "lucide-react"
import { useState } from "react"
import { Eyebrow, Headline, Lede, Section } from "../section"
import { scopePhases } from "@/lib/pitch-data"
import { cn } from "@/lib/utils"

type Phase = "v1" | "v15" | "v2"

const order: Phase[] = ["v1", "v15", "v2"]

export function Scope() {
	const [active, setActive] = useState<Phase>("v1")

	return (
		<Section id="scope">
			<Eyebrow>Scope</Eyebrow>
			<Headline>
				11 features in v1. <span className="text-[#ed8936]">4</span> in v1.5.{" "}
				<span className="text-[#718096]">4</span> in v2.
			</Headline>
			<Lede>
				Tight v1 protects September. Deferred items aren't dropped — they're
				sequenced. Toggle the phases below to see what ships when.
			</Lede>

			{/* Toggle */}
			<div className="mt-10 inline-flex items-center gap-1 p-1 rounded-full bg-white border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)]">
				{order.map((p) => {
					const phase = scopePhases[p]
					const isActive = p === active
					return (
						<button
							type="button"
							key={p}
							onClick={() => setActive(p)}
							className={cn(
								"px-5 py-2.5 rounded-full text-sm font-medium transition-all",
								isActive
									? "navy-gradient text-white shadow-[0_2px_8px_rgba(26,54,93,0.3)]"
									: "text-[#4a5568] hover:bg-[#f1f5fa]",
							)}
						>
							<span className="font-bold">{phase.label}</span>
							<span className="ml-2 text-[10px] uppercase tracking-wider opacity-75">
								{phase.when}
							</span>
						</button>
					)
				})}
			</div>

			{/* Active phase content */}
			<motion.div
				key={active}
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="mt-8 rounded-2xl bg-white border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] p-6 md:p-8"
			>
				<div className="flex flex-wrap items-end justify-between gap-3 mb-6">
					<div>
						<div className="text-xs uppercase tracking-[0.14em] text-[#3182ce] font-semibold">
							{scopePhases[active].label} · {scopePhases[active].when}
						</div>
						<div className="text-2xl font-bold text-[#1a365d] mt-1">
							{scopePhases[active].caption}
						</div>
					</div>
					<div className="text-right">
						<div className="text-4xl font-bold text-[#1a365d] leading-none tracking-tight">
							{scopePhases[active].features.length}
						</div>
						<div className="text-xs text-[#718096] uppercase tracking-wider mt-1">
							features
						</div>
					</div>
				</div>

				<ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
					{scopePhases[active].features.map((f, i) => (
						<motion.li
							key={f}
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.25, delay: i * 0.03 }}
							className={cn(
								"flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] border",
								active === "v1"
									? "bg-[#ebf8ff] border-[#bee3f8] text-[#2b6cb0]"
									: active === "v15"
										? "bg-[#fffaf0] border-[#fbd38d] text-[#7b341e]"
										: "bg-[#f7f9fc] border-[#e2e8f0] text-[#4a5568]",
							)}
						>
							{active === "v1" ? (
								<Check className="size-4 shrink-0" />
							) : (
								<Clock className="size-4 shrink-0" />
							)}
							<span className="text-sm font-medium">{f}</span>
						</motion.li>
					))}
				</ul>
			</motion.div>

			{/* Cumulative bars */}
			<div className="mt-8 flex items-stretch gap-1 h-12 rounded-full overflow-hidden border border-[rgba(26,54,93,0.08)]">
				<div
					className="bg-gradient-to-r from-[#3182ce] to-[#4299e1] flex items-center justify-center text-white text-xs font-semibold"
					style={{ flex: scopePhases.v1.features.length }}
				>
					v1 · {scopePhases.v1.features.length}
				</div>
				<div
					className="bg-gradient-to-r from-[#ed8936] to-[#f6ad55] flex items-center justify-center text-white text-xs font-semibold"
					style={{ flex: scopePhases.v15.features.length }}
				>
					v1.5 · {scopePhases.v15.features.length}
				</div>
				<div
					className="bg-gradient-to-r from-[#cbd5e0] to-[#a0aec0] flex items-center justify-center text-white text-xs font-semibold"
					style={{ flex: scopePhases.v2.features.length }}
				>
					v2 · {scopePhases.v2.features.length}
				</div>
			</div>
		</Section>
	)
}
