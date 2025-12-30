// utils/breakReminder.js
// Smart break reminder system

import AsyncStorage from '@react-native-async-storage/async-storage';

const BREAK_SETTINGS_KEY = 'break_reminder_settings';
const BREAK_HISTORY_KEY = 'break_history';

/**
 * Default break reminder settings
 */
const DEFAULT_SETTINGS = {
    enabled: true,
    shortBreakInterval: 25, // minutes
    longBreakInterval: 90, // minutes
    shortBreakDuration: 5, // minutes
    longBreakDuration: 15, // minutes
    allowSnooze: true,
    maxSnoozes: 2,
    snoozeMinutes: 5,
    suppressNearCompletion: true,
    suppressThresholdPercent: 90, // Don't remind if session >90% done
    reminderSound: true,
    trackSkips: true
};

/**
 * Get break reminder settings
 */
export async function getBreakSettings() {
    try {
        const settings = await AsyncStorage.getItem(BREAK_SETTINGS_KEY);
        return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error loading break settings:', error);
        return DEFAULT_SETTINGS;
    }
}

/**
 * Update break settings
 */
export async function updateBreakSettings(updates) {
    const current = await getBreakSettings();
    const updated = { ...current, ...updates };

    try {
        await AsyncStorage.setItem(BREAK_SETTINGS_KEY, JSON.stringify(updated));
        return updated;
    } catch (error) {
        console.error('Error updating break settings:', error);
        return current;
    }
}

/**
 * Check if break is due
 */
export async function isBreakDue(sessionStartTime, sessionDuration) {
    const settings = await getBreakSettings();
    if (!settings.enabled) return { isDue: false };

    const now = Date.now();
    const elapsed = Math.floor((now - sessionStartTime) / (1000 * 60)); // minutes

    // Check if we should suppress (near completion)
    if (settings.suppressNearCompletion && sessionDuration) {
        const progress = (elapsed / sessionDuration) * 100;
        if (progress >= settings.suppressThresholdPercent) {
            return {
                isDue: false,
                reason: 'Session near completion',
                progress
            };
        }
    }

    // Check for long break
    if (elapsed >= settings.longBreakInterval) {
        return {
            isDue: true,
            type: 'long',
            duration: settings.longBreakDuration,
            elapsed
        };
    }

    // Check for short break
    if (elapsed >= settings.shortBreakInterval && elapsed % settings.shortBreakInterval === 0) {
        return {
            isDue: true,
            type: 'short',
            duration: settings.shortBreakDuration,
            elapsed
        };
    }

    return { isDue: false, elapsed };
}

/**
 * Log break action
 */
export async function logBreakAction(action) {
    try {
        const historyData = await AsyncStorage.getItem(BREAK_HISTORY_KEY);
        const history = historyData ? JSON.parse(historyData) : [];

        const entry = {
            id: `break_${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: action.type, // 'taken', 'skipped', 'snoozed'
            breakType: action.breakType, // 'short' | 'long'
            duration: action.duration,
            sessionElapsed: action.sessionElapsed,
            reason: action.reason || null
        };

        history.push(entry);

        // Keep last 90 days
        const cutoff = Date.now() - (90 * 24 * 60 * 60 * 1000);
        const filtered = history.filter(e => new Date(e.timestamp) >= cutoff);

        await AsyncStorage.setItem(BREAK_HISTORY_KEY, JSON.stringify(filtered));
        return entry;
    } catch (error) {
        console.error('Error logging break action:', error);
        return null;
    }
}

/**
 * Record break taken
 */
export async function recordBreakTaken(breakType, duration) {
    return await logBreakAction({
        type: 'taken',
        breakType,
        duration
    });
}

/**
 * Record break skipped
 */
export async function recordBreakSkipped(breakType, reason = null) {
    return await logBreakAction({
        type: 'skipped',
        breakType,
        duration: 0,
        reason
    });
}

/**
 * Record break snoozed
 */
export async function recordBreakSnoozed(breakType, snoozeMinutes) {
    return await logBreakAction({
        type: 'snoozed',
        breakType,
        duration: snoozeMinutes,
        reason: 'User snoozed'
    });
}

/**
 * Get break history
 */
export async function getBreakHistory(days = 30) {
    try {
        const historyData = await AsyncStorage.getItem(BREAK_HISTORY_KEY);
        const history = historyData ? JSON.parse(historyData) : [];

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return history.filter(e => new Date(e.timestamp) >= cutoff);
    } catch (error) {
        console.error('Error getting break history:', error);
        return [];
    }
}

/**
 * Get break statistics
 */
export async function getBreakStatistics(days = 7) {
    const history = await getBreakHistory(days);

    const taken = history.filter(e => e.action === 'taken');
    const skipped = history.filter(e => e.action === 'skipped');
    const snoozed = history.filter(e => e.action === 'snoozed');

    const totalBreakTime = taken.reduce((sum, e) => sum + (e.duration || 0), 0);

    const complianceRate = history.length > 0
        ? Math.round((taken.length / history.length) * 100)
        : 100;

    return {
        totalBreaks: history.length,
        breaksTaken: taken.length,
        breaksSkipped: skipped.length,
        breaksSnoozed: snoozed.length,
        totalBreakMinutes: totalBreakTime,
        complianceRate,
        averageBreakDuration: taken.length > 0
            ? Math.round(totalBreakTime / taken.length)
            : 0,
        skipStreak: calculateSkipStreak(history)
    };
}

/**
 * Calculate current skip streak
 */
function calculateSkipStreak(history) {
    let streak = 0;

    // Count consecutive skips from most recent
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].action === 'skipped') {
            streak++;
        } else if (history[i].action === 'taken') {
            break;
        }
    }

    return streak;
}

/**
 * Should show warning about skipped breaks
 */
export async function shouldWarnAboutBreaks() {
    const stats = await getBreakStatistics(7);

    // Warn if compliance is below 50% or skip streak > 3
    return {
        shouldWarn: stats.complianceRate < 50 || stats.skipStreak > 3,
        reason: stats.skipStreak > 3
            ? `You've skipped ${stats.skipStreak} breaks in a row`
            : `Only ${stats.complianceRate}% break compliance this week`,
        stats
    };
}

/**
 * Get recommended break type
 */
export async function getRecommendedBreak(sessionElapsed) {
    const settings = await getBreakSettings();

    if (sessionElapsed >= settings.longBreakInterval) {
        return {
            type: 'long',
            duration: settings.longBreakDuration,
            message: 'Time for a longer break! Step away from your screen.'
        };
    }

    if (sessionElapsed >= settings.shortBreakInterval) {
        return {
            type: 'short',
            duration: settings.shortBreakDuration,
            message: 'Quick break time! Stretch and rest your eyes.'
        };
    }

    return null;
}
