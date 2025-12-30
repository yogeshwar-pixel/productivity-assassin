// utils/penaltySystem.js
// Points/rewards system for accountability

import AsyncStorage from '@react-native-async-storage/async-storage';

const POINTS_KEY = 'productivity_points';
const POINTS_HISTORY_KEY = 'points_history';

/**
 * Point values for different actions
 */
export const POINT_VALUES = {
    // Rewards (+)
    TASK_COMPLETE_LOW: 10,
    TASK_COMPLETE_MEDIUM: 20,
    TASK_COMPLETE_HIGH: 30,
    TASK_COMPLETE_URGENT: 50,
    FOCUS_SESSION_COMPLETE: 25,
    GOAL_DAILY_COMPLETE: 100,
    GOAL_WEEKLY_COMPLETE: 200,
    GOAL_LONGTERM_COMPLETE: 500,
    CHECKIN_CONSISTENT: 5,
    STREAK_7DAY: 100,
    STREAK_14DAY: 250,
    STREAK_30DAY: 500,

    // Penalties (-)
    DEADLINE_MISSED: -20,
    CHECKIN_MISSED: -10,
    FOCUS_EXIT_EARLY: -15,
    DISTRACTION_STRICT_MODE: -5,
    CONSECUTIVE_MISSES_3: -50
};

/**
 * Get current points balance
 */
