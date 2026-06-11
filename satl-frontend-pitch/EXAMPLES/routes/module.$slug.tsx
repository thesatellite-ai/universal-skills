import { createFileRoute, notFound } from "@tanstack/react-router"
import { ModulePage } from "@/components/pitch/module-page"
import { getModule } from "@/lib/module-data"

export const Route = createFileRoute("/module/$slug")({
	component: ModuleRoute,
})

function ModuleRoute() {
	const { slug } = Route.useParams()
	const module = getModule(slug)
	if (!module) {
		throw notFound()
	}
	return <ModulePage module={module} />
}
