const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    // 1. Path to your extension directory
    const extensionPath = path.resolve('d:/Projects/productivity-assassin/chrome-extension');

    // 2. Launch Puppeteer with the extension loaded
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`
        ]
    });

    try {
        console.log('🚀 Browser launched with extension.');
        const page = await browser.newPage();

        // 3. Inject dummy profile directly into chrome.storage.local to simulate Setup App
        await page.goto('https://example.com'); // Open safe page first to access chrome API loosely
        console.log('📝 Injecting test setup data...');
        await page.evaluate(async () => {
            return new Promise((resolve) => {
                chrome.storage.local.set({
                    userProfile: {
                        studyPlatforms: [{ name: 'NPTEL', url: 'https://nptel.ac.in' }],
                        realGoal: 'testing extension',
                    },
                    strictMode: true,
                    violationCount: 0
                }, resolve);
            });
        });

        // 4. Navigate to a Blacklisted Site
        console.log('⏳ Navigating to blacklisted site (instagram.com)...');
        await page.goto('https://instagram.com', { waitUntil: 'domcontentloaded' });
        
        // Wait 3 seconds to see what happens
        await new Promise(r => setTimeout(r, 3000));
        
        const finalUrl = page.url();
        console.log(`✅ FINAL URL after 3 seconds: ${finalUrl}`);
        
        if (finalUrl.includes('nptel.ac.in')) {
            console.log('🎉 Redirection SUCCESS: Redirected to study platform.');
        } else if (finalUrl.includes('instagram.com')) {
            console.error('❌ Redirection FAILED: Remained on blacklisted site.');
            // Dump console logs from the page
        } else {
            console.warn('⚠️ Redirected to unknown URL:', finalUrl);
        }
        
    } catch (e) {
        console.error('Test crashed:', e);
    } finally {
        await browser.close();
    }
})();
