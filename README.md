# JobHunt-CLI

把互联网公司的公开招聘官网转成稳定、可脚本化、适合求职者和 AI agent 使用的岗位数据源。

`JobHunt-CLI` 的主命令是 `job`。它把不同公司的招聘页面统一成同一套命令和同一组字段，让你不用在多个官网之间反复点筛选、复制岗位详情，也方便 AI agent 直接读取结构化岗位数据。

它可以做这些事：

- 检索社招岗位：按公司、关键词、城市、职位类别查询岗位。
- 查看岗位详情：拉取岗位职责、任职要求、地点、部门、更新时间和原始调试字段。
- 批量导出数据：把匹配岗位导出为 `json`、`csv` 或 Markdown。
- 生成岗位画像：统计岗位类别、地域、部门、更新时间、高频技能和任职要求关键词。
- 支持跨公司对比：所有站点都归一成标准字段，方便对比同一方向在不同公司的要求差异。
- 服务 AI agent：仓库内置 `jobhunt-cli` skill，告诉 agent 如何发现站点、读取筛选项、检索详情、生成报告。

```bash
npx jobhunt-cli sites
job meituan search AI --category 技术类 --limit 10
job kuaishou search 算法 --location 北京 --limit 10
job didi analyze ai-product --output reports/didi-ai-product-report.md
```

OpenCLI 不是必需依赖，只作为已有 OpenCLI 用户的可选兼容层保留。普通用户直接使用 `job <site> ...` 即可。

## CLI 和 Skill 的关系

这个项目包含两层能力：

| 组件 | 面向对象 | 作用 |
| --- | --- | --- |
| `job` CLI | 人类用户、脚本、AI agent | 真正执行招聘数据查询、详情拉取、批量导出和分析。 |
| `skills/jobhunt-cli` | AI agent | 让 agent 知道如何正确使用 CLI，包括先查站点、再查筛选项、用正确 ID 拉详情、用 JSON 做推理。 |

如果你是人类用户，只安装 npm 包就够了。如果你希望 Codex、Claude Code、Cursor Agent 等工具能自动使用这个 CLI，再安装 skill。

## 适合谁

- 想快速检索互联网公司岗位的求职者。
- 想把招聘官网变成结构化数据源的 AI agent。
- 想批量导出岗位、做岗位画像、做公司招聘情报分析的研究者。
- 想为更多招聘网站贡献 adapter 的开发者。

## 常见使用场景

- “帮我看看小红书当前 AI 产品岗有哪些”：`job xiaohongshu search AI --category 产品 --format json`
- “导出美团技术岗前 100 条”：`job meituan all --category 技术类 --max 100 --format csv --output meituan-tech.csv`
- “分析字节后端岗要求”：`job bytedance analyze 后端 --category 后端 --format md`
- “比较几家公司 AI 产品经理要求”：分别对多个站点运行 `all` 或 `analyze`，再用标准字段做对比。

## 当前支持

| 公司 | 命令 | 官网 | 说明 |
| --- | --- | --- | --- |
| 滴滴 | `job didi ...` | talent.didiglobal.com | 公开接口，列表补齐详情字段。 |
| 快手 | `job kuaishou ...` | zhaopin.kuaishou.cn | 公开接口，已内置请求签名。 |
| 字节跳动 | `job bytedance ...` | jobs.bytedance.com | 公开接口，搜索即返回完整详情。 |
| 美团 | `job meituan ...` | zhaopin.meituan.com | 公开接口，POST JSON，无需签名。 |
| 小米 | `job xiaomi ...` | hr.xiaomi.com | 公开接口，列表POST+详情GET，portal_type=6。 |
| 腾讯 | `job tencent ...` | careers.tencent.com | 公开接口，社招 attrId=1，详情按 PostId 拉取。 |
| 百度 | `job baidu ...` | talent.baidu.com | 公开接口，列表接口 + SSR 详情页解析。 |
| 京东 | `job jd ...` | zhaopin.jd.com | 公开接口，社招类型 3，列表已带详情字段。 |
| 小红书 | `job xiaohongshu ...` | job.xiaohongshu.com | 公开接口，社招 pageQueryPosition。 |
| 哔哩哔哩 | `job bilibili ...` | jobs.bilibili.com | 公开接口，社招 srs 列表 + 详情接口。 |
| 网易 | `job netease ...` | hr.163.com | 公开接口，queryPage 列表 + query 详情。 |
| 携程 | `job ctrip ...` | careers.ctrip.com | 公开接口，getJobAd 列表已带详情字段。 |
| 华为 | `job huawei ...` | career.huawei.com | 公开接口，社招 getJobPage，关键词本地过滤。 |
| 大疆 | `job dji ...` | we.dji.com | 公开接口，职位卡片列表已带详情字段。 |

## 快速开始

### 👤 人类用户

不安装，直接运行：

```bash
npx jobhunt-cli sites
npx jobhunt-cli meituan search AI --category 技术类
```

全局安装（推荐）：

```bash
npm install -g jobhunt-cli
job sites
```

在当前仓库中本地运行：

```bash
npm install
npm run job -- meituan search AI --category 技术类 --limit 5
```

## 网络代理

