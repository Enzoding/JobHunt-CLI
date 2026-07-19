# JobHunt-CLI 变更记录

> 按时间倒序排列。任何代码、配置、文档、工作流或结构的修改均需在此记录。

---

## 2026-07-19

### Phase 3：Alibaba CPO 15 站 + Feishu SaaS 3 站招聘类型接入

**修改文件**：`src/sites/alibaba-cpo/*`、`src/sites/feishu-saas/utils.js`、`src/sites/{dewu,minimax,zhipu}/utils.js`、`scripts/smoke-alibaba-cpo-api.js`、`docs/RECRUITMENT_NATURES.md`、`CHANGES.md`

**修改内容**：
1. **Alibaba CPO**：共享工厂按 `nature` 切换会话页、`channel` 与 `categoryType`（社招 `group_official_site`；校招/实习 `campus_group_official_site` + `freshman`/`internship`），标准化 `nature_code`，15 站声明三类支持。
2. DevTools（淘天/阿里云）确认校招请求使用通用 `campus_group_official_site`；逐站 live 验证 API 可用，季节性空岗返回空列表。
3. **Feishu SaaS**（zhipu/minimax/dewu）：无公开 `/campus` 门户；社招门户内以 `recruitment_id_list` `101`/`301` 区分社招全职与实习；`campus` 明确 unsupported。
4. 默认社招搜索改为只返回全职（`101`），不再混入实习岗位。
5. 更新能力矩阵与 `smoke:alibaba-cpo`（覆盖 campus/intern 空岗可接受）。

**原因**：
按 Phase 3 完成共享实现族改造，并逐站验证后再声明能力，避免错误套用 channel。

**影响范围**：
- `job <cpo-site> ... --nature campus|intern|all` 可用。
- `job zhipu|minimax|dewu ... --nature intern` 可用；`--nature campus` 报 `UNSUPPORTED_NATURE`。
- 上述 Feishu 站点默认社招结果不再包含实习岗位。

---

### Phase 3 调研：Alibaba CPO 校招/实习渠道取证（未改运行时）

**修改文件**：`docs/RECRUITMENT_NATURES.md`、`CHANGES.md`

**修改内容**：
1. 通过 Chrome DevTools 抓包淘天集团校园页，确认校招使用 `campus_group_official_site` + `categoryType=freshman`，实习使用 `categoryType=internship`。
2. 确认批次接口 `searchCondition/listBatch`；当前淘天 `internship` 批次为空（季节性空岗）。
3. 记录社招仍应使用配置中的 `group_official_site`，不能误用 HTML `cdc_*` 窄渠道。

**原因**：
共享工厂改造前先固定真实请求契约，避免 15 站错误套用 channel。

**影响范围**：
- 已被上方 Phase 3 实现条目覆盖；保留作取证过程记录。

---

### Phase 2：试点站点 Xiaomi / Meituan / Kuaishou 三类招聘

**修改文件**：`src/sites/xiaomi/*`、`src/sites/meituan/*`、`src/sites/kuaishou/*`、`docs/RECRUITMENT_NATURES.md`、`CHANGES.md`

**修改内容**：
1. **Xiaomi**：以 Chrome DevTools 抓包确认渠道差异为请求头 `website-path`（`index`/`campus`/`internship`），实现社招/校招/实习的 filters、search、detail、all；标准 `nature_code` 输出，原始类型写入 `raw.source_nature_*`。
2. **Meituan**：确认 `jobType` `3/1/2` 分别对应社招/校招/实习，按类型切换 Referer 与请求体，详情沿用 `jobShareType=1`。
3. **Kuaishou**：社招/日常实习沿用签名 API（`C001`/`C002`）；校招接入独立域名 `campus.kuaishou.cn` 的 `positions/simple` 与 `positions/find`。
4. 三站 `supportedNatures` 均声明 `['social','campus','intern']`，并更新能力矩阵证据摘要。

**原因**：
按执行计划先打通试点站点，验证公共契约与真实官网渠道映射，再铺开其余 33 站。

**影响范围**：
- `job xiaomi|meituan|kuaishou ... --nature campus|intern|all` 现已可用。
- 其余站点仍仅声明 `social`；显式请求未接入类型仍会报 `UNSUPPORTED_NATURE`。

