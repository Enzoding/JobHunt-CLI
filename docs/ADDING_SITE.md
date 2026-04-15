# 新增招聘站点 — 方法论与最佳实践

本文记录了为本项目新增招聘站点 adapter 的完整方法论，基于滴滴、快手、字节跳动、美团四个站点的实战经验总结。

---

## 一、整体流程

```
1. API 调研（chrome-devtools 抓包）
2. 接口分析（认证、分页、字段结构）
3. 编写 utils.js（底层请求与字段归一化）
4. 编写 index.js（adapter 导出）
5. 注册到 registry.js
6. 编写 smoke 脚本验证
7. 更新 README 和 package.json
```

---

## 二、API 调研（抓包方法）

**使用 chrome-devtools MCP，不用 agent-browser。**

### 步骤

1. 用 `navigate_page` 打开招聘官网社招页面。
2. 等待页面加载完成（`wait_for` 等待职位列表出现）。
3. 用 `list_network_requests` 过滤 `fetch/xhr`，找出核心接口：
   - 职位列表接口（关键词：`list`、`search`、`getJob`）
   - 职位详情接口（关键词：`detail`、`getDetail`）
   - 筛选项接口（关键词：`filter`、`enum`、`city`、`category`）
4. 用 `get_network_request` 查看每个接口的完整 Request/Response。
5. 点击一个职位后再次 `list_network_requests`，确认详情接口。

### 重点记录

对每个接口要记录清楚：

| 项目 | 说明 |
|------|------|
| Method | GET 还是 POST |
| URL | 完整路径和 query 参数 |
| Request Body | POST 时的 JSON 结构，字段含义 |
| 认证方式 | 无认证 / Cookie / 签名 / CSRF Token |
| 分页方式 | pageNo+pageSize / offset+limit / cursor |
| 总数字段 | total / totalCount / count |
| 总页数字段 | totalPage / pages / 需自己计算 |
| 列表字段 | list / items / job_post_list 等 |
| ID 字段 | 用于 detail 的稳定唯一标识 |

---

## 三、四个已有站点的 API 特征对比

| 站点 | Method | 认证 | 分页 | ID字段 | 详情独立接口 |
|------|--------|------|------|--------|------------|
| 滴滴 | GET | 无（空 token header） | page+size，返回 total | `jdId` (数字) | 有，`/front/view/:id` |
| 快手 | GET | HMAC-SHA256 签名（时间戳+参数+密钥） | pageNum+pageSize，返回 pages/hasNextPage | `id` (数字) | 有，`/open/position` |
| 字节跳动 | POST JSON | 无 | offset+limit，仅返回 count | `id` 或 `code` (字母+数字) | 无，搜索关键词即可找回 |
| 美团 | POST JSON | 无 | pageNo+pageSize，返回 totalPage+totalCount | `jobUnionId` (数字) | 有，`/job/getJobDetail` |

---

## 四、utils.js 必须包含的内容

### 4.1 常量

```js
export const SITE = '<site>-jobs';        // opencliSite 注册用
export const DOMAIN = '...';
export const BASE_URL = `https://${DOMAIN}`;
export const SOCIAL_URL = '...';          // 用作 Referer

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const COLUMNS = [...];             // search/all 表格列
export const DETAIL_COLUMNS = [...];      // detail 表格列
```

### 4.2 CATEGORY_MAP / CATEGORY_ALIASES

- `CATEGORY_MAP`：code → 中文名，用于 normalizeJob 中展示
- `CATEGORY_ALIASES`：中英文别名 → code，用于 resolveCategory 接受用户输入

别名必须覆盖：中文全称、简称、英文全称、英文简称。key 统一 lowercase。

```js
const CATEGORY_ALIASES = {
  技术类: 'CODE',
  技术: 'CODE',
  tech: 'CODE',
  engineering: 'CODE',
  // ...
};
```

### 4.3 CITY_MAP / CITY_ALIASES（或 LOCATION_MAP）

同上，code → 城市名 + 别名 → code。覆盖主要城市中英文写法。

### 4.4 resolveCategory / resolveCity / resolveNature

统一的 resolve 模式：

```js
function normalizeAliasKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}
function normalizeCompactKey(value) {
  return normalizeAliasKey(value).replace(/[\s_-]+/g, '');
}

