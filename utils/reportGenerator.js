// utils/reportGenerator.js
// Automated daily and weekly productivity reports

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTasks } from './taskManager';
import { getTodayCheckIns, getCheckInHistory } from './checkInManager';
import { getPointsHistory } from './penaltySystem';

const REPORTS_KEY = 'productivity_reports';

/**
 * Get date range for today
 */
function getTodayRange() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { start: today, end: tomorrow };
}

/**
 * Get date range for this week
 */
function getWeekRange() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday start

    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7);

    return { start: monday, end: sunday };
}

/**
 * Get tasks within date range
 */
function filterTasksByDate(tasks, start, end) {
    return tasks.filter(task => {
        const createdDate = new Date(task.createdAt);
        const completedDate = task.completedAt ? new Date(task.completedAt) : null;

        // Task is in range if created or completed in range
        return (createdDate >= start && createdDate < end) ||
            (completedDate && completedDate >= start && completedDate < end);
    });
}

/**
 * Calculate metrics from tasks
 */
function calculateTaskMetrics(tasks, start, end) {
    const tasksInRange = filterTasksByDate(tasks, start, end);

    const planned = tasksInRange.length;
    const completed = tasksInRange.filter(t => t.status === 'completed').length;
    const missed = tasksInRange.filter(t => {
        if (!t.deadline) return false;
        const deadline = new Date(t.deadline);
        return deadline < new Date() && t.status !== 'completed';
    }).length;

    const completionRate = planned > 0 ? Math.round((completed / planned) * 100) : 0;

    return {
        tasksPlanned: planned,
        tasksCompleted: completed,
        tasksMissed: missed,
        completionRate
    };
}

/**
 * Generate daily report
 */
export async function generateDailyReport(date = new Date()) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const start = new Date(targetDate);
    const end = new Date(targetDate);
    end.setDate(end.getDate() + 1);

    // Get all data
    const [tasks, checkIns, pointsHistory] = await Promise.all([
        getTasks(),
        getCheckInHistory(start, end),
        getPointsHistory(100)
    ]);

    // Calculate task metrics
    const taskMetrics = calculateTaskMetrics(tasks, start, end);

    // Calculate points earned today
    const pointsToday = pointsHistory
        .filter(p => {
            const txDate = new Date(p.timestamp);
            return txDate >= start && txDate < end;
        })
        .reduce((sum, p) => sum + p.points, 0);

    // Check-ins
    const checkInsCompleted = checkIns.filter(c => c.status !== 'missed').length;
    const checkInsMissed = checkIns.filter(c => c.status === 'missed').length;

    // Calculate focus session metrics (mock for now - would integrate with focus.js)
    const focusSessionsCompleted = 0; // TODO: Integrate with actual focus data
    const totalFocusMinutes = 0; // TODO: Integrate with actual focus data

    const report = {
        id: `report_${Date.now()}`,
        userId: 'default_user',
        reportType: 'daily',
        date: targetDate.toISOString(),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        metrics: {
            tasksPlanned: taskMetrics.tasksPlanned,
            tasksCompleted: taskMetrics.tasksCompleted,
            tasksMissed: taskMetrics.tasksMissed,
            completionRate: taskMetrics.completionRate,
            focusSessionsCompleted,
            totalFocusMinutes,
            checkInsCompleted,
            checkInsMissed,
            pointsEarned: pointsToday > 0 ? pointsToday : 0,
            pointsLost: pointsToday < 0 ? Math.abs(pointsToday) : 0
        },
        topAccomplishment: tasks
            .filter(t => t.status === 'completed' &&
                new Date(t.completedAt) >= start &&
                new Date(t.completedAt) < end)
            .sort((a, b) => {
                const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            })[0] || null,
        generatedAt: new Date().toISOString()
    };

    // Calculate comparison with previous day
    const yesterday = new Date(targetDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const prevReport = await getDailyReport(yesterday);

    if (prevReport) {
        report.comparison = {
            tasksChange: report.metrics.tasksCompleted - prevReport.metrics.tasksCompleted,
            completionRateChange: report.metrics.completionRate - prevReport.metrics.completionRate,
            focusTimeChange: report.metrics.totalFocusMinutes - prevReport.metrics.totalFocusMinutes,
            pointsChange: report.metrics.pointsEarned - prevReport.metrics.pointsEarned
        };
    }

    // Save report
    await saveReport(report);

    console.log('📊 Daily report generated:', targetDate.toDateString());
    return report;
}

/**
 * Generate weekly report
 */
