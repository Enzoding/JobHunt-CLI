---
name: jobhunt-cli
description: >
  Search, export, compare, and analyze public company recruitment jobs using the
  standalone `jobs` CLI. Use when users ask about job openings, role requirements,
  recruitment trends, skill landscapes, career planning, company hiring insights,
  CSV/JSON exports, or any task involving structured recruitment data.
---

# JobHunt-CLI — AI Agent 使用指南

`jobs` 是一个将互联网公司公开招聘官网转为结构化数据源的 CLI。所有公司共享统一的命令和字段结构。站点会持续新增，Agent 应通过 CLI 自身动态发现能力，而非依赖硬编码假设。

## 1. 发现可用站点

**每次任务开始，先运行此命令获取最新的站点列表和元信息：**

```bash
jobs sites --format json
```

返回每个站点的关键元信息：

| 字段 | 说明 |
|------|------|
| `id` | 站点 ID，用于所有后续命令的 `<site>` 参数 |
| `name` | 公司名称 |
| `description` | 站点简介 |
| `max_page_size` | 单次请求最大返回数量 |
| `detail_id_field` | 查看详情时应使用搜索结果中的哪个字段作为 ID |
| `detail_id_hint` | ID 格式的可读说明 |

**重要：`detail_id_field` 告诉你 `detail` 命令应该用搜索结果的哪个字段值。** 不同站点可能不同（如有的用 `id`，有的用 `code`），始终以此字段为准。

## 2. 发现筛选项

对任意站点，运行 `filters` 获取该站点支持的筛选值：

```bash
jobs <site> filters --format json
```

返回 `location`（城市）、`category`（职位类别）、`nature`（招聘类型）三组筛选码。**在使用 `--category` 或 `--location` 前，先查 filters 获取有效值。** 支持中文名称或编码，CLI 会自动解析。

## 3. 命令全集

所有站点共享同一套命令，将 `<site>` 替换为站点 ID 即可。

### 3.1 搜索岗位

```bash
jobs <site> search [关键词] [--category <类别>] [--location <城市>] [--nature <类型>] [--limit <数量>] [--format json]
```

- 关键词可选，留空返回全部。
- 结果包含完整的 `description` 和 `requirement` 字段。

### 3.2 岗位详情

```bash
jobs <site> detail <id> --format json
```

**`<id>` 的取值方式：从 `jobs sites --format json` 的 `detail_id_field` 获取应使用搜索结果的哪个字段。** 例如某站点的 `detail_id_field` 是 `code`，则应传入搜索结果中 `code` 字段的值。

### 3.3 批量导出

```bash
jobs <site> all [关键词] [--category <类别>] [--location <城市>] [--max <数量>] [--format json]
```

- `--max 0`（默认）表示导出全部匹配岗位，无上限。
- 支持 `--format csv --output jobs.csv` 直接写入文件。

### 3.4 分析报告

```bash
jobs <site> analyze [关键词] [--category <类别>] [--location <城市>] [--max <数量>] [--format md]
```

- 关键词和筛选项均可选，可自由组合。
- 自动生成数据驱动的分析报告，包含：地域/类别/部门/时间分布、高频技能词、高频要求关键词、岗位明细表。
- `--format json` 返回结构化数据，`summary` 中包含各维度聚合结果，Agent 可直接用于推理。

## 4. 输出格式

通过 `--format` 或 `-f` 指定，通过 `--output` 或 `-o` 写入文件：

| 格式 | 适用场景 |
|------|---------|
| `json` | **Agent 默认推荐格式**，用于推理、脚本处理、二次分析 |
| `csv` | 交付给用户的表格文件 |
| `md` | 用户可读的报告，analyze 默认格式 |
| `table` | 终端快速预览，长字段会截断 |

## 5. 标准化岗位字段

所有站点返回统一结构，部分字段可能因站点而异为空：

| 字段 | 说明 |
|------|------|
| `id` | 岗位唯一 ID |
| `code` | 岗位编码（部分站点有） |
| `name` | 岗位名称 |
| `url` | 岗位详情页链接 |
| `category_name` | 职位类别名称 |
| `nature_name` | 招聘类型 |
| `location_names` | 工作城市 |
| `department_name` | 部门名称 |
| `updated_at` | 更新时间 |
| `description` | 岗位职责（完整文本） |
| `requirement` | 任职要求（完整文本） |

## 6. 典型工作流

### 场景 A：用户想了解某公司某方向的岗位

```bash
jobs sites --format json                  # 1. 发现站点和元信息
jobs <site> filters --format json         # 2. 获取可用筛选项
jobs <site> search <关键词> --format json   # 3. 搜索
jobs <site> detail <id> --format json     # 4. 查看详情（id 取自 detail_id_field）
```

### 场景 B：跨公司对比同一类岗位

```bash
# 分别拉取各公司数据
jobs <site1> all <关键词> --category <类别> --format json --output site1.json
jobs <site2> all <关键词> --category <类别> --format json --output site2.json
# Agent 读取多个 JSON 做对比分析
```

跨公司对比时，使用标准化字段名（`category_name`、`location_names`、`description`、`requirement`）做对齐，不要使用 `category_code`（各站点编码体系不同）。

### 场景 C：批量导出交付给用户

```bash
jobs <site> all --category <类别> --format csv --output output.csv
jobs <site> analyze --category <类别> --format md --output report.md
```

### 场景 D：分析技能要求和趋势

```bash
jobs <site> analyze <关键词> --format json
```

Agent 从返回的 `summary.skillTerms` 和 `summary.requirementTerms` 构建能力画像。从 `summary.timeBuckets` 观察招聘趋势。

### 场景 E：用户问"XX 公司在招什么"

```bash
jobs <site> analyze --max 100 --format json
```

从 `summary.categories` 看岗位类别分布，从 `summary.locations` 看地域分布。

### 场景 F：用户提供了目标岗位，想了解要求

```bash
jobs <site> search "目标岗位" --limit 20 --format json
```

从 `requirement` 字段提取任职要求，汇总共性能力项，给出求职建议。

## 7. 注意事项

1. **始终用 `--format json` 获取数据做推理**，需要交付给用户时再转 csv/md。
2. **先 `jobs sites --format json` 再操作**，获取站点元信息，尤其是 `detail_id_field`。
3. **先 `filters` 再用筛选参数**，避免用错编码导致空结果。
4. **`--max 0` 会拉取全量数据**，岗位多时耗时较长，非必要先用 `--max 50` 或 `--limit` 控制。
5. **跨公司对比用字段名对齐**，不要用编码对齐（编码体系不同）。
6. **`analyze` 的关键词和 `--category` 可自由组合**：关键词在全文匹配，`--category` 按类别过滤，两者是 AND 关系。
7. **空结果时**检查：关键词是否过窄、category/location 是否拼写正确，可用 `filters` 确认有效值。
8. **不要硬编码站点列表或 ID 格式**，始终通过 `jobs sites --format json` 动态发现。
