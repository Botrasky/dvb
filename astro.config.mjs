import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  trailingSlash: "always",
  site: "https://botrasky.github.io",
  vite: {
    server: {
      fs: { deny: ["api"] },
    },
  },
  build: {
    format: "directory",
  },
});