export function resolveCategory(input) {
  if (!input) return '';
  const value = String(input).trim();
  if (CATEGORY_MAP[value]) return value;                        // 已是 code
  return CATEGORY_ALIASES[normalizeAliasKey(value)]
    || CATEGORY_ALIASES[normalizeCompactKey(value)]
    || value;
}
```

### 4.5 readJsonResponse

每个站点错误响应结构不同，需单独处理：

```js
// 滴滴：payload.meta.code !== 0
// 快手：payload.code !== 0
// 字节跳动：payload.code !== 0
// 美团：payload.status !== 1
```

统一抛出 `CliError`（即 `ApiError`），code 用 `SITENAME_HTTP` / `SITENAME_API` / `SITENAME_BAD_RESPONSE`。

### 4.6 normalizeJob

将原始字段映射到标准字段。关键点：

- `id`：用于 detail 命令的 ID，必须与 `detailIdField` 一致
- `updated_at`：统一为 `YYYY-MM-DD` 格式（`new Date(timestamp).toISOString().slice(0, 10)`）
- `description`：岗位职责，`.trim()`
- `requirement`：任职要求，`.trim()`
- `raw`：用 `Object.defineProperty` 定义，只保留调试用的原始字段，**enumerable: true**（否则 JSON 输出不可见）

```js
Object.defineProperty(output, 'raw', {
  enumerable: true,
  value: { /* 精简的原始字段 */ },
});
```

### 4.7 fetchJobs / fetchJobDetail / fetchFilters

**fetchJobs** 统一返回：

```js
return {
  total,       // 总数
  pageNo,      // 当前页
  pageSize,    // 当前页大小
  totalPage,   // 总页数（没有则根据 total/pageSize 计算）
  list,        // 原始 job 数组
};
```

**fetchFilters** 统一返回 rows 数组，每条：

```js
{ group: 'category'|'city'|'location'|'nature', parent, code, name, en_name, sort_id }
```

### 4.8 coerceLimit / coercePage / assertNonEmpty

直接复制现有站点的实现，保持一致。

---

## 五、index.js 结构

```js
export const xyzAdapter = {
  id: 'xyz',
  opencliSite: SITE,
  name: 'XYZ',
  description: 'XYZ social recruitment',
  columns: COLUMNS,
  detailColumns: DETAIL_COLUMNS,
  maxPageSize: MAX_PAGE_SIZE,
  detailIdField: 'id',                  // 告诉 agent 用哪个字段做 detail
  detailIdHint: '...',                  // 格式说明，如 "Numeric id, e.g. 12345"
  async filters() { ... },
  async search(args = {}) { ... },
  async detail(id) { ... },
  async all(args = {}) { ... },
};
export default xyzAdapter;
```

### all() 的标准循环模式

```js
async all(args = {}) {
  const pageSize = coerceLimit(args.pageSize ?? args['page-size'], MAX_PAGE_SIZE);
  const max = Math.max(0, Number(args.max || 0));
  const rows = [];
  const seen = new Set();
  let pageNo = 1;
  let totalPage = Infinity;

  while (pageNo <= totalPage && (!max || rows.length < max)) {
    const result = await fetchJobs(args, pageNo, pageSize);
    totalPage = result.totalPage || pageNo;
    if (!result.list.length) break;

    for (const job of result.list) {
      const jobId = job.<id字段>;
      if (!jobId || seen.has(jobId)) continue;
      seen.add(jobId);
      rows.push(normalizeJob(job));
      if (max && rows.length >= max) break;
    }

    if (result.list.length < pageSize || pageNo >= totalPage) break;
    pageNo += 1;
  }

  assertNonEmpty(rows, '<site> all', '...');
  return rows;
},
```

---

## 六、注册到 registry.js

```js
import xyzAdapter from '../sites/xyz/index.js';

const adapters = new Map([
  // ...已有站点...
  [xyzAdapter.id, xyzAdapter],
  [xyzAdapter.opencliSite, xyzAdapter],
]);
```

两条都要注册：`id`（短命令，如 `xyz`）和 `opencliSite`（长名，如 `xyz-jobs`）。

---

## 七、smoke 脚本

新建 `scripts/smoke-<site>-api.js`，覆盖四个核心场景：

```js
import { fetchFilters, fetchJobDetail, fetchJobs, normalizeJob } from '../src/sites/<site>/utils.js';

// 1. search
const search = await fetchJobs({ query: '<中文关键词>' }, 1, 5);
if (!search.list.length) throw new Error('Expected search results');
const first = normalizeJob(search.list[0]);
if (!first.id || !first.name || !first.url) throw new Error('Missing id/name/url');