---

### Phase 0/1：招聘类型公共契约与离线测试

**修改文件**：`src/core/natures.js`、`src/core/registry.js`、`src/core/errors.js`、`src/core/analysis.js`、`src/cli.js`、`index.js`、`src/sites/*/index.js`、`src/sites/alibaba-cpo/*`、`src/sites/feishu-saas/utils.js`、`test/*.test.js`、`docs/RECRUITMENT_NATURES.md`、`package.json`、`CHANGES.md`

**修改内容**：
1. 新增 `src/core/natures.js`，统一 `social/campus/intern/all` 标准值、中英文别名、能力校验、标准筛选项和 `nature+id` 去重键。
2. 扩展 registry：`listSites` 暴露 `supported_natures/default_nature`；`filters/search/all` 支持单类型与顺序聚合；`detail` 拒绝 `--nature all`；任一已支持渠道失败则整体失败。
3. CLI 为 `filters`/`detail` 增加 `--nature`，`sites` 表格展示能力字段；analyze 报告增加招聘类型条件与分布。
4. 36 个 adapter 基线声明 `supportedNatures: ['social']`，并统一 `filters(args)` / `detail(id, args)` 签名。
5. 新增 Node 内置离线契约测试（`npm test`）与能力矩阵文档模板 `docs/RECRUITMENT_NATURES.md`。

**原因**：
先落地可离线验证的公共契约，再按站点调研校招/实习渠道，避免各 adapter 各自实现不一致的 `--nature` 语义。

**影响范围**：
- 省略 `--nature` 仍默认社招，现有脚本兼容。
- 显式请求尚未接入的 `campus/intern` 会在发请求前报 `UNSUPPORTED_NATURE`。
- `nature_code` 输出将逐步标准化为 `social|campus|intern`；原始编码进入 `raw.source_nature_*`。
- 当前各站点仍仅声明支持 `social`；校招/实习能力待后续批次 DevTools 取证后接入。

---

## 2026-07-18

### 新增招聘类型扩展执行与验收 Spec

**修改文件**：`docs/RECRUITMENT_NATURE_EXECUTION_SPEC.md`、`CHANGES.md`

**修改内容**：
1. 新增覆盖 36 个现有站点的社招、校招和实习能力改造 spec，明确 `--nature` 公共契约、能力声明、标准字段、聚合和错误语义。
2. 定义分阶段执行计划、36 站点调研矩阵、离线契约测试、低流量 live smoke、发布前矩阵验收和 `0.2.0-beta.0` 本地预发布流程。
3. 将 Chrome DevTools MCP 设为接口调研和证据采集的首选工具，规定列表、筛选、详情、类型切换和无登录验证的最低证据门槛。
4. 明确 README、新增站点文档、`jobhunt-cli` skill 和 `CHANGES.md` 的后续同步要求。

**原因**：
现有 36 个站点主要写死社招行为，需要在开始批量实现前形成可交接、可验证的统一执行规范，避免不同 adapter 对校招和实习采用不一致的参数、字段与验收口径。

**影响范围**：
- 本次仅新增规划与验收文档，不改变 CLI 运行时行为。
- 后续执行 Agent 应以该 spec 作为实现、测试、文档和预发布验收依据。

---

## 2026-07-05

### 发布 0.1.13

**修改文件**：`package.json`

**修改内容**：
1. 将 npm 包版本从 `0.1.12` 提升到 `0.1.13`。

**原因**：
npm registry 上 `jobhunt-cli` 最新版本已是 `0.1.12`，DeepSeek adapter 需要使用新的 patch 版本发布。

**影响范围**：
- 仅影响 npm 发布版本号，不改变运行时代码逻辑。

---

### 新增 DeepSeek 社会招聘站点 adapter

**修改文件**：`src/core/registry.js`、`src/sites/deepseek/`、`scripts/smoke-deepseek-api.js`、`package.json`、`README.md`

**修改内容**：
1. 新增 `deepseek` 站点 adapter，对接 `https://app.mokahr.com/social-recruitment/high-flyer/140576#/` 公开 Moka 招聘页。
2. 实现 Moka 会话初始化、Cookie 保持、`init-data.aesIv` 读取、加密 API 响应解密、岗位搜索、详情回查、筛选项和分页导出。
3. 针对 DeepSeek 岗位字段补充城市字段解析和 `核心要求`/`任职要求` 文本拆分，使 `description` 与 `requirement` 更适合 agent 消费。
4. 注册 `job deepseek ...` 命令，新增 `npm run smoke:deepseek` 并接入总 `npm run smoke`。
5. 更新 README 支持站点列表和 smoke 示例。

