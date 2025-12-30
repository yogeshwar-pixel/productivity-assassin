// EMERGENCY FIX - Manually set your platforms
// Copy this entire code block, paste in console, press Enter

chrome.storage.local.set({
    userProfile: {
        realGoal: 'Score 85%+ in semester exams',
        failurePattern: 'I scroll reels until 2 AM then wake up late',
        sacrifice: 'My placement chances and parents expectations',
        studyPlatforms: [
            { name: 'PESU Academy', url: 'https://www.pesuacademy.com' },
            { name: 'LeetCode', url: 'https://www.leetcode.com' },
            { name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org' }
        ],
        weakTime: '9-11 PM after dinner',
        mainDistraction: 'Instagram Reels',
        accountability: 'My parents who took loan for fees',
        tone: 'Tough',
        createdAt: new Date().toISOString()
    }
}, function () {
    console.log('✅ PLATFORMS FORCE-SAVED!');

    // Verify it saved
    chrome.storage.local.get(['userProfile'], function (result) {
        console.log('\n📚 Your Study Platforms:');
        result.userProfile.studyPlatforms.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.name} → ${p.url}`);
        });
        console.log('\n🎯 Test now: Visit Instagram!');
    });
});
