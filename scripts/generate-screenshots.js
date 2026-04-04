/**
 * Generate UI screenshots for the CraftAgent frontend
 * Uses Playwright to create headless browser screenshots
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FRONTEND_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.join(__dirname, '../docs/images');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.createContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  try {
    console.log('🌐 Navigating to frontend...');
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for app to fully load
    await page.waitForTimeout(2000);

    console.log('📸 Taking full page screenshot...');
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '01-full-ui.png'),
      fullPage: false
    });

    // Wait a bit then take another screenshot showing different state
    await page.waitForTimeout(1000);

    console.log('✅ Screenshot generated successfully!');
    console.log(`📁 Saved to: ${OUTPUT_DIR}`);

  } catch (error) {
    console.error('❌ Screenshot generation failed:', error.message);
    if (error.message.includes('ERR_CONNECTION_REFUSED')) {
      console.log('\n⚠️  Frontend dev server not running.');
      console.log('Start it with: cd frontend && npm run dev');
    }
    process.exit(1);
  } finally {
    await browser.close();
  }
}

generateScreenshots();
