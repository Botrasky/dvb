/// <reference types="astro/client" />

// psl 1.15.0 ships declarations but omits them from its export map.
declare module "psl" {
  export const parse: typeof import("../../node_modules/psl/types/index.d.ts").parse;
}
