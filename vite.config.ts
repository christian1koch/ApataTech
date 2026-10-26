import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { saveRulesMock } from "./mock-server/saveRules.ts";

export default defineConfig({
	plugins: [react(), tailwindcss(), saveRulesMock()],
	test: {
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		// Playwright runs the specs in e2e/
		include: ["src/**/*.test.{ts,tsx}"],
		coverage: {
			provider: "v8",
			include: ["src/**/*.{ts,tsx}"],
			exclude: ["src/**/*.test.{ts,tsx}", "src/test/**", "src/main.tsx"],
			reporter: ["text", "html"],
		},
	},
});
