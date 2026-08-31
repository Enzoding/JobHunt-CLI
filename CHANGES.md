# JobHunt-CLI 变更记录

> 按时间倒序排列。任何代码、配置、文档、工作流或结构的修改均需在此记录。

---

## 2026-08-31

### 发布 `0.2.5`

**修改文件**：`package.json`、`CHANGES.md`

**修改内容**：将版本从 `0.2.4` 提升至 `0.2.5`，发布 PER-133 Agent Token 消耗优化（包含 `--view compact|full|debug`、analyze `--summary-only`、精简 Agent Skill 及渐进式参考手册）。

**原因**：合并 PER-133 功能分支并发布 npm 包。

**影响范围**：
- npm 包 `jobhunt-cli@0.2.5`

---

### 落地 PER-133：JSON 输出视图、analyze summary-only 与精简 Skill

**修改文件**：
- `src/core/projection.js`、`src/core/output-contract.js`、`src/cli.js`
- `scripts/token-metrics.js`、`scripts/token-benchmark.js`、`scripts/workflow-metrics.js`
- `test/fixtures/token/`、`test/projection.test.js`、`test/output-contract.test.js`、`test/cli-view.test.js`、`test/token-budget.test.js`、`test/skill-workflow.test.js`
- `skills/jobhunt-cli/SKILL.md`、`skills/jobhunt-cli/references/`
- `package.json`、`README.md`、`CHANGES.md`

**修改内容**：
- 新增 CLI `--view compact|full|debug`（仅 JSON）：search / detail / all / compare 在序列化前做字段投影；不传则保持 legacy。
- compact 固定输出 `id` / `detail_id` / `name` 等发现字段，`detail_id` 按站点 `detailIdField` 解析并在缺失时回退 `id`。
- full 去掉顶层 `raw`；debug 保留当前数据链路全部字段。compare 的 debug 不回源补 raw。
- analyze 新增 `--summary-only`（仅 JSON），输出 `{ summary }`，内部仍按原范围抓取并计算。
- 非法 view、view/summary-only 与非 JSON 组合在请求前以参数错误（exit 64）失败。
- Agent Skill 改为精简入口 + 三份 references；推荐 compact / detail full / summary-only / 文件导出，不再要求每个任务先跑完整 sites 与 filters。
- 增加离线 fixture、锁定 `gpt-tokenizer@4.0.0`（`o200k_base`，仅 devDependency）以及命令级 / 工作流 Token budget。

**原因**：降低 Agent 完成招聘查询、对比和分析时的上下文消耗，同时保持搜索范围、排序和默认 CLI / 库契约不变。

**影响范围**：
- 默认 CLI JSON、registry / analyze / compare 库返回值不变
- Agent 新工作流需显式传 `--view` / `--summary-only` 才会变瘦
- 发布包新增 `skills/jobhunt-cli/references/`
- 开发依赖新增 tokenizer，不进入运行时

**任务级验收（fixture，非 LLM judge）**：
1. 列表：compact 与 legacy 岗位 identity / 顺序一致，仅字段更少
2. 对比：compare 顶层分组、count、部分失败 error 不变
3. 任职要求：必须通过 3 条 `detail --view full` 取证，完整要求不因 compact 丢失
4. 趋势：summary-only 的 summary 与 legacy JSON 内 summary 深相等
5. 导出：`--view full --output` 不把岗位数组打到 stdout；文件内容等于 legacy 去掉 raw

**实测 Token（`gpt-tokenizer@4.0.0` / `o200k_base`，离线 fixture）**：
- search/all compact 加权：-75.9%（门槛 75%）
- compare compact：-76.1%
- analyze summary-only：-93.3%
- 五条工作流 P50：-78.8%；职责工作流 4 次 CLI / 3 份 full JD
- Skill 入口：3210 bytes，Token -71.3%

---

### 新增 PER-133 Agent Token 消耗优化实施规格

**修改文件**：`docs/PER-133_AGENT_TOKEN_OPTIMIZATION_SPEC.md`、`CHANGES.md`

**修改内容**：新增完整工程规格，定义 Agent Token 优化的目标与非目标、CLI `compact/full/debug` 输出视图、analyze summary-only 行为、Skill 渐进式工作流、兼容策略、离线 Token benchmark、测试矩阵、验收门槛、分阶段实施计划和 Definition of Done。

**原因**：PER-133 要求在保持岗位搜索范围、排序和回答质量的前提下减少 Agent 上下文消耗，并建立可重复的测试验收标准。先固化实施契约可以避免后续仅优化 JSON 体积、破坏现有脚本或缺少语义质量验证。

