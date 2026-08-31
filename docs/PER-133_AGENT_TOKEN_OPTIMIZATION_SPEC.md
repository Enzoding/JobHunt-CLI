# PER-133：Agent Token 消耗优化实施规格

## 文档状态

- 状态：Proposed
- 对应 Issue：[PER-133](https://linear.app/enzoding/issue/PER-133/feat-需要看下优化一下agent的token消耗)
- 目标版本：后续 minor release
- 编写日期：2026-08-31
- 适用范围：JobHunt-CLI 的 CLI 输出、Agent Skill、离线测试与发布验收

## 1. Problem Statement

JobHunt-CLI 已经能够从不同招聘官网获取结构统一的岗位数据，但当前面向 Agent 的默认使用路径会把大量与当前任务无关的信息放入模型上下文：

- Agent 为了确认站点能力，在每次任务开始时读取完整站点列表和全部元信息。
- Agent 在使用类别或地点筛选前读取完整 filters，即使只需要确认一个筛选值。
- `search`、`all` 和 `detail` 的 JSON 输出包含完整岗位职责、任职要求、空字段以及用于调试的 `raw`。
- `compare` 虽已移除 `raw`，但仍为每个岗位返回完整岗位职责和任职要求。
- `analyze --format json` 已经计算了聚合 summary，却仍同时返回全部岗位明细。
- Agent Skill 主文件包含完整字段表、命令手册和多个重复工作流，这些固定内容会占用每次激活 Skill 时的输入上下文。

这些输出没有增加搜索召回，也没有改变招聘官网返回的岗位顺序，却会增加 Agent 的输入 Token、推理负担和间接 Prompt 注入暴露面。用户需要在保持相同搜索范围、岗位排序和回答质量的前提下，显著降低 Agent 完成招聘查询、对比和分析任务所消耗的 Token。

## 2. Baseline

2026-08-31 使用当前 registry 数据链路对真实公开接口进行采样，得到以下 UTF-8 输出体积。该数据只用于说明量级，不直接作为最终 Token 验收结果：

| 场景 | 当前输出 | 模拟紧凑输出 | 体积变化 |
| --- | ---: | ---: | ---: |
| 完整站点列表，36 个站点 | 14,155 bytes | 全部紧凑字段 4,768 bytes | -66% |
| 单一站点元信息 | 14,155 bytes | 133 bytes | -99% |
| 小米 filters，161 行 | 24,238 bytes | 查询“北京”后 49 bytes | -99% |
| 美团 AI 搜索，10 条 | 32,673 bytes | 3,040 bytes | -91% |
| 小米 AI 搜索，10 条 | 27,842 bytes | 2,315 bytes | -92% |
| 美团与小米对比，共 10 条 | 24,465 bytes | 2,876 bytes | -88% |
| 美团 AI analyze，10 条 | 39,930 bytes | summary 2,084 bytes | -95% |

美团 10 条搜索结果中，仅 `description`、`requirement` 和 `raw` 的序列化内容就分别约为 9.7 KB、8.0 KB 和 5.5 KB。相同样本只移除 JSON 缩进时，从 32.7 KB 降到 27.9 KB，说明第一优先级应是任务级字段投影，而不是发明新的数据格式。

正式实施时必须使用固定 fixture 和固定 tokenizer 重新建立 Token 基线，不能把上述 bytes 直接解释为模型 Token。

## 3. Goals

1. 保持相同的站点请求参数、岗位召回范围、岗位数量、去重结果和排序。
2. 为 Agent 提供只包含当前任务所需字段的稳定输出视图。
3. 让 Agent 先读取岗位摘要，仅对确实需要分析的岗位读取完整 JD。
4. 让聚合分析只返回 summary，不把已消费的原始岗位再次送入上下文。
5. 使 `raw` 成为明确的调试数据，而不是 Agent 推荐工作流的一部分。
6. 缩小 Agent Skill 的固定上下文，并将低频说明改为按需读取。
7. 建立可离线复现、可在 CI 中阻止回归的 Token 预算测试。
8. 保持现有 CLI 脚本和库调用兼容；新能力通过显式参数启用。

## 4. Non-Goals

本规格不包含以下内容：

- 不修改任何招聘官网 API 请求、分页算法、去重键或 adapter 字段归一化逻辑。
- 不改变 registry 和库入口返回的完整岗位对象。
- 不改变未显式指定新选项时的现有 CLI JSON 输出。
- 不引入字段名缩写、TOON、自定义二进制协议或其他非标准序列化格式。
- 不在第一阶段增加 `sites` 的关键词查询能力。
- 不在第一阶段增加 filters 的 `--group`、`--query` 或服务端过滤能力。
- 不在第一阶段增加 `json-compact`、JSONL 或流式输出格式。
- 不自动生成 JD 摘要，不调用外部 LLM，也不增加在线推理成本。
- 不以线上招聘接口数据作为 Token 测试的固定输入。
- 不在本规格中改变默认招聘类型或 `--nature all` 的执行规则。

上述发现与格式优化可以在核心版本发布并取得实际 benchmark 后另立 follow-up issue。

## 5. Definitions

- **Legacy output**：未传入本规格新增选项时，当前版本已经存在的输出行为。
- **Compact view**：面向岗位发现、列表展示和初步比较的最小稳定字段集合。
- **Full view**：完整标准化岗位数据，但不包含 `raw`。
- **Debug view**：命令当前能够获得的全部数据，包括可用时的 `raw`。
- **Job identity**：`${nature_code}:${id}`，与现有跨招聘类型去重语义一致。
- **Search equivalence**：同一请求下 legacy 和新视图拥有完全相同的岗位 identity 数量与顺序。
- **Workflow Token**：完成一个完整用户任务时，Skill 固定上下文、CLI stdout 和必要错误信息的 Token 总和；不包含用户原始问题和最终自然语言回答。
- **Token budget fixture**：脱敏、稳定、无需联网的代表性标准岗位数据集合。

## 6. Solution

系统增加一个集中式输出投影层。adapter 和 registry 继续产生完整标准岗位对象；CLI 在格式化 stdout 之前，根据命令和显式 `--view` 参数投影数据。投影不得影响网络请求、结果数量、排序、去重或分析计算。

Agent Skill 使用以下渐进式读取策略：

1. 岗位发现和跨公司比较先使用 compact view。
2. 用户需要完整职责、任职要求或针对性求职建议时，只对候选岗位调用 detail full view。
3. 用户需要招聘分布、技能频率或趋势时，使用 analyze summary-only。
4. 用户需要批量交付时，将 full 数据直接写入文件，避免 stdout 进入 Agent 上下文。
5. 只有排查站点字段映射或招聘类型原始值时才使用 debug view。

## 7. User Stories

1. As an Agent user, I want a job search to return compact job metadata, so that listing open roles does not consume full JD tokens.
2. As an Agent user, I want the compact result to contain a directly usable detail identifier, so that the Agent does not need to inspect complete site metadata before opening a job.
3. As an Agent user, I want compact results to preserve job count and ordering, so that reducing output does not change the search result set.
4. As an Agent user, I want to request a full view for selected jobs, so that detailed requirements remain available when the task needs them.
5. As an Agent user, I want raw vendor fields to stay out of normal reasoning context, so that duplicate and untrusted data does not waste context.
6. As a maintainer, I want a debug view that retains available raw data, so that adapter regressions remain diagnosable.
7. As an Agent comparing companies, I want compact jobs grouped by site, so that cross-company comparison uses consistent fields without full JD duplication.
8. As an Agent analyzing hiring trends, I want JSON analysis to return only the computed summary, so that source jobs are not emitted after already being analyzed.
9. As a user requesting role requirements, I want the Agent to fetch full detail only for shortlisted jobs, so that answer quality is maintained without reading every JD.
10. As a user requesting a CSV or Markdown deliverable, I want full data written to a file, so that large exports do not fill the conversational context.
11. As an existing CLI script author, I want commands without new options to behave exactly as before, so that the release is backward compatible.
12. As a library consumer, I want registry and analysis APIs to retain their current full data contracts, so that CLI optimization does not silently alter programmatic integrations.
13. As a maintainer, I want Token budgets measured from fixed fixtures, so that CI results do not depend on seasonal job availability or vendor API changes.
14. As a maintainer, I want both bytes and tokenizer counts recorded, so that optimization is not accidentally tailored to one misleading metric.
15. As a maintainer, I want semantic invariants tested before Token thresholds, so that smaller output cannot pass by dropping essential identity data.
16. As an Agent platform integrator, I want the Skill entry file to be concise, so that activating the Skill has a low fixed context cost.
17. As an Agent platform integrator, I want detailed schemas and troubleshooting guidance in references, so that they are loaded only when needed.
18. As a security-conscious user, I want fewer untrusted third-party text fields in routine output, so that indirect Prompt injection exposure is reduced.
19. As a maintainer, I want invalid view names to fail clearly, so that typos cannot silently fall back to an unexpected data contract.
20. As a maintainer, I want benchmark reports to identify the command and fixture responsible for regressions, so that budget failures are actionable.

## 8. Functional Requirements

### FR-1：输出视图参数

岗位数据命令必须支持：

```text
--view compact|full|debug
```

适用命令：

- 单站点 `search`
- 单站点 `detail`
- 单站点 `all`
- 顶层 `compare`

行为要求：

- 未传 `--view` 时使用 legacy output。
- view 名称大小写不敏感，内部规范化为小写。
- 不支持的 view 必须抛出参数错误，使用 CLI 参数错误退出码，并列出合法值。
- view 只影响序列化前的数据投影，不得改变 registry 调用参数。
- table、CSV 和 Markdown 继续使用各命令已有列定义；第一阶段 `--view` 仅承诺 JSON 输出契约。
- 如果非 JSON 格式显式传入 `--view`，命令必须给出明确参数错误，防止用户误以为 view 已生效。

### FR-2：Compact job schema

compact job 必须按以下顺序输出字段：

1. `id`
2. `detail_id`
3. `name`
4. `category_name`
5. `nature_code`
6. `location_names`
7. `department_name`
8. `updated_at`
9. `url`

字段规则：

- `id`、`detail_id`、`name` 和 `nature_code` 为必备字段，必须始终存在。
- `detail_id` 从站点 adapter 声明的 detail ID 字段读取。
- 当 adapter 声明字段为空时，`detail_id` 回退为 `id`；该回退必须由测试覆盖。
- 其他字段在值为 `undefined`、`null`、空字符串或空数组时省略。
- 不输出 `description`、`requirement`、`raw`、源站编码字段、重复的名称字段和空的标准字段。
- 不缩写现有字段名。
- 字段值不得被截断、改写、翻译或摘要。

### FR-3：Full job schema

full view 必须：

- 保留岗位对象当前所有可枚举字段及其值。
- 仅移除顶层 `raw` 字段。
- 保留完整 `description` 和 `requirement`。
- 不改变字段顺序以外的任何值。
- 不修改输入对象。

### FR-4：Debug job schema

debug view 必须：

- 返回命令当前数据链路能够获得的全部可枚举字段。
- 对单站点 search、detail 和 all 保留 `raw`。
- 对 compare，保持库层当前“不返回 raw”的兼容约束；debug 表示 compare 当前可获得的全部字段，不要求额外重新抓取或改变 compare 库契约。
- 不修改输入对象。

### FR-5：容器结构保持

投影只能替换岗位对象，不能改变命令顶层结构：

- search 和 all 继续返回岗位数组。
- detail 继续返回单个岗位对象。
- compare 继续返回原有 query、筛选条件、站点列表和 results 分组。
- compare 的 `count` 必须与投影后的 jobs 数量一致，并与 legacy 相同。
- compare 的 partial failure 和 all-failed 行为不得改变。

### FR-6：Analyze summary-only

单站点 analyze 必须新增：

```text
--summary-only
```

行为要求：

- 第一阶段只允许与 `--format json` 组合。
- JSON 顶层输出固定为 `{ "summary": ... }`。
- summary 内容必须与相同参数、不带 `--summary-only` 时的 `summary` 深度相等。
- analyze 内部仍可读取完整岗位以计算词频和分布。
- summary-only 不得减少抓取范围或改变 `--max` 语义。
- 与 CSV、table、Markdown 一起使用时必须返回参数错误，并提示移除该参数或改用 JSON。
- 未传 `--summary-only` 时保持现有 JSON、CSV、table 和 Markdown 行为。

### FR-7：Legacy compatibility

- 所有不包含 `--view` 或 `--summary-only` 的现有命令，其 stdout JSON 结构必须保持不变。
- 所有已有默认 format 必须保持不变。
- 所有已有错误码、退出码、代理行为、升级提示和 stderr/stdout 分离规则必须保持不变。
- registry、analysis 和 compare 的公开库函数默认返回值必须保持不变。
- adapter interface 不增加必填方法。

### FR-8：Agent Skill 工作流

Skill 主文件必须将推荐命令更新为：

- 列举岗位：search compact。
- 跨公司比较：compare compact。
- 查看职责或任职要求：detail full。
- 分析分布和趋势：analyze summary-only。
- 批量交付：all full 并使用 `--output`。
- adapter 排错：debug。

Skill 不再要求每个任务开始时无条件运行完整 `sites --format json`。只有以下情况才进行动态发现：

- 用户公司名称无法可靠映射到站点 ID。
- 用户显式请求某招聘类型，需要确认站点是否支持。
- 命令返回未知站点或未支持招聘类型错误。

Skill 不再要求每次使用类别或地点参数前无条件运行完整 filters。Agent 应优先使用用户给出的中文名称或现有别名；只有解析失败、结果为空且怀疑筛选值无效，或用户要求列举全部筛选项时才读取 filters。

招聘类型确认、防止把未支持渠道伪装为社招、URL 原样使用和第三方文本防注入规则必须保留。

### FR-9：Skill 渐进式文档

Skill 包必须分为：

- 一个精简入口，包含意图路由、核心命令、输出视图选择规则和安全约束。
- 命令与参数 reference。
- 标准字段与招聘类型 reference。
- 错误处理与排障 reference。

入口文件必须说明何时读取每个 reference，不得在入口中重复完整 reference 内容。发布包必须包含所有 references。

### FR-10：批量输出保护

Skill 必须规定：

- `all --view full` 用于批量交付时必须配合 `--output`。
- Agent 只需要预览时使用有限 `--max` 和 compact view。
- 禁止为了分析趋势把不限量 full JSON 直接写入 stdout。
- 需要趋势时优先让 analyze 在进程内消费完整 JD，只向 Agent 返回 summary。

## 9. CLI Contract Examples

### 9.1 岗位发现

```bash
job meituan search AI --nature social --limit 20 --view compact --format json
```

预期：返回与 legacy 相同的 20 个岗位及相同顺序，但每个岗位仅包含 compact schema。

### 9.2 查看候选岗位详情

```bash
job meituan detail <detail_id> --nature social --view full --format json
```

预期：返回完整职责和要求，不返回 `raw`。

### 9.3 Adapter 排错

```bash
job meituan detail <detail_id> --nature social --view debug --format json
```

预期：返回当前完整数据，包括 `raw`。

### 9.4 跨公司初步比较

```bash
job compare AI --sites meituan,xiaomi --nature social --max 20 --view compact --format json
```

预期：保持原顶层分组和 partial failure 行为，`results[].jobs[]` 使用 compact schema。

### 9.5 趋势分析

```bash
job meituan analyze AI --nature social --max 100 --summary-only --format json
```

预期：只返回 summary，不返回 jobs。

### 9.6 批量交付

```bash
job meituan all AI --nature social --view full --format json --output meituan-ai.json
```

预期：完整标准岗位写入文件，stdout 不承载岗位数组。

## 10. Architecture and Implementation Decisions

### 10.1 深模块：输出投影器

新增一个无网络、无文件写入、无 CLI 依赖的纯投影模块。它应封装：

- view 名称规范化与校验。
- 单个岗位投影。
- 岗位数组投影。
- compare 容器内岗位投影。
- 空字段判断。
- detail ID 解析与回退。

该模块的公开接口应保持小而稳定，调用方只需提供岗位值、view 和站点 detail ID 元信息。模块必须返回新对象，禁止修改 adapter 或 registry 返回的原对象。

### 10.2 CLI 编排

CLI 层负责：

- 为适用命令注册 `--view`。
- 在 registry 调用完成后、formatter 调用前执行投影。
- 为 compact view 传入站点 detail ID 元信息。
- 根据命令容器选择单对象、数组或 compare 投影。
- 对非 JSON view 组合和非法 view 给出一致的参数错误。
- 处理 analyze summary-only 的格式约束。

CLI 层不得复制 compact 字段列表或直接删除字段，所有投影规则必须集中在投影模块。

### 10.3 Formatter

第一阶段 formatter 行为保持不变。JSON 继续使用当前 pretty JSON，以确保本次收益可以明确归因于字段和工作流优化。是否增加紧凑 JSON 由 follow-up benchmark 决定。

### 10.4 Registry 与 adapter

registry 和 adapter 不感知 view。它们继续返回完整标准对象，确保：

- analyze 能在进程内读取完整 JD。
- 库消费者不受 CLI 优化影响。
- view 不会意外改变网络请求和分页行为。

### 10.5 Analyze

analysis 核心继续返回 summary、rows 和 Markdown。summary-only 由 CLI 输出编排选择 `{ summary }`，避免削弱库调用方现有能力。

### 10.6 Compare

compare 核心的默认库契约保持不变，包括移除 raw、并发池、partial failure 和 all-failed 行为。CLI 只投影 `results[].jobs`，不重新实现 compare 拉取。

### 10.7 Token 计量

Token benchmark 使用固定版本、纯 JavaScript、支持 `o200k_base` 的 tokenizer 作为开发依赖，并锁定依赖版本。报告同时输出：

- UTF-8 bytes。
- 字符数。
- `o200k_base` Token 数。
- 相对 legacy 的绝对减少量和百分比。

如果后续增加第二 tokenizer，只作为辅助报告；主 CI budget 在同一版本周期内不得更换编码器。升级 tokenizer 必须显式更新 baseline 并记录原因。

## 11. Testing Decisions

### 11.1 测试原则

- 优先测试外部可观察行为，不断言内部函数调用次数以外的实现细节。
- Token 测试必须离线、确定性、可在任意时间重复。
- 先验证语义不变，再验证体积下降；语义失败时不得用 Token 下降掩盖问题。
- 在线 smoke 只验证真实站点仍能运行，不承担 Token budget 断言。
- fixture 应脱敏并尽量短小，但必须保留真实岗位数据的长中文 JD、英文技术词、空字段和混合数组特征。

### 11.2 Fixture 套件

至少包含：

1. 10 条长中文职责和要求的岗位。
2. 10 条中英文混合技术岗位，包含 AI、C++、RAG 等 tokenizer 特征。
3. 5 条短岗位，防止只针对长文本优化。
4. detail ID 字段使用 `id` 的站点样本。
5. detail ID 字段使用 `code` 的站点样本。
6. 缺失 `code`、需要回退到 `id` 的防御性样本。
7. 包含空字符串、null、undefined 和空数组的岗位。
8. 包含嵌套 raw 的岗位。
9. 两个成功站点和一个失败站点组成的 compare payload。
10. 包含完整 summary 和 rows 的 analyze result。

不得直接保存持续变化的在线 API 完整响应。fixture 只保留测试所需的标准化字段，并对岗位名称、ID 和文本进行必要脱敏。

### 11.3 投影测试

必须覆盖：

- compact 字段集合和字段顺序。
- compact 空字段省略规则。
- detail ID 使用 `id`、使用 `code` 和 fallback 三种路径。
- full 仅移除 raw。
- debug 保留 raw。
- 投影不修改输入对象及嵌套 raw。
- 数组顺序不变。
- 非法 view 返回统一参数错误。
- view 大小写规范化。

### 11.4 容器测试

必须覆盖：

- search/all 数组投影后 identity 和顺序不变。
- detail 仍是对象而不是单元素数组。
- compare 顶层字段、results 顺序、count、error 和 jobs 顺序不变。
- compare 部分失败时只投影成功站点 jobs。
- compare 全部失败的错误行为不变。

### 11.5 Analyze 测试

必须覆盖：

- summary-only JSON 只包含 summary。
- summary 与 legacy JSON 内的 summary 深度相等。
- summary-only 不改变 analyze 的抓取参数和 max 语义。
- summary-only 与非 JSON 格式组合时返回参数错误。
- 未带 summary-only 时旧输出保持不变。

### 11.6 CLI 兼容测试

为代表性命令保存结构断言或 snapshot：

- 无 view 的 search JSON 与 legacy fixture 一致。
- 无 view 的 detail JSON 与 legacy fixture 一致。
- 无 view 的 all JSON 与 legacy fixture 一致。
- 无 view 的 compare JSON 与 legacy fixture 一致。
- compact、full、debug 的 CLI 参数能正确路由。
- 非 JSON 格式加 view 明确失败。
- stdout 仍保持纯数据，错误和升级提示仍在 stderr。

### 11.7 Skill 测试

Skill 通过静态检查和人工场景验收：

- 主文件不存在“每次任务都运行完整 sites”的要求。
- 主文件不存在“每次筛选前都运行完整 filters”的要求。
- 列表和 compare 示例使用 compact。
- 职责/要求场景使用 detail full。
- 趋势场景使用 summary-only。
- 批量 full 输出使用 `--output`。
- debug 仅用于排错。
- 防注入、招聘类型和 URL 安全规则仍存在。
- references 均被发布包包含，入口中的相对链接有效。

### 11.8 任务级质量验收

使用 fixture 设计以下人工验收任务，并记录 legacy 与新工作流的答案证据：

1. 列出指定公司 AI 岗位及城市。
2. 对比两个公司的 AI 岗位数量、类别和地域。
3. 找出三个候选岗位并总结完整任职要求。
4. 分析技能、地点和部门分布。
5. 导出完整岗位文件并报告文件位置与行数。

验收要求：

- 任务 1、2 的岗位集合和展示事实一致。
- 任务 3 必须通过 detail full 获取证据，完整要求不得因 compact 丢失。
- 任务 4 的 summary 数值与 legacy 完全一致。
- 任务 5 的文件内容与 legacy full 去除 raw 后一致。
- 不使用外部 LLM judge 作为 CI 门禁；人工验收记录用于发布评审。

## 12. Token Budget and Acceptance Criteria

### 12.1 命令级门槛

以 fixture 套件的 legacy pretty JSON 为同命令基线：

- search compact：加权平均 Token 至少降低 75%。
- compare compact：加权平均 Token 至少降低 75%。
- all compact：加权平均 Token 至少降低 75%。
- analyze summary-only：Token 至少降低 85%。
- full：Token 必须小于或等于 legacy，并且差异只来自 raw 移除。
- debug：允许与 legacy 相等，不要求降低。
- 任何 compact 样本不得比对应 legacy 更大。

短文本样本可能无法单独达到 75%，因此门槛使用固定权重的 fixture 套件总量，而不是要求每个样本独立达标。fixture 权重一经发布不得为了让测试通过而随意调整。

### 12.2 Workflow 门槛

以下工作流分别计算 Skill 入口、CLI stdout 和必要 stderr 的 Token 总和：

- 岗位列表工作流。
- 跨公司比较工作流。
- 候选岗位职责/要求工作流。
- 招聘趋势工作流。
- 文件导出工作流。

验收要求：

- 五个工作流 Token 总量 P50 至少降低 60%。
- 任一工作流不得比 legacy 增加超过 10%。
- 职责/要求工作流必须同时记录 CLI 调用次数和读取的 full JD 数量。
- 新工作流不得通过减少搜索 limit、max 或站点数来满足预算。

### 12.3 Skill 门槛

- Skill 入口文件 `o200k_base` Token 至少降低 50%。
- Skill 入口文件 UTF-8 bytes 目标不超过 5 KB。
- references 不计入固定入口预算，但必须分别报告体积。

### 12.4 功能门槛

- legacy 兼容测试全部通过。
- identity 数量和顺序一致性测试全部通过。
- full/debug 字段契约测试全部通过。
- analyze summary 深度相等测试全部通过。
- 项目现有单元测试全部通过。
- CLI smoke 通过。
- 招聘类型矩阵 smoke 不因本次改动产生新失败。
- 发布包 dry-run 包含 Skill references 和新增文档。

## 13. Benchmark Report Contract

Token benchmark 必须生成易于 CI 阅读的控制台表格，并支持机器可读 JSON。每个场景至少报告：

- scenario 名称。
- fixture 名称。
- legacy bytes、chars、tokens。
- candidate bytes、chars、tokens。
- token delta。
- reduction percentage。
- pass/fail 和对应 threshold。

进程退出规则：

- 所有预算和语义断言通过时退出 0。
- 任一预算或语义断言失败时非零退出。
- tokenizer 不可用、fixture 无法解析或 baseline 缺失时非零退出，不得跳过。

benchmark JSON 中必须记录 tokenizer 名称和版本，以便未来解释基线变化。

## 14. Error Handling

- 非法 view 使用统一参数错误，不得使用通用网络错误。
- view 与非 JSON 格式冲突时，错误信息必须给出可执行的修复建议。
- summary-only 与非 JSON 格式冲突时，提示改用 `--format json` 或移除 `--summary-only`。
- compact 无法解析 detail ID 时回退到 id；如果 id 也为空，保留空 `detail_id` 并由现有岗位完整性测试暴露，不得静默生成伪 ID。
- 投影过程不得吞掉 compare 的站点 error。
- projection 自身不得访问网络或文件系统，因此不新增重试行为。

## 15. Security and Privacy

- compact 不包含 description、requirement 或 raw，从默认 Agent 列表路径减少第三方不可信文本暴露。
- full 中的 description 和 requirement 仍属于不可信第三方数据，Skill 必须保留只读处理和防间接 Prompt 注入约束。
- debug 的 raw 可能包含供应商扩展字段，只用于排错，不得作为推荐分析输入。
- Token fixture 必须脱敏，不保存个人联系方式、内部代理地址、Cookie、请求头或其他凭据。
- benchmark 输出只包含体积指标，不打印完整 fixture JD。

## 16. Documentation Requirements

实施必须同步更新：

- README 的输出格式与 Agent 使用示例。
- Agent Skill 入口和 references。
- CLI help 中的 view 与 summary-only 说明。
- 变更记录，说明内容、原因、兼容性和影响范围。
- 如新增开发依赖，记录其仅用于离线 Token 测试，不进入运行时依赖。

文档必须明确：

- 不传新参数时保持 legacy。
- compact 用于发现，不包含完整 JD。
- full 用于详情和文件交付，不包含 raw。
- debug 用于排错。
- summary-only 不改变 analyze 的内部分析范围。

## 17. Rollout Plan

### Phase 0：固定基线

1. 建立脱敏 fixture。
2. 引入固定 tokenizer。
3. 对 legacy search、detail、all、compare、analyze 和现有 Skill 入口记录 baseline。
4. 在实现新视图前提交并审查 baseline，确保指标真实可复现。

### Phase 1：核心输出投影

1. 实现纯输出投影器。
2. 接入 search、detail、all 和 compare 的 JSON 输出。
3. 实现 analyze summary-only。
4. 补齐投影、容器、兼容和 Token budget 测试。

### Phase 2：Agent 工作流

1. 精简 Skill 入口。
2. 拆分 references。
3. 将典型场景改为 compact、detail full、summary-only 和文件输出。
4. 完成任务级人工验收。

### Phase 3：发布验证

1. 运行全部单元测试。
2. 运行 Token budget。
3. 运行 CLI smoke 和招聘类型矩阵 smoke。
4. 运行发布包 dry-run，检查 references 和文档。
5. 在变更记录中写明实测 Token 结果。
6. 以 minor version 发布，因为默认行为未改变且只新增显式能力。

## 18. Implementation Work Breakdown

建议按以下顺序实施：

1. 添加 fixture、tokenizer 和 legacy benchmark。
2. 添加输出投影深模块及单元测试。
3. 为单站点岗位命令接入 view。
4. 为 compare 容器接入 view。
5. 为 analyze 接入 summary-only。
6. 添加 CLI 兼容与错误组合测试。
7. 重构 Skill 为入口加 references。
8. 添加 workflow benchmark 和人工验收记录。
9. 更新 README、CLI help 和变更记录。
10. 完成 smoke、dry-run 和发布评审。

为了降低评审风险，推荐拆成两个 PR：

- PR A：baseline、projection、CLI contract、tests。
- PR B：Skill、references、workflow benchmark、documentation。

两个 PR 都必须独立更新变更记录。PR A 合并后仍保持旧 Skill 可用；PR B 合并后 Agent 才开始默认使用 compact 工作流。

## 19. Risks and Mitigations

### 风险 1：Compact 降低候选岗位判断质量

缓解：compact 只用于岗位发现；需要职责或能力判断时必须调用 detail full。通过任务级人工验收验证。如果仍有明显质量损失，再单独设计带查询命中片段的 preview view，不在本次预先实现。

### 风险 2：新增 detail 调用增加延迟

缓解：记录职责工作流的调用次数和 full JD 数量；只对少量候选岗位取详情。若实际延迟不可接受，再评估批量 detail，不在本次扩大范围。

### 风险 3：只针对一种 tokenizer 优化

缓解：同时报告 bytes、chars 和固定 tokenizer Token；不使用字段缩写或模型私有格式。

### 风险 4：Skill references 未被发布或无法按需读取

缓解：发布包 dry-run、相对链接检查和安装后 smoke 必须覆盖 references。

### 风险 5：Legacy 脚本依赖 raw

缓解：未传 view 时完全保持 legacy；debug 显式保留 raw；本次不翻转默认值。

### 风险 6：Benchmark fixture 被人为调整以通过门槛

缓解：baseline 与实现分阶段提交；fixture 和权重变更必须单独说明原因并重新评审。

## 20. Future Follow-ups

只有核心版本通过验收后，才评估以下独立优化：

- `job sites [query]` 或单站点 capability 查询。
- filters 的 group/query 本地过滤。
- minified JSON 或 JSONL。
- 查询命中位置附近的 preview snippet。
- 批量 detail。
- 面向大规模导出的流式写入。
- 在后续 major version 中让 compact 成为 Agent 或 JSON 默认视图。

每个 follow-up 都必须用 benchmark 证明相对于新增复杂度有足够收益。

## 21. Definition of Done

PER-133 只有在以下条件全部满足时才可关闭：

1. 所有功能门槛通过。
2. Token budget 达标并有机器可读报告。
3. 五个任务级场景完成验收，回答证据和 legacy 一致。
4. Skill 入口达到体积目标，references 正确发布。
5. 默认 CLI 和库行为保持兼容。
6. README、Skill、CLI help 和变更记录同步。
7. smoke 和发布包检查通过。
8. Linear Issue 中记录最终实测结果、已知限制和 follow-up issue 链接。

## 22. Further Notes

- 本规格刻意把“减少输出数据”与“减少抓取数据”分开。第一阶段只优化 Agent 上下文，不冒险改变招聘官网查询语义。
- 当前样本表明字段投影是主要收益来源；JSON 空白压缩不是发布阻塞项。
- `detail_id` 是减少 discovery 往返的关键字段。它属于 CLI compact view，不要求修改所有 adapter 的标准岗位 schema。
- 由于本规格不改变默认行为，初始收益主要由新版 Agent Skill 显式选择 compact 和 summary-only 获得。
