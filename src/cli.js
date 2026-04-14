import { Command } from 'commander';
import { analyzeJobs, analyzeCsv } from './core/analysis.js';
import { formatOutput, writeOutput } from './core/formatters.js';
import { JobHuntCliError } from './core/errors.js';
import { getJobDetail, getSite, listFilters, listSites, searchJobs, exportJobs } from './core/registry.js';

const VALID_FORMATS = ['table', 'json', 'csv', 'md', 'markdown'];

function addCommonOptions(command, defaultFormat = 'table') {
  return command
    .option('-f, --format <format>', `Output format: ${VALID_FORMATS.join(', ')}`, defaultFormat)
    .option('-o, --output <path>', 'Write output to a file instead of stdout');
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

function handleError(error) {
  const code = error.code || 'ERROR';
  const exitCode = error.exitCode || 1;
  process.stderr.write(`error: ${code}: ${error.message}\n`);
  if (error.help) process.stderr.write(`help: ${error.help}\n`);
  process.exitCode = exitCode;
}

export async function run(argv = process.argv) {
  const program = new Command();
  program
    .name('jobs')
    .description('JobHunt-CLI: search, export, and analyze public company recruitment jobs')
    .version('0.1.0');

  addCommonOptions(program.command('sites').description('List supported recruitment sites'), 'table')
    .action(async options => {
      const format = ensureFormat(options.format);
      const columns = format === 'json' ? [] : ['id', 'name', 'description'];
      return output(listSites(), options, columns);
    });

  for (const siteInfo of listSites()) {
    const site = getSite(siteInfo.id);
    const siteCommand = program.command(site.id).description(site.description);

    addCommonOptions(
      siteCommand.command('filters').description(`List ${site.name} filter values`),
      'table',
    ).action(async options => output(await listFilters(site.id), options, ['group', 'parent', 'code', 'name', 'en_name', 'sort_id']));

    addCommonOptions(
      siteCommand
        .command('search')
        .description(`Search ${site.name} jobs`)
        .argument('[query]', 'Search keyword')
        .option('--location <location>', 'City name or source code')
        .option('--category <category>', 'Category name or source code')
        .option('--nature <nature>', 'Recruitment type')
        .option('--page <n>', 'Page number', value => Number(value), 1)
        .option('--limit <n>', `Number of jobs to return, max ${site.maxPageSize}`, value => Number(value), undefined),
      'table',
    ).action(async (query, options) => output(await searchJobs(site.id, commandArgs(query, options)), options, site.columns));

    addCommonOptions(
      siteCommand
        .command('detail')
        .description(`Get one ${site.name} job detail`)
        .argument('<id>', 'Job id'),
      'json',
    ).action(async (id, options) => output(await getJobDetail(site.id, id), options, site.detailColumns));

    addCommonOptions(
      siteCommand
        .command('all')
        .description(`Export all matching ${site.name} jobs`)
        .argument('[query]', 'Optional search keyword')
        .option('--location <location>', 'City name or source code')
        .option('--category <category>', 'Category name or source code')
        .option('--nature <nature>', 'Recruitment type')
        .option('--page-size <n>', `Page size, max ${site.maxPageSize}`, value => Number(value), site.maxPageSize)
        .option('--max <n>', 'Maximum jobs to return; 0 means all matching jobs', value => Number(value), 0),
      'json',
    ).action(async (query, options) => output(await exportJobs(site.id, commandArgs(query, options)), options, site.detailColumns));

    addCommonOptions(
      siteCommand
        .command('analyze')
        .description(`Analyze ${site.name} jobs`)
        .argument('[keyword]', 'Search keyword to analyze, e.g. AI, 算法, 后端')
        .option('--category <category>', 'Category filter')
        .option('--location <location>', 'Location filter')
        .option('--nature <nature>', 'Recruitment type filter')
        .option('--max <n>', 'Maximum jobs to inspect; 0 means all matching jobs', value => Number(value), 0),
      'md',
    ).action(async (keyword, options) => {
      const result = await analyzeJobs(site.id, keyword || '', options);
      const format = ensureFormat(options.format);
      if (format === 'json') return output({ summary: result.summary, jobs: result.rows }, options, []);
      if (format === 'csv') {
        writeOutput(analyzeCsv(result.rows), options.output);
        return;
      }
      if (format === 'table') return output(result.rows, options, ['id', 'name', 'category_name', 'location_names', 'department_name', 'updated_at']);
      writeOutput(result.markdown, options.output);
    });
  }

  try {
    await program.parseAsync(argv);
  } catch (error) {
    handleError(error);
  }
}
