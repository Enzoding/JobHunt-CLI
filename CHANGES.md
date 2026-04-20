# JobHunt-CLI 变更记录

> 按时间倒序排列。任何代码、配置、文档、工作流或结构的修改均需在此记录。

---

## 2026-04-19

### 新增 6 个社会招聘站点 adapter

**修改文件**：`src/core/registry.js`、`src/sites/shared.js`、`src/sites/ant/`、`src/sites/dewu/`、`src/sites/feishu-saas/`、`src/sites/mihoyo/`、`src/sites/minimax/`、`src/sites/moonshot/`、`src/sites/zhipu/`、`scripts/smoke-*-api.js`、`package.json`

**修改内容**：
1. 新增蚂蚁集团、得物、米哈游、MiniMax、月之暗面、智谱 6 个社会招聘 adapter，并注册为 CLI 站点：`ant`、`dewu`、`mihoyo`、`minimax`、`moonshot`、`zhipu`。
2. 新增 `src/sites/shared.js`，复用字段文本化、HTML 清洗、别名匹配、分页参数规整等通用逻辑。
3. 新增 `src/sites/feishu-saas/utils.js`，封装飞书招聘 SaaS 站点的公开签名加载、`web_id` 初始化、筛选项、搜索、详情回查和分页导出逻辑，供得物、MiniMax、智谱复用。
4. 新增 Moka（月之暗面）会话初始化、加密响应解密和客户端筛选逻辑，支持从公开招聘页拉取并标准化职位数据。
5. 新增 6 个 smoke 脚本，并把它们接入 `npm run smoke`。

**原因**：
继续扩展 JobHunt-CLI 的公开招聘数据源覆盖范围，支持更多互联网、AI 和消费平台公司的社会招聘数据查询，满足后续脚本化导出和 AI agent 分析需求。

**影响范围**：
- `job sites` 新增 6 个站点，总站点数从 14 个增加到 20 个。
- 新站点支持 `filters`、`search`、`detail`、`all` 和 `analyze` 等现有 CLI 子命令。
- 飞书招聘 SaaS 站点依赖其公开前端 bundle 中的 `_signature` 逻辑；若飞书前端模块 ID 或签名算法变更，`dewu`、`minimax`、`zhipu` 可能需要同步调整共享签名加载逻辑。
- Moka 站点依赖公开页面中的 `init-data.aesIv` 和 API 返回的 `necromancer` 字段解密；若 Moonshot 招聘页迁移或加密字段变化，需要更新 `src/sites/moonshot/utils.js`。

---

## 2026-04-16

### P1: 优化代理自动检测和网络错误诊断

**修改文件**：`src/core/network.js`、`src/cli.js`、`README.md`

**修改内容**：
1. 新增 `JOBHUNT_PROXY` 代理策略环境变量：
   - `auto`（默认）：检测到代理变量后先探测代理端口，代理可达才启用代理，不可达则自动直连；代理请求失败时再直连重试一次。
   - `always`：强制使用代理，适合服务器必须通过代理访问外网的场景。
   - `direct`：忽略代理变量，强制直连。
2. 在网络层包装 `globalThis.fetch`，为 fetch 失败错误补充 `requestUrl`，避免连接失败时只显示 `(unknown)`。
3. CLI debug 输出增加代理绕过和探测失败信息。
4. README 新增网络代理使用和排查说明。

**原因**：
本地环境可能残留 `https_proxy=http://127.0.0.1:<port>`，当代理软件未启动或端口变化时，CLI 会因代理不可达而失败；但服务器环境又可能必须走代理。需要兼顾两类场景：默认自动规避坏代理，同时允许服务器显式强制代理。

**影响范围**：
所有站点的 CLI 网络请求。默认行为更稳健：可用代理仍会使用，不可用代理会自动直连；必须走代理的环境可通过 `JOBHUNT_PROXY=always` 保持强制代理语义。

---

### P0: 修复 `index.js` 导出符号错误

**修改文件**：`index.js`

**修改内容**：
将 `export { analyzeAiProduct }` 修正为 `export { analyzeJobs, analyzeCsv }`，与 `src/core/analysis.js` 的实际导出保持一致。

