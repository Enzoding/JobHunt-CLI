/**
 * Smoke test: verify meituan jobUrl template produces correctly formatted URLs.
 *
 * NOTE: URL actual reachability requires browser-based verification (SPA).
 * This test only validates the URL format matches the expected pattern.
 */
import { fetchJobs, normalizeJob } from '../src/sites/meituan/utils.js';

const URL_PATTERN = /^https:\/\/zhaopin\.meituan\.com\/web\/position\/detail\?jobUnionId=\d+$/;

// 1. Fetch one search result
const result = await fetchJobs({ query: '' }, 1, 1);
if (!result.list.length) throw new Error('No meituan jobs returned');

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
