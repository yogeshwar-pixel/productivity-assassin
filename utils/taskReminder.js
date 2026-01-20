// utils/taskReminder.js
// Unfinished Task Reminder System - Modular and extensible

import { getAllTasks } from './taskStorage';

/**
 * Calculate task completion statistics
 * @returns {Promise<Object>} - Stats object with counts and percentage
 */
async function calculateTaskStats() {
    const tasks = await getAllTasks();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;

    // Deadline Logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let overdueCount = 0;
    let dueTodayCount = 0;
    let dueTomorrowCount = 0;

    tasks.forEach(t => {
        if (t.status === 'completed' || !t.deadline) return;

        const deadline = new Date(t.deadline);
        deadline.setHours(0, 0, 0, 0);
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) overdueCount++;
        else if (diffDays === 0) dueTodayCount++;
        else if (diffDays === 1) dueTomorrowCount++;
    });

    const progressPercent = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    return {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        progressPercent,
        overdueCount,
        dueTodayCount,
        dueTomorrowCount,
        unfinishedCount: pendingTasks + inProgressTasks
    };
}

/**
 * Generate dynamic reminder message based on urgency
 */
function generateReminderMessage(stats) {
    if (stats.overdueCount > 0) {
        return `CRITICAL: You have ${stats.overdueCount} overdue task${stats.overdueCount > 1 ? 's' : ''}. Stop ignoring them.`;
    }
    if (stats.dueTodayCount > 0) {
        return `URGENT: ${stats.dueTodayCount} task${stats.dueTodayCount > 1 ? 's' : ''} due today settings. Finish them now.`;
    }
    if (stats.dueTomorrowCount > 0) {
        return `Heads up: ${stats.dueTomorrowCount} task${stats.dueTomorrowCount > 1 ? 's' : ''} due tomorrow. Don't procrastinate.`;
    }

    const { progressPercent, unfinishedCount } = stats;

    // No reminder if all done
    if (progressPercent === 100) return '';

    // General Progress
    if (progressPercent < 30) {
        return `You've barely scratched the surface — only ${progressPercent}% done. Time to move.`;
    } else if (progressPercent < 70) {
        return `You're halfway there. ${progressPercent}% complete — push through the next chunk.`;
    } else {
        return `You're almost done. ${progressPercent}% complete — finish the last ${unfinishedCount} task${unfinishedCount > 1 ? 's' : ''}.`;
    }
}

/**
 * Get unfinished task reminder data
 * Main API function for reminder system
 */
export async function getUnfinishedTaskReminder() {
    const stats = await calculateTaskStats();

    // Determine if reminder should show
    // Show if unfinished tasks exist OR if overdue items exist
    const shouldShow = (stats.totalTasks > 0 && stats.progressPercent < 100) || stats.overdueCount > 0;

    // Generate message
    const message = shouldShow ? generateReminderMessage(stats) : '';

    // Determine severity
    let severity = 'low';
    if (stats.overdueCount > 0) severity = 'critical';
    else if (stats.dueTodayCount > 0) severity = 'high';
    else if (stats.progressPercent < 30) severity = 'medium';

    return {
        shouldShow,
        progressPercent: stats.progressPercent,
        unfinishedCount: stats.unfinishedCount,
        overdueCount: stats.overdueCount,
        dueTodayCount: stats.dueTodayCount,
        message,
        severity
    };
}

/**
 * Get reminder with caching support (for performance)
 * Cache is valid for 5 minutes
 */
let reminderCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function getCachedUnfinishedTaskReminder() {
    const now = Date.now();

    // Return cached data if still valid
    if (reminderCache && (now - cacheTimestamp) < CACHE_DURATION_MS) {
        return reminderCache;
    }

    // Fetch fresh data
    reminderCache = await getUnfinishedTaskReminder();
    cacheTimestamp = now;

    return reminderCache;
}

/**
 * Invalidate cache (call after task updates)
 */
export function invalidateReminderCache() {
    reminderCache = null;
    cacheTimestamp = 0;
}

/**
 * Get reminder severity level based on progress
 * @param {number} progressPercent 
 * @returns {string} - 'low', 'medium', 'high'
 */
export function getReminderSeverity(progressPercent) {
    if (progressPercent < 30) return 'high';
    if (progressPercent < 70) return 'medium';
    return 'low';
}

/**
 * Schedule reminder check (for future notification integration)
 * @param {Function} callback - Function to call when reminder should trigger
 * @param {number} intervalHours - Check interval in hours (default: 6)
 */
export function scheduleReminderCheck(callback, intervalHours = 6) {
    const intervalMs = intervalHours * 60 * 60 * 1000;

    // Initial check
    callback();

    // Periodic checks
    const intervalId = setInterval(async () => {
        const reminder = await getUnfinishedTaskReminder();
        if (reminder.shouldShow) {
            callback(reminder);
        }
    }, intervalMs);

    // Return cleanup function
    return () => clearInterval(intervalId);
}

/**
 * Get motivational action suggestion based on progress
 * @param {number} progressPercent 
 * @returns {string}
 */
export function getActionSuggestion(progressPercent) {
    if (progressPercent < 30) {
        return 'Start with your highest priority task';
    } else if (progressPercent < 70) {
        return 'Tackle 2-3 tasks in the next hour';
    } else {
        return 'Complete the remaining tasks to finish strong';
    }
}
