# 招聘类型扩展：执行与验收 Spec

> 状态：Ready for Agent  
> 目标版本：`0.2.0-beta.0`  
> 范围：现有 36 个站点 adapter  
> 发布边界：允许本地预发布包验证，不执行 `npm publish`

## Problem Statement

JobHunt-CLI 已经统一了 36 个公开招聘站点，但当前实现主要面向社招。CLI 虽然暴露了 `--nature`，多数 adapter 仍把社招入口、请求参数、筛选项、详情 URL、Referer 和输出字段写死，导致该参数无法稳定表达校招与实习。

用户需要继续使用同一个公司命令，明确查询社招、校招、实习或全部类型，同时保持现有脚本默认查询社招。执行 Agent 还需要以公开官网的真实请求为依据完成 36 站点审计，不能因为官网没有公开入口而伪造支持。

## Solution

把 `--nature` 提升为所有站点共享的招聘类型契约，统一支持：

| 标准值 | 中文含义 | 用途 |
| --- | --- | --- |
| `social` | 社招 | 有经验人才和社会招聘岗位 |
| `campus` | 校招 | 应届全职、春招、秋招和毕业生项目 |
| `intern` | 实习 | 日常实习、暑期实习和实习生岗位 |
| `all` | 全部 | 查询参数，仅聚合站点已经支持的类型 |

36 个 adapter 全部迁移到新契约并声明能力。某类型只有在 `filters/search/detail/all` 均稳定实现后才能标记 supported。官网不存在公开入口时，该类型明确标记 unsupported。

接口调研必须以 Chrome DevTools MCP 捕获的官方页面真实网络请求为主要证据。普通网页搜索、现有源码、前端 bundle 和 URL 命名只能辅助定位，不能替代 DevTools 取证。

## Goals

1. 让现有 `--nature` 对所有相关命令真实生效。
2. 保持 36 个现有公司命令和 site ID 不变。
3. 保持省略 `--nature` 时默认查询社招。
4. 统一跨公司的招聘类型输出。
5. 提供可发现、可验证的站点能力元数据。
6. 安全支持跨类型搜索、导出和分析，不并发轰炸招聘官网。
7. 建立离线契约测试、低流量 live smoke 和发布前矩阵验收。
8. 更新用户文档、新增站点方法论、Agent skill 和变更记录。

## User Stories

1. 作为 CLI 用户，我希望继续使用 `job <site>`，从而不需要记忆新的校招站点命令。
2. 作为社招用户，我希望旧命令不传 `--nature` 时仍查询社招，从而保持脚本兼容。
3. 作为应届生，我希望使用 `--nature campus` 查询校招岗位，从而排除社招和实习岗位。
4. 作为实习生，我希望使用 `--nature intern` 查询实习岗位，从而不把应届全职岗位混入结果。
5. 作为研究者，我希望使用 `--nature all` 查看站点全部已支持类型，从而进行招聘结构比较。
6. 作为脚本作者，我希望 `nature_code` 在所有公司都使用相同枚举，从而能够可靠聚合。
7. 作为调试者，我希望官网原始招聘类型保留在 `raw`，从而排查映射错误。
8. 作为用户，我希望显式请求未支持类型时得到明确错误，从而区分“未接入”和“暂无岗位”。
9. 作为用户，我希望 `sites` 输出每个站点支持的招聘类型，从而在请求前发现能力。
10. 作为用户，我希望 `filters` 能按招聘类型返回正确的城市和岗位类别，从而避免跨渠道编码污染。
11. 作为用户，我希望 `detail` 明确接收招聘类型，从而不会因 ID 碰撞或接口猜测获得错误岗位。
12. 作为数据分析用户，我希望 `analyze` 能按招聘类型筛选并展示类型分布，从而获得准确结论。
13. 作为批量导出用户，我希望 `--max` 在 `all` 模式下仍是全局上限，从而控制数据量和请求量。
14. 作为招聘站点维护者，我希望跨类型请求顺序执行并遵循限速，从而降低触发风控的概率。
15. 作为维护者，我希望季节性空校招能够被正确记录，从而不把当前无岗位误判为接口失效。
16. 作为维护者，我希望共享供应商 adapter 仍逐站验证 channel 和能力，从而避免错误套用配置。
17. 作为 Agent 用户，我希望意图不明确时 Agent 先询问招聘类型，从而避免默认猜错。
18. 作为 Agent 用户，我希望“全部”默认先进行小规模预览，从而避免无意发起全量抓取。
19. 作为发布者，我希望有可重复的 36 站点验收矩阵，从而知道预发布版本的真实覆盖范围。
20. 作为项目负责人，我希望预发布验证不自动上传 npm，从而在人工验收前保留发布控制权。

