# Chrome Extension Debugging Steps

## Step 1: Reload the Extension
1. Go to `chrome://extensions`
2. Find "Productivity Assassin - Browser Monitor"
3. Click the **RELOAD** button (circular arrow ⟳)
4. **Important**: Extension ID might change - check if it's still enabled

## Step 2: Check Console on Instagram
1. Open a new tab
2. Press F12 to open DevTools
3. Go to **Console** tab
4. Visit `https://www.instagram.com`
5. **Look for these logs:**
   ```
   🚀 [PA] Content script with prompts loading...
   🚀 [PA] Content script LOADED
   🔍 Checking domain: instagram.com
   🔍 Is blacklisted? true
   🚫 BLACKLIST DETECTED!
   🔒 Strict Mode: true
   📍 Redirect URL: ...
   🎯 Showing prompt before redirect...
   ```

## Step 3: Check Extension Console
1. Go to `chrome://extensions`
2. Click **"service worker"** link (blue text under extension)
3. This opens background script console
4. Look for errors

## Step 4: Check Storage
In any tab console, run:
```javascript
chrome.storage.local.get(['userProfile', 'strictMode', 'violationCount'], console.log)
```

**Expected output:**
```javascript
{
  userProfile: {
    realGoal: "Score 85%+ in exams",
    failurePattern: "...",
    studyPlatforms: [{name: "NPTEL", url: "..."}],
    ...
  },
  strictMode: true,
  violationCount: 0
}
```

## Common Issues

### Issue 1: No Console Logs
**Problem**: Content script not loading
**Fix**: 
- Reload extension
- Hard refresh page (Ctrl+Shift+R)
- Check manifest.json has correct filename: `content-with-prompts.js`

### Issue 2: "strictMode: false"
**Problem**: Strict mode disabled
**Fix**:
```javascript
// In console:
chrome.storage.local.set({strictMode: true})
```

### Issue 3: "userProfile: null"
**Problem**: Setup not completed
**Fix**:
- Complete setup at `/setup`
- Fill all 8 questions
- Click "Activate Assassin Mode"

### Issue 4: Modal Not Appearing
**Problem**: Script runs but modal doesn't show
**Fix**: Check for JavaScript errors in console

## Quick Test

**Run this in console on ANY page:**
```javascript
// Test if extension script is loaded
console.log('Script exists:', !!document.getElementById);

// Manually trigger modal
if (typeof showPromptBeforeRedirect === 'function') {
  showPromptBeforeRedirect('instagram.com', 'https://khanacademy.org');
} else {
  console.log('Function not found - script not loaded');
}
```

## Verification Checklist

- [ ] Extension is enabled (chrome://extensions)
- [ ] Extension was reloaded after manifest change
- [ ] Setup completed (/setup page)
- [ ] Strict mode is ON
- [ ] Console shows loading messages
- [ ] No JavaScript errors in console

## What to Report

If still not working, tell me:
1. What console logs do you see (copy from F12)?
2. Is there a red error message?
3. Does extension show as "Enabled"?
4. Did you complete setup?
