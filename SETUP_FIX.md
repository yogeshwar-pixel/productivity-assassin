# Setup Navigation Fix

## Issue
Next button in setup wasn't advancing to next question.

## Root Cause
Changed question structure from `id`-based to `field`-based, but didn't update:
1. `next()` function validation (was checking `current.id`)
2. `setAnswer()` function parameter name
3. `confirmAndActivate()` validation checking

## Fixes Applied

### 1. Updated `next()` function
```javascript
// Before
const val = answers[current.id];

// After  
const val = answers[current.field];

// Added special validation for study platforms
if (current.isMultiple) {
  const filled = (val || []).filter(v => v && v.trim()).length;
  if (filled < 2) {
    Alert.alert("Need at least 2 platforms", "Add at least 2 study platforms to continue.");
    return;
  }
}
```

### 2. Fixed `setAnswer()` parameter
```javascript
// Before
const setAnswer = (id, value) => 
  setAnswers((prev) => ({ ...prev, [id]: value }));

// After
const setAnswer = (field, value) => {
  setAnswers((prev) => ({ ...prev, [field]: value }));
};
```

### 3. Updated `confirmAndActivate()` validation
```javascript
// Before
if (!answers.goal || !answers.mode) {

// After
if (!answers.realGoal || !answers.mode) {
```

## Testing
1. Visit `/setup`
2. Fill first question → Click Next
3. Should advance to question 2
4. On study platforms question → must fill at least 2
5. Complete all 7 questions → Review page
6. Click "Activate Assassin Mode" → Should save

## Status
✅ Next button now works
✅ Study platforms validation (min 2)
✅ All questions use `field` consistently
