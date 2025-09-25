const puppeteer = require('puppeteer');

async function runSmokeTest() {
    let browser;
    
    try {
        console.log('Starting smoke test...');
        
        browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Test home page
        console.log('Testing home page...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        
        const title = await page.title();
        if (!title.includes('SaaS QA Code')) {
            throw new Error(`Expected page title to contain 'SaaS QA Code', got: ${title}`);
        }
        
        // Test About link exists
        console.log('Testing About link...');
        const aboutLink = await page.$('footer a[href="/about"]');
        if (!aboutLink) {
            throw new Error('About link not found in footer');
        }
        
        const aboutLinkText = await page.evaluate(el => el.textContent, aboutLink);
        if (aboutLinkText !== 'About') {
            throw new Error(`Expected About link text to be 'About', got: ${aboutLinkText}`);
        }
        
        // Test About page
        console.log('Testing About page...');
        await aboutLink.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        const aboutTitle = await page.title();
        if (!aboutTitle.includes('About')) {
            throw new Error(`Expected About page title to contain 'About', got: ${aboutTitle}`);
        }
        
        const currentUrl = page.url();
        if (!currentUrl.includes('/about')) {
            throw new Error(`Expected URL to contain '/about', got: ${currentUrl}`);
        }
        
        console.log('✅ All smoke tests passed!');
        
    } catch (error) {
        console.error('❌ Smoke test failed:', error.message);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

runSmokeTest();