/**
 * Smoke test: verify netease jobUrl template produces correctly formatted URLs.
 *
 * NOTE: URL actual reachability requires browser-based verification (SPA).
 * Without &lang=zh, the SPA redirects to /job-list.html for non-Chinese locales.
 */
import { fetchJobs, normalizeJob } from '../src/sites/netease/utils.js';

const URL_PATTERN = /^https:\/\/hr\.163\.com\/job-detail\.html\?id=\d+&lang=zh$/;

// 1. Fetch one search result
const result = await fetchJobs({ query: '' }, 1, 1);
if (!result.list.length) throw new Error('No netease jobs returned');

const job = normalizeJob(result.list[0]);
if (!job.url) throw new Error('Job url is empty');

// 2. Assert URL matches expected format
if (!URL_PATTERN.test(job.url)) {
  throw new Error(
    `URL format mismatch.\n  Expected pattern: ${URL_PATTERN}\n  Got: ${job.url}`
  );
}

console.log(JSON.stringify({
  ok: true,
  url: job.url,
  pattern: URL_PATTERN.toString(),
}, null, 2));
