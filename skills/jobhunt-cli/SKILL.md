---
name: jobhunt-cli
description: >
  Search, export, compare, and analyze public company recruitment jobs using the
  standalone `jobs` CLI. Use when users ask about job openings, role requirements,
  recruitment trends, skill landscapes, salary benchmarking data, career planning,
  company hiring insights, CSV/JSON exports, or any task involving structured
  recruitment data from supported companies.
---

# JobHunt-CLI — AI Agent 使用指南

`jobs` 是一个将互联网公司公开招聘官网转为结构化数据源的 CLI。所有公司共享统一的命令和字段结构。

## 1. 支持站点

先运行 `jobs sites` 确认当前支持的公司：

| 站点 ID | 公司 | detail ID 格式 | 备注 |
|---------|------|---------------|------|
| `didi` | 滴滴 | 纯数字（如 `60517`） | 列表接口不含详情，CLI 会自动补齐 |
| `kuaishou` | 快手 | 纯数字（如 `30199`） | 需要请求签名，CLI 已内置 |
| `bytedance` | 字节跳动 | 职位编码（如 `A57861`） | 搜索即返回完整详情 |

## 2. 命令全集

所有站点共享同一套命令，将 `<site>` 替换为站点 ID 即可。

### 2.1 查看筛选项

```bash
jobs <site> filters --format json
```

返回 `location`（城市）、`category`（职位类别）、`nature`（招聘类型）三组筛选码。**在使用 `--category` 或 `--location` 前，先查 filters 获取有效值。**

### 2.2 搜索岗位

```bash
jobs <site> search [关键词] [--category <类别>] [--location <城市>] [--nature <类型>] [--limit <数量>] [--format json]
```

- 关键词可选，留空返回全部。
- `--category` / `--location` 支持中文名称或编码，CLI 会自动解析。
- `--limit` 控制单次返回数量。
- 结果包含完整的 `description` 和 `requirement` 字段。

### 2.3 岗位详情

```bash
jobs <site> detail <id> --format json
```

- 滴滴、快手：使用 `search` 返回的数字 `id` 字段。
- 字节跳动：使用 `code` 字段（如 `A57861`），不支持长数字 ID 查询。

### 2.4 批量导出

```bash
jobs <site> all [关键词] [--category <类别>] [--location <城市>] [--max <数量>] [--format json]
```

- `--max 0`（默认）表示导出全部匹配岗位，无上限。
- 支持 `--format csv --output jobs.csv` 直接写入文件。
- 自动分页抓取并去重。

### 2.5 分析报告

```bash
jobs <site> analyze [关键词] [--category <类别>] [--location <城市>] [--max <数量>] [--format md]
```

- 关键词和筛选项均可选，可自由组合。
- 自动生成包含以下维度的数据驱动报告：
  - 地域分布、类别分布、部门分布、时间分布
  - 岗位描述高频技能词
  - 任职要求高频关键词
  - 岗位明细表

## 3. 输出格式

通过 `--format` 或 `-f` 指定，通过 `--output` 或 `-o` 写入文件：

| 格式 | 适用场景 | 说明 |
|------|---------|------|
| `json` | Agent 推理、脚本处理、二次分析 | **Agent 默认推荐格式** |
| `csv` | 交付给用户的表格文件 | 适合 Excel/Google Sheets |
| `md` | 用户可读的报告 | analyze 默认格式 |
| `table` | 终端快速预览 | 列宽有限，长字段会截断 |

## 4. 标准化岗位字段

所有站点返回统一的字段结构：

