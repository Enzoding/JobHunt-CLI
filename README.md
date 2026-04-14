# JobHunt-CLI

把互联网公司的公开招聘官网转成稳定、可脚本化、适合求职者和 AI agent 使用的岗位数据源。

```bash
npx jobhunt-cli sites
npx jobhunt-cli didi search AI --category 产品 --format json
job kuaishou search 算法 --location 北京 --limit 10
job didi analyze ai-product --output reports/didi-ai-product-report.md
```

`JobHunt-CLI` 的主命令是 `job`。它站在求职者视角：检索岗位、查看详情、批量导出、分析公司岗位画像。OpenCLI 不是必需依赖，只作为已有 OpenCLI 用户的可选兼容层保留。

## 适合谁

- 想快速检索互联网公司岗位的求职者。
- 想把招聘官网变成结构化数据源的 AI agent。
- 想批量导出岗位、做岗位画像、做公司招聘情报分析的研究者。
- 想为更多招聘网站贡献 adapter 的开发者。

## 当前支持

| 公司 | 命令 | 覆盖范围 | 说明 |
| --- | --- | --- | --- |
| 滴滴 | `job didi ...` | 社会招聘 | 公开接口，列表会补齐详情字段。 |
| 快手 | `job kuaishou ...` | 社会招聘 | 公开接口，已内置请求签名。 |
| 字节跳动 | `job bytedance ...` | 社会招聘 | 公开接口，搜索即返回完整详情。 |

## 安装与运行

不安装，直接运行：

```bash
npx jobhunt-cli sites
npx jobhunt-cli didi search AI --category 产品 --format json
```

全局安装：

```bash
npm install -g jobhunt-cli
job sites
```

在当前仓库中本地运行：

```bash
npm install
npm run job -- didi search AI --category 产品 --limit 5 --format json
```

## 核心命令

所有招聘网站都遵循同一套命令形态：

```bash
job sites
job <site> filters --format json
job <site> search [query] --location <城市/编码> --category <类别/编码> --limit <数量> --format json
job <site> detail <岗位ID> --format json
job <site> all [query] --category <类别/编码> --max <数量> --format csv --output jobs.csv
job <site> analyze ai-product --output report.md
```

常用示例：

```bash
job didi search AI --category 产品 --limit 5
job didi detail 60517 --format json
job didi all AI --category 产品 --max 20 --format csv --output didi-ai.csv
job kuaishou search 算法 --location 北京 --limit 10 --format json
job kuaishou all --category 产品 --max 0 --format json --output kuaishou-products.json
```

## 输出格式

使用 `--format` 或 `-f` 指定输出格式：

- `table`：适合人在终端快速浏览。
- `json`：适合 AI agent、脚本、索引和二次处理。
- `csv`：适合表格软件和数据分析。
- `md`：适合报告、Markdown 表格和用户可读输出。

使用 `--output` 或 `-o` 写入文件：

```bash
job didi all AI --category 产品 --format csv --output didi-ai-jobs.csv
job didi analyze ai-product --format md --output didi-ai-product-report.md
```

## 标准岗位字段

不同招聘官网的原始字段会被统一成下面的结构，方便后续 agent 或脚本消费：

```text
id
job_no
name
url
category_code
category_name
nature_code
nature_name
location_codes
location_names
experience_code
levels
department_code
department_name
updated_at
description
requirement
raw
```

`raw` 只保留必要的原始字段，方便排查接口变化，不作为表格输出的主要内容。

## 给 AI Agent 的用法

### 安装 Skill

```bash
npx skills add Enzoding/JobHunt-CLI --skill jobhunt-cli
```

推荐 agent 工作流：

1. 运行 `job sites`，确认支持哪些公司。
2. 运行 `job <site> filters --format json`，查看城市、岗位类别、招聘类型等筛选项。
3. 用 `job <site> search <关键词> --format json` 做快速检索。
4. 用 `job <site> detail <id> --format json` 获取单个岗位详情。
5. 用 `job <site> all --max 0 --format json` 拉取全量匹配岗位。
6. 用 `job <site> analyze ai-product --format md` 生成 AI 产品岗位画像报告。

对 agent 来说，`json` 是默认推荐格式；需要交付给用户时再导出 `csv` 或 `md`。

## 新增招聘网站

新增公司时，只需要实现一个 site adapter：

```text
src/sites/<site>/
├── index.js
└── utils.js
```

adapter 需要提供统一方法：

```js
export default {
  id: 'example',
  name: 'Example',
  description: 'Example social recruitment',
  columns: [],
  detailColumns: [],
  maxPageSize: 20,
  async filters() {},
  async search(args) {},
  async detail(id) {},
  async all(args) {},
};
```

注册到 `src/core/registry.js` 后，CLI 会自动获得：

```bash
job example filters
job example search
job example detail
job example all
job example analyze ai-product
```

更详细的接入清单见 `docs/ADDING_SITE.md`。

## 项目结构

```text
.
├── bin/job.js                  # 独立 CLI 入口
├── src/core/                   # 注册、输出、错误、分析逻辑
├── src/sites/                  # 公司招聘网站 adapter
│   ├── bytedance/
│   ├── didi/
│   └── kuaishou/
├── skills/jobhunt-cli/         # 给 AI agent 使用的 skill
├── integrations/opencli/       # 可选 OpenCLI 兼容层
├── scripts/                    # smoke 检查脚本
├── docs/                       # 开发文档
└── examples/                   # 示例输出
```

## 开发与验证

运行 smoke 检查：

```bash
npm run smoke
npm run smoke:cli
```

本地直接运行 CLI：

```bash
node bin/job.js sites
node bin/job.js didi search AI --category 产品 --limit 1 --format json
```

发布前预检 npm 包内容：

```bash
npm pack --dry-run
```

## 可选 OpenCLI 兼容

普通用户不需要安装 OpenCLI。

如果用户本来就在使用 OpenCLI，可以使用可选入口：

```text
integrations/opencli/index.js
opencli.js
```

产品对外推荐的主接口仍然是：

```bash
job <site> ...
```
