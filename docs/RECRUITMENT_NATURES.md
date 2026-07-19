# 招聘类型能力矩阵与证据

> 验证日期起点：2026-07-19  
> 状态枚举：`SUPPORTED` / `UNSUPPORTED_NO_PUBLIC_CHANNEL` / `NO_LIVE_JOBS` / `BLOCKED_API_CHANGE` / `PENDING`

本文件记录 36 个站点在 `social` / `campus` / `intern` 上的公开渠道能力结论。接口事实以 Chrome DevTools MCP 抓包为准；未完成调研的单元格标记为 `PENDING`。

## 脱敏规则

- 不记录 Cookie、token、CSRF、签名明文、设备 ID、个人信息。
- fixture 仅保留影响解析的最小字段结构。
- `NO_LIVE_JOBS` 必须同时具备公开入口证据、有效空响应和脱敏 fixture。

## 矩阵

| Site ID | social | campus | intern | 官方入口 / 备注 | DevTools 证据摘要 | 验证日期 |
| --- | --- | --- | --- | --- | --- | --- |
| didi | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待校招/实习入口抓包 | 2026-07-19 |
| kuaishou | SUPPORTED | SUPPORTED | SUPPORTED | 社招/日常实习：`zhaopin.kuaishou.cn`；校招：`campus.kuaishou.cn` | DevTools：social `C001`；trainee `C002`+`G002`；campus `POST .../positions/simple` + `GET .../positions/find` | 2026-07-19 |
| bytedance | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待 portal/recruitment filter 抓包 | 2026-07-19 |
| meituan | SUPPORTED | SUPPORTED | SUPPORTED | `/web/social`、`/web/campus` | DevTools：`jobType` `3/1/2` → social/campus/intern；detail `jobShareType=1` | 2026-07-19 |
| xiaomi | SUPPORTED | SUPPORTED | SUPPORTED | `hr.xiaomi.com` → `/index` `/campus/` `/internship/` | DevTools：同 API，`website-path` 头区分渠道；`portal_type` 均为 6 | 2026-07-19 |
| tencent | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待校招独立 API/attrId 抓包 | 2026-07-19 |
| baidu | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待校招列表与 SSR 详情抓包 | 2026-07-19 |
| jd | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待类型路径抓包 | 2026-07-19 |
| xiaohongshu | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待 recruitType 枚举抓包 | 2026-07-19 |
| bilibili | SUPPORTED | PENDING | PENDING | 社招基线；已有 campus filter 线索 | 待 campus position API 抓包 | 2026-07-19 |
| netease | SUPPORTED | UNSUPPORTED_NO_PUBLIC_CHANNEL | SUPPORTED | `/job-list.html`；`/campus.html` 为 404 | API：`workType` `0` 社招 / `1` 实习；校园页无公开列表 | 2026-07-19 |
| ctrip | SUPPORTED | UNSUPPORTED_NO_PUBLIC_CHANNEL | SUPPORTED | experienced jobList | API：`kind` `Regular`/`Intern_Long_Term`；filters 无校园 kind | 2026-07-19 |
| huawei | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待 campus jobType 抓包 | 2026-07-19 |
| dji | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待校招/实习列表抓包 | 2026-07-19 |
| ant | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待 /api/campus 抓包 | 2026-07-19 |
| mihoyo | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待 hireType 枚举抓包 | 2026-07-19 |
| moonshot | SUPPORTED | PENDING | PENDING | Moka 社招基线 | 待独立 campus/intern site 调研 | 2026-07-19 |
| deepseek | SUPPORTED | PENDING | PENDING | Moka 社招基线 | 待公开校招/实习入口调研 | 2026-07-19 |
| dewu | SUPPORTED | UNSUPPORTED_NO_PUBLIC_CHANNEL | SUPPORTED | 仅 `/index`；无 `/campus` | DevTools+API：`recruitment_id_list` `101` 社招 / `301` 实习；`/campus` 404 | 2026-07-19 |
| minimax | SUPPORTED | UNSUPPORTED_NO_PUBLIC_CHANNEL | SUPPORTED | 仅 `/index`；无 `/campus` | 同上；另有 `102` 外包未映射 | 2026-07-19 |
| zhipu | SUPPORTED | UNSUPPORTED_NO_PUBLIC_CHANNEL | SUPPORTED | 仅 `/index`；无 `/campus` | DevTools：`portal_type=6`；`101`/`301` 过滤；校招入口不存在 | 2026-07-19 |
| taotian | SUPPORTED | SUPPORTED | SUPPORTED | `/off-campus` + `/campus` | DevTools：`campus_group_official_site` + `categoryType=freshman\|internship`；实习可空 | 2026-07-19 |
| taobao-shangou | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 逐站验证 API 成功；校招/实习当前可能空岗 | 2026-07-19 |
| fliggy | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 逐站验证 API 成功；校招/实习当前可能空岗 | 2026-07-19 |
| alibaba-intl | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 逐站验证 API 成功；校招/实习当前可能空岗 | 2026-07-19 |
| aliyun | SUPPORTED | SUPPORTED | SUPPORTED | DevTools 校招页 | 前端 body 使用通用 `campus_group_official_site`（非 HTML brand map）；当前空岗 | 2026-07-19 |
| tongyi | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招/实习均有在招岗位 | 2026-07-19 |
| dingtalk | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招有岗；实习可空 | 2026-07-19 |
| quark | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招有岗；实习可空 | 2026-07-19 |
| thead | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招有岗；实习可空 | 2026-07-19 |
| amap | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招可空；实习批次存在但列表可空 | 2026-07-19 |
| cainiao | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招有岗；实习可空 | 2026-07-19 |
| hujing | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招/实习均有在招岗位 | 2026-07-19 |
| freshippo | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招/实习当前可能空岗 | 2026-07-19 |
| alihealth | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招有岗；实习可空 | 2026-07-19 |
| lingxi | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招有岗；实习可空 | 2026-07-19 |

