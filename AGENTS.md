# JobHunt-CLI 项目指南

> 本文件面向 AI Coding Agent。如果你从未接触过这个项目，请优先阅读本文，再动手修改代码。

## 项目概述

JobHunt-CLI 是一个 Node.js CLI 工具，目标是把中国互联网公司的公开招聘官网转换为稳定、可脚本化、适合 AI agent 消费的结构化岗位数据源。

它通过为每家公司的招聘站点编写独立的 **site adapter**，将不同公司的 API/页面统一成同一套命令和标准字段。当前已支持 9 家公司：滴滴、快手、字节跳动、美团、小米、腾讯、百度、京东、小红书。

项目同时提供两层能力：
- `job` CLI：面向人类用户、脚本和 AI agent，执行真正的数据查询、导出和分析。
- `skills/jobhunt-cli/`：面向 AI agent 的 skill 文档，告诉 agent 如何正确使用 CLI。

## 技术栈与运行环境

- **运行时**：Node.js >= 21.0.0（ES Modules，`"type": "module"`）
- **核心依赖**：
  - `commander`：CLI 参数解析与子命令注册
  - `undici`：HTTP 客户端，同时用于代理支持（`EnvHttpProxyAgent`）
- **可选依赖**：`@jackwener/opencli`（peerDependency，optional），为已有 OpenCLI 用户提供兼容层
- **无需构建步骤**：直接运行原生的 `.js` 文件即可

## 项目结构

```text
.
├── bin/job.js                  # CLI 入口（shebang，可直接执行）
├── index.js                    # 库入口，导出 registry / analysis / errors
├── opencli.js                  # 可选 OpenCLI 兼容入口
├── opencli-plugin.json         # OpenCLI 插件元数据
├── package.json                # npm 包配置、scripts、依赖
├── src/
│   ├── cli.js                  # Commander 命令定义与主流程
│   └── core/                   # 核心共享逻辑
│       ├── registry.js         # 站点注册与分发（adapter 映射表）
│       ├── errors.js           # 统一错误类（JobHuntCliError / ApiError / EmptyResultError / ArgumentError）
│       ├── formatters.js       # 输出格式化（table / json / csv / md）
│       ├── network.js          # 网络初始化、代理检测、调试输出
│       └── analysis.js         # analyze 命令的实现（词频统计、分布汇总、Markdown 报告）
│   └── sites/                  # 各公司招聘站点的 adapter
│       ├── baidu/
│       ├── bytedance/
│       ├── didi/
│       ├── jd/
│       ├── kuaishou/
│       ├── meituan/
│       ├── tencent/
│       ├── xiaomi/
│       └── xiaohongshu/
│           ├── index.js        # adapter 对象（id / opencliSite / search / detail / all / filters）
│           └── utils.js        # 站点底层请求、字段归一化、别名解析
├── skills/jobhunt-cli/
│   └── SKILL.md                # 给 AI agent 的用法指南
├── integrations/opencli/
│   └── index.js                # OpenCLI 兼容层（仅做 import 发现）
├── scripts/
│   └── smoke-*-api.js          # 各站点的 smoke 测试脚本
├── docs/
│   └── ADDING_SITE.md          # 新增站点的完整方法论文档
└── examples/
    └── *.csv                   # 示例输出文件
```

## 核心架构：Adapter 模式

每个站点是一个独立的 adapter，必须实现以下接口：

```js
{
  id: 'meituan',               // CLI 子命令名
  opencliSite: 'meituan-jobs', // OpenCLI 兼容名
  name: 'Meituan',
  description: '...',
  columns: [...],              // search 默认表格列
  detailColumns: [...],        // detail/all 默认表格列
  maxPageSize: 30,
  detailIdField: 'id',         // detail 命令应使用搜索结果的哪个字段作为 ID
  detailIdHint: '...',         // ID 格式说明
  async filters() { ... },     // 返回筛选项列表
  async search(args) { ... },  // 返回岗位数组
  async detail(id) { ... },    // 返回单个岗位详情
  async all(args) { ... },     // 分页拉取全部匹配岗位
}
```

新增站点时，只需在 `src/sites/<site>/` 下创建 `index.js` 和 `utils.js`，然后在 `src/core/registry.js` 中注册即可。详细流程见 `docs/ADDING_SITE.md`。

### 标准化岗位字段

所有站点的 `normalizeJob` 必须将原始数据映射为统一结构：

```text
id, code, job_no, name, url,
category_code, category_name,
nature_code, nature_name,
location_codes, location_names,
experience_code, levels,
department_code, department_name,
updated_at, description, requirement,
raw
```

