/// <reference types="astro/client" />

declare module "punycode/punycode.js" {
  const punycode: { toUnicode(input: string): string };
  export default punycode;
}

// psl 1.15.0 ships declarations but omits them from its export map.
declare module "psl" {
  export const parse: typeof import("../../node_modules/psl/types/index.d.ts").parse;
}