// 2. detail
const detail = normalizeJob(await fetchJobDetail(String(first.id)));
if (!detail.name || !detail.url) throw new Error('Detail missing name or url');

// 3. filters
const filters = await fetchFilters();
if (!filters.some(r => r.group === 'category')) throw new Error('Missing category filters');

// 4. pagination
const all = await fetchJobs({}, 1, MAX_PAGE_SIZE);
if (!all.list.length) throw new Error('Expected jobs page');

console.log(JSON.stringify({ ok: true, search_total: search.total, ... }, null, 2));
```

同时在 `package.json` 中添加：

```json
"smoke:<site>": "node scripts/smoke-<site>-api.js",
"smoke": "... && npm run smoke:<site>"
```

---

## 八、常见兼容问题与处理方式

### 8.1 请求签名（快手）

快手需要 HMAC-SHA256 签名，参数排序后与时间戳和密钥拼接：

```js
import crypto from 'node:crypto';

function canonicalQuery(params) {
  // 参数 key 排序，值 URL 编码，join '&'
}

function signHeaders(params) {
  const signTimestamp = String(Date.now());
  const signInput = `${signTimestamp}${canonicalQuery(params)}${SIGN_SECRET}`;
  const sign = crypto.createHmac('sha256', SIGN_SECRET).update(signInput).digest('hex');
  return { sign, signTimestamp };
}
```

其他站点均无签名，直接 fetch 即可。

### 8.2 详情接口缺失（字节跳动）

字节跳动没有独立的详情接口，`fetchJobById` 通过搜索关键词匹配 `id` 或 `code` 字段找回目标职位。列表本身已包含完整的 `description` 和 `requirement`，无需二次请求。

### 8.3 分页字段差异

| 站点 | 总数字段 | 判断结束方式 |
|------|---------|------------|
| 滴滴 | `total` | `list.length < pageSize` |
| 快手 | `total` | `result.pageNum >= result.pages` 或 `list.length < pageSize` |
| 字节跳动 | `count` | `list.length < pageSize` |
| 美团 | `page.totalCount` | `pageNo >= totalPage` 或 `list.length < pageSize` |

双重判断最稳定：**满足任一条件即停止**。

### 8.4 城市/类别字段为对象数组

美团的 `cityList` 和 `department` 是对象数组：

```js
// 原始
"cityList": [{ "code": "001001", "name": "北京市" }]

// 提取
const cities = Array.isArray(job.cityList)
  ? job.cityList.map(c => c.name).filter(Boolean)
  : [];
```

快手的 `workLocationsCode` 是 code 数组，需要通过 LOCATION_MAP 转成名称。

### 8.5 POST vs GET

GET 站点（滴滴、快手）：参数拼到 URL querystring。  
POST JSON 站点（字节跳动、美团）：参数放 body，`Content-Type: application/json`。

美团的 GET 类接口（如 enum）和 POST 接口混用，注意分别处理。

### 8.6 filters 接口合并

美团的 filters 由两个接口合并：

```js
const [jfData, cityData] = await Promise.all([
  fetch('/api/official/job/search/enum?enumType=JF'),  // GET
  meituanPost('/city/search', { hotCity: true }),       // POST
]);
```

用 `Promise.all` 并发请求，合并 category、city、nature 三组。

---

## 九、质量验收清单

新站点上线前，必须跑通以下命令并确认输出合理：

```bash
# 1. 筛选项
node bin/job.js <site> filters --format json

# 2. 搜索（含中文关键词 + category 筛选）
node bin/job.js <site> search AI --limit 5
node bin/job.js <site> search AI --category <某类别> --limit 5

# 3. 详情（从 search 结果取 id）
node bin/job.js <site> detail <id> --format json

# 4. 批量（验证分页）
node bin/job.js <site> all --max 20

# 5. smoke 脚本
node scripts/smoke-<site>-api.js
```

验收重点：

- `search` 和 `all` 返回的 `description` / `requirement` 非空（agent-ready）
- `detail` 的 `id` 与 `search` 结果一致，URL 可访问
- `filters` 包含 `category`、`city`/`location`、`nature` 三组
- 空结果时有明确 error 提示，hint 包含排查建议
- `--max 0` 或不传 max 时不会无限循环（双重结束条件）