CLI 会读取 `HTTPS_PROXY`、`HTTP_PROXY`、`https_proxy`、`http_proxy`。默认代理策略为 `JOBHUNT_PROXY=auto`：

- 检测到代理变量时，先探测代理主机端口是否可连接。
- 代理可连接时走代理，适合必须通过代理访问外网的服务器。
- 代理不可连接时自动改用直连，避免本地残留的 `127.0.0.1` 代理变量导致命令失败。
- 代理端口可连接但实际请求失败时，会再用直连重试一次。

可按环境显式调整：

```bash
# 服务器必须走代理时使用
JOBHUNT_PROXY=always job bytedance filters --format json

# 本地确认可直连，忽略所有代理变量
JOBHUNT_PROXY=direct job bytedance filters --format json

# 某个域名直连，其他请求仍按代理变量处理
NO_PROXY=jobs.bytedance.com job bytedance filters --format json
```

排查网络问题时可加 `--debug` 查看代理是否启用、绕过或不可达：

```bash
job --debug bytedance filters --format json
```

## 更新 CLI

查看线上最新版本：

```bash
npm view jobhunt-cli version
```

查看本机已安装版本：

```bash
job --version
```

全局安装用户，更新到最新版：

```bash
npm install -g jobhunt-cli@latest
job --version
job sites
```

只想临时使用最新版，不安装到全局：

```bash
npx jobhunt-cli@latest sites
npx jobhunt-cli@latest xiaohongshu search AI --category 产品 --limit 5
```

本地仓库开发者，拉取远端并更新依赖：

```bash
git pull
npm install
npm run job -- sites
npm run smoke
```

如果你也安装了 AI agent skill，CLI 更新后建议同步刷新 skill：

```bash
npx skills add Enzoding/JobHunt-CLI --skill jobhunt-cli
```

更新后建议运行：

```bash
job sites --format json
job <site> filters --format json
```

站点会持续新增，agent 和脚本不要硬编码站点列表，应该以 `job sites --format json` 的返回为准。

### 🤖 AI Agent

**第一步：安装 CLI**

```bash
npm install -g jobhunt-cli
```

需要 Node.js >= 21。安装后验证：

```bash
job sites
```

**第二步：安装 Skill（让 Agent 知道如何使用 CLI）**

```bash
npx skills add Enzoding/JobHunt-CLI --skill jobhunt-cli
```

安装完成后，Agent 就能理解 `job` 命令的完整用法，并在用户咨询招聘信息时自动调用。

## 核心命令

所有招聘网站都遵循同一套命令形态：

```bash
job sites
job <site> filters --format json
job <site> search [query] --location <城市> --category <类别> --limit <数量> --format json
job <site> detail <岗位ID> --format json
job <site> all [query] --category <类别> --max <数量> --format csv --output jobs.csv
job <site> analyze [query] --category <类别> --output report.md
```

常用示例：

```bash
job meituan search AI --category 技术类 --limit 10
job meituan detail 4305933827 --format json
job meituan all --category 职能类 --max 50 --format csv --output meituan-hr.csv
job xiaomi search 嵌入式 --category 技术类 --limit 10
job kuaishou search 算法 --location 北京 --limit 10
job didi all AI --category 产品 --max 20 --format csv --output didi-ai.csv
job bytedance search 后端 --category 后端 --limit 5 --format json
job tencent search AI --location 北京 --limit 5
job baidu detail <postId> --format json
job jd search AI --category 研发 --limit 5
job xiaohongshu search AI --category 技术 --limit 5
job bilibili search AI --category 技术类 --limit 5
job netease search AI --category 人工智能 --limit 5
job ctrip detail MJ021758 --format json
job huawei search 审计 --limit 5
job dji search 算法 --location 深圳 --limit 5
```

## 输出格式

使用 `--format` 或 `-f` 指定输出格式：

- `table`：适合人在终端快速浏览。
- `json`：适合 AI agent、脚本、索引和二次处理。
- `csv`：适合表格软件和数据分析。
- `md`：适合报告、Markdown 表格和用户可读输出。

使用 `--output` 或 `-o` 写入文件：

```bash
job meituan all --category 技术类 --format csv --output meituan-tech.csv
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

注册到 `src/core/registry.js` 后，CLI 会自动获得全套命令。详细接入流程（API 调研方法、字段归一化、兼容处理等）见 `docs/ADDING_SITE.md`。

## 项目结构

```text
.
├── bin/job.js                  # 独立 CLI 入口
├── src/core/                   # 注册、输出、错误、分析逻辑
├── src/sites/                  # 公司招聘网站 adapter
│   ├── bytedance/
│   ├── didi/
│   ├── jd/
│   ├── kuaishou/
│   ├── meituan/
│   ├── tencent/
│   ├── xiaomi/
│   └── xiaohongshu/
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

单站点 smoke：

```bash
npm run smoke:meituan
npm run smoke:xiaomi
npm run smoke:kuaishou
npm run smoke:didi
npm run smoke:bytedance
npm run smoke:tencent
npm run smoke:baidu
npm run smoke:jd
npm run smoke:xiaohongshu
```

本地直接运行 CLI：

```bash
node bin/job.js sites
node bin/job.js meituan search AI --category 技术类 --limit 3
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
