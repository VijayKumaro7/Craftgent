/**
 * Generate UI screenshots for the CraftAgent frontend
 * Uses Playwright to create headless browser screenshots at multiple viewport sizes
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

// Viewport configurations
const viewports = [
  {
    name: '01-desktop-full-ui',
    width: 1440,
    height: 900,
    description: 'Full desktop UI (1440x900) - Shows all components'
  },
  {
    name: '06-mobile-responsive',
    width: 375,
    height: 812,
    description: 'Mobile responsive view (375x812) - iPhone size'
  },
  {
    name: '07-tablet-responsive',
    width: 768,
    height: 1024,
    description: 'Tablet responsive view (768x1024) - iPad size'
  }
];

async function generateScreenshots() {
  let browser;
  const screenshots = [];

  try {
    console.log('🚀 Starting Playwright browser...');
    browser = await chromium.launch();

    console.log(`🌐 Navigating to ${FRONTEND_URL}...\n`);

    for (const viewport of viewports) {
      try {
        console.log(`📸 Capturing ${viewport.description}...`);

        const context = await browser.createContext({
          viewport: { width: viewport.width, height: viewport.height },
        });

        const page = await context.newPage();

        // Navigate to frontend
        await page.goto(FRONTEND_URL, { waitUntil: 'networkidle', timeout: 30000 });

        // Wait for app to fully load and render
        await page.waitForTimeout(2500);

        // Take screenshot
        const screenshotPath = path.join(OUTPUT_DIR, `${viewport.name}.png`);
        await page.screenshot({
          path: screenshotPath,
          fullPage: false
        });

        const fileSize = fs.statSync(screenshotPath).size;
        console.log(`✅ Saved: ${viewport.name}.png (${Math.round(fileSize / 1024)}KB)\n`);

        screenshots.push({
          file: `${viewport.name}.png`,
          description: viewport.description,
          size: fileSize
        });

        await context.close();

      } catch (error) {
        console.error(`❌ Failed to capture ${viewport.name}: ${error.message}\n`);
        throw error;
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SCREENSHOT GENERATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n✅ Successfully generated ${screenshots.length} screenshots:\n`);

    screenshots.forEach((shot, idx) => {
      console.log(`  ${idx + 1}. ${shot.file}`);
      console.log(`     ${shot.description}`);
      console.log(`     Size: ${Math.round(shot.size / 1024)}KB\n`);
    });

    console.log(`📁 All screenshots saved to: ${OUTPUT_DIR}\n`);
    console.log('Next steps:');
    console.log('  1. Review the generated screenshots');
    console.log('  2. Update docs/FRONTEND.md with image references');
    console.log('  3. Update README.md with new screenshot images');
    console.log('  4. Create docs/SCREENSHOTS.md for detailed documentation\n');

  } catch (error) {
    console.error('\n❌ Screenshot generation failed:', error.message);

    if (error.message.includes('ERR_CONNECTION_REFUSED')) {
      console.log('\n⚠️  Frontend dev server not running!');
      console.log('\nTo fix, in a separate terminal run:');
      console.log('  cd /home/user/Craftgent/frontend');
      console.log('  npm run dev\n');
      console.log('Then run this script again in another terminal:\n');
      console.log('  cd /home/user/Craftgent');
      console.log('  node scripts/generate-screenshots.js\n');
    } else if (error.message.includes('Playwright')) {
      console.log('\n⚠️  Playwright not installed!');
      console.log('\nTo fix, run:');
      console.log('  npx playwright install\n');
      console.log('Then try again:\n');
      console.log('  node scripts/generate-screenshots.js\n');
    }

    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

generateScreenshots().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
