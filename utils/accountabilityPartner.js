// utils/accountabilityPartner.js
// Accountability partner and group management system

import AsyncStorage from '@react-native-async-storage/async-storage';

const PARTNERS_KEY = 'accountability_partners';
const NUDGES_KEY = 'accountability_nudges';
const SHARED_PROGRESS_KEY = 'shared_progress';

/**
 * Generate unique ID
 */
function generateId() {
    return `partner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all partners
 */
export async function getAllPartners() {
    try {
        const partners = await AsyncStorage.getItem(PARTNERS_KEY);
        return partners ? JSON.parse(partners) : [];
    } catch (error) {
        console.error('Error loading partners:', error);
        return [];
    }
}

/**
 * Save partners
 */
async function savePartners(partners) {
    try {
        await AsyncStorage.setItem(PARTNERS_KEY, JSON.stringify(partners));
        return true;
    } catch (error) {
        console.error('Error saving partners:', error);
        return false;
    }
}

/**
 * Add accountability partner
 */
export async function addAccountabilityPartner(partnerData) {
    const partners = await getAllPartners();

    const newPartner = {
        id: generateId(),
        userId: 'default_user',
        partnerId: partnerData.partnerId || generateId(),
        partnerName: partnerData.name,
        partnerEmail: partnerData.email || '',
        relationship: partnerData.relationship || 'partner', // 'partner' or 'group'
        shareLevel: partnerData.shareLevel || 'basic', // 'basic' or 'detailed'
        settings: {
            shareTaskContent: partnerData.shareTaskContent || false,
            autoNudge: partnerData.autoNudge !== false,
            nudgeThreshold: partnerData.nudgeThreshold || 24, // hours
            receiveNudges: partnerData.receiveNudges !== false
        },
        createdAt: new Date().toISOString(),
        status: 'active',
        lastSync: null
    };

    partners.push(newPartner);
    await savePartners(partners);

    console.log('✅ Partner added:', newPartner.partnerName);
    return newPartner;
}

/**
 * Remove partner
 */
export async function removePartner(partnerId) {
    const partners = await getAllPartners();
    const filtered = partners.filter(p => p.id !== partnerId);

    await savePartners(filtered);
    console.log('🗑️ Partner removed:', partnerId);
    return true;
}

/**
 * Update partner settings
 */
export async function updatePartnerSettings(partnerId, settings) {
    const partners = await getAllPartners();
    const partner = partners.find(p => p.id === partnerId);

    if (!partner) return null;

    partner.settings = { ...partner.settings, ...settings };
    partner.shareLevel = settings.shareLevel || partner.shareLevel;

    await savePartners(partners);
    return partner;
}

/**
 * Pause/Resume partner sharing
 */
export async function togglePartnerStatus(partnerId) {
    const partners = await getAllPartners();
    const partner = partners.find(p => p.id === partnerId);

    if (!partner) return null;

    partner.status = partner.status === 'active' ? 'paused' : 'active';
    await savePartners(partners);

    return partner;
}

/**
 * Generate progress data to share
 */
export async function generateProgressData(shareLevel = 'basic') {
    const { getTasks } = require('./taskManager');
    const { getAllGoals } = require('./goalManager');
    const { getPointsBalance } = require('./penaltySystem');
    const { getCheckInStreak } = require('./checkInManager');

    const [tasks, goals, points, streak] = await Promise.all([
        getTasks(),
        getAllGoals(),
        getPointsBalance(),
        getCheckInStreak()
    ]);

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const activeGoals = goals.filter(g => g.status === 'active');

    const basicData = {
        tasksCompleted: completedTasks,
        totalTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        activeGoalsCount: activeGoals.length,
        currentStreak: streak,
        totalPoints: points.totalPoints,
        lastUpdated: new Date().toISOString()
    };

    if (shareLevel === 'detailed') {
        return {
            ...basicData,
            goalProgress: activeGoals.map(g => ({
                title: g.title,
                progress: g.progress,
                type: g.type
            })),
            recentTasks: tasks
                .filter(t => t.status === 'completed')
                .slice(-5)
                .map(t => ({
                    title: t.title,
                    completedAt: t.completedAt
                }))
        };
    }

    return basicData;
}

/**
 * Share progress with partner
 */
export async function shareProgress(partnerId) {
    const partners = await getAllPartners();
    const partner = partners.find(p => p.id === partnerId);

    if (!partner || partner.status !== 'active') return null;

    const progressData = await generateProgressData(partner.shareLevel);

    // Store shared progress (in real app, would send to server)
    try {
        const sharedData = await AsyncStorage.getItem(SHARED_PROGRESS_KEY);
        const shares = sharedData ? JSON.parse(sharedData) : {};

        shares[partnerId] = {
            ...progressData,
            sharedAt: new Date().toISOString()
        };

        await AsyncStorage.setItem(SHARED_PROGRESS_KEY, JSON.stringify(shares));

        // Update last sync
        partner.lastSync = new Date().toISOString();
        await savePartners(partners);

        console.log('📤 Progress shared with:', partner.partnerName);
        return progressData;
    } catch (error) {
        console.error('Error sharing progress:', error);
        return null;
    }
}

/**
 * Get partner's progress (mock - in real app would fetch from server)
 */
export async function getPartnerProgress(partnerId) {
    try {
        const sharedData = await AsyncStorage.getItem(SHARED_PROGRESS_KEY);
        const shares = sharedData ? JSON.parse(sharedData) : {};

        // Mock partner progress (in real app, would fetch from API)
        const mockProgress = {
            tasksCompleted: Math.floor(Math.random() * 20) + 5,
            totalTasks: Math.floor(Math.random() * 30) + 10,
            completionRate: Math.floor(Math.random() * 40) + 50,
            activeGoalsCount: Math.floor(Math.random() * 5) + 1,
            currentStreak: Math.floor(Math.random() * 14),
            totalPoints: Math.floor(Math.random() * 500) + 100,
            lastUpdated: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        };

        return shares[partnerId] || mockProgress;
    } catch (error) {
        console.error('Error getting partner progress:', error);
        return null;
    }
}

/**
 * Send nudge to partner
 */
export async function sendNudge(partnerId, message = null) {
    const partners = await getAllPartners();
    const partner = partners.find(p => p.id === partnerId);

    if (!partner) return null;

    const nudge = {
        id: `nudge_${Date.now()}`,
        fromUserId: 'default_user',
        toPartnerId: partnerId,
        message: message || `Hey! Just checking in. How's progress on your goals? 💪`,
        type: message ? 'manual' : 'auto',
        sentAt: new Date().toISOString(),
        read: false
    };

    try {
        const nudgesData = await AsyncStorage.getItem(NUDGES_KEY);
        const nudges = nudgesData ? JSON.parse(nudgesData) : [];

        nudges.push(nudge);
        await AsyncStorage.setItem(NUDGES_KEY, JSON.stringify(nudges));

        console.log('📨 Nudge sent to:', partner.partnerName);
        return nudge;
    } catch (error) {
        console.error('Error sending nudge:', error);
        return null;
    }
}

