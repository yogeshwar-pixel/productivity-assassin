// Test Profile Sync - Run this in browser console after completing setup

// 1. Check if profile was saved
chrome.storage.local.get(['userProfile'], function (result) {
    console.log('=== PROFILE SYNC TEST ===');
    console.log('Profile exists:', !!result.userProfile);

    if (result.userProfile) {
        console.log('✅ Profile Data:');
        console.log('  - Real Goal:', result.userProfile.realGoal);
        console.log('  - Failure Pattern:', result.userProfile.failurePattern);
        console.log('  - Sacrifice:', result.userProfile.sacrifice);
        console.log('  - Study Platforms:', result.userProfile.studyPlatforms);
        console.log('  - Weak Time:', result.userProfile.weakTime);
        console.log('  - Main Distraction:', result.userProfile.mainDistraction);
        console.log('  - Accountability:', result.userProfile.accountability);
    } else {
        console.log('❌ NO PROFILE FOUND!');
        console.log('   → Complete setup at /setup');
    }

    console.log('========================');
});

// 2. Manually set test profile (if setup not working)
chrome.storage.local.set({
    userProfile: {
        realGoal: 'Score 85%+ in semester exams',
        failurePattern: 'I scroll reels until 2 AM',
        sacrifice: 'My placement chances',
        studyPlatforms: [
            { name: 'NPTEL', url: 'https://nptel.ac.in' },
            { name: 'LeetCode', url: 'https://leetcode.com' }
        ],
        weakTime: '9-11 PM after dinner',
        mainDistraction: 'Instagram Reels',
        accountability: 'My parents who took loan for fees'
    }
}, function () {
    console.log('✅ Test profile set!');
});
