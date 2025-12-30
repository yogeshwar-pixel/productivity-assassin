// content.js - Injected into all web pages
// FORCE REDIRECTS blacklisted sites to whitelist workspace

const BLACKLIST_SITES = [
  'instagram.com', 'facebook.com', 'twitter.com', 'x.com', 'tiktok.com',
  'reddit.com', 'youtube.com', 'netflix.com', 'primevideo.com',
  'discord.com', 'twitch.tv', 'pinterest.com', '9gag.com'
];

// ❌ NO HARDCODED REDIRECTS
// Redirects MUST come from user's explicit configuration only
// See getRedirectUrl() function below

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DISTRACTION_DETECTED') {
    handleBlacklistViolation(message.data);
  }

  if (message.type === 'BROWSER_ACTIVITY') {
    window.postMessage({
      source: 'productivity-assassin-extension',
      ...message
    }, '*');
  }
});

// Listen for profile sync from React app
window.addEventListener('message', (event) => {
  // Only accept messages from same origin
  if (event.source !== window) return;

  if (event.data && event.data.source === 'productivity-assassin-app') {
    if (event.data.type === 'SYNC_PROFILE') {
      const profile = event.data.profile;
      console.log('📥 Received profile from React app:', profile);

      // Save to chrome extension storage
      chrome.storage.local.set({ userProfile: profile }, () => {
        console.log('✅ Profile saved to chrome extension storage');

        // Send confirmation back to app
        window.postMessage({
          source: 'productivity-assassin-extension',
          type: 'PROFILE_SYNCED',
          success: true
        }, '*');
      });
    }
  }
});

// Handle blacklist violation with FORCE REDIRECT + PERSONALIZED ACCOUNTABILITY
async function handleBlacklistViolation(data) {
  const blacklistUrl = window.location.href;

  // Get user context from storage
  const context = await getUserContext();

  // 🔒 CHECK STRICT MODE - Only redirect if enabled
  const strictMode = await new Promise((resolve) => {
    chrome.storage.local.get(['strictMode'], (result) => {
      // Default to TRUE for testing - user can disable in dashboard
      resolve(result.strictMode !== false);
    });
  });

  console.log(`🔒 Strict Mode: ${strictMode ? 'ENABLED' : 'DISABLED'}`);

  if (!strictMode) {
    // Strict mode OFF - just send notification to app, don't redirect
    console.log('⚠️ Distraction detected but Strict Mode OFF - no redirect');
    window.postMessage({
      source: 'productivity-assassin-extension',
      type: 'DISTRACTION_WARNING',
      data: {
        domain: data.domain,
        url: blacklistUrl,
        severity: data.severity || calculateSeverity(data.domain, context),
        strictModeOff: true
      }
    }, '*');
    return; // Don't redirect, just warn
  }

  // Get redirect URL (will be needed for redirect and logging)
  const redirectUrl = await getRedirectUrl();

  if (!redirectUrl) {
    // No redirect website configured - show error instead
    console.log('⚠️ Cannot redirect - no redirect website configured');
    showConfigurationError();
    return;
  }

  // Generate personalized accountability message
  const accountabilityMessage = await generateMotivationalPrompt({
    taskName: context.currentTask,
    distractionCount: context.totalDistractions,
    recentViolations: context.recentViolations,
    strictMode: strictMode,
    severity: data.severity || calculateSeverity(data.domain, context),
    blockedSite: data.domain,
    currentStreak: context.focusStreak
  });

  // Log violation event with generated prompt
  const violationEvent = {
    event: 'blacklist-redirection',
    type: 'blacklist-redirection',
    blacklist: blacklistUrl,
    redirectTarget: redirectUrl,
    generatedPrompt: accountabilityMessage,
    severity: accountabilityMessage.severity,
    timestamp: new Date().toISOString(),
    domain: data.domain,
    context: {
      task: context.currentTask,
      distractionCount: context.totalDistractions,
      streak: context.focusStreak
    }
  };

  console.log('🚫 BLACKLIST VIOLATION - PERSONALIZED REDIRECT:', violationEvent);

  // Store violation and update context
  chrome.storage.local.get(['violations', 'userContext'], (result) => {
    const violations = result.violations || [];
    violations.push(violationEvent);

    const updatedContext = {
      ...context,
      totalDistractions: context.totalDistractions + 1,
      recentViolations: context.recentViolations + 1,
      lastViolation: violationEvent.timestamp,
      focusStreak: 0 // Reset streak on violation
    };

    chrome.storage.local.set({
      violations,
      lastRedirect: violationEvent,
      userContext: updatedContext
    });
  });

  // Store redirect info + personalized message in chrome.storage (works across domains!)
  const redirectData = {
    from: blacklistUrl,
    to: whitelistUrl,
    reason: 'blacklist-violation',
    message: accountabilityMessage.message,
    severity: accountabilityMessage.severity,
    timestamp: violationEvent.timestamp
  };

  console.log('💾 Saving to chrome.storage:', redirectData);

  // Save to extension storage (accessible on any domain)
  await new Promise((resolve) => {
    chrome.storage.local.set({
      'productivity-assassin-redirect': redirectData
    }, () => {
      console.log('✓ Saved to chrome.storage.local');
      resolve();
    });
  });

  // IMMEDIATE REDIRECT (already have redirectUrl from earlier)
  console.log('🚀 Redirecting to:', redirectUrl);
  window.location.replace(redirectUrl);
}

