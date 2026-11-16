export interface ScriptAnalysis {
  isMixedScript: boolean;
  scripts: string[];
  hasNonAscii: boolean;
}

const KNOWN_SCRIPTS: Array<{ name: string; regex: RegExp }> = [
  { name: "Latin", regex: /\p{sc=Latin}/u },
  { name: "Cyrillic", regex: /\p{sc=Cyrillic}/u },
  { name: "Greek", regex: /\p{sc=Greek}/u },
  { name: "Arabic", regex: /\p{sc=Arabic}/u },
  { name: "Hebrew", regex: /\p{sc=Hebrew}/u },
  { name: "Han", regex: /\p{sc=Han}/u },
  { name: "Hiragana", regex: /\p{sc=Hiragana}/u },
  { name: "Katakana", regex: /\p{sc=Katakana}/u },
  { name: "Hangul", regex: /\p{sc=Hangul}/u },
  { name: "Devanagari", regex: /\p{sc=Devanagari}/u },
  { name: "Thai", regex: /\p{sc=Thai}/u },
];

/**
 * Analyze character scripts of a pre-normalized hostname.
 * Punctuation, digits, and common symbols (Common / Inherited) are ignored.
 * Legitimate non-ASCII single-script domains (e.g. all-Cyrillic or all-Arabic)
 * are not flagged as mixed-script.
 */
export function analyzeScripts(hostname: string): ScriptAnalysis {
  const detectedScripts = new Set<string>();
  let hasNonAscii = false;

  for (const ch of hostname) {
    if (ch.charCodeAt(0) > 127) {
      hasNonAscii = true;
    }

    // Ignore Common or Inherited script characters (digits, dots, hyphens, etc.)
    if (/\p{sc=Common}/u.test(ch) || /\p{sc=Inherited}/u.test(ch)) {
      continue;
    }

    let matched = false;
    for (const { name, regex } of KNOWN_SCRIPTS) {
      if (regex.test(ch)) {
        detectedScripts.add(name);
        matched = true;
        break;
      }
    }

    if (!matched && /[^\s]/u.test(ch)) {
      detectedScripts.add("Other");
    }
  }

  const scripts = Array.from(detectedScripts).sort();
  return {
    isMixedScript: scripts.length > 1,
    scripts,
    hasNonAscii,
  };
}
