// utils/balanceAnalytics.js
// Work-life balance tracking and analytics

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBreakHistory } from './breakReminder';

const WORK_SESSIONS_KEY = 'work_sessions';

/**
 * Record work session
 */
export async function recordWorkSession(session) {
    try {
        const sessionsData = await AsyncStorage.getItem(WORK_SESSIONS_KEY);
        const sessions = sessionsData ? JSON.parse(sessionsData) : [];

        const entry = {
            id: `session_${Date.now()}`,
            startTime: session.startTime,
            endTime: session.endTime || new Date().toISOString(),
            duration: session.duration, // minutes
            type: session.type || 'focus', // 'focus' | 'work' | 'other'
            completed: session.completed !== false
        };

        sessions.push(entry);

        // Keep last 90 days
        const cutoff = Date.now() - (90 * 24 * 60 * 60 * 1000);
        const filtered = sessions.filter(s => new Date(s.startTime) >= cutoff);

        await AsyncStorage.setItem(WORK_SESSIONS_KEY, JSON.stringify(filtered));
        return entry;
    } catch (error) {
        console.error('Error recording work session:', error);
        return null;
    }
}

/**
 * Get work sessions for date range
 */
export async function getWorkSessions(startDate, endDate) {
    try {
        const sessionsData = await AsyncStorage.getItem(WORK_SESSIONS_KEY);
        const sessions = sessionsData ? JSON.parse(sessionsData) : [];

        return sessions.filter(s => {
            const sessionDate = new Date(s.startTime);
            return sessionDate >= startDate && sessionDate <= endDate;
        });
    } catch (error) {
        console.error('Error getting work sessions:', error);
        return [];
    }
}

/**
 * Calculate daily balance
 */
export async function getDailyBalance(date = new Date()) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const [sessions, breaks] = await Promise.all([
        getWorkSessions(dayStart, dayEnd),
        getBreakHistory(1)
    ]);

    // Calculate work time
    const totalWorkMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    // Calculate break time
    const totalBreakMinutes = breaks
        .filter(b => b.action === 'taken')
        .reduce((sum, b) => sum + (b.duration || 0), 0);

    // Find working hours span
    const workHours = getWorkingHours(sessions);

    return {
        date: dayStart.toISOString(),
        totalWorkMinutes,
        totalBreakMinutes,
        workingHoursStart: workHours.start,
        workingHoursEnd: workHours.end,
        totalHoursSpan: workHours.span,
        focusToBreakRatio: totalBreakMinutes > 0
            ? (totalWorkMinutes / totalBreakMinutes).toFixed(1)
            : totalWorkMinutes > 0 ? '∞' : '0',
        utilizationRate: workHours.span > 0
            ? Math.round((totalWorkMinutes / workHours.span) * 100)
            : 0
    };
}

/**
 * Calculate weekly balance
 */
export async function getWeeklyBalance() {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const dailyBalances = [];

    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + i);

        const balance = await getDailyBalance(day);
        dailyBalances.push(balance);
    }

    // Aggregate
    const totalWorkMinutes = dailyBalances.reduce((sum, d) => sum + d.totalWorkMinutes, 0);
    const totalBreakMinutes = dailyBalances.reduce((sum, d) => sum + d.totalBreakMinutes, 0);

    return {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        totalWorkHours: Math.round(totalWorkMinutes / 60),
        totalBreakHours: Math.round(totalBreakMinutes / 60),
        averageDailyWork: Math.round(totalWorkMinutes / 7 / 60 * 10) / 10,
        dailyBalances,
        mostProductiveDay: findMostProductiveDay(dailyBalances),
        warningIndicators: checkWarningIndicators(dailyBalances)
    };
}

/**
 * Get working hours from sessions
 */
function getWorkingHours(sessions) {
    if (sessions.length === 0) {
        return { start: null, end: null, span: 0 };
    }

    const times = sessions.map(s => new Date(s.startTime).getTime());
    const start = new Date(Math.min(...times));
    const end = new Date(Math.max(...times));

    // Add last session duration to end time
    const lastSession = sessions.find(s => new Date(s.startTime).getTime() === Math.max(...times));
    if (lastSession?.duration) {
        end.setMinutes(end.getMinutes() + lastSession.duration);
    }

    const spanMinutes = Math.round((end - start) / (1000 * 60));

    return {
        start: start.toISOString(),
        end: end.toISOString(),
        span: spanMinutes
    };
}

