import { Command } from 'commander';
import { createRequire } from 'module';
import { analyzeJobs, analyzeCsv } from './core/analysis.js';
import {
  compareJobs,
  flattenCompareRows,
  renderCompareMarkdown,
  DEFAULT_COMPARE_MAX,
} from './core/compare.js';
import { formatOutput, writeOutput } from './core/formatters.js';
import { JobHuntCliError } from './core/errors.js';
import { ensureOutputContract, selectAnalyzeJson } from './core/output-contract.js';
import { VIEWS, projectCompare, projectJob, projectJobs } from './core/projection.js';
import { getJobDetail, getSite, listFilters, listSites, searchJobs, exportJobs } from './core/registry.js';
import { ALL_NATURE, NATURES } from './core/natures.js';
import { initNetwork, setDebugMode, getNetworkInfo, formatNetworkError, detectProxyEnv } from './core/network.js';
import { runUpdate } from './core/update.js';
import { maybeNotifyUpdate } from './core/version-check.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const VALID_FORMATS = ['table', 'json', 'csv', 'md', 'markdown'];
const NATURE_HELP = `${[...NATURES, ALL_NATURE].join('|')} (default: social; aliases: 社招/校招/实习/全部)`;
const COMPARE_TABLE_COLUMNS = [
  'site', 'id', 'name', 'category_name', 'nature_name',
  'location_names', 'department_name', 'updated_at', 'url', 'error',
];

function addCommonOptions(command, defaultFormat = 'table') {
  return command
    .option('-f, --format <format>', `Output format: ${VALID_FORMATS.join(', ')}`, defaultFormat)
    .option('-o, --output <path>', 'Write output to a file instead of stdout');
}

function addViewOption(command) {
  return command.option(
    '--view <view>',
    `JSON output view: ${VIEWS.join('|')} (omit for legacy output)`,
  );
}

function resolveSiteDetailIdField(siteId) {
  try {
    return getSite(siteId).detailIdField || 'id';
  } catch {
    return 'id';
  }
}

function normalizeFormat(format) {
  const value = String(format || 'table').toLowerCase();
  return value === 'markdown' ? 'md' : value;
}

function ensureFormat(format) {
  const normalized = normalizeFormat(format);
  if (!VALID_FORMATS.includes(normalized)) {
    throw new JobHuntCliError('FORMAT_ERROR', `Unsupported format: ${format}`, `Use one of: ${VALID_FORMATS.join(', ')}`, 64);
  }
  return normalized;
}

function commandArgs(query, options) {
  return {
    query,
    location: options.location || '',
    category: options.category || '',
    nature: options.nature || '',
    page: options.page,
    limit: options.limit,
    pageSize: options.pageSize,
    max: options.max,
  };
}

async function output(value, options, columns) {
  const format = ensureFormat(options.format);
  const text = formatOutput(value, { format, columns });
  writeOutput(text, options.output);
}

function handleError(error, lastUrl) {
  const code = error.code || 'ERROR';
  const exitCode = error.exitCode || 1;
  const networkMsg = formatNetworkError(error, error.requestUrl || lastUrl);
  if (networkMsg) {
    process.stderr.write(`error: ${code}: ${networkMsg}\n`);
  } else {
    process.stderr.write(`error: ${code}: ${error.message}\n`);
  }
  if (error.help) process.stderr.write(`help: ${error.help}\n`);
  process.exitCode = exitCode;
}

