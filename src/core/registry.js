import didiAdapter from '../sites/didi/index.js';
import kuaishouAdapter from '../sites/kuaishou/index.js';
import bytedanceAdapter from '../sites/bytedance/index.js';
import meituanAdapter from '../sites/meituan/index.js';
import xiaomiAdapter from '../sites/xiaomi/index.js';
import { ArgumentError } from './errors.js';

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
]);

export function listSites() {
  return [...new Set([...adapters.values()])].map(site => ({
    id: site.id,
    name: site.name,
    command: site.id,
    description: site.description,
    max_page_size: site.maxPageSize,
    detail_id_field: site.detailIdField || 'id',
    detail_id_hint: site.detailIdHint || '',
  }));
}

export function getSite(siteId) {
  const site = adapters.get(String(siteId || '').trim());
  if (!site) {
    throw new ArgumentError(`Unknown site: ${siteId}`, `Run \`jobs sites\` to list supported recruitment sites.`);
  }
  return site;
}

export async function searchJobs(siteId, args) {
  return getSite(siteId).search(args);
}

export async function getJobDetail(siteId, id) {
  return getSite(siteId).detail(id);
}

export async function exportJobs(siteId, args) {
  return getSite(siteId).all(args);
}

export async function listFilters(siteId) {
  return getSite(siteId).filters();
}
