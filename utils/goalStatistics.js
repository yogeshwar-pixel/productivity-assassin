// utils/goalStatistics.js
// Goal achievement statistics and classification

import { getAllGoals } from './goalManager';
import { getTasksByGoal } from './taskManager';

/**
 * Calculate goal statistics
 */
export async function getGoalStatistics(goalId) {
    const { getAllGoals } = require('./goalManager');
    const { getTasksByGoal } = require('./taskManager');

    const goals = await getAllGoals();
    const goal = goals.find(g => g.id === goalId);

    if (!goal) return null;

    // Get linked tasks
    const tasks = await getTasksByGoal(goalId);

    const linkedTasksCount = tasks.length;
    const completedTasksCount = tasks.filter(t => t.status === 'completed').length;

    // Calculate completion percentage
    let completionPercent = goal.progress || 0;
    if (linkedTasksCount > 0) {
        completionPercent = Math.round((completedTasksCount / linkedTasksCount) * 100);
    }

    // Calculate time spent (sum of estimated minutes for completed tasks)
    const timeSpentMinutes = tasks
        .filter(t => t.status === 'completed' && t.estimatedMinutes)
        .reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);

    // Calculate planned time (sum of all task estimates)
    const plannedTimeMinutes = tasks
        .filter(t => t.estimatedMinutes)
        .reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);

    // Calculate days since created
    const createdDate = new Date(goal.createdAt);
    const now = new Date();
    const daysSinceCreated = Math.max(1, Math.floor((now - createdDate) / (1000 * 60 * 60 * 24)));

    // Calculate progress rate (% per day)
    const progressRate = completionPercent / daysSinceCreated;

    // Calculate days until deadline
    let daysUntilDeadline = null;
    let requiredRate = null;

    if (goal.targetDate) {
        const targetDate = new Date(goal.targetDate);
        daysUntilDeadline = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));

        if (daysUntilDeadline > 0 && completionPercent < 100) {
            requiredRate = (100 - completionPercent) / daysUntilDeadline;
        }
    }

    // Estimate completion date based on current rate
    let estimatedCompletion = null;
    if (progressRate > 0 && completionPercent < 100) {
        const daysNeeded = Math.ceil((100 - completionPercent) / progressRate);
        estimatedCompletion = new Date(now);
        estimatedCompletion.setDate(estimatedCompletion.getDate() + daysNeeded);
    }

    // Classify goal status
    const classification = classifyGoal({
        completionPercent,
        daysUntilDeadline,
        progressRate,
        requiredRate,
        status: goal.status
    });

    return {
        goalId: goal.id,
        goalTitle: goal.title,
        goalType: goal.type,
        completionPercent,
        timeSpentMinutes,
        plannedTimeMinutes,
        timeUtilization: plannedTimeMinutes > 0 ?
            Math.round((timeSpentMinutes / plannedTimeMinutes) * 100) : 0,
        linkedTasksCount,
        completedTasksCount,
        classification,
        progressRate: Math.round(progressRate * 10) / 10, // 1 decimal
        requiredRate: requiredRate ? Math.round(requiredRate * 10) / 10 : null,
        daysUntilDeadline,
        daysSinceCreated,
        estimatedCompletion: estimatedCompletion ? estimatedCompletion.toISOString() : null,
        isOnSchedule: requiredRate ? progressRate >= requiredRate : null,
        targetDate: goal.targetDate,
        createdAt: goal.createdAt
    };
}

/**
 * Classify goal status
 */
function classifyGoal({ completionPercent, daysUntilDeadline, progressRate, requiredRate, status }) {
    // Completed
    if (completionPercent === 100 || status === 'completed') {
        return 'completed';
    }

    // Overdue
    if (daysUntilDeadline !== null && daysUntilDeadline < 0) {
        return 'overdue';
    }

    // No deadline set
    if (daysUntilDeadline === null) {
        if (completionPercent >= 75) return 'on-track';
        if (completionPercent >= 25) return 'in-progress';
        return 'just-started';
    }

    // At risk (not enough progress for deadline)
    if (requiredRate && progressRate < requiredRate * 0.8) {
        return 'at-risk';
    }

    // Behind schedule but recoverable
    if (requiredRate && progressRate < requiredRate) {
        return 'behind-schedule';
    }

    // On track
    return 'on-track';
}

/**
 * Get all goals statistics
 */
export async function getAllGoalsStatistics() {
    const goals = await getAllGoals();

    const stats = await Promise.all(
        goals.map(goal => getGoalStatistics(goal.id))
    );

    return stats.filter(s => s !== null);
}

/**
 * Classify all goals
 */
export async function classifyGoals() {
    const allStats = await getAllGoalsStatistics();

    return {
        completed: allStats.filter(s => s.classification === 'completed'),
        onTrack: allStats.filter(s => s.classification === 'on-track'),
        behindSchedule: allStats.filter(s => s.classification === 'behind-schedule'),
        atRisk: allStats.filter(s => s.classification === 'at-risk'),
        overdue: allStats.filter(s => s.classification === 'overdue'),
        inProgress: allStats.filter(s => s.classification === 'in-progress'),
        justStarted: allStats.filter(s => s.classification === 'just-started')
    };
}

/**
 * Get goal achievement summary
 */
export async function getGoalAchievementSummary() {
    const allStats = await getAllGoalsStatistics();
    const classified = await classifyGoals();

    const totalGoals = allStats.length;
    const completedGoals = classified.completed.length;
    const activeGoals = totalGoals - completedGoals;

    const averageCompletion = allStats.length > 0 ?
        Math.round(allStats.reduce((sum, s) => sum + s.completionPercent, 0) / allStats.length) : 0;

    const onScheduleCount = allStats.filter(s => s.isOnSchedule === true).length;
    const atRiskCount = classified.atRisk.length + classified.behindSchedule.length;

    return {
        totalGoals,
        completedGoals,
        activeGoals,
        averageCompletion,
        onScheduleCount,
        atRiskCount,
        classified
    };
}

/**
 * Get goals needing attention
 */
export async function getGoalsNeedingAttention() {
    const classified = await classifyGoals();

    return [
        ...classified.overdue,
        ...classified.atRisk,
        ...classified.behindSchedule
    ].sort((a, b) => {
        // Sort by urgency: overdue > at-risk > behind-schedule
        const urgencyOrder = { overdue: 0, 'at-risk': 1, 'behind-schedule': 2 };
        return urgencyOrder[a.classification] - urgencyOrder[b.classification];
    });
}

/**
 * Get goals by time frame
 */
export async function getGoalsByTimeFrame() {
    const allStats = await getAllGoalsStatistics();

    const now = new Date();
    const weekFromNow = new Date(now);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const monthFromNow = new Date(now);
    monthFromNow.setMonth(monthFromNow.getMonth() + 1);

    return {
        dueThisWeek: allStats.filter(s => {
            if (!s.targetDate) return false;
            const target = new Date(s.targetDate);
            return target >= now && target <= weekFromNow;
        }),
        dueThisMonth: allStats.filter(s => {
            if (!s.targetDate) return false;
            const target = new Date(s.targetDate);
            return target >= now && target <= monthFromNow;
        }),
        noDueDate: allStats.filter(s => !s.targetDate)
    };
}