// Get user context from storage
async function getUserContext() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['userContext'], (result) => {
      const defaultContext = {
        currentTask: 'Focused Work',
        totalDistractions: 0,
        recentViolations: 0,
        strictMode: true,
        focusStreak: 0,
        lastViolation: null
      };
      resolve(result.userContext || defaultContext);
    });
  });
}

// Calculate severity based on domain and user context
function calculateSeverity(domain, context) {
  const baseSeverity = {
    'instagram.com': 10,
    'facebook.com': 9,
    'tiktok.com': 10,
    'reddit.com': 8,
    'youtube.com': 9,
    'netflix.com': 10,
    'discord.com': 7
  };

  let severity = baseSeverity[domain] || 7;

  // Increase severity if user is repeatedly violating
  if (context.recentViolations > 3) severity = Math.min(10, severity + 2);
  if (context.totalDistractions > 10) severity = Math.min(10, severity + 1);

  return severity;
}

// Generate personalized motivational/accountability prompt using USER PROFILE DATA
async function generateMotivationalPrompt(input) {
  const { taskName, distractionCount, recentViolations, strictMode, severity, blockedSite, currentStreak } = input;

  // Load user profile from chrome.storage to get goals, tasks, weaknesses
  const userProfile = await new Promise((resolve) => {
    chrome.storage.local.get(['userProfile'], (result) => {
      resolve(result.userProfile || null);
    });
  });

  let message = '';
  let tone = 'accountability';

  // If we have user profile, generate PERSONALIZED goal-oriented message
  if (userProfile && userProfile.longTermGoal) {
    const {
      longTermGoal = 'your goals',
      shortTermGoal = 'your objectives',
      currentTask = taskName,
      weakness = blockedSite,
      painPoint = 'wasting time'
    } = userProfile;

    // Generate message based on violation count - REFERENCE USER'S ACTUAL GOALS
    if (recentViolations >= 5) {
      message = `This is ridiculous. You've been distracted ${recentViolations} times. ` +
        `${blockedSite} will NEVER help you "${longTermGoal}". ` +
        `You said "${painPoint}" was your problem. Stop proving it right. ` +
        `Return to: ${currentTask}.`;
      tone = 'harsh';

    } else if (recentViolations >= 3) {
      message = `${blockedSite} again? That's ${recentViolations} times now. ` +
        `You wanted to "${shortTermGoal}". This isn't getting you there. ` +
        `Your task is waiting: ${currentTask}. Do it.`;
      tone = 'firm';

    } else if (distractionCount > 5) {
      message = `You've been distracted ${distractionCount} times already. ` +
        `Scrolling ${blockedSite} won't get you closer to "${longTermGoal}". ` +
        `You need to "${shortTermGoal}". Return to: ${currentTask}.`;
      tone = 'reminder';

    } else if (currentStreak > 0) {
      message = `You had ${currentStreak} focused minutes going toward "${longTermGoal}". ` +
        `Don't throw it away on ${blockedSite}. Your task: ${currentTask}. Stay on track.`;
      tone = 'motivational';

    } else if (recentViolations >= 1) {
      message = `You promised to stop "${weakness}". But here you are on ${blockedSite}. ` +
        `"${longTermGoal}" requires focus. Return to: ${currentTask}.`;
      tone = 'accountability';

    } else {
      // First distraction - call out the goal mismatch
      message = `Scrolling ${blockedSite} will not get you closer to "${longTermGoal}". ` +
        `You need to "${shortTermGoal}". Return to: ${currentTask}.`;
      tone = 'neutral';
    }

  } else {
    // Fallback to basic messages if no profile
    if (recentViolations >= 5) {
      message = `Seriously? ${blockedSite} again? You're stuck in a loop. This site has NOTHING to do with "${taskName}". Every second here is wasted progress. Redirecting you back before you lose everything you've built.`;
      tone = 'harsh';
    } else if (recentViolations >= 3) {
      message = `You're drifting again. This is the ${recentViolations + 1}th time today. ${blockedSite} does not serve your current goal of "${taskName}". Redirecting you back so you don't lose your progress.`;
      tone = 'firm';
    } else if (distractionCount > 5) {
      message = `Not ${blockedSite} again. You've been distracted ${distractionCount} times already. "${taskName}" requires your full attention. Get back to work.`;
      tone = 'reminder';
    } else if (currentStreak > 0) {
      message = `You had ${currentStreak} focused minutes going. Don't throw it away on ${blockedSite}. Your goal is "${taskName}" - this doesn't help. Stay on track.`;
      tone = 'motivational';
    } else {
      message = `Caught you slipping. ${blockedSite} isn't part of "${taskName}". Redirecting to your workspace. Stay focused.`;
      tone = 'neutral';
    }
  }

  console.log('📝 Generated goal-oriented message:', message.substring(0, 50) + '...', '| Profile used:', !!userProfile);

  return {
    message,
    severity,
    tone,
    type: userProfile ? 'goal-oriented' : 'generic',
    showModal: true
  };
}

