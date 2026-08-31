# JobHunt-CLI

把互联网公司的公开招聘官网转成稳定、可脚本化、适合求职者和 AI agent 使用的结构化岗位数据源。

主命令是 `job`。支持社招、校招、实习三种渠道，所有公司共享同一套命令和标准字段，方便跨公司对比、批量导出和 AI 分析。

```bash
job meituan search AI --category 技术类 --limit 10
job xiaomi search 算法 --nature campus --limit 5
job didi analyze ai-product --format md --output report.md
```

## 支持公司

当前支持 30+ 家互联网公司。运行以下命令获取实时列表：

```bash
job sites --format json
```

包括滴滴、快手、字节跳动、美团、小米、腾讯、百度、京东、小红书、哔哩哔哩、网易、携程、华为、大疆、蚂蚁、得物、米哈游、DeepSeek、阿里系（淘天、阿里云、通义、钉钉等）……

各站点支持的招聘类型（社招 / 校招 / 实习）以 `job sites` 的 `supported_natures` 为准，详见 [`docs/RECRUITMENT_NATURES.md`](docs/RECRUITMENT_NATURES.md)。

## 快速开始

**不安装，直接运行：**

```bash
npx jobhunt-cli sites
npx jobhunt-cli meituan search AI --category 技术类
```

**全局安装（推荐）：**

```bash
npm install -g jobhunt-cli   # 需要 Node.js >= 21
job sites
```

**AI Agent 用户，安装 Skill 让 Agent 自动使用 CLI：**

```bash
npx skills add Enzoding/JobHunt-CLI --skill jobhunt-cli
```

## 更新

一键更新 CLI 和 Skill：

```bash
job update
```

只更新其中一项：

```bash
job update --cli-only    # 只更新 CLI
job update --skill-only  # 只更新 Skill
```

查看当前版本：

```bash
job --version
```

## 招聘类型（`--nature`）

| 值 | 含义 | 说明 |
| --- | --- | --- |
| `social` | 社招 | **默认**，省略时即查社招 |
| `campus` | 校招 | 应届 / 春招 / 秋招 |
| `intern` | 实习 | 日常实习 / 暑期实习 |
| `all` | 全部 | 聚合该站点已支持的类型 |

中文别名同样支持：`社招` / `校招` / `实习` / `全部`。

## 核心命令

```bash
# 发现能力
job sites
job <site> filters [--nature <类型>] --format json

# 查询
job <site> search [query] [--nature <类型>] [--category <类别>] [--location <城市>] [--limit <数量>]
job <site> detail <岗位ID> [--nature <类型>] --format json

# 批量导出
job <site> all [query] [--nature <类型>] [--max <数量>] --format csv --output jobs.csv

# 分析报告
job <site> analyze [query] [--nature <类型>] [--max <数量>] --format md --output report.md

# Agent 推荐：显式视图，不传则保持旧 JSON
job meituan search AI --nature social --view compact --format json
job meituan detail <detail_id> --nature social --view full --format json
job compare AI --sites meituan,xiaomi --view compact --format json
job meituan analyze AI --summary-only --format json
job meituan all AI --view full --format json --output meituan-ai.json
```

输出格式通过 `--format` 指定：`table`（终端预览）/ `json`（脚本/agent）/ `csv`（表格）/ `md`（报告）。

JSON 可选 `--view compact|full|debug`（仅 JSON）：`compact` 用于岗位发现，不含完整 JD；`full` 用于详情和文件交付，不含 `raw`；`debug` 用于排错。不传 `--view` 时输出与旧版本完全一致。`analyze --summary-only` 只返回聚合 `summary`，不改变内部抓取范围。

## 标准岗位字段

所有站点归一化为统一结构：

| 字段 | 说明 |
| --- | --- |
| `id` / `code` | 岗位唯一 ID |
| `name` / `url` | 岗位名称 / 详情页链接 |
| `category_name` | 职位类别 |
| `nature_code` / `nature_name` | `social/campus/intern` / `社招/校招/实习` |
| `location_names` | 工作城市 |
| `department_name` | 部门 |
| `updated_at` | 更新时间 |
| `description` / `requirement` | 岗位职责 / 任职要求（完整文本） |
| `raw` | 原始字段（含官网原始招聘类型，供调试） |

## 网络代理

CLI 自动读取 `HTTPS_PROXY` / `HTTP_PROXY` 环境变量，默认策略（`auto`）会先探测代理是否可连接，不可达时自动切换直连。

```bash
JOBHUNT_PROXY=always job bytedance filters  # 强制走代理
JOBHUNT_PROXY=direct  job bytedance filters  # 强制直连
job --debug bytedance filters               # 排查代理状态
```

## 开发

```bash
npm install
node bin/job.js sites
npm test             # 单元测试与离线 Token budget
npm run token-benchmark  # 命令级 / 工作流 Token 报告
npm run smoke        # 全站点 smoke 测试
npm run smoke:cli    # CLI 端到端验证
```

`gpt-tokenizer` 只用于离线 Token 测试（`o200k_base`），不进入运行时依赖。

新增招聘网站见 [`docs/ADDING_SITE.md`](docs/ADDING_SITE.md)。