**影响范围**：
- 仅新增实施文档，不改变当前 CLI、adapter、Skill 或库运行行为
- 为后续 PER-133 开发、评审和发布验收提供统一依据

---

## 2026-08-04

### 发布 `0.2.4`

**修改文件**：`package.json`、`CHANGES.md`

**修改内容**：将版本从 `0.2.3` 提升至 `0.2.4`，发布启动版本提示的 CLI 简化（移除 `--no-update-check`）。

**原因**：npm 上已存在 `0.2.3`，行为与 help 变更需以新版本号发布。

**影响范围**：
- npm 包 `jobhunt-cli@0.2.4`

---

### 简化启动版本提示：移除 `--no-update-check`

**修改文件**：
- `src/cli.js`、`src/core/version-check.js`
- `test/version-check.test.js`
- `skills/jobhunt-cli/SKILL.md`、`CHANGES.md`

**修改内容**：
去掉全局 CLI 选项 `--no-update-check`（Commander `--no-*` 反向布尔易占 help、语义绕）。启动版本检查仍默认开启：有新版本才往 stderr 打一行 tip；关闭仅保留环境变量 `JOBHUNT_NO_UPDATE_CHECK`；`update` / `--help` / `--version` 仍跳过。

**原因**：
用户只需要「执行前知道有没有新版本」，不必把关闭开关暴露成全局命令选项。

**影响范围**：
- `job --help` 少一项 Options
- 依赖 `--no-update-check` 的脚本需改用 `JOBHUNT_NO_UPDATE_CHECK=1`

---

## 2026-08-03

### 补充 SKILL.md 防间接 Prompt 注入与第三方文本安全约束

**修改文件**：`skills/jobhunt-cli/SKILL.md`、`CHANGES.md`

**修改内容**：
在 `skills/jobhunt-cli/SKILL.md` 的注意事项中新增第 12 条：明确指出抓取的招聘描述（`description`/`requirement`）为未经信任的外部第三方文本，约束 Agent 仅作只读数据提取，严禁将其中的任何指令当作动作执行。

**原因**：
响应安全审查（如 `skills.sh` / Snyk / Socket 安全检测 MEDIUM W011 告警），显式建立防范间接提示词注入（Indirect Prompt Injection）的安全边界。

**影响范围**：
- `jobhunt-cli` Skill 文档约束

---

## 2026-08-03

### 发布 `0.2.3`

**修改文件**：`package.json`、`CHANGES.md`

**修改内容**：将版本从 `0.2.2` 提升至 `0.2.3`，发布新增启动版本提示与 `job compare` 多站对比命令。

**原因**：npm 上已存在 `0.2.2`，新增 `job compare` 命令与更新提示能力后需以新版本号发布。

**影响范围**：
- npm 包 `jobhunt-cli@0.2.3`

---

### 新增启动版本提示与 `compare` 命令

**修改文件**：
- `src/core/version-check.js`（新）
- `src/core/compare.js`（新）
- `src/cli.js`、`index.js`
- `test/version-check.test.js`、`test/compare.test.js`（新）
- `skills/jobhunt-cli/SKILL.md`、`CHANGES.md`

**修改内容**：
1. CLI 启动时按 24h 本地缓存检查 npm registry 是否有新版本（约 2s 短超时）；有更新则 stderr 打印一行提示，失败静默。可用 `JOBHUNT_NO_UPDATE_CHECK` / `--no-update-check` 关闭；`update`/`--help`/`--version` 跳过。
2. 新增顶层命令 `job compare [keyword] --sites a,b,c`：多站并发（默认 3）拉取合并，默认 JSON 按站分组；部分失败记入该站 `error`；岗位去掉 `raw`。
3. Skill 场景 B 改为使用 `compare`，并注明 stderr 升级提示勿当 JSON 解析。

**原因**：降低版本滞后感知成本；让 agent/脚本一次拿到多站同类型岗位数据，而不是多次 `all` 再手工合并。

**影响范围**：
- 人类与 agent 的 CLI 启动输出（stderr tip）
- 新增 `compare` 命令与库导出
- Skill 跨公司对比工作流

---

### 发布 `0.2.2`

**修改文件**：`package.json`、`CHANGES.md`

**修改内容**：将版本从 `0.2.1` 提升至 `0.2.2`，发布合并 PR #15 后的校招/实习渠道补全。

**原因**：npm 上已存在 `0.2.1`，新增多家站点 campus/intern 能力后需以新版本号发布。

