// utils/activitySimulator.js
// Simulates real-time activity detection for demo purposes

export const SIMULATED_APPS = [
    // Productive apps
    { name: "VS Code", title: "dashboard.js - productivity-assassin", type: "productive", duration: 8 },
    { name: "Chrome", title: "React Documentation - useEffect Hook", type: "productive", duration: 6 },
    { name: "Terminal", title: "npm run web - productivity-assassin", type: "productive", duration: 5 },

    // Distraction apps - Social
    { name: "Chrome", title: "Instagram - Explore", type: "distraction", keyword: "instagram", severity: 8, duration: 4 },
    { name: "Chrome", title: "YouTube - Shorts Feed", type: "distraction", keyword: "reels", severity: 9, duration: 5 },
    { name: "WhatsApp", title: "WhatsApp Web - Messages", type: "distraction", keyword: "whatsapp", severity: 5, duration: 3 },

    // Distraction apps - Gaming
    { name: "PUBG", title: "PUBG Mobile - Lobby", type: "distraction", keyword: "pubg", severity: 10, duration: 7 },
    { name: "Steam", title: "Steam - Library", type: "distraction", keyword: "gaming", severity: 9, duration: 4 },
    { name: "Discord", title: "Discord - #general-chat", type: "distraction", keyword: "discord", severity: 7, duration: 3 },

    // Distraction apps - Entertainment
    { name: "Netflix", title: "Netflix - Continue Watching", type: "distraction", keyword: "netflix", severity: 8, duration: 6 },
    { name: "Chrome", title: "Reddit - r/programming", type: "distraction", keyword: "reddit", severity: 7, duration: 4 },
    { name: "Twitter", title: "Twitter - Home Timeline", type: "distraction", keyword: "twitter", severity: 6, duration: 3 },
];

export class ActivitySimulator {
    constructor(onAppChange) {
        this.onAppChange = onAppChange;
        this.currentIndex = 0;
        this.isRunning = false;
        this.intervalId = null;
        this.cycleCount = 0;
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.cycleCount = 0;

        // Emit initial app immediately
        this.emitCurrentApp();

        // Then start cycling
        this.scheduleNext();
    }

    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }
    }

    scheduleNext() {
        if (!this.isRunning) return;

        const currentApp = SIMULATED_APPS[this.currentIndex];
        const waitTime = currentApp.duration * 1000; // Convert to milliseconds

        this.intervalId = setTimeout(() => {
            this.currentIndex = (this.currentIndex + 1) % SIMULATED_APPS.length;
            this.cycleCount++;
            this.emitCurrentApp();
            this.scheduleNext();
        }, waitTime);
    }

    emitCurrentApp() {
        const app = SIMULATED_APPS[this.currentIndex];

        const payload = {
            taskName: "Current Work Session",
            activeApp: app.name,
            windowTitle: app.title,
            distraction: app.type === "distraction",
            distractionType: app.type === "distraction" ? "keyword-hit" : null,
            distractionKeyword: app.keyword || null,
            severity: app.severity || 0,
            timestamp: new Date().toISOString(),
            cycleNumber: this.cycleCount,
        };

        this.onAppChange(payload);
    }

    getCurrentApp() {
        return SIMULATED_APPS[this.currentIndex];
    }

    skipToNext() {
        if (this.intervalId) {
            clearTimeout(this.intervalId);
        }
        this.currentIndex = (this.currentIndex + 1) % SIMULATED_APPS.length;
        this.cycleCount++;
        this.emitCurrentApp();
        this.scheduleNext();
    }
}

export function detectDistractionFromActivity(activityPayload) {
    if (!activityPayload.distraction) {
        return { distracted: false };
    }

    // Map activity payload to detection result
    return {
        distracted: true,
        keyword: activityPayload.distractionKeyword,
        matches: [activityPayload.distractionKeyword],
        prompt: getPromptForKeyword(activityPayload.distractionKeyword),
        action: getActionForKeyword(activityPayload.distractionKeyword),
        suggestion: getSuggestionForKeyword(activityPayload.distractionKeyword),
        severity: activityPayload.severity,
    };
}

