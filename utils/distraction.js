// app/utils/distraction.js
import { detectKeywords } from "./keywordEngine";
import { getRedirectionMessage } from "./redirectionPrompts";

const COMMON_EXTRA_KEYWORDS = [
  "instagram",
  "reels",
  "youtube",
  "reddit",
  "twitter",
  "tiktok",
  "facebook",
  "netflix",
  "chatgpt",
  "whatsapp",
  "pubg", // Added PUBG as required
  "gaming",
  "games",
  "discord",
];

// Severity scoring: assign weights to different distractions
const SEVERITY_MAP = {
  pubg: 10,
  gaming: 9,
  games: 9,
  instagram: 8,
  reels: 9,
  tiktok: 9,
  youtube: 7,
  netflix: 8,
  facebook: 6,
  twitter: 6,
  reddit: 7,
  chatgpt: 5,
  whatsapp: 5,
  discord: 7,
};

export async function detectDistraction(text, profile = null) {
  // collect user keywords from profile (if available)
  const userKeywords = [];
  if (profile) {
    // assume profile has fields like 'pattern' and 'enemy' that may contain words
    if (profile.pattern) userKeywords.push(...profile.pattern.split(/\W+/).filter(Boolean));
    if (profile.enemy) userKeywords.push(...profile.enemy.split(/\W+/).filter(Boolean));
    if (profile.weak_time) userKeywords.push(...profile.weak_time.split(/\W+/).filter(Boolean));
  }

  const result = detectKeywords(text, { userKeywords, extra: COMMON_EXTRA_KEYWORDS });

  if (!result.found) {
    return { distracted: false };
  }

  const keyword = result.keyword;
  const redirect = getRedirectionMessage(keyword);

  // Calculate severity score (1-10, higher = more severe)
  const severityScore = SEVERITY_MAP[keyword.toLowerCase()] || 5;

  // Create a prompt (basic) — feel free to upgrade with AI call
  const prompt = redirect.message;
  const action = redirect.action;
  const suggestion = redirect.suggestion;

  return {
    distracted: true,
    keyword,
    matches: result.matches,
    prompt,
    action,
    suggestion,
    severity: severityScore, // Added severity scoring
  };
}
