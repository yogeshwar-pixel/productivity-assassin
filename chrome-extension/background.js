// background.js - Chrome Extension Service Worker
// Monitors all browser tabs and detects distractions

// Blacklisted websites (distractions)
const BLACKLIST_SITES = [
    'instagram.com', 'facebook.com', 'twitter.com', 'x.com', 'tiktok.com',
    'reddit.com', 'youtube.com', 'netflix.com', 'primevideo.com',
    'discord.com', 'twitch.tv', 'pinterest.com', '9gag.com'
];

// Whitelist keywords for YouTube (only these are OK)
const YOUTUBE_ALLOWED_KEYWORDS = ['tutorial', 'documentation', 'course', 'lecture', 'learning'];

// Track current tab
let currentTab = null;
let focusModeActive = false;

// Listen for tab activation (user switches tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    handleTabChange(tab);
});

// Listen for tab updates (URL or title changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' || changeInfo.title) {
        handleTabChange(tab);
    }
});

// Handle tab change detection
function handleTabChange(tab) {
    if (!tab || !tab.url) return;

    const url = new URL(tab.url);
    const domain = url.hostname.replace('www.', '');
    const title = tab.title || '';

    console.log(`[Productivity Assassin] Tab changed: ${domain} - ${title}`);

    // Check if it's a blacklisted site
    const isBlacklisted = BLACKLIST_SITES.some(site => domain.includes(site));

    // Special handling for YouTube
    let distractionDetected = isBlacklisted;
    if (domain.includes('youtube.com')) {
        const titleLower = title.toLowerCase();
        const isLearning = YOUTUBE_ALLOWED_KEYWORDS.some(kw => titleLower.includes(kw));
        distractionDetected = !isLearning;
    }

    // Build activity payload
    const payload = {
        url: tab.url,
        domain,
        title,
        tabId: tab.id,
        distraction: distractionDetected,
        timestamp: new Date().toISOString(),
    };

    // Store current activity
    chrome.storage.local.set({ currentActivity: payload });

    // If distraction detected, notify
    if (distractionDetected) {
        console.warn(`[Productivity Assassin] ⚠️ DISTRACTION DETECTED: ${domain}`);

        // Show notification
        showDistractionNotification(domain, title);

        // Send message to content script
        chrome.tabs.sendMessage(tab.id, {
            type: 'DISTRACTION_DETECTED',
            data: payload
        }).catch(() => {
            // Content script not ready yet, that's OK
        });

        // Send to React app if it's open
        sendToReactApp(payload);
    }

    currentTab = payload;
}

// Show browser notification
function showDistractionNotification(domain, title) {
    // Notifications disabled for now - using overlay instead
    console.log(`🚨 Would show notification for: ${domain}`);
    /*
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: '🚫 Distraction Detected!',
      message: `You're on ${domain} - Get back to work!`,
      priority: 2
    });
    */
}

// Send data to React app (if localhost is open)
async function sendToReactApp(payload) {
    try {
        const tabs = await chrome.tabs.query({ url: '*://localhost:*/*' });
        if (tabs.length > 0) {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'BROWSER_ACTIVITY',
                    data: payload
                }).catch(() => { });
            });
        }
    } catch (error) {
        // React app not open, that's fine
    }
}

// Get current activity (for popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_CURRENT_ACTIVITY') {
        chrome.storage.local.get(['currentActivity'], (result) => {
            sendResponse(result.currentActivity || null);
        });
        return true; // Keep channel open for async response
    }

    if (request.type === 'TOGGLE_FOCUS_MODE') {
        focusModeActive = request.enabled;
        console.log(`[Productivity Assassin] Focus Mode: ${focusModeActive ? 'ON' : 'OFF'}`);
        sendResponse({ success: true });
    }

    if (request.type === 'SET_STRICT_MODE') {
        // Save strict mode state to storage
        chrome.storage.local.set({ strictMode: request.enabled }, () => {
            console.log(`[Productivity Assassin] 🔒 Strict Mode: ${request.enabled ? 'ENABLED' : 'DISABLED'}`);
            sendResponse({ success: true });
        });
        return true;
    }
});

console.log('[Productivity Assassin] Background service worker loaded');
