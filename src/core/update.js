import { spawn, execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { createRequire } from 'module';
import { JobHuntCliError } from './errors.js';
import { fetchLatestVersion, isNewerVersion } from './version-check.js';

const require = createRequire(import.meta.url);
const { version: currentVersion } = require('../../package.json');

const PACKAGE_NAME = 'jobhunt-cli';
const SKILL_REPO = 'Enzoding/JobHunt-CLI';
const SKILL_NAME = 'jobhunt-cli';

const execFileP = promisify(execFile);

// `npm root -g` is slow-ish (~tens of ms) and stable within one run; cache it.
let npmGlobalRootCache = null;

/**
 * Resolve the global npm node_modules directory (`npm root -g`).
 * Returns null when npm is unavailable; callers fall back to path heuristics.
 */
async function getNpmGlobalRoot() {
  if (npmGlobalRootCache !== null) return npmGlobalRootCache;
  try {
    const { stdout } = await execFileP('npm', ['root', '-g'], { timeout: 5000 });
    npmGlobalRootCache = stdout.trim() || null;
  } catch {
    npmGlobalRootCache = null;
  }
  return npmGlobalRootCache;
}

/**
 * Detect whether the CLI is running from a global npm installation.
 *
 * Primary check: the realpath of the invoked bin script lives under the npm
 * global node_modules root. This is robust against bin shims that are symlinks
 * (macOS/Homebrew, nvm, ...) where `process.argv[1]` is the *shim* path and
 * does not contain "node_modules" at all.
 *
 * Fallback: the resolved path contains "node_modules" and is not inside the
 * current working directory (i.e. not a local/source checkout).
 *
 * @param {object} [opts]
 * @param {string} [opts.binPath]  Invoked script path (defaults to process.argv[1])
 * @param {string} [opts.cwd]      Working directory (defaults to process.cwd())
 * @param {string|null} [opts.globalRoot]  npm global root (defaults to null → fallback only)
 * @returns {boolean}
 */
export function isGlobalInstall({
  binPath = process.argv[1] || '',
  cwd = process.cwd(),
  globalRoot = null,
} = {}) {
  if (!binPath) return false;

  let real;
  try {
    real = fs.realpathSync(binPath);
  } catch {
    real = binPath;
  }
  const resolved = path.resolve(real);

  if (globalRoot) {
    const root = path.resolve(globalRoot);
    if (resolved === root || resolved.startsWith(root + path.sep)) return true;
  }

  const cwdResolved = path.resolve(cwd);
  const inNodeModules = resolved.includes(`${path.sep}node_modules${path.sep}`);
  const insideCwd = resolved === cwdResolved || resolved.startsWith(cwdResolved + path.sep);
  return inNodeModules && !insideCwd;
}

/**
 * Read the currently installed global version via `npm ls -g`.
 * Returns null when the package is not installed globally or npm fails.
 */
async function getInstalledGlobalVersion() {
  try {
    const { stdout } = await execFileP(
      'npm',
      ['ls', '-g', PACKAGE_NAME, '--depth=0', '--json'],
      { timeout: 10000 },
    );
    return stdout ? JSON.parse(stdout)?.dependencies?.[PACKAGE_NAME]?.version ?? null : null;
  } catch {
    return null;
  }
}

/**
 * Run a command as a child process, inheriting stdio so output streams live.
 * Resolves when the process exits with code 0; rejects on non-zero exit.
 */
function runProcess(cmd, args, label) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true });
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new JobHuntCliError(
            'UPDATE_ERROR',
            `${label} exited with code ${code}`,
            `Run manually: ${cmd} ${args.join(' ')}`,
            1,
          ),
        );
      }
    });
    child.on('error', err => {
      reject(
        new JobHuntCliError(
          'UPDATE_ERROR',
          `Failed to start ${label}: ${err.message}`,
          `Ensure '${cmd}' is available in PATH`,
          1,
        ),
      );
    });
  });
}

/**
 * Step 1: update the CLI via npm.
 * Never throws for skip/noop; returns a status object for the reporter.
 */
