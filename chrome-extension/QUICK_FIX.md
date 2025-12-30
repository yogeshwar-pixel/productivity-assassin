# Quick Fix Guide - Profile Not Syncing

## Problem
Extension shows generic prompts and redirects to wrong site.

## Root Cause
Profile from `/setup` not saving to `chrome.storage.local`.

## Solutions (Try in Order)

### Solution 1: Manual Profile Set
**If setup isn't working, manually set profile:**

1. Open ANY tab
2. Press F12 (DevTools)
3. Go to Console tab
4. Paste this code:

```javascript
chrome.storage.local.set({
  userProfile: {
    realGoal: 'Score 85%+ in semester exams',
    failurePattern: 'I scroll reels until 2 AM then wake up late',
    sacrifice: 'My placement chances and parents expectations',
    studyPlatforms: [
      { name: 'NPTEL', url: 'https://nptel.ac.in' },
      { name: 'LeetCode', url: 'https://leetcode.com' },
      { name: 'GeeksforGeeks', url: 'https://geeksforgeeks.org' }
    ],
    weakTime: '9-11 PM after dinner',
    mainDistraction: 'Instagram Reels',
    accountability: 'My parents who took loan for fees'
  }
}, function() {
  console.log('✅ Profile saved!');
  alert('Profile saved! Now visit Instagram to test.');
});
```

5. Press Enter
6. **Reload extension** (chrome://extensions → ⟳)
7. Visit Instagram or YouTube
8. **Should now show YOUR goals!**

### Solution 2: Verify Profile Saved
Check if profile exists:

```javascript
chrome.storage.local.get(['userProfile'], function(result) {
  console.log('Profile:', result.userProfile);
});
```

### Solution 3: Complete Setup Again
1. Go to `http://localhost:19006/setup`
2. Fill ALL 8 questions
3. Click "Activate Assassin Mode"
4. Check console for: `✅ Profile saved directly to chrome.storage.local`

## Test After Fix

1. Check profile: `chrome.storage.local.get(['userProfile'], console.log)`
2. Visit Instagram
3. Should see:
   - Your actual goal in prompt
   - Your failure pattern
   - Redirect to YOUR study platform (NPTEL, LeetCode, etc)

## Extension Errors

If you see errors in chrome://extensions:
1. Click "Errors" button
2. Copy error message
3. It's likely from old cached files
4. **Remove and re-add extension:**
   - chrome://extensions
   - Remove "Productivity Assassin"
   - Click "Load unpacked"
   - Select `d:\Projects\productivity-assassin\chrome-extension`
