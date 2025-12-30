// utils/focusProfileManager.js
// Customizable focus profiles system

import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILES_KEY = 'focus_profiles';
const ACTIVE_PROFILE_KEY = 'active_focus_profile';

/**
 * Default focus profiles
 */
const DEFAULT_PROFILES = {
    deepWork: {
        id: 'deep_work',
        name: 'Deep Work',
        description: 'Maximum focus for complex tasks',
        rules: {
            sessionDuration: 90,
            breakDuration: 15,
            pomodoroEnabled: false,
            strictMode: true,
            exitPenalty: 30,
            minProgressPercent: 80,
            redirectWebsite: '', // User's organization/study website
            blockedWebsites: ['*'], // Block all
            allowedWebsites: [
                'stackoverflow.com',
                'github.com',
                'docs.python.org',
                'developer.mozilla.org'
            ],
            blockedApps: [],
            allowNotifications: false
        },
        color: '#ff3333',
        icon: '🔥',
        isDefault: true,
        createdAt: new Date().toISOString()
    },
    study: {
        id: 'study',
        name: 'Study Session',
        description: 'Focused learning with breaks',
        rules: {
            sessionDuration: 50,
            breakDuration: 10,
            pomodoroEnabled: true,
            strictMode: true,
            exitPenalty: 20,
            minProgressPercent: 70,
            redirectWebsite: '', // User's organization/study website
            blockedWebsites: [
                'youtube.com',
                'netflix.com',
                'reddit.com',
                'twitter.com',
                'instagram.com',
                'facebook.com'
            ],
            allowedWebsites: [
                'google.com',
                'wikipedia.org',
                'khanacademy.org'
            ],
            blockedApps: [],
            allowNotifications: false
        },
        color: '#00aaff',
        icon: '📚',
        isDefault: true,
        createdAt: new Date().toISOString()
    },
    lightFocus: {
        id: 'light_focus',
        name: 'Light Focus',
        description: 'Gentle productivity boost',
        rules: {
            sessionDuration: 25,
            breakDuration: 5,
            pomodoroEnabled: true,
            strictMode: false,
            exitPenalty: 10,
            minProgressPercent: 50,
            redirectWebsite: '', // User's organization/study website
            blockedWebsites: [],
            allowedWebsites: ['*'], // Allow all
            blockedApps: [],
            allowNotifications: true
        },
        color: '#00ff99',
        icon: '🌱',
        isDefault: true,
        createdAt: new Date().toISOString()
    }
};

/**
 * Get all focus profiles
 */
export async function getAllFocusProfiles() {
    try {
        const profilesData = await AsyncStorage.getItem(PROFILES_KEY);
        let profiles = profilesData ? JSON.parse(profilesData) : [];

        // Initialize with defaults if empty
        if (profiles.length === 0) {
            profiles = Object.values(DEFAULT_PROFILES);
            await saveFocusProfiles(profiles);
        }

        return profiles;
    } catch (error) {
        console.error('Error loading focus profiles:', error);
        return Object.values(DEFAULT_PROFILES);
    }
}

/**
 * Save focus profiles
 */
async function saveFocusProfiles(profiles) {
    try {
        await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
        return true;
    } catch (error) {
        console.error('Error saving focus profiles:', error);
        return false;
    }
}

/**
 * Create custom focus profile
 */
export async function createFocusProfile(profileData) {
    const profiles = await getAllFocusProfiles();

    const newProfile = {
        id: `profile_${Date.now()}`,
        name: profileData.name,
        description: profileData.description || '',
        rules: {
            sessionDuration: profileData.sessionDuration || 25,
            breakDuration: profileData.breakDuration || 5,
            pomodoroEnabled: profileData.pomodoroEnabled !== false,
            strictMode: profileData.strictMode || false,
            exitPenalty: profileData.exitPenalty || 15,
            minProgressPercent: profileData.minProgressPercent || 70,
            redirectWebsite: profileData.redirectWebsite || '',
            blockedWebsites: profileData.blockedWebsites || [],
            allowedWebsites: profileData.allowedWebsites || [],
            blockedApps: profileData.blockedApps || [],
            allowNotifications: profileData.allowNotifications !== false
        },
        color: profileData.color || '#00aaff',
        icon: profileData.icon || '⭐',
        isDefault: false,
        createdAt: new Date().toISOString()
    };

    profiles.push(newProfile);
    await saveFocusProfiles(profiles);

    console.log('✅ Focus profile created:', newProfile.name);
    return newProfile;
}