export async function run(argv = process.argv) {
  const program = new Command();
  program
    .name('job')
    .description('JobHunt-CLI: search, export, compare, and analyze public company recruitment jobs')
    .version(version)
    .option('--debug', 'Enable debug output (proxy status, request info)');

  addCommonOptions(program.command('sites').description('List supported recruitment sites'), 'table')
    .action(async options => {
      const format = ensureFormat(options.format);
      const columns = format === 'json'
        ? []
        : ['id', 'name', 'supported_natures', 'default_nature', 'description'];
      const sites = listSites().map(site => ({
        ...site,
        supported_natures: Array.isArray(site.supported_natures)
          ? site.supported_natures.join(',')
          : site.supported_natures,
      }));
      return output(format === 'json' ? listSites() : sites, options, columns);
    });

  program.command('update')
    .description('Update jobhunt-cli and the AI agent skill to the latest version')
    .option('--cli-only', 'Only update the CLI package, skip skill update')
    .option('--skill-only', 'Only update the AI agent skill, skip CLI update')
    .action(async options => {
      await runUpdate({
        cli: !options.skillOnly,
        skill: !options.cliOnly,
      });
    });

  addViewOption(addCommonOptions(
    program.command('compare')
      .description('Fetch the same query across multiple sites for agent-side comparison')
      .argument('[keyword]', 'Search keyword shared across sites')
      .requiredOption('--sites <ids>', 'Comma-separated site ids, e.g. meituan,tencent,bytedance')
      .option('--location <location>', 'City name or source code')
      .option('--category <category>', 'Category name or source code')
      .option('--nature <nature>', `Recruitment type: ${NATURE_HELP}`)
      .option('--max <n>', `Maximum jobs per site; 0 means all matching jobs`, value => Number(value), DEFAULT_COMPARE_MAX),
    'json',
  )).action(async (keyword, options) => {
    const contract = ensureOutputContract(options);
    const result = await compareJobs({
      query: keyword || '',
      sites: options.sites,
      location: options.location || '',
      category: options.category || '',
      nature: options.nature || '',
      max: options.max,
    });
    const format = ensureFormat(options.format);
    if (format === 'json') {
      const payload = contract.view
        ? projectCompare(result, contract.view, { resolveDetailIdField: resolveSiteDetailIdField })
        : result;
      return output(payload, options, []);
    }
    if (format === 'md') {
      writeOutput(renderCompareMarkdown(result), options.output);
      return;
    }
    return output(flattenCompareRows(result), options, COMPARE_TABLE_COLUMNS);
  });

  for (const siteInfo of listSites()) {
    const site = getSite(siteInfo.id);
    const siteCommand = program.command(site.id).description(site.description);
    const supportedHelp = (site.supportedNatures || ['social']).join(', ');

    addCommonOptions(
      siteCommand
        .command('filters')
        .description(`List ${site.name} filter values`)
        .option('--nature <nature>', `Recruitment type: ${NATURE_HELP}`),
      'table',
    ).action(async options => {
      const rows = await listFilters(site.id, commandArgs('', options));
      const columns = rows.some(row => row.applies_to)
        ? ['group', 'parent', 'code', 'name', 'en_name', 'applies_to', 'sort_id']
        : ['group', 'parent', 'code', 'name', 'en_name', 'sort_id'];
      return output(rows, options, columns);
    });

    addViewOption(addCommonOptions(
      siteCommand
        .command('search')
        .description(`Search ${site.name} jobs`)
        .argument('[query]', 'Search keyword')
        .option('--location <location>', 'City name or source code')
        .option('--category <category>', 'Category name or source code')
        .option('--nature <nature>', `Recruitment type: ${NATURE_HELP}`)
        .option('--page <n>', 'Page number', value => Number(value), 1)
        .option('--limit <n>', `Number of jobs to return, max ${site.maxPageSize}`, value => Number(value), undefined),
      'table',
    )).action(async (query, options) => {
      const contract = ensureOutputContract(options);
      const jobs = await searchJobs(site.id, commandArgs(query, options));
      const value = contract.view
        ? projectJobs(jobs, contract.view, { detailIdField: site.detailIdField || 'id' })
        : jobs;
      return output(value, options, site.columns);
    });

    addViewOption(addCommonOptions(
      siteCommand
        .command('detail')
        .description(`Get one ${site.name} job detail`)
        .argument('<id>', 'Job id')
        .option('--nature <nature>', `Recruitment type (single channel only; supported: ${supportedHelp})`),
      'json',
    )).action(async (id, options) => {
      const contract = ensureOutputContract(options);
      const job = await getJobDetail(site.id, id, commandArgs('', options));
      const value = contract.view
        ? projectJob(job, contract.view, { detailIdField: site.detailIdField || 'id' })
        : job;
      return output(value, options, site.detailColumns);
    });

    addViewOption(addCommonOptions(
      siteCommand
        .command('all')
        .description(`Export all matching ${site.name} jobs`)
        .argument('[query]', 'Optional search keyword')
        .option('--location <location>', 'City name or source code')
        .option('--category <category>', 'Category name or source code')
        .option('--nature <nature>', `Recruitment type: ${NATURE_HELP}`)
        .option('--page-size <n>', `Page size, max ${site.maxPageSize}`, value => Number(value), site.maxPageSize)
        .option('--max <n>', 'Maximum jobs to return; 0 means all matching jobs', value => Number(value), 0),
      'json',
    )).action(async (query, options) => {
      const contract = ensureOutputContract(options);
      const jobs = await exportJobs(site.id, commandArgs(query, options));
      const value = contract.view
        ? projectJobs(jobs, contract.view, { detailIdField: site.detailIdField || 'id' })
        : jobs;
      return output(value, options, site.detailColumns);
    });

    addCommonOptions(
      siteCommand
        .command('analyze')
        .description(`Analyze ${site.name} jobs`)
        .argument('[keyword]', 'Search keyword to analyze, e.g. AI, 算法, 后端')
        .option('--category <category>', 'Category filter')
        .option('--location <location>', 'Location filter')
        .option('--nature <nature>', `Recruitment type: ${NATURE_HELP}`)
        .option('--max <n>', 'Maximum jobs to inspect; 0 means all matching jobs', value => Number(value), 0)
        .option('--summary-only', 'JSON only: emit summary without source jobs'),
      'md',
    ).action(async (keyword, options) => {
      const contract = ensureOutputContract(options);
      const result = await analyzeJobs(site.id, keyword || '', options);
      const format = ensureFormat(options.format);
      if (format === 'json') return output(selectAnalyzeJson(result, contract), options, []);
      if (format === 'csv') {
        writeOutput(analyzeCsv(result.rows), options.output);
        return;
      }
      if (format === 'table') return output(result.rows, options, ['id', 'name', 'category_name', 'nature_name', 'location_names', 'department_name', 'updated_at']);
      writeOutput(result.markdown, options.output);
    });
  }

  try {
    program.parseOptions(argv);
    const opts = program.opts();
    if (opts.debug) setDebugMode(true);
    await initNetwork();
    if (opts.debug) {
      const info = getNetworkInfo();
      const detected = detectProxyEnv();
      process.stderr.write(`[debug] proxy: ${info.proxyEnabled ? 'enabled' : 'disabled'}\n`);
      if (info.proxyEnabled) {
        process.stderr.write(`[debug] ${info.proxyVar}=${info.proxyUrl}\n`);
        if (info.noProxy) process.stderr.write(`[debug] NO_PROXY=${info.noProxy}\n`);
      } else if (info.proxyBypassed) {
        process.stderr.write(`[debug] proxy env bypassed (${info.proxyVar}=${info.proxyUrl})\n`);
        if (info.proxyProbeError) process.stderr.write(`[debug] proxy probe failed: ${info.proxyProbeError}\n`);
      } else if (detected && info.proxyMode === 'direct') {
        process.stderr.write(`[debug] proxy env detected (${detected.key}) but ignored by JOBHUNT_PROXY=direct\n`);
      } else if (detected && !info.proxySupported) {
        process.stderr.write(`[debug] proxy env detected (${detected.key}) but undici unavailable\n`);
      }
    }
    await maybeNotifyUpdate({ argv });
    await program.parseAsync(argv);
  } catch (error) {
    handleError(error);
  }
}
