import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  trailingSlash: "always",
  site: "https://vathanakbotra.vercel.app",
  vite: {
    server: {
      fs: { deny: ["api"] },
    },
  },
  build: {
    format: "directory",
  },
});
