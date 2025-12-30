// utils/goalOrientedPrompts.js
// Generates personalized, goal-oriented distraction messages using user profile data

/**
 * Generate a personalized, goal-oriented distraction message
 * @param {Object} userProfile - User's profile data from AsyncStorage
 * @param {string} blockedSite - The distraction site (e.g., "reddit.com")
 * @param {number} severity - Calculated severity level
 * @param {number} violationCount - Number of recent violations
 * @returns {Object} - { message, severity, type }
 */
export function generateGoalOrientedMessage(userProfile, blockedSite, severity, violationCount = 0) {
    if (!userProfile) {
        // Fallback if no profile data
        return {
            message: `${blockedSite} is blocking your productivity. Get back to work.`,
            severity: severity || 7,
            type: 'generic'
        };
    }

    const {
        longTermGoal = "your long-term goals",
        shortTermGoal = "your current objectives",
        currentTask = "your task",
        enemy = blockedSite,
        weakness = "distractions",
        painPoint = "falling behind",
        idealSelf = "the person you want to become",
        tone = "tough"
    } = userProfile;

    // Determine message intensity based on violation count
    let message = '';

    if (violationCount >= 5) {
        // HARSH - Multiple violations
        message = `This is ridiculous. You've been distracted ${violationCount} times. ` +
            `${blockedSite} will NEVER help you "${longTermGoal}". ` +
            `You said "${painPoint}" was your problem. Stop proving it right. ` +
            `Return to: ${currentTask}.`;

    } else if (violationCount >= 3) {
        // FIRM - Repeated violations
        message = `${blockedSite} again? That's ${violationCount} times now. ` +
            `You wanted to "${shortTermGoal}". This isn't getting you there. ` +
            `Your task is waiting: ${currentTask}. Do it.`;

    } else if (violationCount >= 1) {
        // DIRECT - Second violation
        message = `You promised to stop "${weakness}". But here you are on ${blockedSite}. ` +
            `"${longTermGoal}" requires focus. Return to: ${currentTask}.`;

    } else {
        // FIRST WARNING - Call out the goal mismatch
        message = `Scrolling ${blockedSite} will not get you closer to "${longTermGoal}". ` +
            `You need to "${shortTermGoal}". Return to: ${currentTask}.`;
    }

    return {
        message,
        severity,
        type: 'goal-oriented',
        profileUsed: {
            longTermGoal,
            shortTermGoal,
            currentTask,
            weakness
        }
    };
}

/**
 * Generate Focus Mode specific interruption message
 * @param {Object} userProfile - User profile data
 * @param {string} blockedSite - Distraction site
 * @param {number} elapsedMinutes - How many minutes into Focus session
 * @param {number} sessionDistractions - Distractions this session
 * @returns {Object} - Personalized message
 */
export function generateFocusModeInterruptionMessage(userProfile, blockedSite, elapsedMinutes, sessionDistractions) {
    if (!userProfile) {
        return {
            message: `Focus Mode interrupted by ${blockedSite}. Get back to work.`,
            severity: 8,
            type: 'focus-interruption'
        };
    }

    const {
        longTermGoal = "your goals",
        currentTask = "your task",
        shortTermGoal = "your objectives",
        painPoint = "wasting time"
    } = userProfile;

    let message = '';

    if (sessionDistractions >= 2) {
        // Multiple interruptions in same session
        message = `THIRD time you've broken focus! You're ${elapsedMinutes} minutes in and already distracted ${sessionDistractions + 1} times. ` +
            `This is exactly why you're "${painPoint}". ` +
            `Focus Mode exists to help you "${longTermGoal}". Stop sabotaging yourself. ` +
            `Task: ${currentTask}.`;

    } else if (sessionDistractions === 1) {
        // Second interruption
        message = `Breaking focus AGAIN after ${elapsedMinutes} minutes? ` +
            `${blockedSite} won't help you "${shortTermGoal}". ` +
            `You chose Focus Mode for a reason. Respect that choice. ` +
            `Return to: ${currentTask}.`;

    } else {
        // First interruption
        message = `You're ${elapsedMinutes} minutes into Focus Mode and you're already on ${blockedSite}? ` +
            `This is the exact moment that determines if you achieve "${longTermGoal}" or stay stuck. ` +
            `Choose wisely. Task: ${currentTask}.`;
    }

    return {
        message,
        severity: 9, // Focus Mode interruptions are always high severity
        type: 'focus-interruption',
        elapsedMinutes,
        sessionDistractions: sessionDistractions + 1
    };
}

/**
 * Generate re-alignment message after distraction
 * @param {Object} userProfile - User profile
 * @param {string} action - User's choice (resume/end/break)
 * @returns {string} - Motivational realignment message
 */
export function generateRealignmentMessage(userProfile, action) {
    if (!userProfile) {
        return action === 'resume'
            ? "Good choice. Back to work."
            : "Session ended.";
    }

    const { idealSelf, currentTask, longTermGoal } = userProfile;

    if (action === 'resume') {
        return `Good. "${idealSelf}" doesn't give up. Resume: ${currentTask}. You've got this.`;
    } else if (action === 'end') {
        return `Session ended early. Remember: "${longTermGoal}" won't achieve itself. Come back stronger.`;
    } else {
        // break
        return `Taking a break. Use it to refocus on "${longTermGoal}". Next task: ${currentTask}.`;
    }
}
