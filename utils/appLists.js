// utils/appLists.js
// Whitelist and Blacklist configuration for productivity enforcement

/**
 * WHITELIST - Productive apps and websites allowed during Focus Mode
 * These apps help with work, learning, and productivity
 */
export const WHITELIST = {
    apps: [
        // Development Tools
        "VS Code",
        "Visual Studio Code",
        "Visual Studio",
        "IntelliJ IDEA",
        "PyCharm",
        "WebStorm",
        "Android Studio",
        "Xcode",
        "Sublime Text",
        "Atom",
        "Notepad++",
        "Vim",
        "Emacs",

        // Terminals & Command Line
        "Terminal",
        "PowerShell",
        "Command Prompt",
        "iTerm",
        "Hyper",
        "Git Bash",

        // Browsers (for work-related tabs only)
        "Chrome",
        "Firefox",
        "Safari",
        "Edge",
        "Brave",

        // Communication (work-related)
        "Slack",
        "Microsoft Teams",
        "Zoom",
        "Google Meet",
        "Skype",

        // Productivity Apps
        "Notion",
        "Obsidian",
        "OneNote",
        "Evernote",
        "Todoist",
        "Trello",
        "Asana",
        "Jira",

        // Office Suite
        "Microsoft Word",
        "Microsoft Excel",
        "Microsoft PowerPoint",
        "Google Docs",
        "Google Sheets",
        "Google Slides",
        "LibreOffice Writer",

        // Design & Creative (work)
        "Figma",
        "Adobe Photoshop",
        "Adobe Illustrator",
        "Canva",
        "Sketch",

        // Learning Platforms
        "Coursera",
        "Udemy",
        "Khan Academy",
        "edX",

        // Documentation & Reading
        "Adobe Acrobat",
        "PDF Reader",
        "Kindle",

        // System & Utilities
        "File Explorer",
        "Finder",
        "Calculator",
    ],

    websites: [
        // Documentation
        "stackoverflow.com",
        "github.com",
        "developer.mozilla.org",
        "docs.python.org",
        "react.dev",
        "nodejs.org",
        "w3schools.com",

        // Learning
        "coursera.org",
        "udemy.com",
        "khanacademy.org",
        "edx.org",
        "freecodecamp.org",
        "codecademy.com",
        "leetcode.com",
        "hackerrank.com",

        // News & Research
        "scholar.google.com",
        "wikipedia.org",
        "medium.com",
        "dev.to",

        // Work Tools
        "notion.so",
        "trello.com",
        "asana.com",
        "slack.com",
        "teams.microsoft.com",
        "zoom.us",

        // Cloud & Collaboration
        "google.com/drive",
        "docs.google.com",
        "sheets.google.com",
        "slides.google.com",
        "onedrive.com",
        "dropbox.com",
    ],
};

/**
 * BLACKLIST - Unproductive apps and websites blocked during Focus Mode
 * These are distractions that waste time
 */
export const BLACKLIST = {
    apps: [
        // Social Media Apps
        "Instagram",
        "Facebook",
        "Twitter",
        "X",
        "TikTok",
        "Snapchat",
        "Pinterest",
        "LinkedIn", // Optional: can be moved to whitelist if needed for work
        "WhatsApp",
        "Telegram",
        "Discord",
        "WeChat",

        // Gaming
        "PUBG",
        "PUBG Mobile",
        "BGMI",
        "Call of Duty",
        "Fortnite",
        "Valorant",
        "League of Legends",
        "Dota 2",
        "Minecraft",
        "Roblox",
        "Steam",
        "Epic Games",
        "Origin",
        "Battle.net",

        // Entertainment
        "Netflix",
        "Disney+",
        "Prime Video",
        "Hulu",
        "HBO Max",
        "YouTube", // Browser-based, handled separately
        "Spotify",
        "Apple Music",
        "Twitch",

        // Shopping
        "Amazon",
        "eBay",
        "Flipkart",
        "Myntra",
        "AliExpress",

        // Dating Apps
        "Tinder",
        "Bumble",
        "Hinge",
    ],

    websites: [
        // Social Media
        "instagram.com",
        "facebook.com",
        "twitter.com",
        "x.com",
        "tiktok.com",
        "snapchat.com",
        "pinterest.com",
        "reddit.com",
        "9gag.com",

        // Entertainment
        "youtube.com",
        "netflix.com",
        "primevideo.com",
        "disneyplus.com",
        "hulu.com",
        "hbomax.com",
        "twitch.tv",

        // Gaming
        "steam.com",
        "epicgames.com",
        "roblox.com",
        "miniclip.com",
        "pogo.com",
        "kongregate.com",

        // Shopping
        "amazon.com",
        "amazon.in",
        "ebay.com",
        "flipkart.com",
        "myntra.com",
        "aliexpress.com",
        "etsy.com",

        // News (entertainment/gossip)
        "buzzfeed.com",
        "dailymail.co.uk",
        "tmz.com",

        // Messaging
        "web.whatsapp.com",
        "web.telegram.org",
        "discord.com",
    ],
};

