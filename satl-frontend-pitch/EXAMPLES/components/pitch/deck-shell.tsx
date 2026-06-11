"use client"

import { Link } from "@tanstack/react-router"
import { LayoutGrid, Play } from "lucide-react"
import { useEffect, useState } from "react"
import { sections, type SectionId } from "@/lib/pitch-data"
import { cn } from "@/lib/utils"

export function DeckShell({ children }: { children: React.ReactNode }) {
	const [active, setActive] = useState<SectionId>("cover")

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
						const id = entry.target.getAttribute("data-section") as SectionId
						if (id) setActive(id)
					}
				}
			},
			{ threshold: [0.5, 0.7, 0.9] },
		)

		for (const el of document.querySelectorAll<HTMLElement>("[data-section]")) {
			observer.observe(el)
		}
		return () => observer.disconnect()
	}, [])

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement
			if (
				target &&
				(target.tagName === "INPUT" || target.tagName === "TEXTAREA")
			)
				return

			const currentIdx = sections.findIndex((s) => s.id === active)
			let nextIdx: number | null = null

			if (
				e.key === "ArrowDown" ||
				e.key === "PageDown" ||
				e.key === " " ||
				e.key === "j"
			) {
				nextIdx = Math.min(sections.length - 1, currentIdx + 1)
			} else if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "k") {
				nextIdx = Math.max(0, currentIdx - 1)
			} else if (e.key === "Home") {
				nextIdx = 0
			} else if (e.key === "End") {
				nextIdx = sections.length - 1
			}

			if (nextIdx !== null && nextIdx !== currentIdx) {
				e.preventDefault()
				const next = document.querySelector(
					`[data-section="${sections[nextIdx].id}"]`,
				)
				if (next instanceof HTMLElement) {
					next.scrollIntoView({ behavior: "smooth", block: "start" })
				}
			}
		}

		window.addEventListener("keydown", handler)
		return () => window.removeEventListener("keydown", handler)
	}, [active])

	const jumpTo = (id: SectionId) => {
		const target = document.querySelector(`[data-section="${id}"]`)
		if (target instanceof HTMLElement) {
			target.scrollIntoView({ behavior: "smooth", block: "start" })
		}
	}

	const activeIdx = sections.findIndex((s) => s.id === active)

	return (
		<>
			<style>{`
				html, body { scroll-snap-type: y mandatory; scroll-behavior: smooth; }
			`}</style>

			{/* Top bar */}
			<header className="fixed top-0 left-0 right-0 z-30 backdrop-blur-md bg-white/70 border-b border-[rgba(26,54,93,0.08)] h-14 flex items-center px-6">
				<div className="flex items-center gap-2.5">
					<div className="size-7 rounded-[8px] navy-gradient grid place-items-center">
						<span className="text-white text-[10px] font-bold tracking-tight">
							IF
						</span>
					</div>
					<div className="leading-tight">
						<div className="text-sm font-bold tracking-tight text-[#1a365d]">
							IFPG Hub
						</div>
						<div className="text-[10px] uppercase tracking-[0.14em] text-[#718096]">
							v1 plan · May 2026
						</div>
					</div>
				</div>
				<div className="flex-1" />
				<div className="hidden md:flex items-center gap-1 mr-4">
					<Link
						to="/modules"
						className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#4a5568] hover:bg-[#f1f5fa] hover:text-[#1a365d] transition-colors"
					>
						<LayoutGrid className="size-3.5" />
						<span>19 modules</span>
					</Link>
					<Link
						to="/scenarios"
						className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#4a5568] hover:bg-[#f1f5fa] hover:text-[#1a365d] transition-colors"
					>
						<Play className="size-3.5" />
						<span>Scenarios</span>
					</Link>
				</div>
				<div className="hidden lg:flex items-center gap-2 text-xs text-[#718096] mr-3">
					<kbd className="px-1.5 py-0.5 rounded bg-white border border-[#e2e8f0] font-mono text-[10px]">
						↑
					</kbd>
					<kbd className="px-1.5 py-0.5 rounded bg-white border border-[#e2e8f0] font-mono text-[10px]">
						↓
					</kbd>
				</div>
				<div className="text-xs text-[#4a5568] font-mono">
					<span className="text-[#1a365d] font-semibold">
						{String(activeIdx + 1).padStart(2, "0")}
					</span>
					<span className="text-[#cbd5e0]">
						{" "}
						/ {String(sections.length).padStart(2, "0")}
					</span>
				</div>
			</header>

			{/* Side dots */}
			<nav
				aria-label="Section navigation"
				className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-2"
			>
				{sections.map((s, i) => {
					const isActive = s.id === active
					return (
						<button
							key={s.id}
							type="button"
							onClick={() => jumpTo(s.id)}
							className="group flex items-center gap-2 justify-end"
							aria-label={`Go to ${s.label}`}
							aria-current={isActive ? "true" : undefined}
						>
							<span
								className={cn(
									"text-xs font-medium transition-all duration-200 px-2 py-0.5 rounded bg-white/80 backdrop-blur-sm",
									isActive
										? "text-[#1a365d] opacity-100"
										: "text-[#718096] opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0",
								)}
							>
								{s.label}
							</span>
							<span
								className={cn(
									"size-2 rounded-full transition-all duration-300",
									isActive
										? "bg-[#1a365d] scale-150"
										: "bg-[#cbd5e0] group-hover:bg-[#1a365d]",
								)}
							/>
							<span className="sr-only">
								{i + 1} · {s.label}
							</span>
						</button>
					)
				})}
			</nav>

			{children}
		</>
	)
}