## Implementation Decisions

### 1. 标准类型与能力模型

- 建立独立、可离线测试的招聘类型模块，负责标准值、中文/英文别名、默认值、`all` 展开和能力校验。
- 全局别名只包含无歧义语义；供应商数字编码只在对应 adapter 内兼容。
- 每个 adapter 必须声明 `supportedNatures` 和 `defaultNature`。
- adapter 的 `filters/search/detail/all` 都接收规整后的单一招聘类型；`all` 只在核心聚合层出现，不下传为供应商编码。
- `listSites` 暴露 `supported_natures` 和 `default_nature`。

### 2. CLI 契约

- `filters`、`search`、`detail`、`all`、`analyze` 均支持 `--nature`。
- 省略参数统一解析为 `social`。
- `detail --nature all` 在发起网络请求前报错，因为详情必须确定唯一渠道。
- 显式请求未支持类型时返回 `UNSUPPORTED_NATURE` 类参数错误，并展示支持值。
- 未知类型返回 `INVALID_NATURE` 类参数错误。
- `sites` 的表格和 JSON 输出都展示站点能力。

### 3. 标准输出

- 岗位 `nature_code` 只能是 `social`、`campus` 或 `intern`。
- 岗位 `nature_name` 只能是 `社招`、`校招` 或 `实习`。
- 官网原始类型保存为 `raw.source_nature_code` 和 `raw.source_nature_name`。
- 岗位裸 `id` 保持官网值；跨类型去重键使用 `nature_code + id`。
- 校招渠道中有明确实习标记的岗位必须归类为 `intern`。
- 类型判定优先级：官网枚举、官方隔离渠道、站点级明确映射、最后才允许有 fixture 的标题兜底。

### 4. Filters 契约

- 指定单一类型时，返回该渠道实际可用的 category/location 等筛选项。
- `filters --nature all` 聚合所有已支持渠道，筛选行增加 `applies_to`。
- 跨渠道筛选项按 `applies_to + group + parent + code` 去重。
- `nature` group 由核心层根据能力元数据生成，避免供应商编码泄漏为标准值。

### 5. 跨类型聚合

- `--nature all` 仅展开站点声明支持的类型。
- 任一已支持渠道失败时整个命令失败，不返回未标明的部分结果。
- 本期不提供 `--best-effort`。
- `search --limit N` 和 `all/analyze --max N` 的 N 都是合并后的全局上限。
- 聚合请求顺序执行，采用有界配额和剩余额度再分配；禁止为了均匀结果并发请求。
- `--max 0` 才拉取所有已支持类型的全量岗位。
- 各 adapter 继续执行总页数和短页双终止，并使用 Set 去重。

### 6. 网络与风控

- 不新增跨站点或跨渠道默认并发。
- 使用站点允许的最大安全分页，不盲目放大 page size。
- 429 必须尊重 `Retry-After`；只对幂等读取做有限退避。
- 完整 live matrix 人工触发并支持站点间隔、断点续跑和低数据量。
- 不使用登录态、个人 Cookie、验证码绕过或非公开接口。

### 7. Agent Skill 行为

- 用户未说明招聘类型时，Agent 先问：“你想查社招、校招、实习，还是全部类型？”
- 明确提到应届、校招、春招、秋招或毕业生时直接使用 `campus`。
- 明确提到实习、暑期实习或日常实习时直接使用 `intern`。
- 用户选择全部时先做小规模预览；明确要求全量导出或分析时才使用 `--max 0`。
- 详情请求必须沿用搜索结果的 `nature_code`。
- unsupported 不允许自动回退社招。

