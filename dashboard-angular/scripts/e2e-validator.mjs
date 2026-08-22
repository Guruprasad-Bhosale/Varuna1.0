import { chromium } from 'playwright';

const URL = process.env.TEST_URL || 'http://localhost:4200';
const IS_HEADED = process.argv.includes('--headed');

async function runTests() {
  console.log(`\n🚀 Starting VARUNA Automated E2E Diagnostics against ${URL}...`);
  console.log(`================================================================`);
  
  const browser = await chromium.launch({ headless: !IS_HEADED });
  const context = await browser.newContext();
  const page = await context.newPage();

  let failedTests = 0;
  let totalTests = 0;

  // Interceptors
  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  
  page.on('pageerror', exception => {
    consoleErrors.push(exception.message);
  });

  page.on('response', response => {
    if (response.status() >= 400 && !response.url().includes('favicon')) {
      networkErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  const assert = async (condition, message) => {
    totalTests++;
    if (!condition) {
      console.error(`  ❌ FAIL: ${message}`);
      failedTests++;
    } else {
      console.log(`  ✅ PASS: ${message}`);
    }
  };

  try {
    // ----------------------------------------------------
    // Test Suite 1: Navigation & Route Smoke Test
    // ----------------------------------------------------
    console.log('\n[Suite 1] Navigation & Route Smoke Test');
    const tabs = ['overview', 'nodes', 'live', 'trends', 'alerts', 'camera', 'settings'];
    
    for (const tab of tabs) {
      await page.goto(`${URL}/dashboard?tab=${tab}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);
      
      const isContentActive = await page.locator('main').count() > 0;
      await assert(isContentActive, `Tab '?tab=${tab}' mounted with active content`);
    }

    // ----------------------------------------------------
    // Test Suite 2: Live Monitoring & 6-Card Sensor Array
    // ----------------------------------------------------
    console.log('\n[Suite 2] Live Monitoring & Sensor Integrity');
    await page.goto(`${URL}/dashboard?tab=live`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000); 

    const heroCard = page.locator('text=Suitable under current monitored conditions').first();
    const isVisible = await heroCard.isVisible();
    if (!isVisible) {
      console.log('--- PAGE HTML DUMP ---');
      console.log(await page.content());
      console.log('----------------------');
    }
    await assert(isVisible, 'Station Hero Card is present in DOM');
    
    // Fix grid locator to use class directly rather than unreliable text following-sibling
    const sensorGridCards = page.locator('.grid.grid-cols-1 > div');
    const cardCount = await sensorGridCards.count();
    await assert(cardCount === 6, `Sensor grid contains exactly 6 cards (found: ${cardCount})`);

    if (cardCount === 6) {
      const expectedUnits = ['pH', 'NTU', 'µS/cm', '°C', 'count', 'mm'];
      for (let i = 0; i < 6; i++) {
        const cardText = await sensorGridCards.nth(i).innerText();
        const hasUnit = expectedUnits.some(unit => cardText.includes(unit));
        const hasInvalidData = cardText.includes('--') || cardText.includes('NO DATA');
        
        await assert(hasUnit && !hasInvalidData, `Sensor card ${i + 1} contains valid unit and numeric data`);
      }
    }

    // ----------------------------------------------------
    // Test Suite 3: Radial SVG Gauge & Animation
    // ----------------------------------------------------
    console.log('\n[Suite 3] Radial SVG Gauge Dynamics');
    const svgGaugeCircle = page.locator('svg circle.gauge-stroke-transition').first();
    await assert(await svgGaugeCircle.isVisible(), 'Animated SVG gauge is visible');
    
    const dasharray = await svgGaugeCircle.getAttribute('stroke-dasharray');
    const dashoffset = await svgGaugeCircle.getAttribute('style');
    await assert(dasharray !== null && dasharray.includes('163'), `SVG Gauge has valid stroke-dasharray: ${dasharray}`);
    await assert(dashoffset !== null && dashoffset.includes('stroke-dashoffset'), 'SVG Gauge has valid stroke-dashoffset transition logic');

    // ----------------------------------------------------
    // Test Suite 4: Simulation Dock Automation
    // ----------------------------------------------------
    console.log('\n[Suite 4] Interactive Anomaly Simulations');
    
    await page.click('button:has-text("Industrial Dump")');
    await page.waitForTimeout(500); 
    
    let statusText = await page.locator('text=Suitable under current monitored conditions').locator('xpath=preceding-sibling::span').first().innerText();
    await assert(statusText.includes('HAZARD'), 'Industrial Dump triggers HAZARD status');
    
    await page.click('button:has-text("Heavy Rain")');
    await page.waitForTimeout(500);
    let heroStatusText = await page.locator('text=Suitable under current monitored conditions').locator('xpath=preceding-sibling::span').first().innerText();
    await assert(heroStatusText.includes('MODERATE'), 'Heavy Rain triggers MODERATE status');

    await page.click('button:has-text("Alkaline Spill")');
    await page.waitForTimeout(500);
    const phValueEl = page.locator('text=pH Level').locator('xpath=../../div[2]');
    let phValue = parseFloat(await phValueEl.innerText());
    await assert(phValue > 9.0, `Alkaline Spill increases pH > 9.0 (Current: ${phValue})`);

    // ----------------------------------------------------
    // Test Suite 5: GIS Leaflet & Predictive Bloom Layer
    // ----------------------------------------------------
    console.log('\n[Suite 5] GIS Leaflet Map & Radar Integrations');
    await page.goto(`${URL}/dashboard?tab=nodes`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000); 
    
    const mapEl = page.locator('#sindhudurg-gis-map');
    await assert(await mapEl.isVisible(), 'Leaflet GIS map container is mounted');
    
    const radarBeacons = page.locator('.bloom-forecast-radar');
    const radarCount = await radarBeacons.count();
    await assert(radarCount > 0, `Bloom forecast radar beacons are present (found: ${radarCount})`);

    // ----------------------------------------------------
    // Audit Summaries
    // ----------------------------------------------------
    console.log('\n[Diagnostics] Global Error Capture');
    await assert(consoleErrors.length === 0, `0 JavaScript runtime/console errors (found ${consoleErrors.length})`);
    if (consoleErrors.length > 0) consoleErrors.forEach(e => console.error(`    - ${e}`));
    
    await assert(networkErrors.length === 0, `0 HTTP 4xx/5xx network failures (found ${networkErrors.length})`);
    if (networkErrors.length > 0) networkErrors.forEach(e => console.error(`    - ${e}`));

  } catch (error) {
    console.error('\n💥 FATAL TEST RUNNER ERROR:', error);
    if (consoleErrors.length > 0) console.error('Caught Browser Console Errors:', consoleErrors);
    if (networkErrors.length > 0) console.error('Caught Network Errors:', networkErrors);
    failedTests++;
  } finally {
    await browser.close();
    
    console.log(`\n================================================================`);
    if (failedTests > 0) {
      console.error(`🔴 VALIDATION FAILED: ${failedTests} out of ${totalTests} checks failed.`);
      process.exit(1);
    } else {
      console.log(`🟢 VALIDATION PASSED: All ${totalTests} checks completed successfully!`);
      process.exit(0);
    }
  }
}

runTests();