/**
 * Find most productive day
 */
function findMostProductiveDay(dailyBalances) {
    if (dailyBalances.length === 0) return null;

    const sorted = [...dailyBalances].sort((a, b) => b.totalWorkMinutes - a.totalWorkMinutes);
    const best = sorted[0];

    return {
        date: best.date,
        workMinutes: best.totalWorkMinutes,
        dayName: new Date(best.date).toLocaleDateString('en-US', { weekday: 'long' })
    };
}

/**
 * Check for warning indicators
 */
function checkWarningIndicators(dailyBalances) {
    const warnings = [];

    // Check for excessive work without breaks
    dailyBalances.forEach(day => {
        if (day.totalWorkMinutes > 240 && day.totalBreakMinutes < 30) {
            warnings.push({
                type: 'excessive_work',
                severity: 'medium',
                date: day.date,
                message: `Long work session (${Math.round(day.totalWorkMinutes / 60)}h) with minimal breaks`
            });
        }
    });

    // Check for late-night work
    dailyBalances.forEach(day => {
        if (day.workingHoursEnd) {
            const endHour = new Date(day.workingHoursEnd).getHours();
            if (endHour >= 22 || endHour <= 2) {
                warnings.push({
                    type: 'late_work',
                    severity: 'high',
                    date: day.date,
                    message: `Working late (until ${endHour}:00). Consider better time boundaries.`
                });
            }
        }
    });

    // Check for weekend work
    const weekend = dailyBalances.filter(d => {
        const dayOfWeek = new Date(d.date).getDay();
        return dayOfWeek === 0 || dayOfWeek === 6;
    });

    const weekendWork = weekend.reduce((sum, d) => sum + d.totalWorkMinutes, 0);
    if (weekendWork > 240) {
        warnings.push({
            type: 'weekend_work',
            severity: 'medium',
            message: `Significant weekend work (${Math.round(weekendWork / 60)}h). Remember to rest!`
        });
    }

    // Check for consecutive long days
    let consecutiveLongDays = 0;
    dailyBalances.forEach(day => {
        if (day.totalWorkMinutes > 480) { // >8 hours
            consecutiveLongDays++;
        } else {
            consecutiveLongDays = 0;
        }
    });

    if (consecutiveLongDays >= 3) {
        warnings.push({
            type: 'burnout_risk',
            severity: 'high',
            message: `${consecutiveLongDays} consecutive long days. Risk of burnout.`
        });
    }

    return warnings;
}

/**
 * Get balance score (0-100)
 */
export async function getBalanceScore() {
    const weeklyBalance = await getWeeklyBalance();

    let score = 100;

    // Penalize for warnings
    weeklyBalance.warningIndicators.forEach(warning => {
        if (warning.severity === 'high') score -= 15;
        if (warning.severity === 'medium') score -= 10;
    });

    // Check break ratio
    const breakRatio = weeklyBalance.totalBreakHours / weeklyBalance.totalWorkHours;
    if (breakRatio < 0.1) score -= 20; // Less than 10% breaks
    if (breakRatio < 0.05) score -= 10; // Less than 5% breaks

    // Check average daily work
    if (weeklyBalance.averageDailyWork > 10) score -= 15; // >10h/day average
    if (weeklyBalance.averageDailyWork > 12) score -= 10; // >12h/day average

    return Math.max(0, Math.min(100, score));
}

/**
 * Get weekly trends
 */
export async function getWeeklyTrends(weeks = 4) {
    const trends = [];
    const now = new Date();

    for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i));
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const sessions = await getWorkSessions(weekStart, weekEnd);
        const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

        trends.push({
            weekStart: weekStart.toISOString(),
            totalHours: Math.round(totalMinutes / 60),
            sessionCount: sessions.length
        });
    }

    return trends.reverse(); // Oldest to newest
}