## Chrome DevTools MCP Research Protocol

### 工具优先级

1. Chrome DevTools MCP：接口事实和验收证据的主要来源。
2. 仓库源码和前端 bundle：用于寻找入口、参数名和签名实现线索。
3. Node/curl 最小探针：在 DevTools 取证后验证公开请求可重复性。
4. 普通网页搜索：只用于发现官方入口，不作为接口契约证据。

不要使用 agent-browser 替代 Chrome DevTools MCP 完成接口抓包。

### 每个站点、每个候选类型的步骤

1. 使用 `navigate_page` 打开官方招聘入口。
2. 使用 `wait_for` 等待岗位列表或“暂无岗位”状态稳定。
3. 使用 `list_network_requests` 检查 Fetch/XHR。
4. 定位筛选、列表和详情请求。
5. 使用 `get_network_request` 读取完整 Request/Response。
6. 在页面中真实切换招聘类型、分类、城市和分页，对比请求差异。
7. 分别触发校招职位和实习职位，确认 channel、枚举或岗位属性。
8. 在无登录状态下验证最小请求仍可工作。
9. 记录官方页面、验证日期、触发动作、请求路径、关键参数、响应路径和结论。
10. 脱敏 Cookie、token、CSRF、签名、设备 ID 和个人信息。

### DevTools 证据门槛

每个 `SUPPORTED` 类型至少需要：

- 一条官方入口页面证据。
- 一条列表请求证据。
- 一条筛选请求证据，或“接口无独立筛选”的页面行为说明。
- 一条详情请求证据，或列表已包含完整详情的响应证据。
- 一次类型切换前后的参数或路径对比。
- 一次无登录状态验证。

`UNSUPPORTED_NO_PUBLIC_CHANNEL` 也必须记录检查过的官方导航、页面、网络请求范围和日期。不能仅根据现有代码没有常量就判定 unsupported。

## 36-Site Execution Matrix

执行 Agent 必须为每一行补充 `social/campus/intern` 状态、官方入口、DevTools 证据摘要、验证日期和测试结果。

合法状态：`SUPPORTED`、`UNSUPPORTED_NO_PUBLIC_CHANNEL`、`NO_LIVE_JOBS`、`BLOCKED_API_CHANGE`。

| Site ID | 公司/站点 | 实现族 | 当前调研重点 |
| --- | --- | --- | --- |
| `didi` | 滴滴 | 独立 | social 路由、channelId、校招详情路径 |
| `kuaishou` | 快手 | 独立签名 | C001/C002、校招频道、详情签名参数 |
| `bytedance` | 字节跳动 | 独立 | portal/recruitment filter、同 API 复用性 |
| `meituan` | 美团 | 独立 | jobType 3/1、实习 subCode、详情 share type |
| `xiaomi` | 小米 | 独立/飞书协议 | recruitment id、portal type、详情 query |
| `tencent` | 腾讯 | 独立 | attrId 或独立校招 API、详情 ID |
| `baidu` | 百度 | 独立/SSR | 校招列表参数、SSR 详情、实习分类 |
| `jd` | 京东 | 独立 | 类型路径、校招/实习 job URL |
| `xiaohongshu` | 小红书 | 独立 | recruitType/applyType、filter enums |
| `bilibili` | 哔哩哔哩 | 独立 | campus position API、recruitType/workType |
| `netease` | 网易 | 独立 | queryPage 类型参数和详情查询 |
| `ctrip` | 携程 | 独立 | Regular/Intern kind、校招入口 |
| `huawei` | 华为 | 独立 | SR/campus jobType、专属 filters 和详情 |
| `dji` | 大疆 | 独立 | recruitmentName、校招/实习列表和详情 |
| `ant` | 蚂蚁集团 | 独立/CPO 类似 | social/campus API、项目 channel |
| `mihoyo` | 米哈游 | 独立 | hireType 枚举、筛选和详情 |
| `moonshot` | 月之暗面 | Moka | campus/intern site ID、加密响应 |
| `deepseek` | DeepSeek | Moka | 是否存在公开校招/实习入口 |
| `dewu` | 得物 | Feishu SaaS | portal type、recruitment list、详情回查 |
| `minimax` | MiniMax | Feishu SaaS | portal type、recruitment list、详情回查 |
| `zhipu` | 智谱 | Feishu SaaS | portal type、recruitment list、详情回查 |
| `taotian` | 淘天集团 | Alibaba CPO | campus/intern channel、positionType |
| `taobao-shangou` | 淘宝闪购 | Alibaba CPO | campus/intern channel、positionType |
| `fliggy` | 飞猪 | Alibaba CPO | campus/intern channel、positionType |
| `alibaba-intl` | 阿里国际 | Alibaba CPO | campus/intern channel、positionType |
| `aliyun` | 阿里云 | Alibaba CPO | campus/intern channel、positionType |
| `tongyi` | 通义实验室 | Alibaba CPO | campus/intern channel、positionType |
| `dingtalk` | 钉钉 | Alibaba CPO | campus/intern channel、positionType |
| `quark` | 千问 C 端事业群 | Alibaba CPO | campus/intern channel、positionType |
| `thead` | 平头哥 | Alibaba CPO | campus/intern channel、positionType |
| `amap` | 高德地图 | Alibaba CPO | campus/intern channel、positionType |
| `cainiao` | 菜鸟 | Alibaba CPO | campus/intern channel、positionType |
| `hujing` | 虎鲸文娱 | Alibaba CPO | campus/intern channel、positionType |
| `freshippo` | 盒马 | Alibaba CPO | campus/intern channel、positionType |
| `alihealth` | 阿里健康 | Alibaba CPO | campus/intern channel、positionType |
| `lingxi` | 灵犀互娱 | Alibaba CPO | campus/intern channel、positionType |

