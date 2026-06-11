import { motion } from "motion/react"
import { Calendar, Database, Layers } from "lucide-react"
import { Eyebrow, Headline, Lede, Section } from "../section"
import { timingPoints } from "@/lib/pitch-data"

const icons = [Layers, Calendar, Database]

export function Fomo() {
	return (
		<Section id="fomo" tone="navy">
			<Eyebrow tone="white">Timing rationale</Eyebrow>
			<Headline className="text-white">
				Why this window works,{" "}
				<span className="text-[#ecc94b]">not a hard deadline</span>.
			</Headline>
			<Lede className="text-white/80">
				A few things make the next few months a natural starting window for Hub.
				None of them are ultimatums; they're just the reasons we'd pick this
				start date if it fits IFPG's calendar.
			</Lede>

			<div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
				{timingPoints.map((p, i) => {
					const Icon = icons[i]
					return (
						<motion.div
							key={p.title}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: i * 0.1 }}
							className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6"
						>
							<div className="size-10 rounded-[10px] bg-white/10 border border-white/15 grid place-items-center text-[#ecc94b] mb-4">
								<Icon className="size-5" strokeWidth={1.75} />
							</div>
							<div className="text-lg font-semibold text-white leading-snug">
								{p.title}
							</div>
							<p className="text-sm text-white/70 mt-2 leading-relaxed">
								{p.body}
							</p>
						</motion.div>
					)
				})}
			</div>

			<div className="mt-8 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5 text-sm text-white/80 leading-relaxed max-w-3xl">
				If IFPG's calendar prefers a later start, we adjust. The Atlas
				engagement continues regardless, and Hub's plan slides accordingly.
				Nothing in this plan depends on a specific calendar week.
			</div>
		</Section>
	)
}
