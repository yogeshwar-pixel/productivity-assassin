// utils/mindfulnessPrompts.js
// Mindfulness and wellbeing prompts

import AsyncStorage from '@react-native-async-storage/async-storage';

const MINDFULNESS_SETTINGS_KEY = 'mindfulness_settings';
const PROMPT_HISTORY_KEY = 'mindfulness_history';

/**
 * Default mindfulness settings
 */
const DEFAULT_SETTINGS = {
    enabled: true,
    frequency: 'medium', // 'low' | 'medium' | 'high'
    duringBreaks: true,
    duringLowIntensity: true,
    suppressDuringFocus: true,
    adaptToStress: true,
    promptTypes: ['breathing', 'posture', 'attention', 'gratitude']
};

/**
 * Mindfulness prompts library
 */
const PROMPTS = {
    breathing: [
        {
            id: 'breath_1',
            title: 'Deep Breath',
            instruction: 'Take 3 slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 4.',
            duration: 20,
            icon: '🫁'
        },
        {
            id: 'breath_2',
            title: 'Box Breathing',
            instruction: 'Breathe in for 4 seconds, hold for 4, out for 4, hold for 4. Repeat 3 times.',
            duration: 30,
            icon: '📦'
        },
        {
            id: 'breath_3',
            title: 'Calm Breathing',
            instruction: 'Close your eyes. Breathe naturally. Notice your breath for 30 seconds.',
            duration: 30,
            icon: '🌊'
        }
    ],
    posture: [
        {
            id: 'posture_1',
            title: 'Posture Check',
            instruction: 'Sit up straight. Roll your shoulders back. Align your head over your spine.',
            duration: 15,
            icon: '🧘'
        },
        {
            id: 'posture_2',
            title: 'Neck Release',
            instruction: 'Gently tilt your head to each side, holding for 5 seconds. Release tension.',
            duration: 20,
            icon: '💆'
        },
        {
            id: 'posture_3',
            title: 'Shoulder Stretch',
            instruction: 'Lift shoulders to ears, squeeze tight, then drop and relax. Repeat 3 times.',
            duration: 15,
            icon: '💪'
        }
    ],
    attention: [
        {
            id: 'attention_1',
            title: 'Reset Focus',
            instruction: 'Look away from screen. Find 3 things you can see, 2 you can hear, 1 you can feel.',
            duration: 20,
            icon: '👁️'
        },
        {
            id: 'attention_2',
            title: 'Present Moment',
            instruction: 'Pause. Notice where you are. What sounds do you hear right now?',
            duration: 15,
            icon: '🎧'
        },
        {
            id: 'attention_3',
            title: 'Intention Reset',
            instruction: 'Ask yourself: What matters most right now? Refocus on that.',
            duration: 10,
            icon: '🎯'
        }
    ],
    gratitude: [
        {
            id: 'gratitude_1',
            title: 'Quick Gratitude',
            instruction: 'Think of one thing you\'re grateful for today. Really feel it.',
            duration: 15,
            icon: '🙏'
        },
        {
            id: 'gratitude_2',
            title: 'Progress Check',
            instruction: 'Notice one thing you\'ve accomplished today, no matter how small.',
            duration: 10,
            icon: '✨'
        },
        {
            id: 'gratitude_3',
            title: 'Self-Appreciation',
            instruction: 'Acknowledge your effort. You\'re doing your best.',
            duration: 10,
            icon: '💚'
        }
    ]
};

/**
 * Get mindfulness settings
 */
export async function getMindfulnessSettings() {
    try {
        const settings = await AsyncStorage.getItem(MINDFULNESS_SETTINGS_KEY);
        return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error loading mindfulness settings:', error);
        return DEFAULT_SETTINGS;
    }
}

/**
 * Update mindfulness settings
 */
export async function updateMindfulnessSettings(updates) {
    const current = await getMindfulnessSettings();
    const updated = { ...current, ...updates };

    try {
        await AsyncStorage.setItem(MINDFULNESS_SETTINGS_KEY, JSON.stringify(updated));
        return updated;
    } catch (error) {
        console.error('Error updating mindfulness settings:', error);
        return current;
    }
}

/**
 * Get random prompt from category
 */
function getRandomPrompt(category) {
    const prompts = PROMPTS[category] || [];
    return prompts[Math.floor(Math.random() * prompts.length)];
}

/**
 * Get prompt based on context
 */