共享供应商只能复用协议实现，不能复用未经验证的能力结论。Alibaba CPO 15 个配置和 Feishu SaaS 3 个配置都必须逐站用 DevTools 验证入口、channel/site ID 和响应。

## Repository Change Checklist

### 当前 adapter 接入基线

项目当前新增或调整站点的标准路径是：

1. 通过官方招聘页和 Chrome DevTools 调研列表、筛选和详情接口。
2. 在站点 `utils.js` 中维护请求、别名、分页、字段归一化和 URL。
3. 在站点 `index.js` 中暴露 adapter 元数据与 `filters/search/detail/all`。
4. 在 registry 注册 adapter；本任务不新增 site ID，只扩展现有契约。
5. 为站点增加或调整 smoke 脚本，并注册相应 package script。
6. 手动验证 CLI 的 filters、search、detail、all 和 analyze。
7. 更新 README、新增站点方法论文档和 Agent skill。
8. 所有代码、配置、文档、测试和结构修改同步记录到 CHANGES。

### 本任务的仓库触点

- Core：新增 nature 深模块；调整 registry 聚合、错误语义和公开库导出。
- CLI：补齐 filters/detail 选项、sites 能力展示和 help。
- Analysis：传递标准 nature，并增加招聘类型分布和命令回显。
- Adapters：36 个站点补充能力元数据、渠道路由、标准化与正确 job URL。
- Shared providers：Alibaba CPO、Feishu SaaS 和 Moka 相关实现优先抽取共享配置，避免复制社招代码。
- Tests：新增 Node 内置测试、fake adapter 契约测试和脱敏 fixtures。
- Smoke：现有脚本支持显式 nature；新增顺序、低流量矩阵 runner。
- Package：注册测试/矩阵命令，最终把版本标记为 `0.2.0-beta.0`。
- Docs/Skill：更新 README、ADDING_SITE、能力证据矩阵和 jobhunt-cli skill。
- Changes：每一实施批次都同步记录，不等到最后一次性补写。

## Execution Plan

### Phase 0：基线与证据模板

- 安装依赖但不无意新增 lockfile。
- 记录当前 36 站点清单、社招 smoke 状态和 CLI help。
- 建立招聘类型能力矩阵和 DevTools 证据模板。
- 建立脱敏规则和 `NO_LIVE_JOBS` fixture 规则。

Gate：36 行矩阵齐全，调研字段和合法状态已定义。

### Phase 1：公共契约