其中 `raw` 用 `Object.defineProperty(..., { enumerable: true })` 定义，保留精简的原始字段用于调试。

## 常用命令

### 本地运行 CLI

```bash
npm install
node bin/job.js sites
node bin/job.js meituan search AI --category 技术类 --limit 5
```

### smoke 测试

```bash
npm run smoke              # 运行全部站点的 smoke 测试
npm run smoke:cli          # CLI 端到端 smoke（搜索小米 AI 岗位）
npm run smoke:meituan      # 单站点 smoke
npm run smoke:kuaishou
# ... 其他站点同理
```

### 发布前检查

```bash
npm pack --dry-run         # 查看会发布哪些文件
```

## 代码风格与开发约定

- **模块系统**：全部使用 ES Modules（`import` / `export`），文件后缀写 `.js`。
- **适配器组织**：每个站点的 `index.js` 只负责暴露 adapter 接口；所有网络请求、字段映射、别名表、分页逻辑都放在 `utils.js`。
- **错误处理**：底层 API 异常统一抛出 `ApiError`（别名 `CliError`）；参数错误用 `ArgumentError`；空结果用 `EmptyResultError`。
- **别名解析**：`utils.js` 中需提供 `CATEGORY_ALIASES` / `CITY_ALIASES`，支持用户用中文/英文别名传入 `--category` / `--location`。
- **分页安全**：`all()` 必须同时检查 `pageNo >= totalPage` 和 `list.length < pageSize` 两个结束条件，避免无限循环。
- **去重机制**：`all()` 中必须用 `Set` 按唯一 ID 去重，防止不同页出现重复岗位。
- **代理支持**：`src/core/network.js` 自动检测 `HTTP_PROXY` / `HTTPS_PROXY` 环境变量，使用 `undici` 的 `EnvHttpProxyAgent`。
- **变更记录**：**任何代码、配置、文档、工作流或结构的修改，都必须在 `CHANGES.md` 中以文字形式记录修改内容、原因和影响范围。** 保持 `CHANGES.md` 与代码变更同步更新。

## 测试策略

本项目**没有单元测试框架**（如 Jest / Vitest），验证主要依靠：

1. **smoke 脚本**（`scripts/smoke-*-api.js`）：对每个站点覆盖 4 个核心场景：
   - `fetchJobs` 带关键词搜索
   - `fetchJobDetail` 拉取详情
   - `fetchFilters` 获取筛选项
   - 分页请求第一页
2. **CLI smoke**（`npm run smoke:cli`）：验证 CLI 命令端到端可运行。
3. **手动验收**：新增站点后，必须本地跑通 `bin/job.js <site> filters/search/detail/all` 并确认输出合理。

## 部署与发布

- 这是一个 **npm 包**，通过 `npm publish` 发布到 npm registry。
- `package.json` 的 `files` 字段精确控制发布内容：仅包含 `bin/`、`src/`、`docs/`、`integrations/`、`skills/`、`index.js`、`opencli.js`、`opencli-plugin.json`、`README.md`。
- CLI 全局安装后，主命令为 `job`，同时注册 `jobhunt-cli` 别名。

## 安全与合规注意事项

- 所有数据均来自各公司**公开的招聘官网接口或公开页面**，不涉及登录态、Cookie 窃取或越权访问。
- 快手站点使用了内置的 HMAC-SHA256 签名逻辑（`utils.js` 中硬编码签名密钥），仅用于与公开 API 正常通信。
- 百度站点的详情页通过 SSR HTML 解析提取数据，需关注目标页面结构变化。
- 代理配置通过环境变量读取，不会在代码中硬编码敏感地址。

## 给 Agent 的快速决策参考

| 场景 | 应该去哪里改 |
|------|-------------|
| 新增招聘站点 | 参考 `docs/ADDING_SITE.md`，新建 `src/sites/<site>/`，修改 `src/core/registry.js` |
| 修改输出格式 | `src/core/formatters.js` |
| 修改 analyze 报告内容 | `src/core/analysis.js` |
| 修改 CLI 命令或参数 | `src/cli.js` |
| 修复某站点 API 变动 | 修改对应站点的 `src/sites/<site>/utils.js` |
| 新增/修改错误类型 | `src/core/errors.js` |
| 调整代理或网络行为 | `src/core/network.js` |
| 新增 smoke 测试 | 新建 `scripts/smoke-<site>-api.js`，并在 `package.json` 的 `scripts` 中注册 |
