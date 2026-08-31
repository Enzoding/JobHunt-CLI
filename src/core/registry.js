import didiAdapter from '../sites/didi/index.js';
import kuaishouAdapter from '../sites/kuaishou/index.js';
import bytedanceAdapter from '../sites/bytedance/index.js';
import meituanAdapter from '../sites/meituan/index.js';
import xiaomiAdapter from '../sites/xiaomi/index.js';
import tencentAdapter from '../sites/tencent/index.js';
import baiduAdapter from '../sites/baidu/index.js';
import jdAdapter from '../sites/jd/index.js';
import xiaohongshuAdapter from '../sites/xiaohongshu/index.js';
import bilibiliAdapter from '../sites/bilibili/index.js';
import neteaseAdapter from '../sites/netease/index.js';
import ctripAdapter from '../sites/ctrip/index.js';
import huaweiAdapter from '../sites/huawei/index.js';
import djiAdapter from '../sites/dji/index.js';
import antAdapter from '../sites/ant/index.js';
import dewuAdapter from '../sites/dewu/index.js';
import mihoyoAdapter from '../sites/mihoyo/index.js';
import minimaxAdapter from '../sites/minimax/index.js';
import moonshotAdapter from '../sites/moonshot/index.js';
import zhipuAdapter from '../sites/zhipu/index.js';
import deepseekAdapter from '../sites/deepseek/index.js';
import { ALIBABA_CPO_ADAPTERS } from '../sites/alibaba-cpo/index.js';
import { ApiError, ArgumentError } from './errors.js';
import {
  ALL_NATURE,
  buildNatureFilterRows,
  jobDedupeKey,
  mergeFilterRows,
  nextNatureQuota,
  normalizeNature,
  resolveSupportedNatures,
  siteDefaultNature,
  siteSupportedNatures,
  stampStandardNature,
} from './natures.js';

const adapters = new Map([
  [didiAdapter.id, didiAdapter],
  [didiAdapter.opencliSite, didiAdapter],
  [kuaishouAdapter.id, kuaishouAdapter],
  [kuaishouAdapter.opencliSite, kuaishouAdapter],
  [bytedanceAdapter.id, bytedanceAdapter],
  [bytedanceAdapter.opencliSite, bytedanceAdapter],
  [meituanAdapter.id, meituanAdapter],
  [meituanAdapter.opencliSite, meituanAdapter],
  [xiaomiAdapter.id, xiaomiAdapter],
  [xiaomiAdapter.opencliSite, xiaomiAdapter],
  [tencentAdapter.id, tencentAdapter],
  [tencentAdapter.opencliSite, tencentAdapter],
  [baiduAdapter.id, baiduAdapter],
  [baiduAdapter.opencliSite, baiduAdapter],
  [jdAdapter.id, jdAdapter],
  [jdAdapter.opencliSite, jdAdapter],
  [xiaohongshuAdapter.id, xiaohongshuAdapter],
  [xiaohongshuAdapter.opencliSite, xiaohongshuAdapter],
  [bilibiliAdapter.id, bilibiliAdapter],
  [bilibiliAdapter.opencliSite, bilibiliAdapter],
  [neteaseAdapter.id, neteaseAdapter],
  [neteaseAdapter.opencliSite, neteaseAdapter],
  [ctripAdapter.id, ctripAdapter],
  [ctripAdapter.opencliSite, ctripAdapter],
  [huaweiAdapter.id, huaweiAdapter],
  [huaweiAdapter.opencliSite, huaweiAdapter],
  [djiAdapter.id, djiAdapter],
  [djiAdapter.opencliSite, djiAdapter],
  [antAdapter.id, antAdapter],
  [antAdapter.opencliSite, antAdapter],
  [dewuAdapter.id, dewuAdapter],
  [dewuAdapter.opencliSite, dewuAdapter],
  [mihoyoAdapter.id, mihoyoAdapter],
  [mihoyoAdapter.opencliSite, mihoyoAdapter],
  [minimaxAdapter.id, minimaxAdapter],
  [minimaxAdapter.opencliSite, minimaxAdapter],
  [moonshotAdapter.id, moonshotAdapter],
  [moonshotAdapter.opencliSite, moonshotAdapter],
  [zhipuAdapter.id, zhipuAdapter],
  [zhipuAdapter.opencliSite, zhipuAdapter],
  [deepseekAdapter.id, deepseekAdapter],
  [deepseekAdapter.opencliSite, deepseekAdapter],
  ...ALIBABA_CPO_ADAPTERS.flatMap(adapter => [
    [adapter.id, adapter],
    [adapter.opencliSite, adapter],
  ]),
]);

function wrapNatureError(error, siteId, nature) {
  if (!error || error.natureContextAttached) return error;
  const prefix = `[${siteId}/${nature}] `;
  if (error instanceof ApiError || error instanceof ArgumentError) {
    error.message = error.message.startsWith(prefix) ? error.message : `${prefix}${error.message}`;
    error.natureContextAttached = true;
    error.siteId = siteId;
    error.nature = nature;
    return error;
  }
  const wrapped = new ApiError(
    error.code || 'NATURE_CHANNEL_ERROR',
    `${prefix}${error.message || String(error)}`,
    error.help || '',
  );
  wrapped.cause = error;
  wrapped.siteId = siteId;
  wrapped.nature = nature;
  wrapped.natureContextAttached = true;
  return wrapped;
}