- 实现标准 nature 模块、能力校验和错误语义。
- 扩展 registry、CLI 和 adapter 方法签名。
- 实现 filters/search/all 聚合与 detail 单渠道规则。
- 用 fake adapters 完成离线契约测试。

Gate：不访问真实官网即可验证默认 social、all、unsupported、全局 max、失败传播和去重。

### Phase 2：试点站点

- 优先调研并实现 Xiaomi、Meituan、Kuaishou。
- 每个站点先完成 DevTools 证据，再实现和 live smoke。
- 根据试点结果修正公共抽象，避免先铺开错误接口。

Gate：至少一个站点完整支持三类，或以官方证据说明缺失类型；公共接口稳定。

### Phase 3：共享实现族

- Alibaba CPO 15 站点：共享协议改造、逐站能力验证。
- Feishu SaaS 3 站点：共享 portal/recruitment 改造、逐站能力验证。

Gate：18 个站点逐行有 DevTools 证据和测试状态，不能只验证代表站点。

### Phase 4：其余独立站点

- 依次完成传统独立 adapter。
- 最后处理 Moka 的 Moonshot 和 DeepSeek，避免加密/站点 ID 调研阻塞公共能力。

Gate：36 行无未解释空白；任何 blocked 都包含外部事实、已尝试动作和用户可决策项。

### Phase 5：全矩阵测试与文档

- 运行离线契约测试。
- 顺序运行低流量 live matrix。
- 更新 README、新增站点文档、能力证据文档、skill 和 CHANGES。
- 修正 analyze 报告中的类型条件和类型分布。

Gate：无未解释 FAIL，NO_LIVE_JOBS 有 fixture，unsupported 有 DevTools 调研记录。

### Phase 6：本地预发布

- 将版本改为 `0.2.0-beta.0`。
- 执行 `npm pack --dry-run` 和 `npm pack`。
- 在临时目录安装 tarball，验证 CLI help、sites、filters、search、detail、all 和 analyze 的基础行为。
- 不执行 npm publish。

Gate：预发布包可安装、能力元数据和文档随包发布，用户验收材料完整。

## Testing Decisions

### 测试原则

- 离线测试只观察公共行为，不绑定内部函数布局。
- live smoke 验证官方接口真实可用，但不作为每次 CI 默认步骤。
- API 返回 fixture 必须最小化、脱敏，并保留影响解析的关键结构。
- 当前无岗位、接口失败和未支持是三种不同状态。

### 离线测试

使用 Node 内置 `node:test`，不引入 Jest/Vitest。至少覆盖：

- nature 别名、默认值、all 和非法值。
- 站点能力发现和 unsupported 错误。
- detail all 拒绝且无网络调用。
- filters 的 applies_to 和跨渠道去重。
- search/all 聚合的全局上限、额度再分配、确定性顺序。
- 任一支持渠道失败时整体失败。
- nature + id 去重。
- 标准 nature 输出和 source nature 保留。
- 分页双终止、max=0 和短页结束。
- analyzer 的类型条件和类型分布。
- 36 个 adapter metadata contract。
- 共享工厂逐配置 contract。

### Live smoke

单站点、单类型显式运行，每次只取 1–3 条：

```bash
node bin/job.js <site> filters --nature <type> --format json
node bin/job.js <site> search --nature <type> --limit 1 --format json
node bin/job.js <site> detail <id> --nature <type> --format json
node bin/job.js <site> all --nature <type> --max 3 --format json
```

完整矩阵 runner 必须：

- 人工触发，CI 默认不运行。
- 跨站点、跨渠道顺序执行。
- 支持 site/nature 过滤、可配置间隔和断点续跑。
- 输出 `PASS`、`NO_LIVE_JOBS`、`EXPECTED_UNSUPPORTED`、`FAIL` 汇总。
- 遇到 429 尊重 Retry-After，禁止无限重试。

## Acceptance Criteria

### 公共行为

