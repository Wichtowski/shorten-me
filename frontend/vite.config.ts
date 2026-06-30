import { existsSync } from "node:fs";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import vinext from "vinext";

const localWranglerConfigPath = "wrangler.local.jsonc";

export default defineConfig(({ command }) => {
  const configPath =
    command === "serve" && existsSync(localWranglerConfigPath)
      ? localWranglerConfigPath
      : undefined;

  return {
    build: {
      rolldownOptions: {
        external: ["cloudflare:workers"]
      }
    },
    plugins: [
      vinext(),
      cloudflare({
        configPath,
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] }
      })
    ]
  };
});