function normalizeFetchedJobs(jobs, channelNature) {
  return (jobs || []).map(job => {
    if (job?.nature_code === 'social' || job?.nature_code === 'campus' || job?.nature_code === 'intern') {
      if (job?.raw?.source_nature_code !== undefined || job?.raw?.source_nature_name !== undefined) {
        return job;
      }
      return stampStandardNature(job, job.nature_code);
    }
    return stampStandardNature(job, channelNature);
  });
}

async function fetchJobsForNature(site, nature, args, mode) {
  const natureArgs = { ...args, nature };
  try {
    if (mode === 'search') {
      return normalizeFetchedJobs(await site.search(natureArgs), nature);
    }
    return normalizeFetchedJobs(await site.all(natureArgs), nature);
  } catch (error) {
    throw wrapNatureError(error, site.id, nature);
  }
}

/**
 * Sequentially aggregate jobs across natures with a global limit/max.
 * Does not concurrently request channels.
 */
export async function aggregateJobs(site, natures, args = {}, mode = 'search') {
  const globalLimit = mode === 'search'
    ? (args.limit === undefined || args.limit === null || args.limit === '' ? null : Math.max(0, Number(args.limit)))
    : (args.max === undefined || args.max === null || args.max === '' ? 0 : Math.max(0, Number(args.max)));

  const unlimited = mode === 'search' ? globalLimit === null : globalLimit === 0;
  let remaining = unlimited ? Infinity : globalLimit;
  const rows = [];
  const seen = new Set();

  for (let index = 0; index < natures.length; index += 1) {
    if (!unlimited && remaining <= 0) break;

    const nature = natures[index];
    const naturesLeft = natures.length - index;
    const quota = unlimited ? null : nextNatureQuota(remaining, naturesLeft);

    const natureArgs = { ...args, nature };
    if (mode === 'search') {
      if (quota !== null) natureArgs.limit = quota;
    } else if (quota !== null) {
      natureArgs.max = quota;
    } else {
      natureArgs.max = 0;
    }

    const batch = await fetchJobsForNature(site, nature, natureArgs, mode);
    for (const job of batch) {
      const key = jobDedupeKey(job);
      if (!job.id || seen.has(key)) continue;
      seen.add(key);
      rows.push(job);
      if (!unlimited) {
        remaining -= 1;
        if (remaining <= 0) break;
      }
    }
  }

  return rows;
}

export async function aggregateFilters(site, natures) {
  const rowsByNature = [];
  for (const nature of natures) {
    try {
      const rows = await site.filters({ nature });
      rowsByNature.push([nature, rows]);
    } catch (error) {
      throw wrapNatureError(error, site.id, nature);
    }
  }

  const merged = mergeFilterRows(rowsByNature);
  return [...buildNatureFilterRows(siteSupportedNatures(site)), ...merged];
}

export function listSites() {
  return [...new Set([...adapters.values()])].map(site => ({
    id: site.id,
    name: site.name,
    command: site.id,
    description: site.description,
    max_page_size: site.maxPageSize,
    detail_id_field: site.detailIdField || 'id',
    detail_id_hint: site.detailIdHint || '',
    supported_natures: siteSupportedNatures(site),
    default_nature: siteDefaultNature(site),
  }));
}

export function getSite(siteId) {
  const site = adapters.get(String(siteId || '').trim());
  if (!site) {
    throw new ArgumentError(`Unknown site: ${siteId}`, `Run \`job sites\` to list supported recruitment sites.`);
  }
  return site;
}

export async function searchJobs(siteId, args = {}) {
  const site = getSite(siteId);
  const requested = normalizeNature(args.nature);
  const natures = resolveSupportedNatures(site, requested, { allowAll: true });
  if (natures.length === 1 && requested !== ALL_NATURE) {
    return fetchJobsForNature(site, natures[0], args, 'search');
  }
  return aggregateJobs(site, natures, args, 'search');
}

export async function getJobDetail(siteId, id, args = {}) {
  const site = getSite(siteId);
  const requested = normalizeNature(args.nature);
  if (requested === ALL_NATURE) {
    resolveSupportedNatures(site, ALL_NATURE, { allowAll: false });
  }
  const [nature] = resolveSupportedNatures(site, requested, { allowAll: false });
  try {
    const job = await site.detail(id, { ...args, nature });
    return normalizeFetchedJobs([job], nature)[0];
  } catch (error) {
    throw wrapNatureError(error, site.id, nature);
  }
}

export async function exportJobs(siteId, args = {}) {
  const site = getSite(siteId);
  const requested = normalizeNature(args.nature);
  const natures = resolveSupportedNatures(site, requested, { allowAll: true });
  if (natures.length === 1 && requested !== ALL_NATURE) {
    return fetchJobsForNature(site, natures[0], args, 'all');
  }
  return aggregateJobs(site, natures, args, 'all');
}

export async function listFilters(siteId, args = {}) {
  const site = getSite(siteId);
  const requested = normalizeNature(args.nature);
  const natures = resolveSupportedNatures(site, requested, { allowAll: true });
  if (natures.length === 1 && requested !== ALL_NATURE) {
    try {
      const rows = await site.filters({ ...args, nature: natures[0] });
      const withoutVendorNature = (rows || []).filter(row => row?.group !== 'nature');
      return [...buildNatureFilterRows(natures), ...withoutVendorNature];
    } catch (error) {
      throw wrapNatureError(error, site.id, natures[0]);
    }
  }
  return aggregateFilters(site, natures);
}
