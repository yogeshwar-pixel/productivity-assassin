// utils/checkInEngine.js
// Self-Check-In System - Periodic accountability prompts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { deductPoints, addPoints } from './penaltyEngine';

const CHECKINS_KEY = 'accountability_checkins';
const SETTINGS_KEY = 'checkin_settings';
const LAST_CHECKIN_KEY = 'last_checkin_time';

/**
 * Default check-in settings
 */
const DEFAULT_SETTINGS = {
    intervalMinutes: 30,
    autoDismissSeconds: 60,
    enabled: false,
    consecutiveMissThreshold: 2
};

/**
 * Get check-in settings
 */
export async function getCheckInSettings() {
    try {
        const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
        return settingsJson ? JSON.parse(settingsJson) : DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error getting check-in settings:', error);
        return DEFAULT_SETTINGS;
    }
}

/**
 * Update check-in settings
 */
export async function updateCheckInSettings(updates) {
    const current = await getCheckInSettings();
    const updated = { ...current, ...updates };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
}

/**
 * Get all check-ins
 */
async function getCheckIns() {
    try {
        const checkinsJson = await AsyncStorage.getItem(CHECKINS_KEY);
        return checkinsJson ? JSON.parse(checkinsJson) : [];
    } catch (error) {
        console.error('Error getting check-ins:', error);
        return [];
    }
}

/**
 * Save check-ins
 */
async function saveCheckIns(checkins) {
    try {
        await AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(checkins));
    } catch (error) {
        console.error('Error saving check-ins:', error);
    }
}

/**
 * Log a check-in response
 */
export async function logCheckIn(status) {
    const checkins = await getCheckIns();
    const settings = await getCheckInSettings();

    const checkin = {
        id: `checkin_${Date.now()}`,
        timestamp: new Date().toISOString(),
        status, // 'on-track', 'falling-behind', 'distracted'
        intervalMinutes: settings.intervalMinutes,
        missedConsecutive: 0 // Reset on response
    };

    checkins.push(checkin);
    await saveCheckIns(checkins);
    await AsyncStorage.setItem(LAST_CHECKIN_KEY, checkin.timestamp);

    // Award points for on-track response
    if (status === 'on-track') {
        await addPoints('ON_TRACK_CHECKIN');
    }

    // Trigger support message for negative status
    if (status === 'falling-behind' || status === 'distracted') {
        console.log(`⚠️ User reported: ${status}`);
        // Could trigger additional intervention here
    }

    console.log(`📝 Check-in logged: ${status}`);
    return checkin;
}

/**
 * Mark check-in as missed
 */
export async function markMissedCheckIn() {
    const checkins = await getCheckIns();
    const settings = await getCheckInSettings();

    // Count consecutive misses
    let consecutiveMisses = 0;
    for (let i = checkins.length - 1; i >= 0; i--) {
        if (checkins[i].status === 'missed') {
            consecutiveMisses++;
        } else {
            break;
        }
    }

    const checkin = {
        id: `checkin_${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'missed',
        intervalMinutes: settings.intervalMinutes,
        missedConsecutive: consecutiveMisses + 1
    };

    checkins.push(checkin);
    await saveCheckIns(checkins);

    // Apply penalty for missed check-in
    await deductPoints('SKIPPED_CHECKIN');

    // Auto-mark as distracted after threshold
    if (checkin.missedConsecutive >= settings.consecutiveMissThreshold) {
        console.log(`🚨 ${checkin.missedConsecutive} consecutive misses - marked as distracted`);
        checkin.autoDistracted = true;
    }

    console.log(`❌ Check-in missed (${checkin.missedConsecutive} consecutive)`);
    return checkin;
}

/**
 * Check if check-in is due
 */
export async function isCheckInDue() {
    const settings = await getCheckInSettings();
    if (!settings.enabled) return false;

    const lastCheckinStr = await AsyncStorage.getItem(LAST_CHECKIN_KEY);
    if (!lastCheckinStr) return true; // First check-in

    const lastCheckin = new Date(lastCheckinStr);
    const now = new Date();
    const minutesSince = (now - lastCheckin) / (1000 * 60);

    return minutesSince >= settings.intervalMinutes;
}

/**
 * Get check-in history for last N days
 */
export async function getCheckInHistory(days = 7) {
    const checkins = await getCheckIns();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return checkins.filter(c => new Date(c.timestamp) >= cutoff);
}

/**
 * Calculate check-in trend statistics
 */
export async function getCheckInTrend(days = 7) {
    const history = await getCheckInHistory(days);

    if (history.length === 0) {
        return {
            totalCheckins: 0,
            onTrackPercent: 0,
            missedPercent: 0,
            distractedPercent: 0
        };
    }

    const onTrack = history.filter(c => c.status === 'on-track').length;
    const fallingBehind = history.filter(c => c.status === 'falling-behind').length;
    const distracted = history.filter(c => c.status === 'distracted').length;
    const missed = history.filter(c => c.status === 'missed').length;

    return {
        totalCheckins: history.length,
        onTrackPercent: Math.round((onTrack / history.length) * 100),
        fallingBehindPercent: Math.round((fallingBehind / history.length) * 100),
        distractedPercent: Math.round((distracted / history.length) * 100),
        missedPercent: Math.round((missed / history.length) * 100),
        consecutiveMisses: history[history.length - 1]?.missedConsecutive || 0
    };
}

/**
 * Get time until next check-in
 */
export async function getTimeUntilNextCheckIn() {
    const settings = await getCheckInSettings();
    const lastCheckinStr = await AsyncStorage.getItem(LAST_CHECKIN_KEY);

    if (!lastCheckinStr) return 0;

    const lastCheckin = new Date(lastCheckinStr);
    const nextCheckIn = new Date(lastCheckin.getTime() + settings.intervalMinutes * 60 * 1000);
    const now = new Date();

    return Math.max(0, nextCheckIn - now);
}