**影响范围**：
- npm 包 `jobhunt-cli@0.2.2`
- 对应 Issue #13 主体能力；华为实习等仍未支持的渠道保持 unsupported

---

## 2026-08-02

### 补全 Issue #13：多站校招/实习公开渠道

**修改文件**：
- `src/sites/feishu-saas/utils.js`、`dewu/utils.js`、`minimax/utils.js`、`zhipu/{utils,index}.js`
- `src/sites/ctrip/{utils,index}.js`、`bilibili/{utils,index}.js`、`netease/{utils,index}.js`
- `src/sites/moonshot/{utils,index}.js`、`deepseek/{utils,index}.js`
- `docs/RECRUITMENT_NATURES.md`、`CHANGES.md`

**修改内容**：
1. Feishu SaaS 支持按 nature 切换 `website-path` / 域名 / `recruitment_id_list`；得物接入 `578078`（201），MiniMax 接入 `379481`（201）。
2. 智谱校招改为 Moka 双后端（社招/实习仍飞书，校招 `zphz/148984`）。
3. 携程切到 `job.ctrip.com`，校招使用 `getJobAd category=2`。
4. B 站实习：`workType/positionType=0`（前端「实习生招聘」）；`type=3` 仍为校招全职。
5. 网易校招：`campus.163.com` project `69`；Moonshot/DeepSeek 增加独立 Moka campus siteId（DeepSeek 允许无 init-data + 零 IV）。
6. 更新招聘类型矩阵证据日期与状态。

**原因**：Issue #13 跟踪的多家公司已开放公开校招/实习入口，需在不猜测参数、不回退社招的前提下补齐 `supportedNatures`。

**影响范围**：
- 新增/扩展：`ctrip/dewu/minimax/zhipu/bilibili/netease/moonshot/deepseek` 的 campus 或 intern
- 华为实习仍无独立公开入口，保持 unsupported
- 空岗站点（如携程校招、DeepSeek 校招）按 `EMPTY_RESULT` / nature-matrix EMPTY 处理

---

### 发布 `0.2.1`

**修改文件**：`package.json`、`CHANGES.md`

**修改内容**：将版本从 `0.2.0` 提升至 `0.2.1`，发布合并 PR #14 后的新能力：`job update` 命令与精简后的 README。

**原因**：npm 上已存在 `0.2.0`，新增用户可见命令后需以新版本号发布，避免覆盖已发布包。

**影响范围**：
- npm 包 `jobhunt-cli@0.2.1`
- 不改变既有站点 adapter 行为

---

## 2026-07-29

### 简化 README

**修改文件**：`README.md`

**修改内容**：将 README 从 436 行缩减至约 120 行。保留快速开始、更新命令（`job update`）、核心命令语法、招聘类型、标准字段和代理说明；移除逐站点示例列表、逐站点 smoke 命令、OpenCLI 兼容说明和仅面向开发者的冗余内容。

**原因**：原 README 内容层次不清，普通用户需要的关键信息被大量细节淹没；简化后首屏即可获得完整的使用路径。

---

### 新增 `job update` 命令：一键更新 CLI 与 AI agent skill

**修改文件**：`src/core/update.js`（新建）、`src/cli.js`、`CHANGES.md`

**修改内容**：

1. 新建 `src/core/update.js`：封装两步更新逻辑：
   - `updateCli()`：调用 `npm install -g jobhunt-cli@latest` 更新全局 CLI；若检测到本地 dev 运行模式（`process.argv[1]` 在 `process.cwd()` 内），跳过并给出提示而非报错。
   - `updateSkill()`：调用 `npx -y skills add Enzoding/JobHunt-CLI --skill jobhunt-cli` 更新 AI agent skill。
   - `runUpdate({ cli, skill })`：组合入口，根据 flag 决定执行哪些步骤，带步骤编号和 ✅ 提示。
   - 子进程使用 `spawn(..., { stdio: 'inherit', shell: true })` 实时透传输出；非零退出码抛出 `JobHuntCliError`，走现有 `handleError` 流程。

2. `src/cli.js`：
   - 新增 `import { runUpdate } from './core/update.js'`。
   - 在 `sites` 命令之后注册顶层命令 `update`，附带 `--cli-only`（只更新 CLI）和 `--skill-only`（只更新 skill）两个可选 flag；默认两步都执行。

**原因**：用户和 AI agent 使用 `job update` 即可一键同步 CLI 与 skill，无需手动记忆两条命令。

**影响范围**：
- 新增命令 `job update`，不影响任何现有命令。
- `src/core/update.js` 为纯新增文件。