// Get redirect URL from user's profile - SINGLE SOURCE OF TRUTH
// Uses studyPlatforms entered during setup (Question 4)
// NEVER use cached, default, inferred, or hardcoded redirects
async function getRedirectUrl() {
  console.log('🔍 Getting redirect URL from user setup...');

  // Get profile with studyPlatforms
  const result = await new Promise((resolve) => {
    chrome.storage.local.get(['userProfile', 'violationCount'], (data) => {
      resolve(data);
    });
  });

  const profile = result.userProfile;
  const violationCount = result.violationCount || 0;

  console.log('📋 Profile exists:', !!profile);
  console.log('📚 Study platforms:', profile ? profile.studyPlatforms : 'no profile');

  // ONLY use user's explicitly entered study platforms from setup
  if (profile && profile.studyPlatforms && profile.studyPlatforms.length > 0) {
    // Rotate through platforms based on violation count
    const platformIndex = violationCount % profile.studyPlatforms.length;
    const selectedPlatform = profile.studyPlatforms[platformIndex];

    let url = selectedPlatform.url || selectedPlatform;

    // Handle both object format {name, url} and string format
    if (typeof url === 'object') {
      url = url.url || url.name;
    }

    // Add https:// if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    console.log(`✅ Using USER PLATFORM #${platformIndex + 1}/${profile.studyPlatforms.length}: ${url}`);
    console.log(`📊 Violation count: ${violationCount} → Platform index: ${platformIndex}`);

    // Increment violation count for rotation
    chrome.storage.local.set({ violationCount: violationCount + 1 });

    return url;
  }

  // NO FALLBACK - User must complete setup
  console.error('❌ NO STUDY PLATFORMS CONFIGURED');
  console.error('💡 User must complete Setup and enter their organization websites');

  return null;
} // Don't redirect if not configured

