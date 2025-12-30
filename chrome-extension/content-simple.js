// Personalized Prompts Content Script
console.log('🟢 PERSONALIZED PROMPT SCRIPT LOADING...');

const BLACKLIST = ['instagram.com', 'facebook.com', 'twitter.com', 'x.com', 'tiktok.com', 'reddit.com', 'youtube.com'];

// Check if blacklisted
const domain = window.location.hostname.replace('www.', '');
const isBlocked = BLACKLIST.some(site => domain.includes(site));

console.log('Domain:', domain, '| Blocked:', isBlocked);

if (isBlocked) {
  console.log('🚫 FETCHING PROFILE & SHOWING PERSONALIZED MODAL');

  // Get user profile, violation count, and strict mode
  chrome.storage.local.get(['userProfile', 'violationCount', 'strictMode'], function (result) {
    const profile = result.userProfile;
    const violationCount = result.violationCount || 0;
    const strictMode = result.strictMode !== false; // Default true

    console.log('📋 Profile:', profile);
    console.log('📊 Violations:', violationCount);
    console.log('🔒 Strict Mode:', strictMode);

    // Increment violation count
    chrome.storage.local.set({ violationCount: violationCount + 1 });

    // Generate personalized message
    let message = '';
    let borderColor = '#ff6600';

    if (profile) {
      const goal = profile.realGoal || 'your goals';
      const pattern = profile.failurePattern || 'getting distracted';
      const sacrifice = profile.sacrifice || 'your future';
      const accountability = profile.accountability || 'yourself';
      const weakTime = profile.weakTime || 'now';
      const mainDistraction = profile.mainDistraction || domain;

      // Get study platform name
      const platforms = profile.studyPlatforms || [];
      const platform = platforms.length > 0
        ? platforms[violationCount % platforms.length].name
        : 'your work';

      // 3-TIER SYSTEM - BRUTAL VERSION
      if (violationCount >= 5) {
        // CONSEQUENCE - DEVASTATING
        borderColor = '#ff0000';
        message = `STOP LYING TO YOURSELF.

This is the ${violationCount}th time you've failed today.

"${pattern}" — You knew this would happen. You always do this.

While you waste time on ${domain}, "${sacrifice}" is slipping away.

${accountability} is watching you fail. AGAIN.

You promised yourself "${goal}". This isn't it.

${platform}. NOW. No excuses left.`;

      } else if (violationCount >= 2) {
        // ACCOUNTABILITY - HARSH
        borderColor = '#ff3333';
        message = `Really? ${domain} AGAIN?

Violation #${violationCount} today. You're proving yourself right about "${pattern}".

"${goal}" won't happen by itself.

Every minute here is a minute you'll regret.

${accountability} expects better. You know better.

Get back to ${platform} before you waste another hour.`;

      } else {
        // ADVISORY - FIRM
        borderColor = '#ff6600';
        message = `${domain} has ZERO connection to "${goal}".

You identified "${mainDistraction}" as your weakness. Here you are.

${weakTime} is when you always fail. Don't prove it right.

${platform} is waiting. This scrolling isn't.

Make the choice that future-you won't regret.`;
      }
    } else {
      // No profile - still strong
      message = `You know exactly what you should be doing.

This isn't it.

Stop running from your work.`;
    }

    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.95); z-index: 999999999;
      display: flex; align-items: center; justify-content: center;
    `;

    modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        border: 6px solid ${borderColor};
        border-radius: 20px;
        padding: 60px 50px;
        max-width: 750px;
        max-height: 80vh;
        overflow-y: auto;
        text-align: center;
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.95), 0 0 50px ${borderColor}40;
      ">
        <!-- Icon with glow -->
        <div style="font-size: 100px; margin-bottom: 25px; filter: drop-shadow(0 0 20px ${borderColor});">
          🚫
        </div>
        
        <!-- Blocked Site - Big and Bold -->
        <h1 style="
          color: ${borderColor};
          font-size: 42px;
          font-weight: 900;
          margin: 0 0 35px 0;
          letter-spacing: 3px;
          text-transform: uppercase;
          text-shadow: 0 0 20px ${borderColor}80;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        ">
          ${domain.toUpperCase()} IS BLOCKED
        </h1>
        
        <!-- Personalized Message - Clear and Readable -->
        <div style="
          color: #ffffff;
          font-size: 26px;
          line-height: 1.7;
          margin: 0 0 45px 0;
          white-space: pre-line;
          font-weight: 600;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        ">
${message}
        </div>
        
        <!-- Countdown - Massive and Attention-Grabbing -->
        <div style="
          color: ${borderColor};
          font-size: 90px;
          font-weight: 900;
          margin: 30px 0 15px 0;
          text-shadow: 0 0 30px ${borderColor}, 0 4px 8px rgba(0,0,0,0.8);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        " id="timer">3</div>
        
        <div style="
          color: #aaaaaa;
          font-size: 16px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 2px;
        ">
          Redirecting in <span id="sec" style="color: ${borderColor}; font-weight: 700;">3</span> seconds...
        </div>
        
        <!-- VISUAL DEBUG INFO (Temporary) -->
        <div style="margin-top: 20px; font-size: 12px; color: #666; font-family: monospace;">
          Status: <span id="debug-status">Initializing...</span><br>
          Strict Mode: <span id="debug-strict">${strictMode ? 'ON' : 'OFF'}</span><br>
          Status: <span id="debug-status">Initializing...</span><br>
          Strict Mode: <span id="debug-strict">${strictMode ? 'ON' : 'OFF'}</span><br>
          
          <button id="toggle-strict" style="
            background: #222; color: #00ff99; border: 1px solid #00ff99; 
            padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 10px; margin-right: 10px;
          ">
            🔒 Toggle Strict Mode (Current: ${strictMode ? 'ON' : 'OFF'})
          </button>

          <button id="emergency-reset" style="
            background: #333; color: #fff; border: 1px solid #555; 
            padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 10px;
          ">
            ⚠️ RESET SYSTEM (Fix Count)
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    console.log('✅ PERSONALIZED MODAL ADDED');

    // Toggle Strict Mode Handler
    document.getElementById('toggle-strict').addEventListener('click', () => {
      const newMode = !strictMode;
      chrome.storage.local.set({ strictMode: newMode }, () => {
        alert(`Strict Mode turned ${newMode ? 'ON' : 'OFF'}. Reloading...`);
        window.location.reload();
      });
    });

    // Emergency Reset Handler
    document.getElementById('emergency-reset').addEventListener('click', () => {
      if (confirm('Reset violation count to 0 and force Strict Mode ON?')) {
        chrome.storage.local.set({ violationCount: 0, strictMode: true }, () => {
          alert('System Reset! Reloading...');
          window.location.reload();
        });
      }
    });

    // Countdown
    let sec = 3;
    const timer = setInterval(() => {
      sec--;
      const t = document.getElementById('timer');
      const s = document.getElementById('sec');
      if (t) t.textContent = sec;
      if (s) s.textContent = sec;

      if (sec <= 0) {
        clearInterval(timer);

        console.log('⏰ Countdown finished!');
        console.log('🔍 Checking strictMode value:', strictMode);
        console.log('🔍 strictMode type:', typeof strictMode);

        // Check strict mode before redirecting
        if (!strictMode) {
          console.log('⚠️ Strict Mode OFF - No redirect');
          const t = document.getElementById('timer');
          const secText = document.getElementById('sec');
          if (t) t.textContent = '✓';
          if (secText) secText.parentElement.innerHTML = 'Strict Mode OFF - <button onclick="this.closest(\'.modal\').remove()" style="background:#00ff99;color:#000;border:none;padding:8px 20px;border-radius:6px;cursor:pointer;font-weight:bold;margin-left:10px">Close</button>';
          return;
        }

        // Get redirect URL from user's study platforms
        let redirectUrl = null;

        console.log('🔍 Checking for studyPlatforms from Setup...');
        console.log('📋 Profile exists:', !!profile);
        console.log('📚 Study platforms:', profile ? profile.studyPlatforms : 'no profile');

        // ONLY use user's studyPlatforms from Setup (Question 4)
        if (profile && profile.studyPlatforms && profile.studyPlatforms.length > 0) {
          // Rotate through platforms
          const platformIndex = violationCount % profile.studyPlatforms.length;
          const selectedPlatform = profile.studyPlatforms[platformIndex];

          redirectUrl = selectedPlatform.url || selectedPlatform;

          // Handle both object and string formats
          if (typeof redirectUrl === 'object') {
            redirectUrl = redirectUrl.url || redirectUrl.name;
          }

          // Add https:// if missing
          if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
            redirectUrl = 'https://' + redirectUrl;
          }

          console.log(`✅ Using USER PLATFORM #${platformIndex + 1}/${profile.studyPlatforms.length}: ${redirectUrl}`);
        } else {
          console.error('❌ NO STUDY PLATFORMS CONFIGURED');
          alert('Please complete Setup tab and enter your organization websites (Question 4)');
          return; // Don't redirect if not configured
        }

        // Update debug status
        const debugStatus = document.getElementById('debug-status');
        if (debugStatus) debugStatus.textContent = 'Redirecting to: ' + redirectUrl;

        console.log('🚀 REDIRECTING to:', redirectUrl);
        window.location.replace(redirectUrl);
      }
    }, 1000);
  });
}