export async function generateWeeklyReport(startDate = null) {
    let weekStart, weekEnd;

    if (startDate) {
        weekStart = new Date(startDate);
        weekStart.setHours(0, 0, 0, 0);
        weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
    } else {
        const range = getWeekRange();
        weekStart = range.start;
        weekEnd = range.end;
    }

    // Get all data
    const [tasks, checkIns, pointsHistory] = await Promise.all([
        getTasks(),
        getCheckInHistory(weekStart, weekEnd),
        getPointsHistory(200)
    ]);

    // Calculate task metrics
    const taskMetrics = calculateTaskMetrics(tasks, weekStart, weekEnd);

    // Calculate points earned this week
    const pointsThisWeek = pointsHistory
        .filter(p => {
            const txDate = new Date(p.timestamp);
            return txDate >= weekStart && txDate < weekEnd;
        })
        .reduce((sum, p) => sum + (p.points > 0 ? p.points : 0), 0);

    const pointsLost = pointsHistory
        .filter(p => {
            const txDate = new Date(p.timestamp);
            return txDate >= weekStart && txDate < weekEnd && p.points < 0;
        })
        .reduce((sum, p) => sum + Math.abs(p.points), 0);

    // Check-ins
    const checkInsCompleted = checkIns.filter(c => c.status !== 'missed').length;
    const checkInsMissed = checkIns.filter(c => c.status === 'missed').length;

    // Find best day
    const dailyTasks = {};
    for (let i = 0; i < 7; i++) {
        const dayStart = new Date(weekStart);
        dayStart.setDate(dayStart.getDate() + i);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const dayTasks = filterTasksByDate(tasks, dayStart, dayEnd);
        const completed = dayTasks.filter(t => t.status === 'completed').length;

        dailyTasks[dayStart.toISOString().split('T')[0]] = completed;
    }

    const bestDay = Object.entries(dailyTasks)
        .sort((a, b) => b[1] - a[1])[0];

    const report = {
        id: `report_${Date.now()}`,
        userId: 'default_user',
        reportType: 'weekly',
        weekNumber: getWeekNumber(weekStart),
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
        metrics: {
            tasksPlanned: taskMetrics.tasksPlanned,
            tasksCompleted: taskMetrics.tasksCompleted,
            tasksMissed: taskMetrics.tasksMissed,
            completionRate: taskMetrics.completionRate,
            focusSessionsCompleted: 0, // TODO
            totalFocusMinutes: 0, // TODO
            checkInsCompleted,
            checkInsMissed,
            pointsEarned: pointsThisWeek,
            pointsLost
        },
        bestDay: bestDay ? {
            date: bestDay[0],
            tasksCompleted: bestDay[1]
        } : null,
        consistency: checkInsCompleted > 0 ?
            Math.round((checkInsCompleted / (checkInsCompleted + checkInsMissed)) * 100) : 0,
        generatedAt: new Date().toISOString()
    };

    // Calculate comparison with previous week
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevReport = await getWeeklyReport(prevWeekStart);

    if (prevReport) {
        report.comparison = {
            tasksChange: report.metrics.tasksCompleted - prevReport.metrics.tasksCompleted,
            completionRateChange: report.metrics.completionRate - prevReport.metrics.completionRate,
            focusTimeChange: report.metrics.totalFocusMinutes - prevReport.metrics.totalFocusMinutes,
            pointsChange: report.metrics.pointsEarned - prevReport.metrics.pointsEarned
        };
    }

    // Save report
    await saveReport(report);

    console.log('📊 Weekly report generated: Week', report.weekNumber);
    return report;
}

/**
 * Save report to storage
 */
async function saveReport(report) {
    try {
        const reportsData = await AsyncStorage.getItem(REPORTS_KEY);
        const reports = reportsData ? JSON.parse(reportsData) : [];

        // Remove old report for same period if exists
        const filtered = reports.filter(r =>
            !(r.reportType === report.reportType && r.startDate === report.startDate)
        );

        filtered.push(report);

        // Keep last 90 days of reports
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);
        const recent = filtered.filter(r => new Date(r.generatedAt) >= cutoffDate);

        await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(recent));
        return true;
    } catch (error) {
        console.error('Error saving report:', error);
        return false;
    }
}

/**
 * Get daily report
 */
export async function getDailyReport(date = new Date()) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    try {
        const reportsData = await AsyncStorage.getItem(REPORTS_KEY);
        const reports = reportsData ? JSON.parse(reportsData) : [];

        return reports.find(r =>
            r.reportType === 'daily' &&
            new Date(r.startDate).toDateString() === targetDate.toDateString()
        );
    } catch (error) {
        console.error('Error getting daily report:', error);
        return null;
    }
}

/**
 * Get weekly report
 */
export async function getWeeklyReport(weekStart) {
    const start = new Date(weekStart);
    start.setHours(0, 0, 0, 0);

    try {
        const reportsData = await AsyncStorage.getItem(REPORTS_KEY);
        const reports = reportsData ? JSON.parse(reportsData) : [];

        return reports.find(r =>
            r.reportType === 'weekly' &&
            new Date(r.startDate).toDateString() === start.toDateString()
        );
    } catch (error) {
        console.error('Error getting weekly report:', error);
        return null;
    }
}

/**
 * Get report history
 */
export async function getReportHistory(days = 30) {
    try {
        const reportsData = await AsyncStorage.getItem(REPORTS_KEY);
        const reports = reportsData ? JSON.parse(reportsData) : [];

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return reports
            .filter(r => new Date(r.generatedAt) >= cutoff)
            .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
    } catch (error) {
        console.error('Error getting report history:', error);
        return [];
    }
}

/**
 * Get week number
 */
function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
