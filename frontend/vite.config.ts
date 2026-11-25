import { fileURLToPath, URL } from "node:url";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type UserConfig } from "vite";

type TestConfig = UserConfig & {
	test: {
		environment: "jsdom";
		setupFiles: string[];
	};
};

export default defineConfig(
	({ mode }): TestConfig => ({
		plugins: mode === "test" ? [] : [tailwindcss(), reactRouter()],
		resolve: {
			alias: {
				"~": fileURLToPath(new URL("./app", import.meta.url)),
			},
			tsconfigPaths: true,
		},
		test: {
			environment: "jsdom",
			setupFiles: ["./app/test/setup.ts"],
		},
		// .env file is in the root directory
		envDir: "..",
	}),
);
