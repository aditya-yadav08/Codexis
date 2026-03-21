import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  
  // Set theme to Emerald
  await page.evaluate(() => {
    document.documentElement.classList.add('theme-Emerald');
  });
  
  // Wait to ensure CSS is updated
  await page.waitForTimeout(500);
  
  // Get computed styles
  const data = await page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const rootStyles = getComputedStyle(root);
    const bodyStyles = getComputedStyle(body);
    
    // Also inject a test div
    const div = document.createElement('div');
    div.className = 'bg-accent-primary text-accent-primary p-4';
    div.innerText = 'Test Div';
    document.body.appendChild(div);
    const divStyles = getComputedStyle(div);
    
    return {
      htmlClass: root.className,
      themePrimary: rootStyles.getPropertyValue('--theme-primary'),
      colorEmerald500: rootStyles.getPropertyValue('--color-emerald-500'),
      colorAccentPrimary: rootStyles.getPropertyValue('--color-accent-primary'),
      divBg: divStyles.backgroundColor,
      divColor: divStyles.color
    };
  });
  
  console.log('Results:', JSON.stringify(data, null, 2));
  await browser.close();
})();
