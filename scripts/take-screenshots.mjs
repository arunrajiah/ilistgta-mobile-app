import puppeteer from 'puppeteer-core';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../store-assets/screenshots/iphone-67');
const BASE = 'http://localhost:8081';

// iPhone 14 Pro Max: 393×852 @3x = 1179×2556
const WIDTH = 393;
const HEIGHT = 852;
const SCALE = 3;

const SCREENS = [
  { file: '00-onboarding.png',     url: '/onboarding',          wait: 1000 },
  { file: '00b-onboarding-lang.png', url: '/onboarding/language', wait: 800 },
  { file: '00c-onboarding-loc.png',  url: '/onboarding/location', wait: 800 },
  { file: '01-home.png',           url: '/',                    wait: 2500 },
  { file: '02-explore.png',        url: '/explore',             wait: 2500 },
  { file: '03-events.png',         url: '/events',              wait: 2500 },
  { file: '04-deals.png',          url: '/coupons',             wait: 2500 },
  { file: '05-profile.png',        url: '/profile',             wait: 1000 },
  { file: '06-login.png',          url: '/auth/login',          wait: 800  },
];

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process'],
});

const page = await browser.newPage();
await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: SCALE });

// Intercept corsproxy.io requests and route directly to the API
await page.setRequestInterception(true);
page.on('request', req => {
  const url = req.url();
  if (url.startsWith('https://corsproxy.io/?url=')) {
    const target = decodeURIComponent(url.replace('https://corsproxy.io/?url=', ''));
    req.continue({ url: target });
  } else {
    req.continue();
  }
});

for (const { file, url, wait } of SCREENS) {
  const fullUrl = BASE + url;
  console.log(`📸 ${file}  →  ${fullUrl}`);
  await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {
    console.warn(`  ⚠️  networkidle2 timeout, continuing...`);
  });
  await new Promise(r => setTimeout(r, wait));
  const outPath = path.join(OUT_DIR, file);
  await page.screenshot({ path: outPath, fullPage: false });
  console.log(`   ✅  saved ${outPath}`);
}

await browser.close();
console.log('\nAll screenshots done!');
