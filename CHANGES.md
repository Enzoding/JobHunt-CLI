# JobHunt-CLI 变更记录

> 按时间倒序排列。任何代码、配置、文档、工作流或结构的修改均需在此记录。

---

## 2026-04-16

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
