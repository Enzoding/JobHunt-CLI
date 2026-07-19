---
name: jobhunt-cli
description: Search, export, compare, and analyze public company recruitment jobs using the
  standalone `job` CLI. Use when users ask about job openings, role requirements,
  recruitment trends, skill landscapes, career planning, company hiring insights,
  CSV/JSON exports, or any task involving structured recruitment data.
---

# JobHunt-CLI — AI Agent 使用指南

`job` 是一个将互联网公司公开招聘官网转为结构化数据源的 CLI。所有公司共享统一的命令和字段结构。站点会持续新增，Agent 应通过 CLI 自身动态发现能力，而非依赖硬编码假设。

## 0. 先确认招聘类型

用户未说明要查社招、校招还是实习时，**先询问**：

> 你想查社招、校招、实习，还是全部类型？

意图映射（可直接使用，无需再问）：

| 用户说法 | `--nature` |
|----------|------------|
| 社招、社会招聘、有经验、全职社招 | `social`（也可省略，默认即社招） |
| 校招、校园招聘、应届、春招、秋招、毕业生 | `campus` |
| 实习、实习生、暑期实习、日常实习 | `intern` |
| 全部、所有类型、一起看 | `all`（先小规模预览，见下） |

标准值：`social` / `campus` / `intern` / `all`。也支持中文别名（如 `社招`/`校招`/`实习`/`全部`）。

**全部类型安全规则：**

1. 先用 `job sites --format json` 查看该站 `supported_natures`。
2. 用 `--nature all --max 9`（或更小）做预览，**不要一上来 `--max 0` 全量抓取**。
3. 用户确认后再放大 `max` 或分类型导出。

## 1. 发现可用站点

**每次任务开始，先运行此命令获取最新的站点列表和元信息：**

