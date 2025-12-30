# Profile Sync - React App ↔ Chrome Extension

## ✅ COMPLETED

The profile setup now automatically syncs between your React app and the Chrome Extension!

---

## 🎯 How It Works:

1. **Complete Setup in React App:**
   - Navigate to `/setup` page
   - Answer the 7 Assassin Mode questions:
     - Goal (e.g., "Lose 10kg")
     - Enemy (e.g., "Scrolling at night")
     - Weak time (e.g., "9-11 PM")
     - Pattern (e.g., "Open Instagram → lose 2 hours")
     - Ideal self (e.g., "Fit and disciplined")
     - Pain (e.g., "Fear of staying overweight")
     - Mode (Firm / Tough / Merciless)

2. **Click "Activate Assassin Mode"**
   - Profile saved to AsyncStorage (React app)
   - **AUTO-SYNCS to Chrome Extension** via postMessage
   - Extension saves to `chrome.storage.local`

3. **Personalized Messages Automatically Work!**
   - Extension reads your profile
   - Generates messages using YOUR goals
   - No need to fill setup twice!

---

## 📋 **Profile Mapping:**

React Setup → Extension Format:
- `goal` → `longTermGoal`
- `pattern` → `shortTermGoal` ("Stop: [pattern]")
- `ideal_self` → `currentTask` & `idealSelf`
- `enemy` → `weakness`
- `pain` → `painPoint`
- `mode` → `tone`

---

## 🧪 **Test It:**

1. **Go to** `http://localhost:8081/setup`
2. **Fill in your real answers**
3. **Click "Activate Assassin Mode"**
4. **Check console** - should see:
   ```
   ✅ Profile synced to Chrome Extension: {...}
   ```
5. **Visit Reddit** - modal message will use YOUR goals!

Example:
> "reddit.com again? You wanted to 'Stop: Open Instagram → lose 2 hours'. This isn't getting you there. Your task is waiting: Fit and disciplined. Do it."

---

## 💾 **Data Flow:**

```
React Setup Page
    ↓ (user fills answers)
AsyncStorage
    ↓ (auto-sync via postMessage)
Chrome Extension Content Script
    ↓ (saves to chrome.storage.local)
Extension Message Generator
    ↓ (loads profile)
Personalized Goal-Oriented Messages
```

---

**No extension options page needed - just complete setup in your React app!** 🎉
