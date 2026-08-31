import { spawn } from 'child_process';
import { createRequire } from 'module';
import { JobHuntCliError } from './errors.js';

const require = createRequire(import.meta.url);
const { version: currentVersion } = require('../../package.json');

const PACKAGE_NAME = 'jobhunt-cli';
const SKILL_REPO = 'Enzoding/JobHunt-CLI';
const SKILL_NAME = 'jobhunt-cli';

/**
 * Detect whether the CLI is running from a global npm installation.
 * Returns true for global installs, false for local dev runs.
 */
function isGlobalInstall() {
  const binPath = process.argv[1] || '';
  // Global npm installs land in paths like:
  //   /usr/local/lib/node_modules/...
  //   ~/.nvm/versions/node/.../lib/node_modules/...
  //   /opt/homebrew/lib/node_modules/...
  return binPath.includes('node_modules') && !binPath.includes(process.cwd());
}

/**
 * Wait for an already-spawned child process, inheriting stdio so output streams live.
 * Resolves when the process exits with code 0; rejects on non-zero exit.
 */
function runProcess(spawnChild, label, hint) {
  return new Promise((resolve, reject) => {
    const child = spawnChild();
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new JobHuntCliError(
            'UPDATE_ERROR',
            `${label} exited with code ${code}`,
            hint,
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
          hint,
          1,
        ),
      );
    });
  });
}

/**
 * Step 1: update the CLI via npm.
 */
async function updateCli() {
  if (!isGlobalInstall()) {
    process.stdout.write(
      `  ℹ  Running in dev/local mode — skipping npm global update.\n` +
      `     To update a global install, run: npm install -g ${PACKAGE_NAME}@latest\n`,
    );
    return;
  }
  await runProcess(
    () => spawn('npm', ['install', '-g', `${PACKAGE_NAME}@latest`], { stdio: 'inherit' }),
    'npm install -g',
    'Run manually: npm install -g jobhunt-cli@latest',
  );
}

/**
 * Step 2: update the AI agent skill via npx.
 */
async function updateSkill() {
  const skillArgs = ['-y', 'skills', 'add', SKILL_REPO, '--skill', SKILL_NAME];
  await runProcess(
    () => spawn('npx', skillArgs, { stdio: 'inherit' }),
    'npx skills add',
    'Run manually: npx ' + skillArgs.join(' '),
  );
}

/**
 * Main entry: run CLI update and/or skill update based on flags.
 * @param {{ cli?: boolean, skill?: boolean }} opts
 */
export async function runUpdate({ cli = true, skill = true } = {}) {
  const steps = [];
  if (cli) steps.push({ label: 'CLI', fn: updateCli });
  if (skill) steps.push({ label: 'AI agent skill', fn: updateSkill });

  if (steps.length === 0) {
    process.stdout.write('Nothing to update.\n');
    return;
  }

  process.stdout.write(
    `\nJobHunt-CLI updater  (current: v${currentVersion})\n` +
    `${'─'.repeat(48)}\n`,
  );

  for (let i = 0; i < steps.length; i++) {
    const { label, fn } = steps[i];
    process.stdout.write(`\n[${i + 1}/${steps.length}] Updating ${label}…\n`);
    await fn();
    process.stdout.write('✓  ' + label + ' updated\n');
  }

  process.stdout.write(`\n✅ All done!\n`);
}
