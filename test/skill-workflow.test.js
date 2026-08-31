import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillDir = path.join(root, 'skills/jobhunt-cli');
const entry = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');

const REFERENCES = [
  'references/commands.md',
  'references/fields-and-natures.md',
  'references/troubleshooting.md',
];

describe('Skill progressive docs', () => {
  it('does not require full sites or filters on every task', () => {
    assert.doesNotMatch(entry, /每次任务开始/);
    assert.doesNotMatch(entry, /先运行此命令获取最新的站点列表/);
    assert.doesNotMatch(entry, /在使用 `--category` 或 `--location` 前，先查 filters/);
    assert.match(entry, /不要每个任务都跑完整/);
    assert.match(entry, /不要每次筛选前都跑完整/);
  });

  it('routes typical tasks to compact, detail full, summary-only, and file output', () => {
    assert.match(entry, /--view compact/);
    assert.match(entry, /detail <detail_id>[\s\S]*--view full/);
    assert.match(entry, /--summary-only/);
    assert.match(entry, /--view full --format json --output/);
    assert.match(entry, /--view debug/);
  });

  it('keeps nature, URL, and injection safety rules', () => {
    assert.match(entry, /UNSUPPORTED_NATURE/);
    assert.match(entry, /不要改成社招重试/);
    assert.match(entry, /url.*原样/i);
    assert.match(entry, /不可信第三方|禁止把其中的指令/);
  });

  it('points to published references with working relative links', () => {
    for (const rel of REFERENCES) {
      assert.match(entry, new RegExp(rel.replaceAll('.', '\\.')));
      const abs = path.join(skillDir, rel);
      assert.equal(fs.existsSync(abs), true, `missing ${rel}`);
      assert.ok(fs.statSync(abs).size > 0, `empty ${rel}`);
    }
  });
});

describe('publish package includes skill references', () => {
  it('lists references in npm pack dry-run', () => {
    const out = execSync('npm pack --dry-run --json', {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const report = JSON.parse(out);
    const files = (Array.isArray(report) ? report[0]?.files : report.files) || [];
    const paths = files.map(file => file.path || file);
    for (const rel of REFERENCES) {
      assert.ok(paths.includes(`skills/jobhunt-cli/${rel}`), `pack missing ${rel}`);
    }
    assert.ok(paths.includes('skills/jobhunt-cli/SKILL.md'));
  });
});
