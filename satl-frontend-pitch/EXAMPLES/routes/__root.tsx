import type { RouterUtils } from "@orpc/tanstack-query"
import { TanStackDevtools } from "@tanstack/react-devtools"
import type { QueryClient } from "@tanstack/react-query"
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query"
import { Toaster } from "sonner"
import type { ORPCClient } from "@/integrations/orpc/react"
import type { TRPCRouter } from "@/integrations/trpc/routers"
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools"
import { Provider } from "../integrations/tanstack-query/root-provider"
import appCss from "../styles.css?url"

interface MyRouterContext {
	queryClient: QueryClient
	trpc: TRPCOptionsProxy<TRPCRouter>
	orpc: RouterUtils<ORPCClient>
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "IFPG Hub · Development plan and roadmap",
			},
			{
				name: "description",
				content:
					"Development plan and roadmap for IFPG Hub. Modules, architecture, timeline, and team — Solverhood team, May 2026.",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap",
			},
		],
	}),

	component: RootComponent,
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
})

function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
			<h1 className="text-4xl font-bold text-[#1a365d]">404</h1>
			<p className="text-lg text-[#4a5568]">Page not found</p>
			<Link
				to="/"
				className="text-[#3182ce] hover:underline font-medium"
			>
				Go back to the Dash
			</Link>
		</div>
	)
}

function RootComponent() {
	const { queryClient } = Route.useRouteContext()
	return (
		<Provider queryClient={queryClient}>
			<Outlet />
		</Provider>
	)
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Toaster richColors position="top-right" closeButton />
				<TanStackDevtools
					config={{ position: "bottom-right" }}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	)
}
