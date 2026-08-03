import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version: currentVersion, name: packageName } = require('../../package.json');

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
// npm registry often needs ~1–2s even when healthy; keep short but usable.
const FETCH_TIMEOUT_MS = 2000;
const REGISTRY_LATEST_URL = `https://registry.npmjs.org/${packageName}/latest`;

/**
 * Compare semver-ish versions. Returns true when latest is greater than current.
 */
export function isNewerVersion(latest, current) {
  const parse = value => String(value || '')
    .replace(/^v/i, '')
    .split(/[.+-]/)
    .map(part => {
      const n = Number.parseInt(part, 10);
      return Number.isFinite(n) ? n : 0;
    });

  const a = parse(latest);
  const b = parse(current);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const diff = (a[i] || 0) - (b[i] || 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
}

export function getUpdateCheckCachePath(env = process.env, homedir = os.homedir()) {
  const root = env.XDG_CACHE_HOME
    ? path.join(env.XDG_CACHE_HOME, 'jobhunt-cli')
    : path.join(homedir, '.cache', 'jobhunt-cli');
  return path.join(root, 'update-check.json');
}

export function shouldSkipUpdateCheck(argv = process.argv, opts = {}, env = process.env) {
  const flag = String(env.JOBHUNT_NO_UPDATE_CHECK || '').trim().toLowerCase();
  if (flag && flag !== '0' && flag !== 'false' && flag !== 'off' && flag !== 'no') return true;
  // Commander maps --no-update-check onto opts.updateCheck === false
  if (opts.updateCheck === false) return true;

  const args = argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) return true;
  if (args.includes('--version') || args.includes('-V')) return true;
  if (args[0] === 'update') return true;
  return false;
}

function readCache(cachePath) {
  try {
    const raw = fs.readFileSync(cachePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(cachePath, data) {
  try {
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    fs.writeFileSync(cachePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch {
    // Cache write failures must never break the CLI.
  }
}

async function fetchLatestVersion(fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== 'function') return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetchImpl(REGISTRY_LATEST_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response?.ok) return null;
    const payload = await response.json();
    const latest = payload?.version;
    return typeof latest === 'string' && latest ? latest : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Lightweight update tip. Never throws; prints at most one stderr line.
 */
export async function maybeNotifyUpdate({
  argv = process.argv,
  opts = {},
  env = process.env,
  now = Date.now(),
  fetchImpl = globalThis.fetch,
  cachePath = getUpdateCheckCachePath(env),
  current = currentVersion,
} = {}) {
  if (shouldSkipUpdateCheck(argv, opts, env)) return { skipped: true };

  const cached = readCache(cachePath);
  const checkedAt = cached?.checkedAt ? Date.parse(cached.checkedAt) : NaN;
  const cacheFresh = Number.isFinite(checkedAt) && (now - checkedAt) < CACHE_TTL_MS;

  let latest = cacheFresh ? cached?.latestVersion : null;
  if (!cacheFresh) {
    latest = await fetchLatestVersion(fetchImpl);
    if (latest) {
      writeCache(cachePath, {
        checkedAt: new Date(now).toISOString(),
        latestVersion: latest,
      });
    } else if (cached?.latestVersion) {
      // Keep prior knowledge if network fails; refresh checkedAt lightly so we don't hammer.
      writeCache(cachePath, {
        checkedAt: new Date(now).toISOString(),
        latestVersion: cached.latestVersion,
      });
      latest = cached.latestVersion;
    } else {
      return { skipped: false, checked: true, updateAvailable: false };
    }
  }

  if (!latest || !isNewerVersion(latest, current)) {
    return { skipped: false, checked: true, updateAvailable: false, latestVersion: latest };
  }

  process.stderr.write(
    `tip: jobhunt-cli ${latest} is available (current ${current}). Run: job update\n`,
  );
  return { skipped: false, checked: true, updateAvailable: true, latestVersion: latest };
}