async function updateCli({ dryRun = false } = {}) {
  const [latest, globalRoot] = await Promise.all([fetchLatestVersion(), getNpmGlobalRoot()]);
  const global = isGlobalInstall({ globalRoot });

  if (!global) {
    return {
      status: 'skipped',
      message: 'Running in dev/local mode — skipping npm global update.',
      hint:
        `To update a global install, run: npm install -g ${PACKAGE_NAME}@latest\n` +
        `     If '${PACKAGE_NAME}' still points at a local copy (npm link / dev source), ` +
        `unlink first: npm unlink ${PACKAGE_NAME} -g`,
    };
  }

  if (latest && !isNewerVersion(latest, currentVersion)) {
    return { status: 'noop', message: `Already up to date (v${currentVersion}).` };
  }

  const target = latest ? `v${latest}` : 'latest';
  const command = `npm install -g ${PACKAGE_NAME}@${latest || 'latest'}`;

  if (dryRun) {
    return {
      status: 'simulated',
      message: `Would run: ${command}  (v${currentVersion} → ${target})`,
    };
  }

  await runProcess('npm', ['install', '-g', `${PACKAGE_NAME}@${latest || 'latest'}`], 'npm install -g');

  const installed = await getInstalledGlobalVersion();
  return {
    status: 'updated',
    message: installed ? `v${currentVersion} → v${installed}` : command,
    warn:
      installed && latest && installed !== latest
        ? `Installed v${installed}, expected v${latest}. If '${PACKAGE_NAME}' still runs the old ` +
          `version, it may be linked to a local source (npm link). Fix: npm unlink ${PACKAGE_NAME} -g, then reinstall.`
        : null,
  };
}

/**
 * Step 2: update the AI agent skill via npx.
 */
async function updateSkill({ dryRun = false } = {}) {
  const cmd = 'npx';
  const args = ['-y', 'skills', 'add', SKILL_REPO, '--skill', SKILL_NAME];

  if (dryRun) {
    return { status: 'simulated', message: `Would run: ${cmd} ${args.join(' ')}` };
  }

  await runProcess(cmd, args, 'npx skills add');
  return { status: 'updated', message: 'AI agent skill updated' };
}

/**
 * Main entry: run CLI update and/or skill update based on flags.
 * @param {{ cli?: boolean, skill?: boolean, dryRun?: boolean }} opts
 */
export async function runUpdate({ cli = true, skill = true, dryRun = false } = {}) {
  const steps = [];
  if (cli) steps.push({ label: 'CLI', fn: updateCli });
  if (skill) steps.push({ label: 'AI agent skill', fn: updateSkill });

  if (steps.length === 0) {
    process.stdout.write('Nothing to update.\n');
    return;
  }

  process.stdout.write(
    `\nJobHunt-CLI updater  (current: v${currentVersion})${dryRun ? '  [dry-run]' : ''}\n` +
    `${'─'.repeat(48)}\n`,
  );

  let applied = false;
  for (let i = 0; i < steps.length; i++) {
    const { label, fn } = steps[i];
    process.stdout.write(`\n[${i + 1}/${steps.length}] Updating ${label}…\n`);

    const result = (await fn({ dryRun })) || {};
    const { status, message = '', hint = '', warn = null } = result;

    if (status === 'updated') {
      applied = true;
      process.stdout.write(`✓  ${label} updated: ${message}\n`);
    } else if (status === 'simulated') {
      applied = true;
      process.stdout.write(`◻  ${label} (dry-run): ${message}\n`);
    } else if (status === 'noop') {
      process.stdout.write(`ℹ  ${label}: ${message}\n`);
    } else if (status === 'skipped') {
      process.stdout.write(`ℹ  ${label}: ${message}\n` + (hint ? `     ${hint}\n` : ''));
    } else {
      // Backwards-compatible default when a step returns no explicit status.
      applied = true;
      process.stdout.write(`✓  ${label} updated\n`);
    }

    if (warn) process.stdout.write(`  ⚠  ${warn}\n`);
  }

  process.stdout.write(applied ? '\n✅ Done.\n' : '\nℹ No changes applied.\n');
}