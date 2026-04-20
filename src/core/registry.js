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
