/**
 * Smoke test: verify jd jobUrl returns the public social recruitment list page.
 *
 * JD does not provide public job detail deep links (detail pages require login).
 * jobUrl() is intentionally degraded to the list page URL.
 */
import { SOCIAL_URL, fetchJobs, normalizeJob } from '../src/sites/jd/utils.js';

const EXPECTED_URL = SOCIAL_URL;

// 1. Fetch one search result
const result = await fetchJobs({ query: '' }, 1, 1);
if (!result.list.length) throw new Error('No jd jobs returned');

const job = normalizeJob(result.list[0]);
if (!job.url) throw new Error('Job url is empty');

// 2. Assert URL equals the public list page
if (job.url !== EXPECTED_URL) {
  throw new Error(
    `URL mismatch.\n  Expected: ${EXPECTED_URL}\n  Got: ${job.url}`
  );
}

console.log(JSON.stringify({
  ok: true,
  url: job.url,
  expected: EXPECTED_URL,
}, null, 2));