**原因**：
扩展 JobHunt-CLI 的公开招聘数据源覆盖范围，支持 DeepSeek/幻方公开社会招聘岗位查询、导出和分析。

**影响范围**：
- `job sites` 新增 `deepseek` 站点，总站点数从 35 个增加到 36 个。
- 新站点支持 `filters`、`search`、`detail`、`all`、`analyze` 等现有 CLI 子命令。
- DeepSeek adapter 依赖 Moka 页面中的 `init-data`、`aesIv` 和 `/api/outer/ats-apply/website/jobs/v2` 接口；若 Moka 页面结构、加密字段或接口请求参数变化，需要同步更新 `src/sites/deepseek/utils.js`。

---

## 2026-04-20

### 发布 0.1.11

**修改文件**：`package.json`

**修改内容**：
1. 将 npm 包版本从 `0.1.9` 提升到 `0.1.11`。

**原因**：
npm registry 上 `jobhunt-cli` 最新版本已是 `0.1.10`，当前代码需要使用更高版本号发布，避免重复发布已存在版本。

**影响范围**：
- 仅影响 npm 发布版本号，不改变运行时代码逻辑。

---

### 新增 15 个阿里巴巴集团 CPO 招聘站点 adapter

**修改文件**：`src/core/registry.js`、`src/sites/alibaba-cpo/`、`scripts/smoke-alibaba-cpo-api.js`、`package.json`、`README.md`

**修改内容**：
1. 新增 `src/sites/alibaba-cpo/` 共享 adapter 工厂，统一封装阿里 CPO 招聘站点的动态 `_csrf` 初始化、Cookie 会话、社招频道识别、筛选项、列表搜索、详情拉取和分页导出逻辑。
2. 注册 15 个阿里巴巴集团站点：`taotian`、`taobao-shangou`、`fliggy`、`alibaba-intl`、`aliyun`、`tongyi`、`dingtalk`、`quark`、`thead`、`amap`、`cainiao`、`hujing`、`freshippo`、`alihealth`、`lingxi`。
3. 新增 `npm run smoke:alibaba-cpo`，批量验证 15 个阿里 CPO 站点的 filters/search/all，并在站点当前有岗位时额外验证 detail。
4. 更新 README 当前支持站点列表和 package scripts/keywords。
5. 修正阿里 CPO 站点列表请求 channel：Chrome DevTools 抓包确认前端真实使用 `group_official_site`，而不是 HTML `channelCodeMap.offCampus` 中的子频道值；使用子频道会导致接口成功但岗位列表为空。
6. 修正阿里 CPO 站点父级岗位分类解析：接口不接受单独父级 code，例如钉钉 `产品类` 必须展开为 `平台型/商业型/用户型/综合管理` 等子类 code；同时支持用户输入 `产品` 匹配官网筛选项 `产品类`。

**原因**：
继续扩展 JobHunt-CLI 的招聘数据源覆盖范围。上述站点均为阿里巴巴集团相关招聘官网，前端页面和公开 API 共享同一套 CPO 框架，适合抽象成复用 adapter，降低后续维护成本。

**影响范围**：
- `job sites` 新增 15 个站点，总站点数从 20 个增加到 35 个。
- 新站点支持 `filters`、`search`、`detail`、`all`、`analyze` 等现有 CLI 子命令。
- 部分阿里子站当前公开社招列表返回 0 条岗位；新 adapter 将空列表视为正常结果，避免把“暂无岗位”误报为接口失败。
- 父级分类参数会自动展开为其所有子分类，避免用户传入 `--category 产品` 时退化成无效筛选或空结果。
- 阿里 CPO 站点依赖页面 HTML 中的 `window.__sysconfig.__token__`，列表查询 channel 与前端保持为 `group_official_site`。若前端页面结构、API CSRF 机制或 channel 策略变更，需要同步更新 `src/sites/alibaba-cpo/utils.js`。

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
