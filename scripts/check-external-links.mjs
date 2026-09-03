import { promises as fs } from 'node:fs';

const html = await fs.readFile('dijital-araclar.html', 'utf8');
const urls = [...html.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi)]
  .map(m => m[1])
  .filter((url, i, arr) => arr.indexOf(url) === i);

const officialHosts = [
  'meb.gov.tr','www.meb.gov.tr','eba.gov.tr','www.eba.gov.tr','dilim.eba.gov.tr',
  'oba.gov.tr','www.oba.gov.tr','etwinning.meb.gov.tr','genctek.eba.gov.tr',
  'yesilay.org.tr','www.etwinning.net','school-education.ec.europa.eu'
];

const targets = urls.filter(url => {
  try { return officialHosts.includes(new URL(url).hostname); }
  catch { return false; }
});

let hardFailures = 0;
for (const url of targets) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'KeskinLab-Link-Health/1.0 (+https://www.keskinlab.com)' }
    });
    const status = response.status;
    if (status === 404 || status === 410) {
      hardFailures++;
      console.error(`BROKEN ${status} ${url}`);
    } else if (status >= 500) {
      console.warn(`WARN   ${status} ${url}`);
    } else {
      console.log(`OK     ${status} ${url}`);
    }
  } catch (error) {
    console.warn(`WARN   network ${url} (${error.name || error.message})`);
  } finally {
    clearTimeout(timer);
  }
}

console.log(`External link health: ${targets.length} official URL(s), ${hardFailures} hard failure(s)`);
if (hardFailures) process.exit(1);