/**
 * Get received nudges
 */
export async function getReceivedNudges() {
    try {
        const nudgesData = await AsyncStorage.getItem(NUDGES_KEY);
        const allNudges = nudgesData ? JSON.parse(nudgesData) : [];

        // Filter nudges for current user (in real app would be server-side)
        return allNudges.filter(n => n.toPartnerId === 'default_user');
    } catch (error) {
        console.error('Error getting nudges:', error);
        return [];
    }
}

/**
 * Mark nudge as read
 */
export async function markNudgeRead(nudgeId) {
    try {
        const nudgesData = await AsyncStorage.getItem(NUDGES_KEY);
        const nudges = nudgesData ? JSON.parse(nudgesData) : [];

        const nudge = nudges.find(n => n.id === nudgeId);
        if (nudge) {
            nudge.read = true;
            await AsyncStorage.setItem(NUDGES_KEY, JSON.stringify(nudges));
        }

        return nudge;
    } catch (error) {
        console.error('Error marking nudge read:', error);
        return null;
    }
}

/**
 * Check if auto-nudge should be sent
 */
export async function checkAutoNudge(partnerId) {
    const partners = await getAllPartners();
    const partner = partners.find(p => p.id === partnerId);

    if (!partner || !partner.settings.autoNudge) return false;

    const partnerProgress = await getPartnerProgress(partnerId);
    if (!partnerProgress) return false;

    const lastUpdate = new Date(partnerProgress.lastUpdated);
    const hoursSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60);

    // Send nudge if no progress for threshold hours
    if (hoursSinceUpdate >= partner.settings.nudgeThreshold) {
        await sendNudge(partnerId);
        return true;
    }

    return false;
}

/**
 * Get partner statistics
 */
export async function getPartnerStats() {
    const partners = await getAllPartners();
    const nudges = await getReceivedNudges();

    return {
        totalPartners: partners.length,
        activePartners: partners.filter(p => p.status === 'active').length,
        nudgesReceived: nudges.length,
        unreadNudges: nudges.filter(n => !n.read).length
    };
}
