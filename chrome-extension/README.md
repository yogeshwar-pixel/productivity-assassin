# Chrome Extension - Goal-Oriented Messaging System

## NEW: Profile Setup

The extension now supports **personalized, goal-oriented messages** that reference your actual goals instead of generic templates!

---

## 🎯 **How to Set Up Your Profile:**

1. **Open Extension Options:**
   - Right-click the extension icon
   - Click "Options"
   - OR go to `chrome://extensions/` → Click "Details" → Scroll to "Extension options"

2. **Fill in Your Profile:**
   - **Long-Term Goal**: e.g., "Become a full-stack developer"
   - **Short-Term Goal**: e.g., "Finish project module by Friday"
   - **Current Task**: e.g., "Build login page UI"
   - **Weakness**: e.g., "Reels addiction"
   - **Pain Point**: e.g., "Feels behind peers"
   - **Ideal Self**: e.g., "Disciplined developer who ships projects"

3. **Save Profile** - Click "💾 Save Profile"

---

## 💬 **Example Personalized Messages:**

### Without Profile (Generic):
> "Caught you slipping. reddit.com isn't part of 'Focused Work'. Redirecting to your workspace. Stay focused."

### With Profile (Goal-Oriented):
> "Scrolling reddit.com will not get you closer to 'Become a full-stack developer'. You need to 'Finish project module by Friday'. Return to: Build login page UI."

### After 3+ Violations:
> "reddit.com again? That's 4 times now. You wanted to 'Finish project module by Friday'. This isn't getting you there. Your task is waiting: Build login page UI. Do it."

### After 5+ Violations:
> "This is ridiculous. You've been distracted 6 times. reddit.com will NEVER help you 'Become a full-stack developer'. You said 'Feels behind peers' was your problem. Stop proving it right. Return to: Build login page UI."

---

## 🧪 **Quick Test:**

1. Set up your profile
2. Visit Reddit
3. You'll be redirected to FreeCodeCamp
4. The modal will show a message referencing YOUR goals!

---

## 📊 **Message Logic:**

- **First distraction**: Calls out goal mismatch
- **2nd distraction**: References weakness
- **3-4 distractions**: Firm tone with short-term goal
- **5+ distractions**: Harsh tone referencing pain point

All messages connect the distraction to your personal goals!