console.log('🟢 SCRIPT COMPLETE');

// LISTEN FOR MESSAGES FROM DASHBOARD (localhost)
window.addEventListener('message', (event) => {
  // Only accept messages from same origin
  if (event.source !== window) return;

  if (event.data && event.data.source === 'productivity-assassin-app') {

    // 1. Handle Profile Sync
    if (event.data.type === 'SYNC_PROFILE') {
      const profile = event.data.profile;
      const strictMode = event.data.strictMode;
      const violationCount = event.data.violationCount;

      console.log('📥 Received profile from App:', profile);

      const dataToSave = { userProfile: profile };
      if (strictMode !== undefined) dataToSave.strictMode = strictMode;
      if (violationCount !== undefined) dataToSave.violationCount = violationCount;

      chrome.storage.local.set(dataToSave, () => {
        console.log('✅ Extension: Profile & Settings Saved!');
        // Send confirmation back
        window.postMessage({
          source: 'productivity-assassin-extension',
          type: 'PROFILE_SYNCED',
          success: true
        }, '*');
      });
    }

    // 2. Handle Strict Mode Toggle
    if (event.data.type === 'SET_STRICT_MODE') {
      const enabled = event.data.enabled;
      console.log('🔒 Extension: Setting Strict Mode to', enabled);

      chrome.storage.local.set({ strictMode: enabled }, () => {
        console.log('✅ Extension: Strict Mode Saved!');
      });
    }
  }
});
