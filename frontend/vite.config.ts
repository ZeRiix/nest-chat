import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import autoImport from "unplugin-auto-import/vite";
import autoImportComponents from "unplugin-vue-components/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import vueComplexTypes from "@vue.ts/complex-types/vite";

// https://vite.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	plugins: [
		vue(),
		tailwindcss(),
		autoImport({
			dirs: [
				"src/composables",
				"src/domains/**/router.ts",
				"src/libs/zod/index.ts",
				"src/router/createPage.ts",
			],
			imports: [
				"vue",
				"vue-router",
			],
			ignore: ["_**"],
			vueTemplate: true,
		}),
		autoImportComponents({
			dirs: ["src/components"],
			resolvers: [],
		}),
		tsconfigPaths(),
		vueComplexTypes(),
	],
	server: {
		host: "0.0.0.0",
		port: 3000,
	},
	optimizeDeps: {
		force: true,
	},
});
