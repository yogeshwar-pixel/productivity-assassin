// utils/checkInManager.js
// Self-check-in system with interval scheduling

import AsyncStorage from '@react-native-async-storage/async-storage';

const CHECKINS_KEY = 'productivity_checkins';
const CHECKIN_SETTINGS_KEY = 'checkin_settings';

/**
 * Generate unique ID for check-ins
 */
function generateId() {
    return `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get check-in settings
 */
export async function getCheckInSettings() {
    try {
        const settings = await AsyncStorage.getItem(CHECKIN_SETTINGS_KEY);
        return settings ? JSON.parse(settings) : {
            enabled: true,
            intervalMinutes: 30,
            pauseDuringBreaks: true,
            requireResponse: true
        };
    } catch (error) {
        console.error('Error loading check-in settings:', error);
        return { enabled: true, intervalMinutes: 30 };
    }
}

/**
 * Update check-in settings
 */
export async function updateCheckInSettings(settings) {
    try {
        await AsyncStorage.setItem(CHECKIN_SETTINGS_KEY, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error('Error saving check-in settings:', error);
        return false;
    }
}

/**
 * Get all check-in records
 */
export async function getAllCheckIns() {
    try {
        const checkIns = await AsyncStorage.getItem(CHECKINS_KEY);
        return checkIns ? JSON.parse(checkIns) : [];
    } catch (error) {
        console.error('Error loading check-ins:', error);
        return [];
    }
}

/**
 * Save check-in records
 */
async function saveCheckIns(checkIns) {
    try {
        await AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(checkIns));
        return true;
    } catch (error) {
        console.error('Error saving check-ins:', error);
        return false;
    }
}

/**
 * Record a check-in response
 */
export async function recordCheckIn(data) {
    const checkIns = await getAllCheckIns();

    const newCheckIn = {
        id: generateId(),
        userId: data.userId || 'default_user',
        timestamp: new Date().toISOString(),
        status: data.status, // 'on-track' | 'falling-behind' | 'distracted'
        taskIds: data.taskIds || [],
        goalIds: data.goalIds || [],
        sessionId: data.sessionId || null,
        notes: data.notes || '',
        mood: data.mood || null, // 1-5
        wasPrompted: data.wasPrompted !== false
    };

    checkIns.push(newCheckIn);
    await saveCheckIns(checkIns);

    console.log('✅ Check-in recorded:', newCheckIn.status);
    return newCheckIn;
}

/**
 * Record a missed check-in
 */
export async function recordMissedCheckIn(sessionId = null) {
    const checkIns = await getAllCheckIns();

    const missedCheckIn = {
        id: generateId(),
        userId: 'default_user',
        timestamp: new Date().toISOString(),
        status: 'missed',
        taskIds: [],
        goalIds: [],
        sessionId,
        notes: 'Auto-recorded as missed',
        mood: null,
        wasPrompted: true
    };

    checkIns.push(missedCheckIn);
    await saveCheckIns(checkIns);

    console.log('⚠️ Missed check-in recorded');
    return missedCheckIn;
}

/**
 * Get check-in history for a date range
 */
export async function getCheckInHistory(startDate, endDate) {
    const checkIns = await getAllCheckIns();

    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    return checkIns.filter(c => {
        const checkDate = new Date(c.timestamp);
        return checkDate >= start && checkDate <= end;
    });
}

/**
 * Get today's check-ins
 */
export async function getTodayCheckIns() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return getCheckInHistory(today, tomorrow);
}

/**
 * Calculate check-in consistency metrics
 */
export async function calculateConsistency(days = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const checkIns = await getCheckInHistory(startDate, endDate);

    const settings = await getCheckInSettings();
    const expectedCheckIns = Math.floor((days * 24 * 60) / settings.intervalMinutes);

    const totalCheckIns = checkIns.length;
    const missedCheckIns = checkIns.filter(c => c.status === 'missed').length;
    const respondedCheckIns = totalCheckIns - missedCheckIns;

    const onTrackCount = checkIns.filter(c => c.status === 'on-track').length;
    const fallingBehindCount = checkIns.filter(c => c.status === 'falling-behind').length;
    const distractedCount = checkIns.filter(c => c.status === 'distracted').length;

    const consistencyRate = totalCheckIns > 0 ? (respondedCheckIns / totalCheckIns) * 100 : 0;
    const onTrackRate = respondedCheckIns > 0 ? (onTrackCount / respondedCheckIns) * 100 : 0;

    return {
        totalCheckIns,
        respondedCheckIns,
        missedCheckIns,
        onTrackCount,
        fallingBehindCount,
        distractedCount,
        consistencyRate: Math.round(consistencyRate),
        onTrackRate: Math.round(onTrackRate),
        expectedCheckIns
    };
}

/**
 * Get last check-in
 */
export async function getLastCheckIn() {
    const checkIns = await getAllCheckIns();
    if (checkIns.length === 0) return null;

    return checkIns[checkIns.length - 1];
}

/**
 * Calculate time since last check-in (in minutes)
 */
export async function getTimeSinceLastCheckIn() {
    const lastCheckIn = await getLastCheckIn();
    if (!lastCheckIn) return Infinity;

    const now = new Date();
    const lastTime = new Date(lastCheckIn.timestamp);
    const diffMs = now - lastTime;
    return Math.floor(diffMs / (1000 * 60));
}

/**
 * Check if a check-in is due
 */
export async function isCheckInDue() {
    const settings = await getCheckInSettings();
    if (!settings.enabled) return false;

    const timeSinceLast = await getTimeSinceLastCheckIn();
    return timeSinceLast >= settings.intervalMinutes;
}

/**
 * Get check-in streak (consecutive days with at least 1 check-in)
 */
export async function getCheckInStreak() {
    const checkIns = await getAllCheckIns();
    if (checkIns.length === 0) return 0;

    // Sort by date descending
    const sorted = checkIns.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) { // Check last 30 days
        const dayStart = new Date(currentDate);
        const dayEnd = new Date(currentDate);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const hasCheckIn = sorted.some(c => {
            const checkDate = new Date(c.timestamp);
            return checkDate >= dayStart && checkDate < dayEnd;
        });

        if (hasCheckIn) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}
