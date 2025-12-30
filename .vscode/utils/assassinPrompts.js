export function generateAssassinPrompt(profile, sessionMinutes = 25) {
  if (!profile) {
    return "Stay sharp. No profile found — but you know what you're supposed to be doing.";
  }

  const { goal, enemy, weak_time, pattern, pain, ideal_self, mode } = profile;

  const toneTemplates = {
    "Firm (no fluff)": [
      `You said you want "${goal}". Your actions need to match that. Ignore the ${enemy}.`,
      `You know your weak time is ${weak_time}. Don’t let that pattern repeat today.`,
      `Your ideal self — "${ideal_self}" — won’t appear magically. Get back to work.`,
      `Pain doesn’t disappear by avoiding it: ${pain}. Face it.`,
    ],

    "Tough (call you out)": [
      `You talk big about "${goal}", but your biggest enemy — ${enemy} — keeps winning. Fix that.`,
      `You always fall apart around ${weak_time}. Not today.`,
      `This pattern is killing your progress: ${pattern}. Break it.`,
      `You’re running from ${pain}, and you know it. Move.`,
      `"${ideal_self}" is not impressed with you yet. Earn it.`,
    ],

    "Merciless (push hard)": [
      `You said you want "${goal}". Then why does ${enemy} beat you every time? Stand up.`,
      `You crumble at ${weak_time}. Weak. Prove today is different.`,
      `That pathetic loop — "${pattern}" — is the reason you're stuck. Destroy it.`,
      `You're running from ${pain}. Stop hiding. Pain is your fuel now.`,
      `"${ideal_self}" would spit on the version of you that quits after small effort. Keep going.`,
    ],
  };

  const chosen = toneTemplates[mode] || toneTemplates["Tough (call you out)"];

  const line = chosen[Math.floor(Math.random() * chosen.length)];

  return `Session done (${sessionMinutes} minutes).\n\n${line}`;
}