// Show error modal when study platforms are not configured
function showConfigurationError() {
  const modal = document.createElement('div');
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 999999999; display: flex; align-items: center; justify-content: center; font-family: sans-serif;';

  modal.innerHTML = `
    <div style="background: linear-gradient(135deg, #1a0a0a 0%, #2a1a1a 100%); border: 6px solid #ff3333; border-radius: 20px; padding: 60px 40px; max-width: 600px; text-align: center; color: white;">
      <div style="font-size: 80px; margin-bottom: 20px;">⚠️</div>
      <h1 style="color: #ff3333; font-size: 32px; margin: 0 0 20px 0;">Setup Required</h1>
      <div style="font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
        <p>You haven't entered your organization/study websites yet.</p>
        <p style="margin-top: 15px;">Please go to:</p>
        <p style="color: #00ff99; font-weight: bold; margin-top: 10px;">
          Dashboard → Setup Tab<br/>
          Complete Question 4: Enter your organization websites
        </p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="background: #00ff99; color: #000; border: none; padding: 15px 40px; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer;">
        Got It
      </button>
    </div>
  `;

  document.body.appendChild(modal);
}

// Show LARGE FORCED-VISIBILITY modal AFTER redirect with PERSONALIZED MESSAGE
async function showRedirectModal() {
  console.log('🔍 Checking for redirect data in chrome.storage...');

  // Get redirect info from chrome.storage (works across domains!)
  const redirectInfo = await new Promise((resolve) => {
    chrome.storage.local.get(['productivity-assassin-redirect'], (result) => {
      console.log('📦 Retrieved from chrome.storage:', result);
      resolve(result['productivity-assassin-redirect']);
    });
  });

  if (!redirectInfo) {
    console.log('❌ No redirect info found');
    return;
  }

  console.log('✅ Found redirect info, showing modal!');

  // Clear the redirect data so modal doesn't show again
  chrome.storage.local.remove('productivity-assassin-redirect');

  // Prevent duplicate modals
  if (document.getElementById('productivity-assassin-redirect-modal')) {
    return;
  }

  const severity = redirectInfo.severity || 7;
  const severityColor = (severity >= 9) ? '#ff0000' : (severity >= 7) ? '#ff6600' : '#ffaa00';
  const severityLabel = (severity >= 9) ? 'CRITICAL' : (severity >= 7) ? 'HIGH' : 'MODERATE';
  const pulseAnimation = severity >= 3 ? 'pulse 2s ease-in-out infinite' : 'none';

  // Create LARGE FULL-SCREEN CENTERED modal
  const overlay = document.createElement('div');
  overlay.id = 'productivity-assassin-redirect-modal';
  overlay.innerHTML = `
    <style>
      @keyframes slideInBig {
        from { transform: translate(-50%, -60%); opacity: 0; scale: 0.8; }
        to { transform: translate(-50%, -50%); opacity: 1; scale: 1; }
      }
      @keyframes pulse {
        0%, 100% { box-shadow: 0 0 40px rgba(255, 51, 51, 0.8); }
        50% { box-shadow: 0 0 80px rgba(255, 51, 51, 1); }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    </style>
    
    <!-- Full-screen dark overlay -->
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.92);
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      
      <!-- LARGE CENTERED MODAL -->
      <div id="main-modal-box" style="
        background: #1a1a1a;
        border: 5px solid ${severityColor};
        border-radius: 16px;
        padding: 48px;
        width: 70%;
        min-width: 600px;
        max-width: 900px;
        min-height: 25vh;
        z-index: 2147483648;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        animation: slideInBig 0.4s ease-out, ${pulseAnimation};
        box-shadow: 0 10px 60px rgba(0, 0, 0, 0.9);
      ">
        
        <!-- Header with Severity -->
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 32px;">
          <span style="font-size: 64px; margin-right: 20px;">🚫</span>
          <div style="text-align: left;">
            <h1 style="color: ${severityColor}; margin: 0; font-size: 36px; font-weight: 900;">
              SITE BLOCKED
            </h1>
            <div style="
              background: ${severityColor};
              color: #000;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 14px;
              font-weight: bold;
              margin-top: 8px;
              display: inline-block;
            ">
              SEVERITY: ${severityLabel}
            </div>
          </div>
        </div>
        
        <!-- PERSONALIZED ACCOUNTABILITY MESSAGE - LARGE TEXT -->
        <div style="
          background: linear-gradient(135deg, #2a2020 0%, #1a1a1a 100%);
          border-left: 6px solid ${severityColor};
          padding: 32px;
          border-radius: 12px;
          margin-bottom: 32px;
          text-align: center;
        ">
          <p style="
            color: #fff;
            font-size: 24px;
            margin: 0;
            line-height: 1.6;
            font-weight: 600;
            letter-spacing: -0.5px;
          ">
            ${redirectInfo.message || 'This site is blocked for your current session.'}
          </p>
        </div>
        
        <!-- Site Information -->
        <div style="display: flex; gap: 16px; margin-bottom: 32px;">
          <div style="
            flex: 1;
            background: #2a2a2a;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #ff3333;
          ">
            <div style="color: #ff6666; font-size: 14px; font-weight: bold; margin-bottom: 8px;">
              ❌ BLOCKED URL:
            </div>
            <div style="color: #fff; font-size: 18px; font-weight: 600; word-break: break-all;">
              ${new URL(redirectInfo.from).hostname}
            </div>
          </div>
          
          <div style="
            flex: 1;
            background: #1a2a1a;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #00ff99;
          ">
            <div style="color: #00ff99; font-size: 14px; font-weight: bold; margin-bottom: 8px;">
              ✓ REDIRECTED TO:
            </div>
            <div style="color: #fff; font-size: 18px; font-weight: 600; word-break: break-all;">
              ${new URL(redirectInfo.to).hostname}
            </div>
          </div>
        </div>
        
        <!-- Dismiss Button (DISABLED for first 3 seconds) -->
        <button id="dismiss-redirect-modal" disabled style="
          width: 100%;
          background: #555;
          color: #999;
          border: none;
          padding: 20px;
          border-radius: 10px;
          font-size: 18px;
          font-weight: bold;
          cursor: not-allowed;
          transition: all 0.3s ease;
        ">
          <span id="countdown-text">Wait 3 seconds...</span>
        </button>
        
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const dismissButton = document.getElementById('dismiss-redirect-modal');
  const countdownText = document.getElementById('countdown-text');

  // 3-second countdown before allowing dismissal
  let secondsLeft = 3;
  const countdownInterval = setInterval(() => {
    secondsLeft--;
    if (secondsLeft > 0) {
      countdownText.textContent = `Wait ${secondsLeft} second${secondsLeft > 1 ? 's' : ''}...`;
    } else {
      clearInterval(countdownInterval);
      // Enable button
      dismissButton.disabled = false;
      dismissButton.style.background = '#00ff99';
      dismissButton.style.color = '#000';
      dismissButton.style.cursor = 'pointer';
      countdownText.textContent = '✓ Got It - Stay Focused';
    }
  }, 1000);

  // Dismiss handler (only works after 3 seconds)
  dismissButton.addEventListener('click', () => {
    if (!dismissButton.disabled) {
      overlay.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => overlay.remove(), 300);
    }
  });

  // Auto-dismiss after 20 seconds
  setTimeout(() => {
    if (document.getElementById('productivity-assassin-redirect-modal')) {
      overlay.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => overlay.remove(), 300);
    }
  }, 20000);
}

console.log('[Productivity Assassin] Content script loaded - LARGE MODAL MODE');

// Auto-check if current page is a blacklist violation
(async function checkCurrentPage() {
  const domain = window.location.hostname.replace('www.', '');
  const isBlacklisted = BLACKLIST_SITES.some(site => domain.includes(site));

  if (isBlacklisted) {
    console.log('[Productivity Assassin] 🚫 BLACKLIST DETECTED - REDIRECTING...');
    // Immediate redirect - AWAIT to ensure sessionStorage is saved first
    await handleBlacklistViolation({
      domain: domain,
      title: document.title,
      url: window.location.href
    });
  } else {
    // Check if we just got redirected here
    await showRedirectModal();
  }
})();