```bash
job sites --format json
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
| `supported_natures` | 该站已接入的招聘类型（`social`/`campus`/`intern`） |
| `default_nature` | 省略 `--nature` 时的默认值（当前均为 `social`） |

**重要：`detail_id_field` 告诉你 `detail` 命令应该用搜索结果的哪个字段值。** 不同站点可能不同（如有的用 `id`，有的用 `code`），始终以此字段为准。

只请求 `supported_natures` 中的类型。显式请求未支持类型会得到 `UNSUPPORTED_NATURE`，**不要改成社招重试冒充结果**。

## 2. 发现筛选项

对任意站点，运行 `filters` 获取该站点支持的筛选值：

```bash
job <site> filters --nature <类型> --format json
```

返回 `location`（城市）、`category`（职位类别）、`nature`（标准招聘类型）等筛选项。**在使用 `--category` 或 `--location` 前，先查 filters 获取有效值。** 支持中文名称或编码，CLI 会自动解析。筛选项可能因招聘类型不同而不同，务必带上与后续搜索相同的 `--nature`。

## 3. 命令全集

所有站点共享同一套命令，将 `<site>` 替换为站点 ID 即可。

### 3.1 搜索岗位

```bash
job <site> search [关键词] [--nature <类型>] [--category <类别>] [--location <城市>] [--limit <数量>] [--format json]
```

- 关键词可选，留空返回全部。
- 省略 `--nature` 时查询社招。
- 结果包含完整的 `description` 和 `requirement` 字段，以及标准化的 `nature_code` / `nature_name`。

### 3.2 岗位详情

```bash
job <site> detail <id> --nature <类型> --format json
```

**`<id>` 的取值方式：从 `job sites --format json` 的 `detail_id_field` 获取应使用搜索结果的哪个字段。**

**`--nature` 必须与搜索该岗位时使用的类型一致**（跨类型裸 ID 可能碰撞）。`detail --nature all` 会失败，详情必须指定单一渠道。

### 3.3 批量导出

```bash
job <site> all [关键词] [--nature <类型>] [--category <类别>] [--location <城市>] [--max <数量>] [--format json]
```

- `--max 0`（默认）表示导出全部匹配岗位，无上限；岗位多时很慢，先小 `max` 预览。
- `--nature all` 时 `max` 是合并后的全局上限，各类型顺序请求、不并发。
- 支持 `--format csv --output jobs.csv` 直接写入文件。

### 3.4 分析报告

```bash
job <site> analyze [关键词] [--nature <类型>] [--category <类别>] [--location <城市>] [--max <数量>] [--format md]
```

- 关键词和筛选项均可选，可自由组合。
- 报告包含地域/类别/部门/招聘类型/时间分布、高频技能词、任职要求关键词、岗位明细。
- `--format json` 返回结构化数据，`summary` 中包含各维度聚合结果。

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
| `id` | 岗位唯一 ID（官网裸 ID；跨类型比较时配合 `nature_code`） |
| `code` | 岗位编码（部分站点有） |
| `name` | 岗位名称 |
| `url` | 岗位详情页链接 |
| `category_name` | 职位类别名称 |
| `nature_code` | 标准招聘类型：`social` / `campus` / `intern` |
| `nature_name` | `社招` / `校招` / `实习` |
| `location_names` | 工作城市 |
| `department_name` | 部门名称 |
| `updated_at` | 更新时间 |
| `description` | 岗位职责（完整文本） |
| `requirement` | 任职要求（完整文本） |
| `raw.source_nature_code` / `raw.source_nature_name` | 官网原始招聘类型（调试用） |

## 6. 典型工作流

### 场景 A：用户想了解某公司某方向的岗位

```bash
job sites --format json
# 若用户未说明类型，先询问社招/校招/实习/全部
job <site> filters --nature campus --format json
job <site> search <关键词> --nature campus --format json
job <site> detail <id> --nature campus --format json
```

### 场景 B：跨公司对比同一类岗位

```bash
job <site1> all <关键词> --nature campus --category <类别> --max 50 --format json --output site1.json
job <site2> all <关键词> --nature campus --category <类别> --max 50 --format json --output site2.json
```

跨公司对比时，使用标准化字段名（`category_name`、`location_names`、`nature_code`、`description`、`requirement`）做对齐，不要使用 `category_code`（各站点编码体系不同）。

### 场景 C：批量导出交付给用户

```bash
job <site> all --nature intern --category <类别> --format csv --output output.csv
job <site> analyze --nature social --category <类别> --format md --output report.md
```

### 场景 D：分析技能要求和趋势

```bash
job <site> analyze <关键词> --nature campus --format json
```

Agent 从返回的 `summary.skillTerms` 和 `summary.requirementTerms` 构建能力画像。从 `summary.timeBuckets` 观察招聘趋势。

### 场景 E：用户问「XX 公司在招什么」

先确认招聘类型；若不明确则询问。然后：

```bash
job <site> analyze --nature all --max 30 --format json
```

从 `summary.categories` / `summary.locations` / 招聘类型分布看结构。需要全量时再提高 `max` 或分类型拉取。

### 场景 F：用户提供了目标岗位，想了解要求

```bash
job <site> search "目标岗位" --nature campus --limit 20 --format json
```

从 `requirement` 字段提取任职要求，汇总共性能力项，给出求职建议。

## 7. 注意事项

1. **始终用 `--format json` 获取数据做推理**，需要交付给用户时再转 csv/md。
2. **先 `job sites --format json` 再操作**，获取 `detail_id_field` 与 `supported_natures`。
3. **先确认招聘类型，再 `filters`，再用筛选参数**，避免跨渠道编码污染或空结果。
4. **`detail` 必须带上与搜索相同的 `--nature`**；禁止 `detail --nature all`。
5. **`--nature all` 先小规模预览**（如 `--max 9`）；`--max 0` 会拉取全量，耗时长。
6. **跨公司对比用字段名对齐**，不要用编码对齐（编码体系不同）。
7. **`analyze` 的关键词和 `--category` 可自由组合**：关键词在全文匹配，`--category` 按类别过滤，两者是 AND 关系。
8. **空结果时**区分：关键词过窄、筛选项错误、季节性无岗位（渠道已支持）、`UNSUPPORTED_NATURE`（未接入）。
9. **不要硬编码站点列表、能力或 ID 格式**，始终通过 `job sites --format json` 动态发现。
10. 更细的站点能力证据见仓库文档 `docs/RECRUITMENT_NATURES.md`（若本地可读）。
