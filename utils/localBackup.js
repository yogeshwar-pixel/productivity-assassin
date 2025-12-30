// utils/localBackup.js
// Local backup and restore system (export/import files)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTasks } from './taskManager';
import { getAllGoals } from './goalManager';
import { getAllCheckIns } from './checkInManager';
import { getPointsBalance, getPointsHistory } from './penaltySystem';
import { getAllFocusProfiles } from './focusProfileManager';

/**
 * Create complete backup of all user data
 */
export async function createBackup() {
    try {
        // Gather all data
        const [
            tasks,
            goals,
            checkIns,
            points,
            pointsHistory,
            focusProfiles
        ] = await Promise.all([
            getTasks(),
            getAllGoals(),
            getAllCheckIns(),
            getPointsBalance(),
            getPointsHistory(1000),
            getAllFocusProfiles()
        ]);

        // Get all settings from AsyncStorage
        const settingsKeys = [
            'checkin_settings',
            'lock_settings',
            'productivity_checkins',
            'productivity_points',
            'accountability_partners',
            'productivity_reports'
        ];

        const settings = {};
        for (const key of settingsKeys) {
            const value = await AsyncStorage.getItem(key);
            if (value) {
                settings[key] = JSON.parse(value);
            }
        }

        const backupData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            deviceId: await getDeviceId(),
            data: {
                tasks,
                goals,
                checkIns,
                points,
                pointsHistory,
                focusProfiles,
                settings
            }
        };

        // Calculate checksum
        const checksum = await calculateChecksum(JSON.stringify(backupData.data));
        backupData.checksum = checksum;

        console.log('✅ Backup created:', backupData.timestamp);
        return backupData;
    } catch (error) {
        console.error('Error creating backup:', error);
        throw error;
    }
}

/**
 * Export backup to JSON file
 */