function getPromptForKeyword(keyword) {
    const prompts = {
        instagram: "Stop running to Instagram. You're repeating the same pattern.",
        pubg: "PUBG again? You're burning time you can't get back. Games don't build your future.",
        reels: "Reels are designed to steal your time. Don't let them win.",
        netflix: "Binge-watching won't move your goals forward. Get back to work.",
        discord: "Discord chats won't move your life forward. Focus on what matters.",
        gaming: "Gaming isn't relaxation—it's avoidance. Face what you need to do.",
        reddit: "Reddit rabbit hole again. Snap out of it.",
        twitter: "Quick social check. Move your body instead.",
        whatsapp: "WhatsApp can wait. Your goals can't.",
    };
    return prompts[keyword] || "You drifted away from the work.";
}

function getActionForKeyword(keyword) {
    const actions = {
        instagram: "write_reflection",
        pubg: "stop_gaming",
        reels: "write_reflection",
        netflix: "open_focus_task",
        discord: "limit_chat",
        gaming: "stop_gaming",
        reddit: "open_focus_task",
        twitter: "short_walk",
        whatsapp: "reflect",
    };
    return actions[keyword] || "reflect";
}

function getSuggestionForKeyword(keyword) {
    const suggestions = {
        instagram: "Write a 30-second reflection on why you opened Instagram instead of working.",
        pubg: "Close the game. Write down ONE task you've been avoiding. Do it for 15 minutes.",
        reels: "Close the app. Write down what you were supposed to be doing instead.",
        netflix: "Close Netflix. Open your task list and work for 25 minutes straight.",
        discord: "Close Discord. Mute notifications for the next hour. Get back to work.",
        gaming: "Turn off the game. Set a 25-minute Pomodoro timer and tackle real work.",
        reddit: "Return to your current smallest sub-task for 10 minutes.",
        twitter: "Take a 3-minute walk and come back.",
        whatsapp: "Reply later. Put phone on Do Not Disturb for 30 minutes.",
    };
    return suggestions[keyword] || "Write one sentence: why you split focus just now.";
}

/**
 * Determines if a distraction alert should be triggered
 * Only triggers when:
 * 1. Window name has changed
 * 2. New window is valid
 * 3. Contains distraction keyword or forbidden app
 * 4. Not a duplicate alert
 */
export function shouldTriggerAlert(currentActivity, previousActivity) {
    // Rule 1: Must have valid activity with window title
    if (!currentActivity || !currentActivity.windowTitle || typeof currentActivity.windowTitle !== 'string') {
        console.log(' Invalid activity or window title - skipping alert');
        return false;
    }

    // Rule 2: Window must have changed (compare full window title and app name)
    if (previousActivity && 
        currentActivity.windowTitle === previousActivity.windowTitle &&
        currentActivity.activeApp === previousActivity.activeApp) {
        console.log(' Window unchanged - skipping duplicate alert');
        return false;
    }

    // Rule 3: Must be marked as a distraction
    if (!currentActivity.distraction) {
        console.log(' Productive app - no alert needed');
        return false;
    }

    // Rule 4: YouTube special handling - only trigger on specific keywords
    const titleLower = currentActivity.windowTitle.toLowerCase();
    if (titleLower.includes('youtube')) {
        const youtubeDistractionKeywords = ['reels', 'shorts',  'videos', 'watch'];
        const hasDistractionKeyword = youtubeDistractionKeywords.some(kw => titleLower.includes(kw));
        
        if (!hasDistractionKeyword) {
            console.log(' YouTube without distraction keywords - skipping alert');
            return false;
        }
    }

    // Rule 5: Must have a valid distraction keyword
    if (!currentActivity.distractionKeyword) {
        console.log(' No distraction keyword found - skipping alert');
        return false;
    }

    console.log(' All conditions met - TRIGGERING ALERT for:', currentActivity.distractionKeyword);
    return true;
}


