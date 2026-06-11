import { fileURLToPath, URL } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"
import viteTsConfigPaths from "vite-tsconfig-paths"

const config = defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	nitro: {
		rollupConfig: {
			external: [
				/^@sentry\//,
				/^@opentelemetry\//,
				/^@prisma\/instrumentation/,
			],
		},
	},
	plugins: [
		devtools(),
		nitro(),
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart({
			spa: {
				enabled: true,
			},
		}),
		// React Compiler removed in the v6 upgrade: @vitejs/plugin-react v6
		// dropped the `babel` option. Re-add via reactCompilerPreset +
		// @rolldown/plugin-babel when desired (see plugin-react README).
		viteReact(),
	],
})

export default config
