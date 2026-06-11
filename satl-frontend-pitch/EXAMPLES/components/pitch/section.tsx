import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Section({
	id,
	children,
	className,
	tone = "light",
}: {
	id: string
	children: ReactNode
	className?: string
	tone?: "light" | "navy" | "cream" | "ink"
}) {
	const toneClass = {
		light: "bg-[#f7f9fc] text-[#1a365d]",
		navy: "navy-gradient text-white",
		cream: "bg-[#fffaf0] text-[#1a365d]",
		ink: "bg-[#0d1b2f] text-white",
	}[tone]

	return (
		<section
			id={id}
			data-section={id}
			className={cn(
				"min-h-screen w-full snap-start flex items-center justify-center px-6 md:px-16 py-20 relative overflow-hidden",
				toneClass,
				className,
			)}
		>
			<div className="max-w-6xl w-full">{children}</div>
		</section>
	)
}

export function Eyebrow({
	children,
	className,
	tone = "blue",
}: {
	children: ReactNode
	className?: string
	tone?: "blue" | "white" | "gold"
}) {
	const toneClass = {
		blue: "text-[#3182ce]",
		white: "text-white/70",
		gold: "text-[#d69e2e]",
	}[tone]

	return (
		<div
			className={cn(
				"text-xs uppercase tracking-[0.18em] font-semibold mb-3",
				toneClass,
				className,
			)}
		>
			{children}
		</div>
	)
}

export function Headline({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return (
		<h2
			className={cn(
				"text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-tight",
				className,
			)}
		>
			{children}
		</h2>
	)
}

export function Lede({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return (
		<p
			className={cn(
				"text-[clamp(1rem,1.4vw,1.25rem)] leading-relaxed text-[#4a5568] max-w-2xl mt-4",
				className,
			)}
		>
			{children}
		</p>
	)
}

export function BigStat({
	value,
	label,
	className,
	tone = "navy",
}: {
	value: ReactNode
	label: ReactNode
	className?: string
	tone?: "navy" | "orange" | "white" | "green"
}) {
	const toneClass = {
		navy: "text-[#1a365d]",
		orange: "text-[#ed8936]",
		white: "text-white",
		green: "text-[#38a169]",
	}[tone]

	return (
		<div className={cn("flex flex-col", className)}>
			<div className={cn("text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-none tracking-tight", toneClass)}>
				{value}
			</div>
			<div className="text-sm md:text-base text-[#4a5568] mt-2 font-medium">
				{label}
			</div>
		</div>
	)
}
