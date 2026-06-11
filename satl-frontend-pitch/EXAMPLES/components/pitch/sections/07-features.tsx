"use client"

import { motion } from "motion/react"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Eyebrow, Headline, Lede, Section } from "../section"
import { featureAnswers } from "@/lib/pitch-data"
import { cn } from "@/lib/utils"

export function Features() {
	const [open, setOpen] = useState<number | null>(0)

	const phaseColor: Record<string, string> = {
		v1: "bg-[#bee3f8] text-[#2b6cb0]",
		"v1.5": "bg-[#feebc8] text-[#7b341e]",
		v2: "bg-[#e2e8f0] text-[#4a5568]",
		"v1 + v1.5": "bg-[#c6f6d5] text-[#276749]",
	}

	return (
		<Section id="features">
			<Eyebrow>Your questions, answered</Eyebrow>
			<Headline>
				The <span className="text-[#ed8936]">9 features</span> we asked you to
				clarify.
			</Headline>
			<Lede>
				These are the items we asked IFPG to clarify before locking the plan,
				along with our reading of each answer and the release each feature
				lands in. Click any question to expand.
			</Lede>

			<div className="mt-10 rounded-2xl bg-white border border-[rgba(26,54,93,0.08)] shadow-[var(--shadow-ifpg-card)] overflow-hidden">
				{featureAnswers.map((item, i) => {
					const isOpen = open === i
					return (
						<motion.div
							key={item.q}
							initial={false}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3, delay: i * 0.04 }}
							className="border-b border-[#edf2f7] last:border-0"
						>
							<button
								type="button"
								onClick={() => setOpen(isOpen ? null : i)}
								className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-[#f7fbff] transition-colors"
								aria-expanded={isOpen}
							>
								<div className="size-7 rounded-full bg-[#ebf8ff] grid place-items-center text-[#3182ce] text-xs font-bold shrink-0">
									{String(i + 1).padStart(2, "0")}
								</div>
								<div className="flex-1 text-[#1a365d] font-semibold text-sm md:text-base">
									{item.q}
								</div>
								<span
									className={cn(
										"text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0",
										phaseColor[item.phase],
									)}
								>
									{item.phase}
								</span>
								<ChevronDown
									className={cn(
										"size-4 text-[#a0aec0] shrink-0 transition-transform duration-200",
										isOpen && "rotate-180 text-[#1a365d]",
									)}
								/>
							</button>
							{isOpen && (
								<motion.div
									initial={false}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.25 }}
									className="px-5 pb-5 pl-[60px] text-sm text-[#4a5568] leading-relaxed"
								>
									{item.a}
								</motion.div>
							)}
						</motion.div>
					)
				})}
			</div>

			<div className="mt-6 text-center text-xs text-[#718096]">
				Full feature-by-feature breakdown in{" "}
				<code className="px-1.5 py-0.5 rounded bg-white text-[#1a365d] text-[11px] font-mono">
					03_HUB_SCOPE.md
				</code>{" "}
				of the plan folder we sent.
			</div>
		</Section>
	)
}
