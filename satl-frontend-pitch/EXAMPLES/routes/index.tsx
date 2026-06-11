import { createFileRoute } from "@tanstack/react-router"
import { DeckShell } from "@/components/pitch/deck-shell"
import { Cover } from "@/components/pitch/sections/01-cover"
import { Solution } from "@/components/pitch/sections/03-solution"
import { Ecosystem } from "@/components/pitch/sections/03b-ecosystem"
import { Architecture } from "@/components/pitch/sections/04-architecture"
import { Scope } from "@/components/pitch/sections/06-scope"
import { Features } from "@/components/pitch/sections/07-features"
import { Timeline } from "@/components/pitch/sections/08-timeline"
import { Team } from "@/components/pitch/sections/09-team"
import { Risks } from "@/components/pitch/sections/10-risks"
import { Fomo } from "@/components/pitch/sections/11-fomo"
import { Ask } from "@/components/pitch/sections/12-ask"
import { Close } from "@/components/pitch/sections/13-close"

export const Route = createFileRoute("/")({ component: PitchDeck })

function PitchDeck() {
	return (
		<DeckShell>
			<Cover />
			<Solution />
			<Ecosystem />
			<Architecture />
			<Scope />
			<Features />
			<Timeline />
			<Team />
			<Risks />
			<Fomo />
			<Ask />
			<Close />
		</DeckShell>
	)
}
