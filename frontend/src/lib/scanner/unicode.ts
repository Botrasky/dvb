import punycode from "punycode/punycode.js";
import { CONFUSABLES } from "./unicode-data/confusables.ts";

/** Unicode 16.0.0 UTS#39 skeleton transform. This is only confusable matching. */
export function confusableSkeleton(label: string): string {
  const unicode = punycode.toUnicode(label).normalize("NFD");
  return [...unicode]
    .map((character) => CONFUSABLES[character] ?? character)
    .join("")
    .normalize("NFD");
}
