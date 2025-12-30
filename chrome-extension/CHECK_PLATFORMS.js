// CHECK WHAT'S IN STORAGE - Run this in console

chrome.storage.local.get(['userProfile'], function (result) {
    console.clear();
    console.log('=== PROFILE CHECK ===');

    if (!result.userProfile) {
        console.log('❌ NO PROFILE FOUND!');
        return;
    }

    const profile = result.userProfile;
    console.log('✅ Profile exists');
    console.log('\n📚 Study Platforms:');

    if (!profile.studyPlatforms) {
        console.log('  ❌ studyPlatforms is undefined');
    } else if (profile.studyPlatforms.length === 0) {
        console.log('  ❌ studyPlatforms is empty array');
    } else {
        console.log('  ✅ Found', profile.studyPlatforms.length, 'platforms:');
        profile.studyPlatforms.forEach((p, i) => {
            console.log(`    ${i + 1}. ${p.name} → ${p.url}`);
        });
    }

    console.log('\n📋 Full Profile:');
    console.log(profile);
    console.log('==================');
});
