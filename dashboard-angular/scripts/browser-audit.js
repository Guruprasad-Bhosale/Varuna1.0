/**
 * VARUNA In-Browser DevTools Diagnostic Script
 * Copy and paste this into the Chrome DevTools Console.
 * It runs a 5-second health check on the Live Dashboard.
 */
(async function runVarunaDiagnostics() {
  console.log('%c🚀 Starting VARUNA Health Diagnostics...', 'color: #0ea5e9; font-weight: bold; font-size: 14px;');
  
  const results = [];
  const addResult = (test, passed, msg) => {
    results.push({ Test: test, Status: passed ? '✅ PASS' : '❌ FAIL', Message: msg });
  };

  try {
    // 1. Check Route
    const isLive = window.location.search.includes('tab=live');
    if (!isLive) {
      console.warn('⚠️ Please navigate to the Live Monitoring tab (?tab=live) for full diagnostics.');
    }
    
    // 2. Sensor Cards
    const gridCards = document.querySelectorAll('.grid > div');
    const hasCards = gridCards.length === 6;
    addResult('Sensor Array Mount', hasCards, `Found ${gridCards.length}/6 sensor cards`);
    
    // 3. SVG Gauge
    const gauge = document.querySelector('svg circle.gauge-stroke-transition');
    const hasGauge = !!gauge;
    let gaugeValid = false;
    if (hasGauge) {
      const dash = gauge.getAttribute('stroke-dasharray');
      gaugeValid = dash && dash.includes('163');
    }
    addResult('SVG Gauge Dynamics', hasGauge && gaugeValid, hasGauge ? 'Gauge mounted and animated' : 'Gauge missing');

    // 4. Console Errors (Monkey patch to capture runtime errors for next 3 seconds)
    let capturedErrors = 0;
    const origError = console.error;
    console.error = function(...args) {
      capturedErrors++;
      origError.apply(console, args);
    };

    console.log('%c⏳ Monitoring telemetry loops for 3 seconds...', 'color: #64748b; font-style: italic;');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Restore
    console.error = origError;
    addResult('Runtime Stability', capturedErrors === 0, `${capturedErrors} console errors detected during idle`);

    // 5. Check Simulation Buttons
    const buttons = Array.from(document.querySelectorAll('button'));
    const dumpBtn = buttons.find(b => b.innerText.includes('Industrial Dump'));
    addResult('Simulation Dock', !!dumpBtn, dumpBtn ? 'Interactive dock mounted' : 'Simulation buttons missing');

    // Output Table
    console.log('%c\n📊 DIAGNOSTIC SUMMARY:', 'color: #f59e0b; font-weight: bold; font-size: 12px;');
    console.table(results);

    const allPassed = results.every(r => r.Status === '✅ PASS');
    if (allPassed) {
      console.log('%c🟢 SYSTEM HEALTHY: All visual and structural constraints satisfied.', 'color: #10b981; font-weight: bold;');
    } else {
      console.log('%c🔴 SYSTEM UNHEALTHY: Visual regressions detected.', 'color: #ef4444; font-weight: bold;');
    }
  } catch (err) {
    console.error('Diagnostic harness failure:', err);
  }
})();
