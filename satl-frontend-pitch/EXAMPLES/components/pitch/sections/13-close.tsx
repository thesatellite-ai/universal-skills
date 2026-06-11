import { motion } from "motion/react"
import { Section } from "../section"
import { closeContact, meta } from "@/lib/pitch-data"

export function Close() {
	return (
		<Section id="close" tone="ink" className="relative">
			<div className="absolute -top-40 -right-40 size-[600px] rounded-full bg-[#ed8936]/15 blur-[120px] pointer-events-none" />
			<div className="absolute -bottom-40 -left-40 size-[600px] rounded-full bg-[#3182ce]/15 blur-[120px] pointer-events-none" />

			<div className="relative text-center max-w-3xl mx-auto">
				<motion.h2
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
					className="text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[0.98] tracking-tight"
				>
					Thanks for going through this.
				</motion.h2>

				<motion.p
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.25 }}
					className="mt-6 text-lg text-white/70 leading-relaxed"
				>
					{closeContact.next}
				</motion.p>

				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="mt-12 inline-flex flex-col items-center gap-1"
				>
					<div className="text-xs uppercase tracking-[0.16em] text-white/50 font-semibold">
						From
					</div>
					<div className="text-base font-medium text-white">
						{closeContact.from}
					</div>
				</motion.div>

				<motion.div
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8, delay: 0.8 }}
					className="mt-16 text-sm text-white/40"
				>
					{meta.productName} · {meta.tagline}
				</motion.div>
			</div>
		</Section>
	)
}
