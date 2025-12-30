// utils/goalAnalytics.js
// Goal progress tracking and analytics

import { getAllGoals } from './goalManager';
import { getTasksByGoal } from './taskManager';

/**
 * Calculate goal analytics
 */
export async function getGoalAnalytics(goalId) {
    const goals = await getAllGoals();
    const goal = goals.find(g => g.id === goalId);

    if (!goal) return null;

    const tasks = await getTasksByGoal(goalId);
    const completedTasks = tasks.filter(t => t.status === 'completed');

    // Calculate completion percentage
    const totalItems = tasks.length + (goal.subtasks ? goal.subtasks.length : 0);
    const completedSubtasks = goal.subtasks ? goal.subtasks.filter(st => st.completed).length : 0;
    const completedTotal = completedTasks.length + completedSubtasks;

    const completionPercent = totalItems > 0 ? Math.round((completedTotal / totalItems) * 100) : 0;

    // Calculate time metrics
    const daysElapsed = Math.floor((Date.now() - new Date(goal.createdAt)) / (1000 * 60 * 60 * 24));
    const daysRemaining = goal.targetDate
        ? Math.floor((new Date(goal.targetDate) - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    // Calculate velocity (tasks per day)
    const velocity = daysElapsed > 0 ? completedTasks.length / daysElapsed : 0;

    // Estimate completion date
    const remainingTasks = tasks.length - completedTasks.length;
    const estimatedDays = velocity > 0 ? Math.ceil(remainingTasks / velocity) : null;
    const estimatedCompletion = estimatedDays
        ? new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

    // Determine risk status
    let status = 'on-track';
    if (goal.status === 'completed') {
        status = 'completed';
    } else if (daysRemaining !== null && estimatedDays !== null) {
        if (estimatedDays > daysRemaining * 1.3) {
            status = 'at-risk';
        } else if (estimatedDays > daysRemaining) {
            status = 'behind';
        }
    }

    return {
        goalId: goal.id,
        goalTitle: goal.title,
        goalType: goal.type,
        completionPercent,
        tasksCompleted: completedTasks.length,
        tasksTotal: tasks.length,
        subtasksCompleted: completedSubtasks,
        subtasksTotal: goal.subtasks ? goal.subtasks.length : 0,
        daysElapsed,
        daysRemaining,
        velocity: Math.round(velocity * 100) / 100,
        estimatedCompletion,
        estimatedDays,
        status,
        targetDate: goal.targetDate,
        createdAt: goal.createdAt
    };
}

/**
 * Get analytics for all active goals
 */
export async function getAllGoalsAnalytics() {
    const goals = await getAllGoals();
    const activeGoals = goals.filter(g => g.status === 'active');

    const analytics = await Promise.all(
        activeGoals.map(goal => getGoalAnalytics(goal.id))
    );

    return analytics.filter(a => a !== null);
}

/**
 * Get goals summary statistics
 */
export async function getGoalsSummary() {
    const goals = await getAllGoals();

    const total = goals.length;
    const active = goals.filter(g => g.status === 'active').length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const abandoned = goals.filter(g => g.status === 'abandoned').length;

    const analytics = await getAllGoalsAnalytics();
    const onTrack = analytics.filter(a => a.status === 'on-track').length;
    const atRisk = analytics.filter(a => a.status === 'at-risk' || a.status === 'behind').length;

    const avgCompletionPercent = analytics.length > 0
        ? Math.round(analytics.reduce((sum, a) => sum + a.completionPercent, 0) / analytics.length)
        : 0;

    return {
        total,
        active,
        completed,
        abandoned,
        onTrack,
        atRisk,
        avgCompletionPercent,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
}

/**
 * Get goals by status
 */
export async function getGoalsByRiskStatus() {
    const analytics = await getAllGoalsAnalytics();

    return {
        onTrack: analytics.filter(a => a.status === 'on-track'),
        atRisk: analytics.filter(a => a.status === 'at-risk'),
        behind: analytics.filter(a => a.status === 'behind'),
        completed: analytics.filter(a => a.status === 'completed')
    };
}