---

## 2026-07-24

### 发布准备与版本提升：`0.2.0` 准备合入主干

**修改文件**：`package.json`、`scripts/smoke-nature-matrix.js`、`CHANGES.md`

**修改内容**：
1. `package.json` 版本号由 `0.2.0-beta.0` 正式提升至 `0.2.0`。
2. `scripts/smoke-nature-matrix.js` 补充对校招渠道中返回规范归一化实习岗位 (`campus->intern`) 的容忍判定，使在线全矩阵冒烟测试达 100% 通过。
3. 完成 PR #12 审查与合并准备。

**原因**：
校招/实习多招聘类型能力（Phase 1~6）及岗位 URL 加固已全量通过单元测试和在线冒烟验收，提升版本至 `0.2.0` 以便合并后发布 npm。

**影响范围**：
- npm 发布版本号标记为 `0.2.0`。
- `smoke:nature-matrix` 自动化断言更加符合架构规范。

---

## 2026-07-19

### 岗位 URL 诊断修复：快手 SPA 容器路径 + 美团 jobType

**修改文件**：`src/sites/kuaishou/utils.js`、`src/sites/meituan/utils.js`、`skills/jobhunt-cli/SKILL.md`、`docs/job_url_diagnosis_report.md`、`CHANGES.md`

**修改内容**：
1. 快手社招/实习 `jobUrl` 从 `zhaopin.kuaishou.cn/#/official/...` 改为容器路径 `.../recruit/e/#/official/...`；校招继续使用 `/recruit/campus/e/`，并在有数据时附加 `?recruitSubProjectCodes=`。
2. 美团三类详情 URL 统一带上 `jobType`（含社招 `3`）。
3. 新增 `docs/job_url_diagnosis_report.md` 全站 URL 风险分类；skill 补充「原样打开 url、勿截断 Hash/容器路径」防呆说明。

**原因**：
快手 SPA 脱离部署根目录时 Nginx 302 会丢弃 Hash；美团详情依赖 `jobType` 区分招聘渠道。避免导出链接在非浏览器客户端或跨渠道场景失效。

**影响范围**：
- `kuaishou` / `meituan` 搜索、详情、all 输出的 `url` 字段。
- Agent 使用 skill 打开岗位链接时的行为约定。

---

### 确认快手校招 Web 前端路由完整基准路径

**修改文件**：`src/sites/kuaishou/utils.js`、`CHANGES.md`

**修改内容**：
经对快手校招 SPA 静态资源与页面路径排查，确认 `https://campus.kuaishou.cn/recruit/campus/e/` 为校招前端单页应用的基准目录，保持 `jobUrl` 生成规则为 `https://campus.kuaishou.cn/recruit/campus/e/#/campus/job-info/${id}`。

**原因**：
快手校招前端工程部署于 `/recruit/campus/e/` 路径下，脱离该基准路径访问会导致页面重定向至主页。

**影响范围**：
快手校招 (`--nature campus`) 岗位的搜索与详情输出 URL。

---

### Phase 5/6：文档、skill 与 `0.2.0-beta.0` 本地预发布

**修改文件**：`README.md`、`docs/ADDING_SITE.md`、`docs/RECRUITMENT_NATURES.md`、`skills/jobhunt-cli/SKILL.md`、`package.json`、`scripts/smoke-nature-matrix.js`、`CHANGES.md`

**修改内容**：
1. README 增加招聘类型契约（默认 social、`all`、能力发现、安全全量）与命令示例。
2. `ADDING_SITE.md` 补充多类型 DevTools 调研、`supportedNatures`/`stampStandardNature` 与验收清单。
3. `jobhunt-cli` skill：意图不明先问招聘类型；detail 沿用搜索 nature；`all` 先小规模预览。
4. 新增 `npm run smoke:nature-matrix` 低流量全矩阵冒烟。
5. 版本标记为 `0.2.0-beta.0`，完成本地 `npm pack` 安装验证；**未执行 `npm publish`**。

**原因**：
按执行 Spec 完成文档/skill 同步与本地预发布验收，保留人工发布控制权。

**影响范围**：
- 使用者与 Agent 可通过文档/skill 正确使用 `--nature`。
- npm 包版本进入 `0.2.0-beta.0`；发布需另行人工执行。

---

### Phase 4：ByteDance / Ant / JD / Didi 三类招聘

**修改文件**：`src/sites/bytedance/*`、`src/sites/ant/*`、`src/sites/jd/*`、`src/sites/didi/*`、`docs/RECRUITMENT_NATURES.md`、`CHANGES.md`