export async function getPointsBalance() {
    try {
        const points = await AsyncStorage.getItem(POINTS_KEY);
        return points ? JSON.parse(points) : {
            userId: 'default_user',
            totalPoints: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error loading points:', error);
        return { totalPoints: 0, currentStreak: 0, longestStreak: 0 };
    }
}

/**
 * Save points balance
 */
async function savePointsBalance(balance) {
    try {
        await AsyncStorage.setItem(POINTS_KEY, JSON.stringify(balance));
        return true;
    } catch (error) {
        console.error('Error saving points:', error);
        return false;
    }
}

/**
 * Get points transaction history
 */
export async function getPointsHistory(limit = 50) {
    try {
        const history = await AsyncStorage.getItem(POINTS_HISTORY_KEY);
        const transactions = history ? JSON.parse(history) : [];
        return transactions.slice(-limit);
    } catch (error) {
        console.error('Error loading points history:', error);
        return [];
    }
}

/**
 * Add transaction to history
 */
async function addTransaction(action, points, reason) {
    try {
        const history = await getPointsHistory(1000);
        const transaction = {
            id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            action,
            points,
            reason,
            timestamp: new Date().toISOString()
        };

        history.push(transaction);
        await AsyncStorage.setItem(POINTS_HISTORY_KEY, JSON.stringify(history));
        return transaction;
    } catch (error) {
        console.error('Error adding transaction:', error);
        return null;
    }
}

/**
 * Award points
 */
export async function awardPoints(points, reason, action = 'reward') {
    const balance = await getPointsBalance();

    balance.totalPoints += points;
    balance.lastUpdated = new Date().toISOString();

    await savePointsBalance(balance);
    await addTransaction(action, points, reason);

    console.log(`✅ +${points} points: ${reason}`);
    return balance;
}

/**
 * Deduct points (penalty)
 */
export async function deductPoints(points, reason, action = 'penalty') {
    const balance = await getPointsBalance();

    balance.totalPoints = Math.max(0, balance.totalPoints - points);
    balance.lastUpdated = new Date().toISOString();

    await savePointsBalance(balance);
    await addTransaction(action, -points, reason);

    console.log(`⚠️ -${points} points: ${reason}`);
    return balance;
}

/**
 * Award points for task completion based on priority
 */
export async function awardTaskCompletionPoints(task) {
    let points = POINT_VALUES.TASK_COMPLETE_MEDIUM;

    switch (task.priority) {
        case 'urgent':
            points = POINT_VALUES.TASK_COMPLETE_URGENT;
            break;
        case 'high':
            points = POINT_VALUES.TASK_COMPLETE_HIGH;
            break;
        case 'medium':
            points = POINT_VALUES.TASK_COMPLETE_MEDIUM;
            break;
        case 'low':
            points = POINT_VALUES.TASK_COMPLETE_LOW;
            break;
    }

    const balance = await awardPoints(
        points,
        `Completed task: ${task.title}`,
        'task_complete'
    );

    return { points, balance };
}

/**
 * Award points for goal completion based on type
 */
export async function awardGoalCompletionPoints(goal) {
    let points = POINT_VALUES.GOAL_WEEKLY_COMPLETE;

    switch (goal.type) {
        case 'daily':
            points = POINT_VALUES.GOAL_DAILY_COMPLETE;
            break;
        case 'weekly':
            points = POINT_VALUES.GOAL_WEEKLY_COMPLETE;
            break;
        case 'long-term':
            points = POINT_VALUES.GOAL_LONGTERM_COMPLETE;
            break;
    }

    const balance = await awardPoints(
        points,
        `Completed goal: ${goal.title}`,
        'goal_complete'
    );

    return { points, balance };
}

/**
 * Award points for focus session completion
 */
export async function awardFocusSessionPoints(durationMinutes, distractionCount = 0) {
    let points = POINT_VALUES.FOCUS_SESSION_COMPLETE;

    // Bonus for longer sessions
    if (durationMinutes >= 90) points += 15;
    else if (durationMinutes >= 60) points += 10;
    else if (durationMinutes >= 45) points += 5;

    // Penalty for distractions during session
    points -= (distractionCount * 2);
    points = Math.max(5, points); // Minimum 5 points

    const balance = await awardPoints(
        points,
        `Completed focus session (${durationMinutes} min)`,
        'focus_complete'
    );

    return { points, balance };
}

/**
 * Award points for consistent check-ins
 */
export async function awardCheckInPoints() {
    const balance = await awardPoints(
        POINT_VALUES.CHECKIN_CONSISTENT,
        'Consistent check-in',
        'checkin'
    );

    return balance;
}

/**
 * Deduct points for missed deadline
 */
export async function penaltyMissedDeadline(taskTitle) {
    const balance = await deductPoints(
        POINT_VALUES.DEADLINE_MISSED,
        `Missed deadline: ${taskTitle}`,
        'deadline_missed'
    );

    return balance;
}

/**
 * Deduct points for missed check-in
 */
export async function penaltyMissedCheckIn() {
    const balance = await deductPoints(
        POINT_VALUES.CHECKIN_MISSED,
        'Missed check-in',
        'checkin_missed'
    );

    return balance;
}

/**
 * Deduct points for early focus exit
 */
export async function penaltyEarlyFocusExit() {
    const balance = await deductPoints(
        POINT_VALUES.FOCUS_EXIT_EARLY,
        'Exited focus session early',
        'focus_exit_early'
    );

    return balance;
}

/**
 * Update streak and award bonus if milestone reached
 */
export async function updateStreak(newStreakDays) {
    const balance = await getPointsBalance();

    const oldStreak = balance.currentStreak;
    balance.currentStreak = newStreakDays;

    if (newStreakDays > balance.longestStreak) {
        balance.longestStreak = newStreakDays;
    }

    // Award milestone bonuses
    if (newStreakDays === 7 && oldStreak < 7) {
        await awardPoints(POINT_VALUES.STREAK_7DAY, '7-day streak bonus! 🔥', 'streak_bonus');
    } else if (newStreakDays === 14 && oldStreak < 14) {
        await awardPoints(POINT_VALUES.STREAK_14DAY, '14-day streak bonus! 🔥🔥', 'streak_bonus');
    } else if (newStreakDays === 30 && oldStreak < 30) {
        await awardPoints(POINT_VALUES.STREAK_30DAY, '30-day streak bonus! 🔥🔥🔥', 'streak_bonus');
    }

    await savePointsBalance(balance);
    return balance;
}

/**
 * Get points summary for display
 */
export async function getPointsSummary() {
    const balance = await getPointsBalance();
    const recentTransactions = await getPointsHistory(10);

    const totalEarned = recentTransactions
        .filter(t => t.points > 0)
        .reduce((sum, t) => sum + t.points, 0);

    const totalLost = recentTransactions
        .filter(t => t.points < 0)
        .reduce((sum, t) => sum + Math.abs(t.points), 0);

    return {
        ...balance,
        recentTransactions,
        totalEarned,
        totalLost,
        netChange: totalEarned - totalLost
    };
}

/**
 * Calculate streak multiplier
 */
export function getStreakMultiplier(streakDays) {
    if (streakDays >= 30) return 2.0;
    if (streakDays >= 14) return 1.5;
    if (streakDays >= 7) return 1.2;
    return 1.0;
}
