import { Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { ArrowDown, LayoutGrid, Play } from "lucide-react"
import { Section } from "../section"
import { meta } from "@/lib/pitch-data"

export function Cover() {
	return (
		<Section id="cover" tone="ink" className="relative">
			{/* Animated background grid */}
			<div className="absolute inset-0 opacity-[0.06] pointer-events-none">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage:
							"linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
						backgroundSize: "44px 44px",
					}}
				/>
			</div>
			{/* Glow */}
			<div className="absolute -top-40 -right-40 size-[600px] rounded-full bg-[#3182ce]/20 blur-[120px] pointer-events-none" />
			<div className="absolute -bottom-40 -left-40 size-[500px] rounded-full bg-[#ed8936]/15 blur-[100px] pointer-events-none" />

			<div className="relative">
				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
					className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm"
				>
					<span className="size-1.5 rounded-full bg-[#48bb78] animate-pulse-subtle" />
					<span className="text-xs uppercase tracking-[0.16em] text-white/80 font-semibold">
						Plan and roadmap · May 2026
					</span>
				</motion.div>

				<motion.h1
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.2 }}
					className="mt-8 text-[clamp(3.5rem,9vw,7.5rem)] font-bold leading-[0.92] tracking-tight"
				>
					{meta.productName}
				</motion.h1>

				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.35 }}
					className="mt-3 text-[clamp(1.5rem,3vw,2.5rem)] font-light text-white/70 leading-tight max-w-3xl"
				>
					<span className="text-white font-medium relative">
						Development plan and roadmap
						<span className="absolute -bottom-1 left-0 right-0 h-[3px] cta-gradient rounded-full" />
					</span>
					.
				</motion.div>

				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.5 }}
					className="mt-12 flex flex-wrap items-center gap-6 text-white/80"
				>
					<div>
						<div className="text-xs uppercase tracking-[0.14em] text-white/50 font-semibold">
							From
						</div>
						<div className="text-base font-medium mt-1">Solverhood team</div>
					</div>
					<div className="w-px h-8 bg-white/15 hidden sm:block" />
					<div>
						<div className="text-xs uppercase tracking-[0.14em] text-white/50 font-semibold">
							v1 target
						</div>
						<div className="text-base font-medium mt-1">Sept 30, 2026</div>
					</div>
				</motion.div>

				<motion.div
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8, delay: 0.7 }}
					className="mt-12 flex flex-wrap gap-2"
				>
					<Link
						to="/modules"
						className="group flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-sm px-4 py-2 text-sm text-white transition-all hover:-translate-y-0.5"
					>
						<LayoutGrid className="size-4 text-[#ecc94b]" strokeWidth={1.75} />
						<span>
							<span className="font-semibold">19 modules</span>
							<span className="text-white/60"> · full deep dives</span>
						</span>
					</Link>
					<Link
						to="/scenarios"
						className="group flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-sm px-4 py-2 text-sm text-white transition-all hover:-translate-y-0.5"
					>
						<Play className="size-4 text-[#ecc94b]" strokeWidth={1.75} />
						<span>
							<span className="font-semibold">4 scenarios</span>
							<span className="text-white/60"> · Hub + Atlas</span>
						</span>
					</Link>
				</motion.div>

				<motion.div
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ duration: 1, delay: 1.5 }}
					className="mt-10 inline-flex items-center gap-2 text-sm text-white/50"
				>
					<ArrowDown className="size-4 animate-pulse-subtle" />
					Scroll or press{" "}
					<kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 font-mono text-[10px]">
						↓
					</kbd>{" "}
					to begin
				</motion.div>
			</div>
		</Section>
	)
}
