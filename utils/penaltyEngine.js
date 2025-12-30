// utils/penaltyEngine.js
// Penalty System - Point-based accountability with weekly reset

import AsyncStorage from '@react-native-async-storage/async-storage';

const POINTS_KEY = 'accountability_points';
const PENALTIES_KEY = 'accountability_penalties';
const WEEK_START_KEY = 'accountability_week_start';

// Point values
const POINTS = {
    TASK_COMPLETED: 10,
    GOAL_COMPLETED: 25,
    MISSED_DEADLINE: -10,
    SKIPPED_CHECKIN: -5,
    ABANDONED_TASK: -15,
    EARLY_FOCUS_EXIT: -20,
    ON_TRACK_CHECKIN: 2
};

const MAX_WEEKLY_POINTS = 100;
const STARTING_POINTS = 50;
const WARNING_THRESHOLD = 0.4; // 40% of max

/**
 * Get current week's start date (Monday)
 */
function getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString();
}

/**
 * Check if we need to reset for a new week
 */
async function checkWeeklyReset() {
    try {
        const storedWeekStart = await AsyncStorage.getItem(WEEK_START_KEY);
        const currentWeekStart = getWeekStart();

        if (!storedWeekStart || storedWeekStart !== currentWeekStart) {
            // New week - reset points
            console.log('🔄 New week detected - resetting points');
            await AsyncStorage.setItem(WEEK_START_KEY, currentWeekStart);
            await AsyncStorage.setItem(POINTS_KEY, JSON.stringify(STARTING_POINTS));

            // Archive last week's penalties (optional)
            const penalties = await getPenalties();
            if (penalties.length > 0) {
                await AsyncStorage.setItem(
                    `penalties_archive_${storedWeekStart}`,
                    JSON.stringify(penalties)
                );
                await AsyncStorage.setItem(PENALTIES_KEY, JSON.stringify([]));
            }

            return true; // Reset occurred
        }

        return false; // No reset needed
    } catch (error) {
        console.error('Error checking weekly reset:', error);
        return false;
    }
}

/**
 * Get current points total
 */
export async function getCurrentPoints() {
    await checkWeeklyReset();

    try {
        const pointsJson = await AsyncStorage.getItem(POINTS_KEY);
        return pointsJson ? parseInt(pointsJson) : STARTING_POINTS;
    } catch (error) {
        console.error('Error getting points:', error);
        return STARTING_POINTS;
    }
}

/**
 * Get penalty history
 */
async function getPenalties() {
    try {
        const penaltiesJson = await AsyncStorage.getItem(PENALTIES_KEY);
        return penaltiesJson ? JSON.parse(penaltiesJson) : [];
    } catch (error) {
        console.error('Error getting penalties:', error);
        return [];
    }
}

/**
 * Save penalties to storage
 */
async function savePenalties(penalties) {
    try {
        await AsyncStorage.setItem(PENALTIES_KEY, JSON.stringify(penalties));
    } catch (error) {
        console.error('Error saving penalties:', error);
    }
}

/**
 * Add points for positive actions
 */
export async function addPoints(reason, taskId = null) {
    const amount = POINTS[reason];
    if (!amount || amount <= 0) {
        console.warn('Invalid reason for adding points:', reason);
        return null;
    }

    const currentPoints = await getCurrentPoints();
    const newPoints = Math.min(currentPoints + amount, MAX_WEEKLY_POINTS);

    const penalty = {
        id: `penalty_${Date.now()}`,
        timestamp: new Date().toISOString(),
        reason,
        pointsChange: amount,
        taskId,
        currentTotal: newPoints,
        type: 'reward'
    };

    // Save new total
    await AsyncStorage.setItem(POINTS_KEY, JSON.stringify(newPoints));

    // Log penalty/reward
    const penalties = await getPenalties();
    penalties.push(penalty);
    await savePenalties(penalties);

    console.log(`✅ +${amount} points (${reason}). Total: ${newPoints}`);
    return penalty;
}

/**
 * Deduct points for negative actions
 */
export async function deductPoints(reason, taskId = null) {
    const amount = POINTS[reason];
    if (!amount || amount >= 0) {
        console.warn('Invalid reason for deducting points:', reason);
        return null;
    }

    const currentPoints = await getCurrentPoints();
    const newPoints = Math.max(currentPoints + amount, 0); // Don't go below 0

    const penalty = {
        id: `penalty_${Date.now()}`,
        timestamp: new Date().toISOString(),
        reason,
        pointsChange: amount,
        taskId,
        currentTotal: newPoints,
        type: 'penalty'
    };

    // Save new total
    await AsyncStorage.setItem(POINTS_KEY, JSON.stringify(newPoints));

    // Log penalty
    const penalties = await getPenalties();
    penalties.push(penalty);
    await savePenalties(penalties);

    console.log(`❌ ${amount} points (${reason}). Total: ${newPoints}`);
    return penalty;
}

/**
 * Calculate performance percentage (0-100)
 */
export async function getPerformancePercent() {
    const points = await getCurrentPoints();
    return Math.round((points / MAX_WEEKLY_POINTS) * 100);
}

/**
 * Check if warning should be shown
 */
export async function shouldShowWarning() {
    const percent = await getPerformancePercent();
    return percent < (WARNING_THRESHOLD * 100);
}

/**
 * Get warning message based on performance
 */
export async function getWarningMessage() {
    const percent = await getPerformancePercent();
    const points = await getCurrentPoints();

    if (percent >= 70) {
        return null; // No warning
    } else if (percent >= 40) {
        return `Your performance is slipping. ${points}/${MAX_WEEKLY_POINTS} points this week — push harder.`;
    } else if (percent >= 20) {
        return `CRITICAL: You're at ${percent}%. This is unacceptable. Turn it around NOW.`;
    } else {
        return `FAILURE MODE: ${points} points. You've nearly given up. Last chance to recover.`;
    }
}

/**
 * Get penalty history for last N days
 */
export async function getPenaltyHistory(days = 7) {
    const penalties = await getPenalties();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return penalties.filter(p => new Date(p.timestamp) >= cutoff);
}

/**
 * Get stats summary
 */
export async function getAccountabilityStats() {
    const points = await getCurrentPoints();
    const percent = await getPerformancePercent();
    const penalties = await getPenalties();

    const rewards = penalties.filter(p => p.type === 'reward');
    const punishments = penalties.filter(p => p.type === 'penalty');

    return {
        currentPoints: points,
        maxPoints: MAX_WEEKLY_POINTS,
        performancePercent: percent,
        totalRewards: rewards.length,
        totalPenalties: punishments.length,
        weekStart: await AsyncStorage.getItem(WEEK_START_KEY),
        shouldWarn: await shouldShowWarning(),
        warningMessage: await getWarningMessage()
    };
}

/**
 * Reset points manually (for testing)
 */
export async function resetPoints() {
    await AsyncStorage.setItem(POINTS_KEY, JSON.stringify(STARTING_POINTS));
    await AsyncStorage.setItem(PENALTIES_KEY, JSON.stringify([]));
    await AsyncStorage.setItem(WEEK_START_KEY, getWeekStart());
    console.log('🔄 Points reset to', STARTING_POINTS);
}

// Export point values for display
export { POINTS, MAX_WEEKLY_POINTS, STARTING_POINTS };
