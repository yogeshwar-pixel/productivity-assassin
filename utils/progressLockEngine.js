// utils/progressLockEngine.js
// Progress lock-in system for Focus Mode

import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCK_STATUS_KEY = 'focus_lock_status';
const LOCK_SETTINGS_KEY = 'lock_settings';

/**
 * Default lock settings
 */
const DEFAULT_SETTINGS = {
    enabled: true,
    minProgressPercent: 70,
    allowOverride: true,
    overridePenalty: 25
};

/**
 * Get lock settings
 */
export async function getLockSettings() {
    try {
        const settings = await AsyncStorage.getItem(LOCK_SETTINGS_KEY);
        return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error loading lock settings:', error);
        return DEFAULT_SETTINGS;
    }
}

/**
 * Update lock settings
 */
export async function updateLockSettings(settings) {
    try {
        await AsyncStorage.setItem(LOCK_SETTINGS_KEY, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error('Error saving lock settings:', error);
        return false;
    }
}

/**
 * Initialize lock for a focus session
 */
export async function initializeSessionLock(sessionId, tasks = []) {
    const lockStatus = {
        sessionId,
        isLocked: true,
        requiredProgress: (await getLockSettings()).minProgressPercent,
        currentProgress: 0,
        totalTasks: tasks.length,
        completedTasks: 0,
        taskIds: tasks.map(t => t.id),
        canExit: false,
        penaltyApplied: false,
        createdAt: new Date().toISOString()
    };

    try {
        await AsyncStorage.setItem(LOCK_STATUS_KEY, JSON.stringify(lockStatus));
        console.log('🔒 Session locked:', sessionId);
        return lockStatus;
    } catch (error) {
        console.error('Error initializing lock:', error);
        return null;
    }
}

/**
 * Get current lock status
 */
export async function getLockStatus() {
    try {
        const status = await AsyncStorage.getItem(LOCK_STATUS_KEY);
        return status ? JSON.parse(status) : null;
    } catch (error) {
        console.error('Error loading lock status:', error);
        return null;
    }
}

/**
 * Calculate session progress based on completed tasks
 */
export async function calculateSessionProgress(completedTaskIds = []) {
    const lockStatus = await getLockStatus();
    if (!lockStatus) return 0;

    const completedCount = lockStatus.taskIds.filter(id =>
        completedTaskIds.includes(id)
    ).length;

    const progress = lockStatus.totalTasks > 0
        ? Math.round((completedCount / lockStatus.totalTasks) * 100)
        : 0;

    // Update lock status
    lockStatus.completedTasks = completedCount;
    lockStatus.currentProgress = progress;
    lockStatus.canExit = progress >= lockStatus.requiredProgress;

    await AsyncStorage.setItem(LOCK_STATUS_KEY, JSON.stringify(lockStatus));

    console.log(`📊 Progress: ${progress}% (${completedCount}/${lockStatus.totalTasks})`);
    return progress;
}

/**
 * Check if user can exit session
 */
export async function canExitSession() {
    const settings = await getLockSettings();
    if (!settings.enabled) return true;

    const lockStatus = await getLockStatus();
    if (!lockStatus) return true;

    return lockStatus.canExit;
}

/**
 * Get exit status with details
 */
export async function getExitStatus() {
    const lockStatus = await getLockStatus();
    const settings = await getLockSettings();

    if (!lockStatus) {
        return {
            canExit: true,
            reason: 'No active lock',
            progress: 100,
            remainingTasks: 0
        };
    }

    const canExit = lockStatus.currentProgress >= lockStatus.requiredProgress;
    const remainingTasks = lockStatus.totalTasks - lockStatus.completedTasks;

    return {
        canExit,
        reason: canExit
            ? 'Progress requirement met'
            : `Only ${lockStatus.currentProgress}% complete (need ${lockStatus.requiredProgress}%)`,
        progress: lockStatus.currentProgress,
        requiredProgress: lockStatus.requiredProgress,
        completedTasks: lockStatus.completedTasks,
        totalTasks: lockStatus.totalTasks,
        remainingTasks,
        allowOverride: settings.allowOverride,
        overridePenalty: settings.overridePenalty
    };
}

/**
 * Force exit with penalty
 */
export async function forceExitSession() {
    const lockStatus = await getLockStatus();
    const settings = await getLockSettings();

    if (!lockStatus) return { success: true, penaltyApplied: false };

    // Apply penalty if not already applied
    let penaltyApplied = false;
    if (!lockStatus.penaltyApplied && !lockStatus.canExit) {
        try {
            const { penaltyEarlyFocusExit } = require('./penaltySystem');
            await penaltyEarlyFocusExit();
            penaltyApplied = true;

            lockStatus.penaltyApplied = true;
            await AsyncStorage.setItem(LOCK_STATUS_KEY, JSON.stringify(lockStatus));
        } catch (error) {
            console.error('Error applying penalty:', error);
        }
    }

    console.log('⚠️ Force exit - Penalty applied:', penaltyApplied);
    return {
        success: true,
        penaltyApplied,
        penaltyPoints: penaltyApplied ? settings.overridePenalty : 0
    };
}

/**
 * Release lock (normal exit)
 */
export async function releaseSessionLock() {
    try {
        await AsyncStorage.removeItem(LOCK_STATUS_KEY);
        console.log('🔓 Session unlocked');
        return true;
    } catch (error) {
        console.error('Error releasing lock:', error);
        return false;
    }
}

/**
 * Update task completion and recalculate progress
 */
export async function updateTaskCompletion(taskId, completed = true) {
    const lockStatus = await getLockStatus();
    if (!lockStatus) return null;

    // Get current completed task IDs
    const completedIds = lockStatus.taskIds.filter((id, index) => {
        // Check if this task was previously completed
        return index < lockStatus.completedTasks || id === taskId;
    });

    if (completed && !completedIds.includes(taskId)) {
        completedIds.push(taskId);
    } else if (!completed) {
        const index = completedIds.indexOf(taskId);
        if (index > -1) completedIds.splice(index, 1);
    }

    // Recalculate progress
    await calculateSessionProgress(completedIds);

    return getLockStatus();
}

/**
 * Get remaining tasks list
 */
export async function getRemainingTasks(allTasks) {
    const lockStatus = await getLockStatus();
    if (!lockStatus) return [];

    return allTasks.filter(task =>
        lockStatus.taskIds.includes(task.id) && task.status !== 'completed'
    );
}

/**
 * Check if session has minimum tasks for lock
 */
export function hasMinimumTasks(tasks, minTasks = 1) {
    return tasks.length >= minTasks;
}

/**
 * Get progress summary for display
 */
export async function getProgressSummary(allTasks = []) {
    const lockStatus = await getLockStatus();
    if (!lockStatus) {
        return {
            isLocked: false,
            progress: 0,
            message: 'No active focus session'
        };
    }

    const remaining = await getRemainingTasks(allTasks);
    const exitStatus = await getExitStatus();

    return {
        isLocked: lockStatus.isLocked,
        progress: lockStatus.currentProgress,
        requiredProgress: lockStatus.requiredProgress,
        canExit: lockStatus.canExit,
        completedTasks: lockStatus.completedTasks,
        totalTasks: lockStatus.totalTasks,
        remainingTasks: remaining,
        exitStatus,
        message: exitStatus.reason
    };
}
