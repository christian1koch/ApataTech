import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { saveRulesMock } from "./mock-server/saveRules.ts";

export default defineConfig({
	plugins: [react(), tailwindcss(), saveRulesMock()],
});