## 公共契约进度

| 能力 | 状态 |
| --- | --- |
| `src/core/natures.js` 标准类型与别名 | Done |
| registry `supported_natures` / 聚合 / detail 拒 all | Done |
| CLI `filters`/`detail --nature` | Done |
| 离线契约测试 | Done |
| 试点站点多类型实现（xiaomi/meituan/kuaishou） | Done |
| Alibaba CPO 15 站共享协议改造 | Done |
| Feishu SaaS 3 站（social/intern） | Done |
| 全矩阵 DevTools 证据 | Pending（其余独立站） |
| `0.2.0-beta.0` 预发布 | Pending |

## Phase 3 取证摘要（Alibaba CPO）

验证日期：2026-07-19

- 官方入口：社招 `/off-campus/position-list`，校招 `/campus/position-list`
- 列表：`POST /position/search`
  - 社招：`channel=group_official_site`（配置默认；HTML `cdc_*` 窄渠道不可直接替代）
  - 校招：`channel=campus_group_official_site` + `categoryType=freshman`
  - 实习：`channel=campus_group_official_site` + `categoryType=internship`
- DevTools（淘天 + 阿里云）确认前端使用通用 `campus_group_official_site`，与 HTML brand map（如 `aliyun_campus_group_official_site`）等价或应优先使用通用值
- 详情：`POST /position/detail`，`{ id, channel, language }`
- 15 站均声明 `supportedNatures: social/campus/intern`；季节性空岗返回空列表（`NO_LIVE_JOBS`），不降级为 unsupported

## Phase 3 取证摘要（Feishu SaaS：zhipu / minimax / dewu）

验证日期：2026-07-19

- `/campus`、`/internship` 公开路径 404，无独立校招门户
- 社招门户 `portal_type=6` 内通过 `recruitment_id_list` 区分：`101`=全职社招，`301`=实习
- `supportedNatures: ['social','intern']`；显式 `--nature campus` → `UNSUPPORTED_NATURE`
- 默认社招现仅返回 `101`，不再混入实习岗位

## 证据记录模板

```text
Site: <id>
Nature: social|campus|intern
Status: SUPPORTED|UNSUPPORTED_NO_PUBLIC_CHANNEL|NO_LIVE_JOBS|BLOCKED_API_CHANGE
Verified: YYYY-MM-DD
Official URL: https://...
List request: METHOD path — trigger — key params
Filter request: METHOD path — trigger — key params
Detail request: METHOD path — trigger — key params
Nature switch diff: ...
Unauthenticated replay: yes/no
Notes: ...
```