**修改内容**：
1. **ByteDance**：社招 `portal_type=6`；校招/实习共用 campus portal（`portal_type=3` + campus headers），`recruitment_id_list` `201`/`202`；filters `/config/job/filters/3`。
2. **Ant Group**：社招 `/api/social/position/search`；校招/实习 `/api/campus/position/search` + 客户端 `batchType` `graduate`/`trainee` 过滤。
3. **JD**：社招保留 `zhaopin.jd.com`；校招/实习 `campus.jd.com` `POST /api/wx/position/page?type=present|internship`（0-based `pageIndex`）。
4. **Didi**：社招 `talent.didiglobal.com`；校招/实习 Moka 双站点（AES 解密，复用 moonshot 会话模式）。

**原因**：
Phase 4 独立站 DevTools 取证完成后实现三类招聘并标准化 `nature_code`。

**影响范围**：
- `job bytedance|ant|jd|didi ... --nature campus|intern|all` 可用。

---

### Phase 4：Tencent / Baidu / 小红书 / miHoYo / Huawei / Bilibili / DJI / Moonshot / DeepSeek 招聘类型

**修改文件**：`src/sites/{tencent,baidu,xiaohongshu,mihoyo,huawei,bilibili,dji,moonshot,deepseek}/*`、`docs/RECRUITMENT_NATURES.md`、`CHANGES.md`

**修改内容**：
1. **Tencent**：`attrId` `1/2/3` → social/campus/intern；标准化 `nature_code`；移除 vendor nature filter 行。
2. **Baidu**：`recruitType` `SOCIAL/GRADUATE/INTERN`；详情/Referer 按类型切换。
3. **小红书**：`recruitType` + `applyType` + job URL 路径 `/social|/campus|/intern`。
4. **miHoYo**：`hireType`/`jobNatures` 映射三类；不再将 CLI `--nature` 解析为 vendor JobNatureEnum。
5. **Huawei**：`jobType` `SR/CR`；校招 filters 使用 `getCampusRecruitmentCategory`；intern unsupported。
6. **Bilibili**：社招 `/api/srs` + `X-Channel: social`；校招 `/api/campus/position/positionList` + `recruitType: 1`；intern unsupported。
7. **DJI**：`schoolFlag` `N/Y` → social/intern；campus unsupported；社招空列表允许（`NO_LIVE_JOBS`）。
8. **Moonshot / DeepSeek**：Moka 社招基线；`stampStandardNature(..., 'social')`；移除将 `commitment` 误映射为 `--nature` 的客户端过滤。

**原因**：
Phase 4 继续铺开独立站点的标准招聘类型契约，按 DevTools 取证映射 vendor 参数。

**影响范围**：
- 上述站点 `--nature` 按 `supportedNatures` 声明可用；未支持类型报 `UNSUPPORTED_NATURE`。
- `all()` 去重键改为 `nature:id`；filters 由 registry 注入标准 nature 行。

---

### Phase 4 起步：NetEase / Ctrip 社招+实习

**修改文件**：`src/sites/netease/*`、`src/sites/ctrip/*`、`docs/RECRUITMENT_NATURES.md`、`CHANGES.md`

**修改内容**：
1. **NetEase**：`workType` `0/1` → social/intern；标准化输出；`/campus.html` DevTools 确认为 404，campus unsupported。
2. **Ctrip**：`kind` `Regular`/`Intern_Long_Term` → social/intern；公开 filters 无校园 kind，campus unsupported。

**原因**：
Phase 4 优先落地已有 intern 线索且可快速取证的独立站点。

**影响范围**：
- `job netease|ctrip ... --nature intern` 可用；`--nature campus` 明确报错。

---

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

## 2026-05-30

### 修复 Meituan 岗位详情链接 404 问题

**修改文件**：`src/sites/meituan/utils.js`

**修改内容**：
1. 更新 `jobUrl` 函数，将岗位详情的 URL 格式从旧版的 `https://zhaopin.meituan.com/web/social/position/${id}` 修改为目前官方真实使用的 `https://zhaopin.meituan.com/web/position/detail?highlightType=social&jobUnionId=${id}`。

**原因**：
美团招聘官网旧版 `/web/social/position/${id}` 路径在前端 SPA 路由中已被废弃，导致进入后页面展示失效/404；而新的带有 `jobUnionId` 的参数化链接能正常稳定地加载并展示社招职位详情。

**影响范围**：
- 仅影响 Meituan 站点返回的岗位 URL 属性，不改变列表拉取或命令行正常运行。

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
