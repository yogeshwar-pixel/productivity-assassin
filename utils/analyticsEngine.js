// utils/analyticsEngine.js
// Core analytics engine for productivity metrics

import { getTasks } from './taskManager';
import { getAllGoals } from './goalManager';
import { getTodayCheckIns, getCheckInHistory } from './checkInManager';
import { getPointsHistory } from './penaltySystem';

/**
 * Calculate daily statistics
 */
export async function calculateDailyStats(date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all data for the day
    const [allTasks, checkIns, pointsHistory] = await Promise.all([
        getTasks(),
        getCheckInHistory(startOfDay, endOfDay),
        getPointsHistory(100)
    ]);

    // Filter tasks for this day
    const tasksCreatedToday = allTasks.filter(task => {
        const created = new Date(task.createdAt);
        return created >= startOfDay && created <= endOfDay;
    });

    const tasksCompletedToday = allTasks.filter(task => {
        if (!task.completedAt) return false;
        const completed = new Date(task.completedAt);
        return completed >= startOfDay && completed <= endOfDay;
    });

    const missedDeadlinesToday = allTasks.filter(task => {
        if (!task.deadline || task.status === 'completed') return false;
        const deadline = new Date(task.deadline);
        const now = new Date();
        return deadline >= startOfDay && deadline <= endOfDay && deadline < now;
    });

    // Calculate points for the day
    const todayPoints = pointsHistory.filter(txn => {
        const txnDate = new Date(txn.timestamp);
        return txnDate >= startOfDay && txnDate <= endOfDay;
    });

    const pointsEarned = todayPoints.filter(p => p.points > 0).reduce((sum, p) => sum + p.points, 0);
    const pointsLost = todayPoints.filter(p => p.points < 0).reduce((sum, p) => sum + Math.abs(p.points), 0);

    // Check-in stats
    const checkInsCompleted = checkIns.filter(c => c.status !== 'missed').length;
    const checkInsMissed = checkIns.filter(c => c.status === 'missed').length;

    return {
        date: date.toISOString(),
        tasksCreated: tasksCreatedToday.length,
        tasksCompleted: tasksCompletedToday.length,
        completionRate: tasksCreatedToday.length > 0
            ? Math.round((tasksCompletedToday.length / tasksCreatedToday.length) * 100)
            : 0,
        missedDeadlines: missedDeadlinesToday.length,
        checkInsCompleted,
        checkInsMissed,
        checkInRate: (checkInsCompleted + checkInsMissed) > 0
            ? Math.round((checkInsCompleted / (checkInsCompleted + checkInsMissed)) * 100)
            : 0,
        pointsEarned,
        pointsLost,
        netPoints: pointsEarned - pointsLost
    };
}

/**
 * Calculate weekly statistics
 */
export async function calculateWeeklyStats(startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    // Collect daily stats for the week
    const dailyStats = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(day.getDate() + i);
        const stats = await calculateDailyStats(day);
        dailyStats.push(stats);
    }

    // Aggregate weekly totals
    const weeklyTotals = dailyStats.reduce((acc, day) => ({
        tasksCreated: acc.tasksCreated + day.tasksCreated,
        tasksCompleted: acc.tasksCompleted + day.tasksCompleted,
        missedDeadlines: acc.missedDeadlines + day.missedDeadlines,
        checkInsCompleted: acc.checkInsCompleted + day.checkInsCompleted,
        checkInsMissed: acc.checkInsMissed + day.checkInsMissed,
        pointsEarned: acc.pointsEarned + day.pointsEarned,
        pointsLost: acc.pointsLost + day.pointsLost
    }), {
        tasksCreated: 0,
        tasksCompleted: 0,
        missedDeadlines: 0,
        checkInsCompleted: 0,
        checkInsMissed: 0,
        pointsEarned: 0,
        pointsLost: 0
    });

    return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        ...weeklyTotals,
        completionRate: weeklyTotals.tasksCreated > 0
            ? Math.round((weeklyTotals.tasksCompleted / weeklyTotals.tasksCreated) * 100)
            : 0,
        checkInRate: (weeklyTotals.checkInsCompleted + weeklyTotals.checkInsMissed) > 0
            ? Math.round((weeklyTotals.checkInsCompleted / (weeklyTotals.checkInsCompleted + weeklyTotals.checkInsMissed)) * 100)
            : 0,
        netPoints: weeklyTotals.pointsEarned - weeklyTotals.pointsLost,
        dailyBreakdown: dailyStats
    };
}

/**
 * Compare two periods
 */
export function compareStats(current, previous) {
    const calculateChange = (curr, prev) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return Math.round(((curr - prev) / prev) * 100);
    };

    return {
        tasksCompletedChange: calculateChange(current.tasksCompleted, previous.tasksCompleted),
        completionRateChange: current.completionRate - previous.completionRate,
        checkInRateChange: current.checkInRate - previous.checkInRate,
        netPointsChange: calculateChange(current.netPoints, previous.netPoints)
    };
}

/**
 * Get productivity trends (last N days)
 */
export async function getProductivityTrends(days = 7) {
    const trends = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const stats = await calculateDailyStats(date);
        trends.push(stats);
    }

    return trends;
}

/**
 * Get time-of-day productivity data
 */
export async function getTimeOfDayData(days = 7) {
    const tasks = await getTasks();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Initialize data structure
    const hourly = Array(24).fill(0);

    // Count tasks completed by hour
    tasks.forEach(task => {
        if (!task.completedAt) return;

        const completed = new Date(task.completedAt);
        if (completed < startDate) return;

        const hour = completed.getHours();
        hourly[hour]++;
    });

    return hourly.map((count, hour) => ({
        hour,
        count,
        label: `${hour}:00`
    }));
}

/**
 * Get day-of-week productivity data
 */
export async function getDayOfWeekData(weeks = 4) {
    const tasks = await getTasks();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daily = Array(7).fill(0);

    tasks.forEach(task => {
        if (!task.completedAt) return;

        const completed = new Date(task.completedAt);
        if (completed < startDate) return;

        const day = completed.getDay();
        daily[day]++;
    });

    return daily.map((count, index) => ({
        day: dayNames[index],
        dayIndex: index,
        count
    }));
}

/**
 * Calculate overall productivity score (0-100)
 */
export async function calculateProductivityScore() {
    const today = await calculateDailyStats();
    const weeklyTrends = await getProductivityTrends(7);

    // Factors for score
    const completionScore = today.completionRate * 0.3;
    const checkInScore = today.checkInRate * 0.2;
    const streakScore = Math.min((today.netPoints / 100) * 20, 20); // Max 20 points

    const consistency = weeklyTrends.filter(d => d.tasksCompleted > 0).length;
    const consistencyScore = (consistency / 7) * 30;

    return Math.round(completionScore + checkInScore + streakScore + consistencyScore);
}