export async function getContextualPrompt(context = {}) {
    const settings = await getMindfulnessSettings();

    if (!settings.enabled) return null;

    const {
        isDuringBreak = false,
        isDuringFocus = false,
        stressLevel = 'low', // 'low' | 'medium' | 'high'
        lastPromptTime = null
    } = context;

    // Don't interrupt focus mode
    if (isDuringFocus && settings.suppressDuringFocus) {
        return null;
    }

    // Check frequency limits
    if (lastPromptTime) {
        const minInterval = getMinInterval(settings.frequency);
        const elapsed = Date.now() - lastPromptTime;
        if (elapsed < minInterval) return null;
    }

    // Select prompt type based on context
    let promptType;

    if (stressLevel === 'high') {
        // High stress - breathing exercises
        promptType = 'breathing';
    } else if (isDuringBreak) {
        // During break - posture or breathing
        promptType = Math.random() < 0.5 ? 'posture' : 'breathing';
    } else {
        // Random from enabled types
        const enabledTypes = settings.promptTypes;
        promptType = enabledTypes[Math.floor(Math.random() * enabledTypes.length)];
    }

    return getRandomPrompt(promptType);
}

/**
 * Get minimum interval between prompts (milliseconds)
 */
function getMinInterval(frequency) {
    switch (frequency) {
        case 'high': return 30 * 60 * 1000; // 30 minutes
        case 'medium': return 60 * 60 * 1000; // 60 minutes
        case 'low': return 120 * 60 * 1000; // 120 minutes
        default: return 60 * 60 * 1000;
    }
}

/**
 * Detect stress signals
 */
export async function detectStressLevel() {
    // Check for stress indicators
    const { getBreakStatistics } = require('./breakReminder');
    const { getCheckInHistory } = require('./checkInManager');

    const [breakStats, recentCheckIns] = await Promise.all([
        getBreakStatistics(1), // Last day
        getCheckInHistory(new Date(Date.now() - 4 * 60 * 60 * 1000), new Date()) // Last 4 hours
    ]);

    let stressScore = 0;

    // High skip streak
    if (breakStats.skipStreak > 2) stressScore += 2;

    // Low break compliance
    if (breakStats.complianceRate < 50) stressScore += 1;

    // Frequent "falling behind" check-ins
    const fallingBehind = recentCheckIns.filter(c => c.status === 'falling-behind').length;
    if (fallingBehind > 2) stressScore += 2;

    // Distracted check-ins
    const distracted = recentCheckIns.filter(c => c.status === 'distracted').length;
    if (distracted > 1) stressScore += 1;

    if (stressScore >= 4) return 'high';
    if (stressScore >= 2) return 'medium';
    return 'low';
}

/**
 * Log prompt shown
 */
export async function logPromptShown(prompt, completed = false) {
    try {
        const historyData = await AsyncStorage.getItem(PROMPT_HISTORY_KEY);
        const history = historyData ? JSON.parse(historyData) : [];

        const entry = {
            id: `prompt_${Date.now()}`,
            promptId: prompt.id,
            type: prompt.title,
            timestamp: new Date().toISOString(),
            completed,
            duration: completed ? prompt.duration : 0
        };

        history.push(entry);

        // Keep last 90 days
        const cutoff = Date.now() - (90 * 24 * 60 * 60 * 1000);
        const filtered = history.filter(e => new Date(e.timestamp) >= cutoff);

        await AsyncStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(filtered));
        return entry;
    } catch (error) {
        console.error('Error logging prompt:', error);
        return null;
    }
}

/**
 * Get mindfulness statistics
 */
export async function getMindfulnessStats(days = 7) {
    try {
        const historyData = await AsyncStorage.getItem(PROMPT_HISTORY_KEY);
        const history = historyData ? JSON.parse(historyData) : [];

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const recent = history.filter(e => new Date(e.timestamp) >= cutoff);
        const completed = recent.filter(e => e.completed);

        const totalTime = completed.reduce((sum, e) => sum + (e.duration || 0), 0);

        return {
            totalPrompts: recent.length,
            completed: completed.length,
            skipped: recent.length - completed.length,
            completionRate: recent.length > 0
                ? Math.round((completed.length / recent.length) * 100)
                : 0,
            totalMinutes: Math.round(totalTime / 60),
            averageDuration: completed.length > 0
                ? Math.round(totalTime / completed.length)
                : 0
        };
    } catch (error) {
        console.error('Error getting mindfulness stats:', error);
        return {
            totalPrompts: 0,
            completed: 0,
            skipped: 0,
            completionRate: 0,
            totalMinutes: 0,
            averageDuration: 0
        };
    }
}