export async function exportBackup() {
    const backup = await createBackup();
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `productivity-assassin-backup-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('📥 Backup file downloaded');
    return backup;
}

/**
 * Import backup from JSON file
 */
export async function importBackup(fileContent) {
    try {
        const backup = JSON.parse(fileContent);

        // Verify checksum
        const calculatedChecksum = await calculateChecksum(JSON.stringify(backup.data));
        if (calculatedChecksum !== backup.checksum) {
            throw new Error('Backup file is corrupted (checksum mismatch)');
        }

        // Verify version compatibility
        if (!isVersionCompatible(backup.version)) {
            throw new Error(`Backup version ${backup.version} is not compatible`);
        }

        return backup;
    } catch (error) {
        console.error('Error parsing backup file:', error);
        throw new Error('Invalid backup file format');
    }
}

/**
 * Restore data from backup
 */
export async function restoreFromBackup(backup, options = {}) {
    const {
        clearExisting = true,
        restoreTasks = true,
        restoreGoals = true,
        restoreCheckIns = true,
        restorePoints = true,
        restoreProfiles = true,
        restoreSettings = true
    } = options;

    try {
        // Clear existing data if requested
        if (clearExisting) {
            await clearAllData();
        }

        const { data } = backup;

        // Restore tasks
        if (restoreTasks && data.tasks) {
            await AsyncStorage.setItem('productivity_tasks', JSON.stringify(data.tasks));
            console.log('✅ Tasks restored:', data.tasks.length);
        }

        // Restore goals
        if (restoreGoals && data.goals) {
            await AsyncStorage.setItem('productivity_goals', JSON.stringify(data.goals));
            console.log('✅ Goals restored:', data.goals.length);
        }

        // Restore check-ins
        if (restoreCheckIns && data.checkIns) {
            await AsyncStorage.setItem('productivity_checkins', JSON.stringify(data.checkIns));
            console.log('✅ Check-ins restored:', data.checkIns.length);
        }

        // Restore points
        if (restorePoints) {
            if (data.points) {
                await AsyncStorage.setItem('productivity_points', JSON.stringify(data.points));
            }
            if (data.pointsHistory) {
                await AsyncStorage.setItem('points_history', JSON.stringify(data.pointsHistory));
            }
            console.log('✅ Points restored');
        }

        // Restore focus profiles
        if (restoreProfiles && data.focusProfiles) {
            await AsyncStorage.setItem('focus_profiles', JSON.stringify(data.focusProfiles));
            console.log('✅ Focus profiles restored:', data.focusProfiles.length);
        }

        // Restore settings
        if (restoreSettings && data.settings) {
            for (const [key, value] of Object.entries(data.settings)) {
                await AsyncStorage.setItem(key, JSON.stringify(value));
            }
            console.log('✅ Settings restored');
        }

        console.log('🎉 Restore completed successfully');
        return {
            success: true,
            restoredItems: {
                tasks: data.tasks?.length || 0,
                goals: data.goals?.length || 0,
                checkIns: data.checkIns?.length || 0,
                profiles: data.focusProfiles?.length || 0
            }
        };
    } catch (error) {
        console.error('Error restoring backup:', error);
        throw error;
    }
}

/**
 * Clear all data (use with caution!)
 */
async function clearAllData() {
    const keys = [
        'productivity_tasks',
        'productivity_goals',
        'productivity_checkins',
        'productivity_points',
        'points_history',
        'focus_profiles',
        'accountability_partners',
        'productivity_reports',
        'checkin_settings',
        'lock_settings'
    ];

    await AsyncStorage.multiRemove(keys);
    console.log('🗑️ All data cleared');
}

/**
 * Calculate checksum for data integrity
 */
async function calculateChecksum(data) {
    // Simple hash function (in production, use crypto.subtle.digest)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
}

/**
 * Check version compatibility
 */
function isVersionCompatible(backupVersion) {
    const currentVersion = '1.0.0';
    const [major1] = currentVersion.split('.');
    const [major2] = backupVersion.split('.');

    // Compatible if major version matches
    return major1 === major2;
}

/**
 * Get device ID
 */
async function getDeviceId() {
    let deviceId = await AsyncStorage.getItem('device_id');

    if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('device_id', deviceId);
    }

    return deviceId;
}

/**
 * Get backup summary
 */
export async function getBackupSummary(backup) {
    const { data } = backup;

    return {
        version: backup.version,
        timestamp: backup.timestamp,
        deviceId: backup.deviceId,
        items: {
            tasks: data.tasks?.length || 0,
            goals: data.goals?.length || 0,
            checkIns: data.checkIns?.length || 0,
            focusProfiles: data.focusProfiles?.length || 0,
            totalPoints: data.points?.totalPoints || 0
        },
        size: new Blob([JSON.stringify(backup)]).size
    };
}

/**
 * Validate backup before restore
 */
export async function validateBackup(backup) {
    const errors = [];

    if (!backup.version) {
        errors.push('Missing version information');
    }

    if (!backup.timestamp) {
        errors.push('Missing timestamp');
    }

    if (!backup.checksum) {
        errors.push('Missing checksum');
    } else {
        const calculated = await calculateChecksum(JSON.stringify(backup.data));
        if (calculated !== backup.checksum) {
            errors.push('Checksum verification failed - file may be corrupted');
        }
    }

    if (!backup.data) {
        errors.push('Missing data');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Compare backup with current data
 */
export async function compareWithCurrent(backup) {
    const current = await createBackup();

    return {
        backup: {
            tasks: backup.data.tasks?.length || 0,
            goals: backup.data.goals?.length || 0,
            points: backup.data.points?.totalPoints || 0,
            timestamp: backup.timestamp
        },
        current: {
            tasks: current.data.tasks?.length || 0,
            goals: current.data.goals?.length || 0,
            points: current.data.points?.totalPoints || 0,
            timestamp: current.timestamp
        },
        differences: {
            tasksDiff: (current.data.tasks?.length || 0) - (backup.data.tasks?.length || 0),
            goalsDiff: (current.data.goals?.length || 0) - (backup.data.goals?.length || 0),
            pointsDiff: (current.data.points?.totalPoints || 0) - (backup.data.points?.totalPoints || 0)
        }
    };
}