- [ ] 省略 `--nature` 的现有命令仍查询社招。
- [ ] `social/campus/intern/all` 及约定中英文别名可解析。
- [ ] 未知类型在网络请求前失败。
- [ ] 显式 unsupported 在网络请求前失败并列出支持值。
- [ ] `sites` 返回 `supported_natures/default_nature`。
- [ ] `filters` 和 `detail` 已支持 `--nature`。
- [ ] `detail --nature all` 明确失败。
- [ ] `nature_code/name` 在所有结果中标准化。
- [ ] `raw.source_nature_code/name` 可用于调试且不含敏感值。

### 聚合与风控

- [ ] `--nature all` 只查询已支持类型。
- [ ] 任一支持渠道失败时整体失败。
- [ ] `limit/max` 是全局上限。
- [ ] 不同类型相同裸 ID 不会互相去重。
- [ ] 聚合请求不并发。
- [ ] 全量分页具备总页数和短页双终止。
- [ ] 429 和 Retry-After 行为有测试或可重复证据。

### 单站点、单类型

每个声明 `SUPPORTED` 的类型均满足：

- [ ] DevTools 官方入口、列表、筛选、详情证据齐全。
- [ ] 无登录状态可访问。
- [ ] filters 返回该渠道有效筛选项。
- [ ] search 返回的岗位类型、ID、名称和 URL 正确。
- [ ] 有在线岗位时 detail 与 search 同渠道、同 ID。
- [ ] all 不超过 max、无重复、可正常终止。
- [ ] job URL 指向正确招聘渠道。
- [ ] fixture 或 live 响应覆盖字段归一化。

### 季节性空岗位

- [ ] 官方渠道和有效空响应已通过 DevTools 验证。
- [ ] 状态记录为 `NO_LIVE_JOBS`，不伪装 PASS 或 unsupported。
- [ ] 有脱敏 fixture 验证解析和归一化。
- [ ] smoke 不在无岗位时强行调用 detail。

### Unsupported

- [ ] 有检查过的官方入口、网络请求范围和验证日期。
- [ ] 状态为 `UNSUPPORTED_NO_PUBLIC_CHANNEL`。
- [ ] CLI 不会向社招回退，也不会发起猜测请求。

### 文档与 Skill

- [ ] README 说明三类招聘、默认 social、all 和安全全量行为。
- [ ] 新增站点文档加入多类型 DevTools 调研和 adapter 契约。
- [ ] 36 站点能力矩阵具有证据和日期。
- [ ] skill 在意图不明确时先询问招聘类型。
- [ ] skill 的 detail 示例沿用搜索结果 nature。
- [ ] skill 对全部类型先小规模预览。
- [ ] 所有仓库修改同步记录在 CHANGES。

### 预发布

- [ ] 版本为 `0.2.0-beta.0`。
- [ ] 离线测试通过。
- [ ] 发布前 live matrix 无未解释 FAIL。
- [ ] `npm pack --dry-run` 通过。
- [ ] tarball 临时安装和 CLI 验证通过。
- [ ] 未执行 `npm publish`。

## Required Acceptance Evidence

最终交付必须包含：

1. 36 站点 × 3 类型能力矩阵。
2. 每个 supported/unsupported 结论的 DevTools 证据摘要和验证日期。
3. 离线测试结果。
4. live matrix 汇总。
5. NO_LIVE_JOBS 清单和 fixture 位置。
6. BLOCKED_API_CHANGE 清单及原因。
7. 修改文件和兼容性影响。
8. `npm pack` 产物验证结果。
9. 尚未执行正式发布的明确声明。

## Out of Scope

- npm 正式发布。
- 登录后岗位、内推岗位或非公开接口。
- 验证码、风控或访问控制绕过。
- 创建新的公司 site ID 表示招聘类型。
- 默认并发抓取或后台定时爬取。
- 本期新增 `--best-effort`。
- 对招聘官网岗位内容做持久化数据库或历史归档。

## Further Notes

- 共享供应商是代码复用边界，不是能力结论复用边界。
- HTTP 200 + 空列表不能自动判成功，必须先验证 channel 参数正确。
- `all` 是查询值，不允许出现在单个岗位的 `nature_code` 中。
- 任何抓包记录、fixture、日志和变更记录都必须脱敏。
- 执行 Agent 遇到官网事实与本 spec 冲突时，应记录证据并请求用户决策，不得擅自扩大到登录或非公开能力。
