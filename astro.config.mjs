import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
  srcDir: "./frontend/src",
  publicDir: "./frontend/public",
  output: "server",
  adapter: vercel(),
  trailingSlash: "always",
  site: "https://zeuswriteups.vercel.app",
  vite: {
    server: {
      fs: { deny: ["api"] },
    },
  },
  build: {
    format: "directory",
  },
});