**原因**：
`index.js` 导出了 `analysis.js` 中不存在的符号 `analyzeAiProduct`，任何 `import { analyzeAiProduct } from 'jobhunt-cli'` 都会直接抛错。这是关键的功能缺陷，必须立即修复。

**影响范围**：
库入口的公开 API。修复后下游可正确引用 `analyzeJobs` 和 `analyzeCsv`。

---

### P1: 快手签名密钥支持环境变量覆盖

**修改文件**：`src/sites/kuaishou/utils.js`

**修改内容**：
```diff
- export const SIGN_SECRET = '652f962a-0575-4575-98d2-f04e2291bee2';
+ export const SIGN_SECRET = process.env.KUAISHOU_SIGN_SECRET || '652f962a-0575-4575-98d2-f04e2291bee2';
```

**原因**：
硬编码签名密钥一旦泄漏或被目标方撤销，所有用户的 CLI 会同步失效。通过环境变量 `KUAISHOU_SIGN_SECRET` 覆盖，可以让用户在密钥变动时无需等待代码更新即可恢复功能。

**影响范围**：
快手站点的 API 签名逻辑。未设置环境变量时行为完全不变，保持向后兼容。

---

### P1: 华为 `HW_ID` 支持环境变量覆盖

**修改文件**：`src/sites/huawei/utils.js`

**修改内容**：
```diff
- export const HW_ID = 'app_000000035886';
+ export const HW_ID = process.env.HUAWEI_HW_ID || 'app_000000035886';
```

**原因**：
华为请求头中的 `X-HW-ID` 为硬编码应用 ID。若该 ID 被目标方限制或轮换，会导致所有用户请求失败。通过环境变量 `HUAWEI_HW_ID` 覆盖，可降低单点失效风险。

**影响范围**：
华为站点的所有网络请求（请求头 `X-HW-ID` 和 URL 查询参数）。未设置环境变量时行为完全不变，保持向后兼容。

---

### 更新整改计划：纳入 dev 分支新增的 5 个站点

**修改文件**：`plan/20260416-remediation-plan.md`

**修改内容**：
1. 在计划顶部补充说明：当前基于 `dev` 分支最新 commit `87c2ff4`，已新增 bilibili、ctrip、dji、huawei、netease 5 个站点，**总计 14 个站点**。
2. 将所有涉及"9 个站点"的描述更新为"14 个站点"（包括 `core/utils.js` 迁移、`core/paginate.js` 迁移、hint 统一等）。
3. **新增 P1 修复项 2.3**：华为 `HW_ID` 硬编码问题，支持通过 `HUAWEI_HW_ID` 环境变量覆盖。
4. 更新验收清单：`npm run smoke` 需覆盖 14 个站点。
5. 调整实施顺序：Week 1 同时处理快手密钥和华为 HW_ID 的环境变量化。

**原因**：
用户切换至 `dev` 分支后发现最新 commit 未合并到 `main`。评审和整改计划必须与当前工作分支保持一致，避免遗漏新增站点的共性问题。

**影响范围**：
- 整改实施范围从 9 个站点扩大到 14 个站点。
- `src/sites/huawei/utils.js` 未来需要支持环境变量覆盖 `HW_ID`。

---

### 新增约定：所有修改必须同步记录到 CHANGES.md

**修改文件**：`AGENTS.md`

**修改内容**：
在"代码风格与开发约定"章节末尾新增一条约定：
> **变更记录**：**任何代码、配置、文档、工作流或结构的修改，都必须在 `CHANGES.md` 中以文字形式记录修改内容、原因和影响范围。** 保持 `CHANGES.md` 与代码变更同步更新。

**原因**：
项目已进入多轮迭代阶段（包含 14 个站点 adapter、CLI、分析模块、文档和 skill）。为避免历史修改不可追溯、后续 Agent 或开发者重复踩坑，需要建立统一的变更日志机制。

**影响范围**：
- 所有未来由 AI Agent 或人类开发者提交的代码/文档修改。
- 同时创建了本 `CHANGES.md` 文件，作为变更记录的正式入口。
