# Chrome Extension Debugging Guide

## Issue: Extension Not Redirecting

### Quick Checks:

#### 1. Is the Extension Loaded?
1. Open `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Find "Productivity Assassin - Browser Monitor"
4. Should show **green "Enabled"** toggle
5. If not visible, click "Load unpacked" → select `chrome-extension` folder

#### 2. Check Extension Errors
1. On `chrome://extensions`
2. Click "Errors" button on the extension card
3. Look for any red error messages
4. **Common errors**:
   - "Refused to execute..." → Content script not injected
   - "Cannot read property..." → Background script crash

#### 3. Test Content Script Injection
1. Visit any website (e.g., google.com)
2. Press F12 (open DevTools)
3. Go to **Console** tab
4. Look for: `[Productivity Assassin] Content script loaded - LARGE MODAL MODE`
5. ✅ If you see it → Content script working
6. ❌ If NOT → Content script not injecting

#### 4. Enable Strict Mode in Dashboard
1. Open http://localhost:8082 (or whatever port)
2. Go to Dashboard
3. **Toggle Strict Mode ON** (should turn green)
4. Check console for: `🔒 Strict Mode: ENABLED`

#### 5. Test Blacklist Detection
1. With Strict Mode ON
2. Visit instagram.com OR reddit.com OR youtube.com
3. **Expected**: Should redirect immediately
4. **Check console** for:
   - `🚫 BLACKLIST DETECTED - REDIRECTING...`
   - `🔒 Strict Mode: ENABLED` or `DISABLED`

---

## Common Issues & Fixes

### Issue 1: "Strict Mode: DISABLED" even when toggled ON

**Cause**: Dashboard → Extension communication not working

**Fix**:
1. Open dashboard at localhost:8082
2. Open DevTools (F12)
3. Toggle Strict Mode
4. Check console for:
   ```
   🔒 Strict Mode: ENABLED
   ```
5. Then visit instagram.com
6. If still not working, extension didn't receive message

**Debug**:
```javascript
// In content.js, add listener to see if message received:
window.addEventListener('message', (event) => {
  console.log('📨 Message received:', event.data);
});
```

---

### Issue 2: Content Script Not Loading

**Cause**: Manifest not configured or extension not reloaded

**Fix**:
1. Go to `chrome://extensions`
2. Click **Reload** button (circular arrow) on extension card
3. **Hard refresh** any open tabs: Ctrl+Shift+R
4. Visit blacklisted site again

---

### Issue 3: No Console Logs at All

**Cause**: Background service worker not active

**Fix**:
1. Go to `chrome://extensions`
2. Find "Productivity Assassin"
3. Click **"service worker"** link (blue text)
4. This opens background script console
5. Look for errors

---

### Issue 4: Redirection Doesn't Happen

**Possible Causes**:

#### A. Strict Mode Not Saved to Chrome Storage
**Test**:
```javascript
// Open any tab console
chrome.storage.local.get(['strictMode'], (result) => {
  console.log('Strict Mode from storage:', result.strictMode);
});
```

**Expected**: `true`
**If undefined/false**: Dashboard didn't save it

**Fix**: Dashboard needs to send message to extension. Check if this code runs:
```javascript
// In dashboard.js toggleStrictMode()
window.postMessage({
  source: 'productivity-assassin-app',
  type: 'SET_STRICT_MODE',
  enabled: true
}, '*');
```

#### B. Content Script Checks Strict Mode Too Early
**Issue**: Auto-check at bottom of content.js runs before strict mode is loaded

**Current code** (lines 548-564):
```javascript
(async function checkCurrentPage() {
  const domain = window.location.hostname.replace('www.', '');
  const isBlacklisted = BLACKLIST_SITES.some(site => domain.includes(site));
  
  if (isBlacklisted) {
    await handleBlacklistViolation({ ... });
  }
})();
```

**Inside handleBlacklistViolation**, strict mode is checked:
```javascript
const strictMode = await new Promise((resolve) => {
  chrome.storage.local.get(['strictMode'], (result) => {
    resolve(result.strictMode || false);
  });
});

if (!strictMode) {
  return; // Don't redirect
}
```

**Problem**: If strict mode hasn't been set yet in storage, it defaults to `false`

---

## Manual Test Steps

### Test 1: Enable Strict Mode & Check Storage
1. Open dashboard (localhost:8082)
2. Open DevTools (F12)
3. Toggle Strict Mode ON
4. In console, run:
   ```javascript
   chrome.storage.local.get(['strictMode'], console.log)
   ```
5. Should show: `{strictMode: true}`

### Test 2: Visit Blacklisted Site
1. Visit https://instagram.com
2. Open DevTools BEFORE page loads
3. Check console for logs:
   ```
   [Productivity Assassin] Content script loaded
   [Productivity Assassin] 🚫 BLACKLIST DETECTED - REDIRECTING...
   🔒 Strict Mode: ENABLED
   🚀 Redirecting to: https://www.khanacademy.org
   ```
4. **Should redirect** to Khan Academy
5. **Modal should appear** with personalized message

### Test 3: Check Background Script
1. Go to chrome://extensions
2. Click "service worker" under extension
3. Try visiting instagram.com
4. Background console should log:
   ```
   [Productivity Assassin] Tab changed: instagram.com
   [Productivity Assassin] ⚠️ DISTRACTION DETECTED: instagram.com
   ```

---

## Quick Fix: Force Strict Mode ON by Default

If testing and you want strict mode ALWAYS ON:

**Edit content.js line 82-88**:
```javascript
// 🔒 CHECK STRICT MODE - Only redirect if enabled
const strictMode = await new Promise((resolve) => {
  chrome.storage.local.get(['strictMode'], (result) => {
    resolve(result.strictMode !== false); // ← CHANGE: default to true
  });
});
```

**OR** even simpler, temporarily bypass check:
```javascript
const strictMode = true; // FORCE ON for testing
```

---

## Expected Behavior

### With Strict Mode ON:
1. Visit instagram.com
2. **Immediate redirect** to khanacademy.org
3. **Large modal appears** with message:
   > "Scrolling instagram.com will not get you closer to 'Become a developer'"
4. Must wait 3 seconds to dismiss

### With Strict Mode OFF:
1. Visit instagram.com
2. **No redirect**, stays on Instagram
3. **Warning sent** to dashboard (if open)
4. Dashboard could show notification

---

## Checklist

- [ ] Extension loaded in chrome://extensions
- [ ] Developer mode enabled
- [ ] Extension shows no errors
- [ ] Content script logs appear in page console
- [ ] Strict mode toggle in dashboard works
- [ ] Strict mode saved to chrome.storage
- [ ] Visit blacklisted site → redirects
- [ ] Modal appears with personalized message

---

## If Still Not Working

1. **Reload extension**: chrome://extensions → Click reload
2. **Hard refresh tabs**: Ctrl+Shift+R on all tabs
3. **Check console** on BOTH:
   - Background service worker console
   - Page console (F12)
4. **Verify strict mode** in storage:
   ```javascript
   chrome.storage.local.get(null, console.log) // Shows ALL storage
   ```
5. **Check content.js** is injecting:
   - Should see "Content script loaded" in console

---

## Console Commands for Debugging

```javascript
// Check strict mode
chrome.storage.local.get(['strictMode'], console.log)

// Check all storage
chrome.storage.local.get(null, console.log)

// Set strict mode manually
chrome.storage.local.set({strictMode: true}, () => console.log('Set!'))

// Check user profile
chrome.storage.local.get(['userProfile'], console.log)

// Check violations
chrome.storage.local.get(['violations'], console.log)
```
