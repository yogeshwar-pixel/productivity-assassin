// app/utils/redirectionPrompts.js

export const REDIRECTION_MAP = {
  pubg: {
    action: "stop_gaming",
    message: "PUBG again? You're burning time you can't get back. Games don't build your future.",
    suggestion: "Close the game. Write down ONE task you've been avoiding. Do it for 15 minutes.",
  },
  gaming: {
    action: "stop_gaming",
    message: "Gaming isn't relaxation—it's avoidance. Face what you need to do.",
    suggestion: "Turn off the game. Set a 25-minute Pomodoro timer and tackle real work.",
  },
  games: {
    action: "stop_gaming",
    message: "Games give you fake progress. Real progress requires real work.",
    suggestion: "Exit the game. Work on your actual goals for the next 20 minutes.",
  },
  discord: {
    action: "limit_chat",
    message: "Discord chats won't move your life forward. Focus on what matters.",
    suggestion: "Close Discord. Mute notifications for the next hour. Get back to work.",
  },
  instagram: {
    action: "write_reflection",
    message: "Stop running to \"instagram\". You're repeating the same pattern.",
    suggestion: "Write a 30-second reflection on why you opened Instagram instead of working.",
  },
  reels: {
    action: "write_reflection",
    message: "Reels are designed to steal your time. Don't let them win.",
    suggestion: "Close the app. Write down what you were supposed to be doing instead.",
  },
  youtube: {
    action: "open_learning",
    message: "You drifted to YouTube. Redirect to something useful.",
    suggestion: "Open a 5-minute tutorial related to your goal.",
  },
  reddit: {
    action: "open_focus_task",
    message: "Reddit rabbit hole again. Snap out of it.",
    suggestion: "Return to your current smallest sub-task for 10 minutes.",
  },
  twitter: {
    action: "short_walk",
    message: "Quick social check. Move your body instead.",
    suggestion: "Take a 3-minute walk and come back.",
  },
  // fallback
  default: {
    action: "reflect",
    message: "You drifted away from the work.",
    suggestion: "Write one sentence: why you split focus just now.",
  },
};

export function getRedirectionMessage(keyword) {
  if (!keyword) return REDIRECTION_MAP.default;
  const k = keyword.toLowerCase();
  return REDIRECTION_MAP[k] || REDIRECTION_MAP.default;
}
