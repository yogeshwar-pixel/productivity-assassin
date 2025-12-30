// app/utils/keywordEngine.js

// simple normalize
function normalize(s) {
  if (!s) return "";
  return s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").trim();
}

/**
 * detectKeywords(text, options)
 * options:
 *   - userKeywords: array of strings
 *   - extra: array of strings
 * returns { found: boolean, keyword: string|null, matches: [..] }
 */
export function detectKeywords(text = "", { userKeywords = [], extra = [] } = {}) {
  const normalized = normalize(text);
  const tokens = normalized.split(/\s+/).filter(Boolean);

  // prepare keyword list: prefer longer phrases first
  const allKeywords = [...new Set([...(userKeywords || []), ...(extra || [])])]
    .map((k) => String(k || "").toLowerCase().trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  const matches = [];

  for (const kw of allKeywords) {
    const nkw = normalize(kw);
    if (!nkw) continue;
    // check phrase contains or tokens includes
    if (normalized.includes(nkw) || tokens.includes(nkw)) {
      matches.push(kw);
    }
  }

  return {
    found: matches.length > 0,
    keyword: matches[0] || null,
    matches,
  };
}