| 字段 | 说明 | 示例 |
|------|------|------|
| `id` | 岗位唯一 ID | `60517` / `7625858990787578117` |
| `code` | 岗位编码（部分站点） | `A57861` |
| `name` | 岗位名称 | `AI产品经理-飞书` |
| `url` | 岗位详情页链接 | `https://...` |
| `category_code` | 职位类别编码 | `J0011` / `6704215956018694411` |
| `category_name` | 职位类别名称 | `算法` / `产品` |
| `nature_name` | 招聘类型 | `全职` / `社招-正式` |
| `location_names` | 工作城市 | `北京` / `北京,上海` |
| `department_name` | 部门名称 | `基础架构` |
| `updated_at` | 更新时间 | `2026-04-14` |
| `description` | 岗位职责 | 完整 JD 文本 |
| `requirement` | 任职要求 | 完整要求文本 |
| `raw` | 原始字段（调试用） | 不在表格中显示 |

## 5. 典型工作流

### 场景 A：用户想了解某公司某方向的岗位

```bash
# 1. 查看筛选项
jobs bytedance filters --format json

# 2. 搜索目标岗位
jobs bytedance search AI --category 算法 --location 北京 --limit 10 --format json

# 3. 查看感兴趣的岗位详情
jobs bytedance detail A57861 --format json
```

### 场景 B：跨公司对比同一类岗位

```bash
# 分别拉取各公司数据
jobs didi all AI --category 产品 --max 0 --format json --output didi-ai.json
jobs kuaishou all AI --category 产品 --max 0 --format json --output kuaishou-ai.json
jobs bytedance all AI --category 产品 --max 0 --format json --output bytedance-ai.json

# Agent 读取三个 JSON 做对比分析
```

跨公司对比时，使用标准化字段（`category_name`、`location_names`、`description`、`requirement`）做对齐，不要依赖 `category_code`（各站点编码体系不同）。

### 场景 C：批量导出交付给用户

```bash
# 导出 CSV 文件
jobs kuaishou all --category 工程 --max 0 --format csv --output kuaishou-engineering.csv

# 导出分析报告
jobs kuaishou analyze --category 工程 --format md --output kuaishou-engineering-report.md
```

### 场景 D：分析某方向的技能要求和趋势

```bash
# 生成分析报告（自动提取高频技能词和任职要求关键词）
jobs bytedance analyze Agent --format json
```

JSON 返回结构：

```json
{
  "summary": {
    "total": 42,
    "locations": [["北京", 20], ["上海", 12]],
    "categories": [["研发", 15], ["算法", 10]],
    "departments": [["...", 5]],
    "timeBuckets": [["2026-04", 8], ["2026-03", 12]],
    "skillTerms": [["Agent", 30], ["大模型", 25]],
    "requirementTerms": [["Python", 20], ["分布式", 15]]
  },
  "jobs": [...]
}
```

Agent 可直接使用 `summary.skillTerms` 和 `summary.requirementTerms` 构建能力画像。

### 场景 E：用户问"XX 公司在招什么"

```bash
# 不带关键词，拉取全量岗位做分析
jobs bytedance analyze --max 100 --format json
```

从 `summary.categories` 看公司当前岗位类别分布，从 `summary.locations` 看地域分布。

### 场景 F：用户提供了目标岗位，想了解要求

```bash
# 搜索匹配岗位
jobs bytedance search "产品经理" --limit 20 --format json
```

Agent 从返回的 `requirement` 字段提取任职要求，汇总共性能力项，给出求职建议。

## 6. 注意事项

1. **始终用 `--format json` 获取数据做推理**，需要交付给用户时再转 csv/md。
2. **先查 `filters` 再用筛选参数**，避免用错编码导致空结果。
3. **`--max 0` 会拉取全量数据**，岗位多时耗时较长，非必要先用 `--max 50` 或 `--limit` 控制。
4. **跨公司对比用字段名对齐**，不要用编码对齐（编码体系不同）。
5. **字节 detail 用 `code` 不用 `id`**（如 `A57861`），滴滴和快手用数字 `id`。
6. **`analyze` 的关键词和 `--category` 可自由组合**：关键词在全文匹配，`--category` 按类别过滤，两者是 AND 关系。
7. **空结果时**检查：关键词是否过窄、category/location 是否拼写正确、可用 `filters` 确认有效值。
