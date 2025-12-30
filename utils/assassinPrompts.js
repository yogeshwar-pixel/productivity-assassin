// app/utils/assassinPrompts.js
export function generateAssassinPrompt(profile, sessionMinutes = 25) {
  if (!profile) {
    return `Session done (${sessionMinutes} minutes). Stay sharp.`;
  }

  const {
    goal = "your goal",
    enemy = "distraction",
    weak_time = "that time",
    pattern = "that pattern",
    ideal_self = "disciplined you",
    pain = "that pain",
    mode,
  } = profile;

  const tone = mode || "Tough (call you out)";

  const toneTemplates = {
    "Firm (no fluff)": [
      `Another ${sessionMinutes} minutes done. Your goal: "${goal}". Keep moving.`,
      `Your enemy: "${enemy}". Did you beat it now or later?`,
      `You said you fall at "${weak_time}". Don’t repeat it.`,
    ],
    "Tough (call you out)": [
      `You said your enemy is "${enemy}". Fight it — don’t let it fight you.`,
      `Stop the pattern: "${pattern}". That’s wasting your time.`,
      `"${ideal_self}" won’t show up by accident. Show up for them.`,
      `If you're avoiding "${pain}", turn that into fuel.`,
    ],
    "Merciless (push hard)": [
      `You promised "${goal}". Stop making excuses — earn it.`,
      `Weakness window: "${weak_time}". Control it or get controlled.`,
      `Break "${pattern}" today. No excuses.`,
      `"${ideal_self}" is a result, not a wish.`,
      `If "${pain}" is your fuel, burn it into action.`,
    ],
  };

  const chosen = toneTemplates[tone] || toneTemplates["Tough (call you out)"];
  const line = chosen[Math.floor(Math.random() * chosen.length)];
  return `Session done (${sessionMinutes} minutes).\n\n${line}`;
}
