# 命令与参数

在需要完整 CLI 手册、默认值或参数组合时阅读本文件。日常列表、对比和分析先看 Skill 入口的意图路由。

所有站点共享同一套命令，将 `<site>` 替换为站点 ID。Agent 推理时使用 `--format json`。`--view` 与 `--summary-only` 只能搭配 JSON；不传新参数时保持 legacy 输出。

## 搜索

```bash
job <site> search [关键词] [--nature <类型>] [--category <类别>] [--location <城市>] [--limit <数量>] [--view compact] --format json
```

- 关键词可选，留空返回全部。
- 省略 `--nature` 时查询社招。
- 列举岗位用 `--view compact`。不要用 legacy / full 搜索结果当列表。

## 岗位详情

```bash
job <site> detail <detail_id> --nature <类型> --view full --format json
```

- `<detail_id>` 取自 compact 结果的 `detail_id`（或站点 `detail_id_field`）。
- `--nature` 必须与搜索该岗位时的类型一致。
- `detail --nature all` 会失败。
- 只对短名单调用；不要对搜索页每一条都拉详情。

## 批量导出

```bash
job <site> all [关键词] [--nature <类型>] [--category <类别>] [--location <城市>] [--max <数量>] --view full --format json --output jobs.json
```

- `--max 0`（默认）表示全部匹配岗位；岗位多时先小 `max` 预览。
- `--nature all` 时 `max` 是合并后的全局上限，各类型顺序请求、不并发。
- **`all --view full` 必须配合 `--output`**，避免完整 JD 进入 Agent 上下文。
- Agent 只要预览时用有限 `--max` 和 `--view compact`。
- 禁止为了分析趋势把不限量 full JSON 打到 stdout。

## 分析报告

```bash
job <site> analyze [关键词] [--nature <类型>] [--category <类别>] [--location <城市>] [--max <数量>] --summary-only --format json
```

- 关键词和筛选项均可选，AND 组合。
- `--summary-only` 只返回 `{ "summary": ... }`，不改变抓取范围或 `--max` 语义。
- 需要给用户看报告时再用 `--format md --output report.md`。
- 未传 `--summary-only` 时 JSON 仍是 `{ summary, jobs }`（legacy）。

## 跨公司对比

```bash
job compare [关键词] --sites <site1,site2,...> [--nature <类型>] [--category <类别>] [--location <城市>] [--max <每站数量>] --view compact --format json
```

- `--sites` 必填，逗号分隔站点 ID。
- 默认 `--nature social`，默认 `--max 30`（`0` 表示该站不限量）。
- 顶层结构：`{ query, nature, sites, results: [{ site, count, jobs, error }] }`。
- 某一站失败时写入该站 `error`，其余站照常返回；全部失败才退出。
- CLI 只负责多站拉取合并；跨站解读由 Agent 完成。对齐时用标准化字段名，不要用各站不同的 `category_code`。

## 发现命令

```bash
job sites --format json
job <site> filters --nature <类型> --format json
```

不要每个任务无条件运行。入口文件写了何时才需要动态发现。

## 输出格式

| 格式 | 适用场景 |
|------|----------|
| `json` | Agent 推理、脚本、二次分析；view / summary-only 仅对此生效 |
| `csv` | 交付给用户的表格文件 |
| `md` | 用户可读报告，analyze 默认格式 |
| `table` | 终端预览，长字段会截断 |

`--output` / `-o` 写入文件。批量 full 数据应写入文件而不是 stdout。