/**
 * Check if an app is whitelisted (productive)
 */
export function isAppWhitelisted(appName) {
    if (!appName) return false;
    const nameLower = appName.toLowerCase();
    return WHITELIST.apps.some(app => nameLower.includes(app.toLowerCase()));
}

/**
 * Check if an app is blacklisted (distraction)
 */
export function isAppBlacklisted(appName) {
    if (!appName) return false;
    const nameLower = appName.toLowerCase();
    return BLACKLIST.apps.some(app => nameLower.includes(app.toLowerCase()));
}

/**
 * Check if a website is whitelisted (productive)
 */
export function isWebsiteWhitelisted(url) {
    if (!url) return false;
    const urlLower = url.toLowerCase();
    return WHITELIST.websites.some(site => urlLower.includes(site.toLowerCase()));
}

/**
 * Check if a website is blacklisted (distraction)
 */
export function isWebsiteBlacklisted(url) {
    if (!url) return false;
    const urlLower = url.toLowerCase();
    return BLACKLIST.websites.some(site => urlLower.includes(site.toLowerCase()));
}

/**
 * Determine if app/website should be allowed in Focus Mode
 * Returns: { allowed: boolean, reason: string, category: string }
 */
export function checkFocusModeAccess(appName, windowTitle = "") {
    // Check if it's a whitelisted app
    if (isAppWhitelisted(appName)) {
        return {
            allowed: true,
            reason: "Productive app - allowed in Focus Mode",
            category: "whitelist"
        };
    }

    // Check if it's a blacklisted app
    if (isAppBlacklisted(appName)) {
        return {
            allowed: false,
            reason: `${appName} is blocked during Focus Mode`,
            category: "blacklist"
        };
    }

    // Check websites in window title
    const titleLower = windowTitle.toLowerCase();

    // Check whitelisted websites
    for (const site of WHITELIST.websites) {
        if (titleLower.includes(site.toLowerCase())) {
            return {
                allowed: true,
                reason: `${site} - productive website allowed`,
                category: "whitelist"
            };
        }
    }

    // Check blacklisted websites
    for (const site of BLACKLIST.websites) {
        if (titleLower.includes(site.toLowerCase())) {
            return {
                allowed: false,
                reason: `${site} is blocked during Focus Mode`,
                category: "blacklist"
            };
        }
    }

    // Default: allow if not in blacklist (whitelist-first approach can be changed)
    return {
        allowed: true,
        reason: "Not in blacklist - allowed by default",
        category: "neutral"
    };
}

/**
 * Get statistics about lists
 */
export function getListStats() {
    return {
        whitelist: {
            apps: WHITELIST.apps.length,
            websites: WHITELIST.websites.length,
            total: WHITELIST.apps.length + WHITELIST.websites.length,
        },
        blacklist: {
            apps: BLACKLIST.apps.length,
            websites: BLACKLIST.websites.length,
            total: BLACKLIST.apps.length + BLACKLIST.websites.length,
        },
    };
}