/**
 * Update focus profile
 */
export async function updateFocusProfile(profileId, updates) {
    const profiles = await getAllFocusProfiles();
    const profile = profiles.find(p => p.id === profileId);

    if (!profile) return null;
    if (profile.isDefault && updates.isDefault === false) {
        throw new Error('Cannot modify default profiles');
    }

    Object.assign(profile, updates);
    profile.updatedAt = new Date().toISOString();

    await saveFocusProfiles(profiles);
    return profile;
}

/**
 * Delete focus profile
 */
export async function deleteFocusProfile(profileId) {
    const profiles = await getAllFocusProfiles();
    const profile = profiles.find(p => p.id === profileId);

    if (profile?.isDefault) {
        throw new Error('Cannot delete default profiles');
    }

    const filtered = profiles.filter(p => p.id !== profileId);
    await saveFocusProfiles(filtered);

    console.log('🗑️ Profile deleted:', profileId);
    return true;
}

/**
 * Get active focus profile
 */
export async function getActiveFocusProfile() {
    try {
        const activeId = await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);

        if (!activeId) {
            // Default to study profile
            return (await getAllFocusProfiles()).find(p => p.id === 'study');
        }

        const profiles = await getAllFocusProfiles();
        return profiles.find(p => p.id === activeId) || profiles[0];
    } catch (error) {
        console.error('Error getting active profile:', error);
        return DEFAULT_PROFILES.study;
    }
}

/**
 * Set active focus profile
 */
export async function setActiveFocusProfile(profileId) {
    const profiles = await getAllFocusProfiles();
    const profile = profiles.find(p => p.id === profileId);

    if (!profile) {
        throw new Error('Profile not found');
    }

    await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, profileId);

    // Apply profile rules to Chrome extension
    await applyProfileToExtension(profile);

    console.log('✅ Active profile set:', profile.name);
    return profile;
}

/**
 * Apply profile rules to Chrome extension
 */
async function applyProfileToExtension(profile) {
    try {
        // Send message to extension content script
        window.postMessage({
            type: 'APPLY_FOCUS_PROFILE',
            source: 'productivity-assassin-app',
            profile: {
                redirectWebsite: profile.rules.redirectWebsite,
                blockedSites: profile.rules.blockedWebsites,
                allowedSites: profile.rules.allowedWebsites,
                strictMode: profile.rules.strictMode
            }
        }, '*');

        console.log('📤 Profile rules sent to extension');
    } catch (error) {
        console.error('Error applying profile to extension:', error);
    }
}

/**
 * Check if website is blocked by active profile
 */
export async function isWebsiteBlocked(url) {
    const profile = await getActiveFocusProfile();
    const { blockedWebsites, allowedWebsites } = profile.rules;

    const domain = new URL(url).hostname.replace('www.', '');

    // Check if explicitly allowed
    if (allowedWebsites.includes('*')) return false;
    if (allowedWebsites.some(site => domain.includes(site))) return false;

    // Check if blocked
    if (blockedWebsites.includes('*')) return true;
    if (blockedWebsites.some(site => domain.includes(site))) return true;

    return false;
}

/**
 * Get profile statistics
 */
export async function getProfileStatistics(profileId) {
    // TODO: Integrate with session history
    // For now, return mock stats
    return {
        profileId,
        totalSessions: 0,
        totalMinutes: 0,
        averageCompletion: 0,
        lastUsed: null
    };
}

/**
 * Duplicate profile
 */
export async function duplicateFocusProfile(profileId) {
    const profiles = await getAllFocusProfiles();
    const source = profiles.find(p => p.id === profileId);

    if (!source) return null;

    const duplicate = {
        ...source,
        id: `profile_${Date.now()}`,
        name: `${source.name} (Copy)`,
        isDefault: false,
        createdAt: new Date().toISOString()
    };

    delete duplicate.updatedAt;

    profiles.push(duplicate);
    await saveFocusProfiles(profiles);

    return duplicate;
}
