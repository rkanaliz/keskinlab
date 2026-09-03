const ORIGIN = 'https://www.keskinlab.com';
const targets = [
  ['/', 'KeskinLab'],
  ['/hakkinda', 'KeskinLab'],
  ['/iletisim', 'KeskinLab'],
  ['/dijital-araclar', 'Dijital'],
  ['/evrak-cantasi', 'Evrak'],
  ['/takvim', 'Takvimi'],
  ['/5-sinif-bty', '5. Sınıf BTY'],
  ['/6-sinif-bty', '6. Sınıf BTY'],
  ['/robotik-kodlama', 'Robotik Kodlama'],
  ['/yapay-zeka', 'Yapay Zekâ'],
  ['/robots.txt', 'Sitemap:'],
  ['/sitemap.xml', '<urlset']
];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(path, attempts = 8) {
  let lastError;
  for (let i = 1; i <= attempts; i++) {
    try {
      const response = await fetch(`${ORIGIN}${path}`, {
        redirect: 'follow',
        headers: { 'user-agent': 'KeskinLab-Production-Smoke/1.0' }
      });
      if (response.ok) return response;
      lastError = new Error(`${path} → HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (i < attempts) await sleep(15000);
  }
  throw lastError;
}

let failures = 0;
for (const [path, marker] of targets) {
  try {
    const response = await fetchWithRetry(path);
    const text = await response.text();
    if (!text.includes(marker)) {
      failures++;
      console.error(`FAIL ${path}: beklenen içerik işareti bulunamadı: ${marker}`);
      continue;
    }
    console.log(`OK   ${path} → ${response.url} (${response.status})`);
  } catch (error) {
    failures++;
    console.error(`FAIL ${path}: ${error.message}`);
  }
}

// Implementation filename must not remain visible after navigation.
try {
  const response = await fetchWithRetry('/classroom-5-sinif.html');
  if (!response.url.endsWith('/5-sinif-bty')) {
    failures++;
    console.error(`FAIL implementation route canonicalization: ${response.url}`);
  } else {
    console.log(`OK   implementation route → ${response.url}`);
  }
} catch (error) {
  failures++;
  console.error(`FAIL implementation route: ${error.message}`);
}

console.log(`Production smoke: ${targets.length + 1} check(s), ${failures} failure(s)`);
if (failures) process.exit(1);
