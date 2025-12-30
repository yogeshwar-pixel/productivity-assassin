// utils/focusLockEngine.js
// Progress Lock-In System - Enforce Focus Mode completion requirements

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTaskById } from './taskManager';
import { deductPoints } from './penaltyEngine';

const SESSION_KEY = 'focus_lock_session';
const DEFAULT_REQUIRED_PERCENT = 70;

/**
 * Start a locked Focus Mode session
 */
export async function startFocusSession(taskIds = [], requiredPercent = DEFAULT_REQUIRED_PERCENT) {
    const session = {
        id: `focus_${Date.now()}`,
        startTime: new Date().toISOString(),
        endTime: null,
        requiredPercent,
        currentPercent: 0,
        selectedTasks: taskIds,
        completedTasks: [],
        locked: true,
        exitAttempts: 0,
        forcedExit: false
    };

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    console.log(`🔒 Focus session started - ${taskIds.length} tasks, ${requiredPercent}% required`);
    return session;
}

/**
 * Get active Focus Mode session
 */
export async function getActiveFocusSession() {
    try {
        const sessionJson = await AsyncStorage.getItem(SESSION_KEY);
        return sessionJson ? JSON.parse(sessionJson) : null;
    } catch (error) {
        console.error('Error getting focus session:', error);
        return null;
    }
}

/**
 * Calculate current session progress
 */
export async function calculateSessionProgress() {
    const session = await getActiveFocusSession();
    if (!session || session.selectedTasks.length === 0) return 0;

    // Calculate % of tasks completed
    const progress = Math.round(
        (session.completedTasks.length / session.selectedTasks.length) * 100
    );

    // Update session
    session.currentPercent = progress;
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return progress;
}

/**
 * Mark a task as completed in the session
 */
export async function updateSessionProgress(taskId, completed) {
    const session = await getActiveFocusSession();
    if (!session) return null;

    if (completed && !session.completedTasks.includes(taskId)) {
        session.completedTasks.push(taskId);
    } else if (!completed) {
        session.completedTasks = session.completedTasks.filter(id => id !== taskId);
    }

    session.currentPercent = await calculateSessionProgress();
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

    console.log(`📊 Session progress: ${session.currentPercent}%`);
    return session;
}

/**
 * Check if user can exit Focus Mode
 */
export async function canExitFocusMode() {
    const session = await getActiveFocusSession();
    if (!session || !session.locked) return true;

    const progress = await calculateSessionProgress();
    return progress >= session.requiredPercent;
}

/**
 * Handle exit attempt
 */
export async function attemptExit() {
    const session = await getActiveFocusSession();
    if (!session) return { allowed: true, penalty: null };

    const progress = await calculateSessionProgress();

    // Increment exit attempts
    session.exitAttempts += 1;
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

    if (progress >= session.requiredPercent) {
        // Exit allowed
        return {
            allowed: true,
            penalty: null,
            progress,
            message: `Great work! ${progress}% complete. Session ended.`
        };
    } else {
        // Exit blocked - show warning
        return {
            allowed: false,
            penalty: null,
            progress,
            requiredPercent: session.requiredPercent,
            message: `You've only completed ${progress}%. Keep going to reach ${session.requiredPercent}%.`
        };
    }
}

/**
 * Force exit with penalty
 */
export async function forceExitWithPenalty() {
    const session = await getActiveFocusSession();
    if (!session) return null;

    // Apply penalty
    const penalty = await deductPoints('EARLY_FOCUS_EXIT');

    // Mark session as forced exit
    session.forcedExit = true;
    session.locked = false;
    session.endTime = new Date().toISOString();
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

    console.log(`⚠️ Focus session force-exited at ${session.currentPercent}% - penalty applied`);

    return {
        session,
        penalty,
        message: `Session ended early. -20 points penalty applied. You were at ${session.currentPercent}%.`
    };
}

/**
 * End Focus Mode session normally
 */
export async function endFocusSession(forced = false) {
    const session = await getActiveFocusSession();
    if (!session) return null;

    session.locked = false;
    session.endTime = new Date().toISOString();
    session.forcedExit = forced;

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

    console.log(`✅ Focus session ended - ${session.currentPercent}% complete`);
    return session;
}

/**
 * Get session stats
 */
export async function getFocusSessionStats() {
    const session = await getActiveFocusSession();
    if (!session) return null;

    const progress = await calculateSessionProgress();
    const canExit = await canExitFocusMode();

    return {
        ...session,
        progress,
        canExit,
        tasksCompleted: session.completedTasks.length,
        tasksRemaining: session.selectedTasks.length - session.completedTasks.length
    };
}

/**
 * Clear session (for testing)
 */
export async function clearFocusSession() {
    await AsyncStorage.removeItem(SESSION_KEY);
    console.log('🗑️ Focus session cleared');
}
